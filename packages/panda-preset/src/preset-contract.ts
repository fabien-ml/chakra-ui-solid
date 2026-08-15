import type { Config } from "@pandacss/dev";
import { animationStyles } from "./chakra/animation-styles";
import { keyframes } from "./chakra/keyframes";
import { layerStyles } from "./chakra/layer-styles";
import { semanticTokens } from "./chakra/semantic-tokens";
import { textStyles } from "./chakra/text-styles";
import { tokens } from "./chakra/tokens";
import { type RecipeShape, recipeContract, slotRecipeContract } from "./contract";

type Plugin = NonNullable<Config["plugins"]>[number];
type ThemeOption = NonNullable<Config["theme"]>;

/** The token halves this file walks, out of the far wider theme Panda's own types describe. */
type ThemeTables = Pick<
  ThemeOption,
  "tokens" | "semanticTokens" | "textStyles" | "layerStyles" | "animationStyles" | "keyframes"
>;

/** The recipe keys the contract records, out of the far wider body Panda's own types describe. */
type ResolvedBody = {
  className?: string;
  slots?: readonly string[];
  base?: unknown;
  variants?: Record<string, Record<string, unknown>>;
  defaultVariants?: Record<string, unknown>;
  compoundVariants?: Array<{ css?: unknown }>;
};

type ResolvedTheme = ThemeTables & {
  recipes?: Record<string, ResolvedBody | undefined>;
  slotRecipes?: Record<string, ResolvedBody | undefined>;
};

/**
 * What a preset can get wrong that nothing else in the toolchain reports.
 *
 * Every category below is one failure in different clothes: **the build stays green and the page is
 * wrong.** Nothing here can be an error. Panda's `mergeHooks` wraps every hook in a `try`/`catch`
 * that logs and continues, so a thrown error cannot fail a build — the same reasoning
 * `lockedKeysPlugin` documents, and the reason both of them reach for `console.warn`.
 *
 * The hook **returns nothing**. `config:resolved`'s return value *replaces* the config, and
 * `lockedKeysPlugin` is the one that uses that; this plugin runs before it and must hand the config
 * on untouched.
 *
 * It reads the **resolved theme** and nothing else — not a preset object anyone passed us, which is
 * one entry in a chain Panda merges and resolves in its own order, and not our own vendored bodies,
 * which a later preset in that chain may have replaced outright.
 */
export function presetContractPlugin(): Plugin {
  return {
    name: "chakra-ui-solid:preset-contract",
    hooks: {
      "config:resolved": ({ config }) => {
        warnAboutContractGaps(config);
        warnAboutCompoundVariants(themeOf(config));
      },
    },
  };
}

function themeOf(config: Config): ResolvedTheme {
  return (config.theme ?? {}) as ResolvedTheme;
}

/** Enough names to recognize the shape of the mistake, without a console line nobody can read. */
const LISTED_AT_MOST = 10;

/**
 * One kind of gap, with the sentence that says how it reaches the page.
 *
 * The `label` is always a plural, and {@link counted} leans on that.
 */
type Gap = { label: string; note: string; names: string[] };

/**
 * The whole report, in one line per category, **counts before names**.
 *
 * A preset written from zero is the case this format is for: it misses recipes, slots and tokens by
 * the dozen at once, and ten truncated names out of one category tell its author nothing about the
 * size of what is left. `37 recipes, 114 slots, 134 tokens` does, and the names after it are there
 * to recognize the shape of the mistake rather than to enumerate it.
 */
function warnAboutContractGaps(config: Config): void {
  const theme = themeOf(config);
  const gaps = [
    ...shapeGaps(theme),
    unresolvedTokens(theme, config.utilities as UtilityMap),
  ].filter((gap) => gap.names.length > 0);

  if (gaps.length === 0) {
    return;
  }

  const summary = gaps.map(({ label, names }) => counted(names.length, label)).join(", ");
  const detail = gaps
    .map(({ label, note, names }) => `  ${label} (${names.length}) — ${note}: ${listed(names)}`)
    .join("\n");

  console.warn(
    `[chakra-ui-solid] the resolved theme does not satisfy this library's recipe contract: ` +
      `${summary}. Panda generates a stylesheet either way and nothing else reports any of it, so ` +
      `the build stays green and the page is what is wrong.\n${detail}`,
  );
}

/** Every label is a plural ending in `s`, so its singular is the label minus that letter. */
function counted(count: number, plural: string): string {
  return `${count} ${count === 1 ? plural.slice(0, -1) : plural}`;
}

function listed(names: string[]): string {
  const rest = names.length - LISTED_AT_MOST;
  const shown = names.slice(0, LISTED_AT_MOST).join(", ");
  return rest > 0 ? `${shown}, and ${rest} more` : shown;
}

/**
 * The six ways a preset's bodies can disagree with the contract, in severity order.
 *
 * A recipe with no body swallows the other five — 37 missing recipes would otherwise also report
 * every slot, variant key and value they were supposed to carry, which is the 476-name console line
 * the counts exist to avoid.
 */
function shapeGaps(theme: ResolvedTheme): Gap[] {
  const missingRecipes: string[] = [];
  const wrongClassNames: string[] = [];
  const missingSlots: string[] = [];
  const missingVariantKeys: string[] = [];
  const missingVariantValues: string[] = [];
  const wrongDefaults: string[] = [];

  const tables: Array<[Record<string, RecipeShape>, ResolvedTheme["recipes"]]> = [
    [recipeContract, theme.recipes],
    [slotRecipeContract, theme.slotRecipes],
  ];

  for (const [shapes, bodies] of tables) {
    for (const [key, shape] of Object.entries(shapes)) {
      const body = bodies?.[key];

      // **Not key presence.** Our own `theme.extend` writes a `jsx` tracking hint under all 75
      // contract keys, so every key exists in the resolved theme whatever a preset declared —
      // measured, a preset that never mentioned `badge` left `{ jsx: ["Badge"] }` behind, with no
      // `className` and no `base`. The `className` is what tells a body from a hint.
      if (body?.className === undefined) {
        missingRecipes.push(`\`${key}\``);
        continue;
      }

      if (body.className !== shape.className) {
        wrongClassNames.push(`\`${key}\` is \`${body.className}\`, not \`${shape.className}\``);
      }

      // Deduplicated because upstream's `dialog` lists `backdrop` twice and the contract records
      // that verbatim; a preset that omits it has made one mistake, not two.
      for (const slot of new Set(shape.slots)) {
        if (!(body.slots ?? []).includes(slot)) {
          missingSlots.push(`\`${key}.${slot}\``);
        }
      }

      for (const [variantKey, values] of Object.entries(shape.variants)) {
        const declared = body.variants?.[variantKey];
        if (declared === undefined) {
          missingVariantKeys.push(`\`${key}.${variantKey}\``);
          continue;
        }
        for (const value of values) {
          if (!(value in declared)) {
            missingVariantValues.push(`\`${key}.${variantKey}.${value}\``);
          }
        }
      }

      for (const [variantKey, expected, actual] of defaultsToCompare(shape, body)) {
        // Spellings rather than values, and that is the whole subtlety: Panda names a boolean
        // variant's classes `"true"` and `"false"`, so `alert.inline` resolves a real `false` while
        // the values declared under that key are the two strings. Comparing values would report all
        // three of the boolean defaults as wrong on a preset that is correct.
        if (String(expected) !== String(actual)) {
          wrongDefaults.push(
            `\`${key}.${variantKey}\` is ${spelled(actual)}, not ${spelled(expected)}`,
          );
        }
      }
    }
  }

  return [
    {
      label: "recipes",
      note:
        "declared by no body in the resolved theme, so every rule they would have emitted is " +
        "absent while our runtime goes on computing their classes",
      names: missingRecipes,
    },
    {
      label: "class names",
      note:
        "our runtime computes each class from the contract's spelling, so a preset that spells one " +
        "differently emits every rule and dresses nothing in them",
      names: wrongClassNames,
    },
    {
      label: "slots",
      note: "a part our runtime renders and this preset styles nothing for",
      names: missingSlots,
    },
    {
      label: "variant keys",
      note: "a prop our runtime turns into a class the stylesheet never declares",
      names: missingVariantKeys,
    },
    {
      label: "variant values",
      note: "a value our runtime turns into a class the stylesheet never declares",
      names: missingVariantValues,
    },
    {
      label: "default variants",
      note:
        "our runtime is compiled with the contract's, so a component rendered with no variant prop " +
        "wears one class while the stylesheet styles another by default",
      names: wrongDefaults,
    },
  ];
}

/** Both sides' keys, so a default a preset omits and one it invents are both a disagreement. */
function defaultsToCompare(
  shape: RecipeShape,
  body: ResolvedBody,
): Array<[key: string, expected: unknown, actual: unknown]> {
  const declared = body.defaultVariants ?? {};
  const keys = new Set([...Object.keys(shape.defaultVariants), ...Object.keys(declared)]);
  return [...keys].map((key) => [key, shape.defaultVariants[key], declared[key]]);
}

function spelled(value: unknown): string {
  return value === undefined ? "unset" : `\`${String(value)}\``;
}

/**
 * A preset's `compoundVariants` never apply at all.
 *
 * Our runtime is **compiled**, and it carries the contract's compound list, which is empty across
 * all 75 rows. A compound rule is only ever worn by a class that list produces, so the CSS is
 * generated and nothing on the page can match it. Its own warning rather than a row in the report
 * above: nothing here is missing, and the fix is to write the rule a different way.
 */
function warnAboutCompoundVariants(theme: ResolvedTheme): void {
  const declaring = everyBody(theme)
    .filter(([, body]) => (body.compoundVariants?.length ?? 0) > 0)
    .map(([key]) => `\`${key}\``);

  if (declaring.length === 0) {
    return;
  }

  console.warn(
    `[chakra-ui-solid] a preset's \`compoundVariants\` never apply, and this one declares them on ` +
      `${counted(declaring.length, "recipes")}: ${listed(declaring)}. Our published runtime carries ` +
      `the contract's compound list, which is empty, so nothing on the page ever wears the class ` +
      `those rules are written for. Nest the other variant's own selector in the variant body ` +
      `instead — \`size: { sm: { "&.button--variant_outline": { … } } }\`.`,
  );
}

function everyBody(theme: ResolvedTheme): Array<[string, ResolvedBody]> {
  return [
    ...Object.entries(theme.recipes ?? {}),
    ...Object.entries(theme.slotRecipes ?? {}),
  ].filter((entry): entry is [string, ResolvedBody] => entry[1] !== undefined);
}

/**
 * The check this file exists for, and the one gap that is wrong rather than missing.
 *
 * Panda does not fail on a token it cannot resolve — it emits the *name* as a raw CSS value.
 * Measured: a theme missing `spacing.4` produced `padding-inline: 4px` where the default produces
 * `padding-inline: var(--chakra-spacing-4)`, and one missing `radii.l3` produced
 * `border-radius: l3`. Neither is unstyled, both are **wrong**, and every test in the repo stays
 * green.
 *
 * Three sets, and each one is a different theme for a reason:
 *
 * - The **bodies walked** are the resolved theme's, because a preset supplies its own. Walking
 *   Chakra's instead would hold every preset to Chakra's token table and report ~130 names against
 *   one that is smaller on purpose.
 * - A reference **resolves** against the resolved theme, because a token reaches its value through
 *   `tokens`, through `semanticTokens`, or through a consumer's own `theme.extend`, and a check
 *   that only knew the first would warn about ~130 names on a stylesheet that is correct.
 * - What counts as a reference **at all** is Chakra's own token names, and that set cannot come
 *   from the resolved theme: a name looked up in the same table that decided it was a name always
 *   resolves, and the check finds nothing, ever. A recipe body is full of values that are not
 *   tokens (`cursor: pointer`, `borderColor: currentColor`, `zIndex: 1`), and Chakra's names are the
 *   ones a replacement owes. A preset that invents `spacing.gutter` is outside the vocabulary and
 *   goes unchecked, which is the honest half of the trade.
 */
function unresolvedTokens(theme: ResolvedTheme, utilities: UtilityMap): Gap {
  const declared = tokenNamesIn(CHAKRA_TOKEN_TABLES);
  const resolved = tokenNamesIn(theme);
  const missing = tokenReferencesIn(everyBody(theme), utilities, declared).filter(
    ({ category, name }) => !resolved.get(category)?.has(name),
  );

  return {
    label: "tokens",
    note:
      "read by a recipe body and resolved by nothing, so Panda emits the name as a literal CSS " +
      "value instead of a variable",
    names: missing.map(
      ({ category, name, property }) =>
        `\`${category}.${name}\` → ${property}: ${literalFor(name)}`,
    ),
  };
}

/** The vocabulary, assembled from the vendored modules — see {@link unresolvedTokens}. */
const CHAKRA_TOKEN_TABLES: ThemeTables = {
  tokens,
  semanticTokens,
  textStyles,
  layerStyles,
  animationStyles,
  keyframes,
};

/**
 * What Panda puts in the declaration instead, so the warning names the thing the reader can find by
 * searching their stylesheet. Measured on both spellings: `4` came out as `4px` and `l3` as `l3`,
 * the name going through raw and a bare number picking up the `px` a unitless length gets.
 */
function literalFor(tokenName: string): string {
  return /^-?\d+(\.\d+)?$/.test(tokenName) ? `${tokenName}px` : tokenName;
}

/** Every flat name a scale declares, keyed by scale — `colors` → `bg.panel`, `red.500`, `white`. */
type TokenNames = Map<string, Set<string>>;

/** Panda spells a token that has both a value and children `bg.DEFAULT`, and resolves `bg` to it. */
const DEFAULT_LEAF = /(^|\.)DEFAULT$/;

const COMPOSITION_SCALES = {
  textStyle: "textStyles",
  layerStyle: "layerStyles",
  animationStyle: "animationStyles",
} as const;

/**
 * Every name the given theme halves define.
 *
 * `keyframes` is the one table read by its top-level keys alone — an `@keyframes` body is a style
 * object all the way down, so the `value` marker every other table leans on is not in it.
 */
function tokenNamesIn(theme: ThemeTables): TokenNames {
  const names: TokenNames = new Map();
  const scale = (category: string) => {
    const existing = names.get(category);
    if (existing) {
      return existing;
    }
    const created = new Set<string>();
    names.set(category, created);
    return created;
  };

  for (const table of [theme.tokens, theme.semanticTokens]) {
    for (const [category, tokens] of Object.entries(table ?? {})) {
      collectNames(tokens, "", scale(category));
    }
  }
  for (const category of Object.values(COMPOSITION_SCALES)) {
    collectNames(theme[category], "", scale(category));
  }
  for (const name of Object.keys(theme.keyframes ?? {})) {
    scale("keyframes").add(name);
  }

  return names;
}

function collectNames(node: unknown, path: string, into: Set<string>): void {
  if (node === null || typeof node !== "object") {
    return;
  }
  const branch = node as Record<string, unknown>;
  if ("value" in branch) {
    into.add(path.replace(DEFAULT_LEAF, ""));
  }
  for (const [key, child] of Object.entries(branch)) {
    if (key === "value" || key === "description") {
      continue;
    }
    collectNames(child, path ? `${path}.${key}` : key, into);
  }
}

type TokenName = { category: string; name: string };
type TokenReference = TokenName & { property: string };

function tokenReferencesIn(
  bodies: Array<[string, ResolvedBody]>,
  utilities: UtilityMap,
  names: TokenNames,
): TokenReference[] {
  const scaleFor = scalesByProperty(utilities, names);
  const found = new Map<string, TokenReference>();

  const readDeclaration = (property: string, value: unknown) => {
    if (typeof value !== "string" && typeof value !== "number") {
      return;
    }
    const token = scaleFor.get(property)?.(String(value));
    if (token === undefined) {
      return;
    }
    const key = `${token.category}.${token.name}`;
    if (!found.has(key)) {
      found.set(key, { ...token, property });
    }
  };

  const walk = (styles: unknown) => {
    if (styles === null || typeof styles !== "object") {
      return;
    }
    for (const [key, value] of Object.entries(styles)) {
      if (value !== null && typeof value === "object") {
        walk(value);
      } else {
        readDeclaration(key, value);
      }
    }
  };

  for (const [, body] of bodies) {
    walk(body.base);
    walk(body.variants);
    for (const compound of body.compoundVariants ?? []) {
      walk(compound.css);
    }
  }

  return [...found.values()];
}

type TokenLookup = (value: string) => TokenName | undefined;

type UtilityValues =
  | string
  | string[]
  | Record<string, unknown>
  | ((scale: (category: string) => Record<string, unknown>) => Record<string, unknown> | undefined);

type UtilityMap = Record<
  string,
  { shorthand?: string | string[]; values?: UtilityValues } | undefined
>;

/**
 * Which scale a style property reads, for the properties whose utility names one — and the reason a
 * `p: "4"` in a recipe body can be told from a `zIndex: 1`.
 *
 * `utilities` is the **resolved** config's, so a consumer's own utility is covered too. Panda's
 * three compositions are not utilities at all — they are resolved straight out of the theme — so
 * they are added by hand.
 */
function scalesByProperty(utilities: UtilityMap, names: TokenNames): Map<string, TokenLookup> {
  const lookups = new Map<string, TokenLookup>();

  for (const [property, entry] of Object.entries(utilities ?? {})) {
    const lookup = tokenLookupFor(entry?.values, names);
    if (lookup === undefined) {
      continue;
    }
    for (const spelling of [property, entry?.shorthand ?? []].flat()) {
      lookups.set(spelling, lookup);
    }
  }

  for (const [property, category] of Object.entries(COMPOSITION_SCALES)) {
    lookups.set(property, (value) => nameIn(names, category, value));
  }

  return lookups;
}

/**
 * Panda has two spellings for a utility's value set, and only the second needs work.
 *
 * A **string** — `padding: { values: "spacing" }` — names its scale outright. A **function** builds
 * its set from one or more scales *plus literals of its own*: `width` is `sizes` and also `auto`,
 * `full`, `1/2`. Calling it with an accessor that hands back nothing separates the two halves, and
 * that separation is what keeps `width: "full"` from being read as a `sizes.full` reference — a
 * theme that dropped that token would be warned about a declaration Panda still emits as `100%`.
 */
function tokenLookupFor(
  values: UtilityValues | undefined,
  names: TokenNames,
): TokenLookup | undefined {
  if (typeof values === "string") {
    return (value) => nameIn(names, values, value);
  }
  if (typeof values !== "function") {
    return undefined;
  }

  const scales: string[] = [];
  // A validator must never be what breaks a build, and this calls a function a Panda minor or a
  // consumer wrote against an accessor richer than this one.
  let literals: Record<string, unknown> = {};
  try {
    literals =
      values((category) => {
        scales.push(category);
        return {};
      }) ?? {};
  } catch {
    return undefined;
  }
  const ownValues = new Set(Object.keys(literals));

  return (value) => {
    if (ownValues.has(value)) {
      return undefined;
    }
    for (const category of scales) {
      const token = nameIn(names, category, value);
      if (token) {
        return token;
      }
    }
    return undefined;
  };
}

function nameIn(names: TokenNames, category: string, value: string): TokenName | undefined {
  // `bg="blue.500/40"` is one token and an alpha, so the half before the slash is the name.
  const name = category === "colors" ? (value.split("/")[0] ?? value) : value;
  return names.get(category)?.has(name) ? { category, name } : undefined;
}
