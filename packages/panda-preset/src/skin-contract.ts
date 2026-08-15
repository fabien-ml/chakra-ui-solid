import type { Config } from "@pandacss/dev";
import { recipes } from "./chakra/recipes";
import { slotRecipes } from "./chakra/slot-recipes";
import { defaultVariantsFor } from "./contract";
import { chakraSkin, type Skin } from "./skin";

type Plugin = NonNullable<Config["plugins"]>[number];
type ThemeOption = NonNullable<Config["theme"]>;
/**
 * The halves of a theme this file reads, and the reason it is a `Pick` rather than the whole thing:
 * it is handed both a resolved `config.theme` and a bare {@link Skin}, whose recipe deltas are typed
 * as partials and therefore do not fit `theme`'s own shape.
 */
type ThemeTables = Pick<
  ThemeOption,
  "tokens" | "semanticTokens" | "textStyles" | "layerStyles" | "animationStyles" | "keyframes"
>;

/**
 * The three things a skin can get wrong that nothing else in the toolchain reports.
 *
 * All three are the same failure in different clothes: **the build stays green and the page is
 * wrong.** Nothing here can be an error. Panda's `mergeHooks` wraps every hook in a `try`/`catch`
 * that logs and continues, so a thrown error cannot fail a build — the same reasoning
 * `lockedKeysPlugin` documents, and the reason both of them reach for `console.warn`.
 *
 * The hook **returns nothing**. `config:resolved`'s return value *replaces* the config, and
 * `lockedKeysPlugin` is the one that uses that; this plugin runs before it and must hand the config
 * on untouched.
 */
export function skinContractPlugin(skin: Skin): Plugin {
  return {
    name: "chakra-ui-solid:skin-contract",
    hooks: {
      "config:resolved": ({ config }) => {
        warnAboutUnresolvedTokens(config);
        warnAboutInertDefaultVariants(skin);
        warnAboutCompoundVariants(skin);
      },
    },
  };
}

/**
 * The check this file exists for, and the one failure a skin can genuinely produce.
 *
 * Panda does not fail on a token it cannot resolve — it emits the *name* as a raw CSS value.
 * Measured: a skin missing `spacing.4` produced `padding-inline: 4px` where the default produces
 * `padding-inline: var(--chakra-spacing-4)`, and one missing `radii.l3` produced
 * `border-radius: l3`. Neither is unstyled, both are **wrong**, and every test in the repo stays
 * green.
 *
 * The reference set is built against **`chakraSkin`** and the missing half is looked up in the
 * **resolved** config, and both halves of that matter. Resolved, because a token reference reaches
 * its value through `tokens`, through `semanticTokens`, or through a consumer's own `theme.extend`,
 * and a check that only knew the first would warn about ~130 names on a stylesheet that is
 * completely correct. Against `chakraSkin`, because that is what makes the reference set a
 * *contract* rather than a guess: a recipe body is full of values that are not tokens at all
 * (`cursor: pointer`, `borderColor: currentColor`, `zIndex: 1`), and the ones Chakra's own skin
 * defines are exactly the ones a replacement owes.
 */
function warnAboutUnresolvedTokens(config: Config): void {
  const declared = tokenNamesIn(chakraSkin);
  const resolved = tokenNamesIn(config.theme ?? {});
  const missing = tokenReferencesInRecipes(config.utilities as UtilityMap, declared).filter(
    ({ category, name }) => !resolved.get(category)?.has(name),
  );

  if (missing.length === 0) {
    return;
  }

  const listed = missing
    .slice(0, LISTED_AT_MOST)
    .map(
      ({ category, name, property }) =>
        `\`${category}.${name}\` → ${property}: ${literalFor(name)}`,
    )
    .join(", ");
  const rest = missing.length - LISTED_AT_MOST;

  console.warn(
    `[chakra-ui-solid] this skin leaves ${missing.length} token(s) a recipe body reads undefined: ` +
      `${listed}${rest > 0 ? `, and ${rest} more` : ""}. Panda does not fail on a token it cannot ` +
      `resolve — it emits the name as a literal CSS value, so those declarations are wrong rather ` +
      `than missing and nothing else reports them.`,
  );
}

/** Enough names to recognize the shape of the mistake, without a console line nobody can read. */
const LISTED_AT_MOST = 10;

/**
 * What Panda puts in the declaration instead, so the warning names the thing the reader can find by
 * searching their stylesheet. Measured on both spellings: `4` came out as `4px` and `l3` as `l3`,
 * the name going through raw and a bare number picking up the `px` a unitless length gets.
 */
function literalFor(tokenName: string): string {
  return /^-?\d+(\.\d+)?$/.test(tokenName) ? `${tokenName}px` : tokenName;
}

/**
 * A skin's `defaultVariants` change the stylesheet and not the page.
 *
 * Our runtime is **compiled**, and a recipe's defaults are compiled into it:
 * `createRecipe('button', { size: 'md', variant: 'solid' }, [])`. So `<Button>` goes on emitting
 * `button--size_md` whatever a later config declares, and the skin author sees their default
 * ignored with a stylesheet that agrees with them.
 */
function warnAboutInertDefaultVariants(skin: Skin): void {
  const overridden = recipeDeltasIn(skin).flatMap(([recipe, delta]) => {
    const compiled = defaultVariantsFor(recipe);
    return Object.entries(delta.defaultVariants ?? {})
      .filter(([key, value]) => value !== compiled[key])
      .map(([key]) => `\`${recipe}.${key}\``);
  });

  if (overridden.length === 0) {
    return;
  }

  console.warn(
    `[chakra-ui-solid] a skin's \`defaultVariants\` are inert, and this one sets ` +
      `${overridden.join(", ")}. Our published runtime is compiled with the anatomy's own ` +
      `defaults, so a component rendered with no variant prop still emits the anatomy's class ` +
      `whatever the stylesheet declares. Change the value under that variant key instead.`,
  );
}

/**
 * A skin's `compoundVariants` never apply at all.
 *
 * Same mechanism as {@link warnAboutInertDefaultVariants}, one step further: the compiled runtime
 * carries the anatomy's compound list, which is empty across all 74 bodies, and a compound rule is
 * only ever worn by a class that list produces. So the CSS is generated and nothing on the page can
 * match it.
 */
function warnAboutCompoundVariants(skin: Skin): void {
  const declaring = recipeDeltasIn(skin)
    .filter(([, delta]) => (delta.compoundVariants?.length ?? 0) > 0)
    .map(([recipe]) => `\`${recipe}\``);

  if (declaring.length === 0) {
    return;
  }

  console.warn(
    `[chakra-ui-solid] a skin's \`compoundVariants\` never apply, and this one declares them on ` +
      `${declaring.join(", ")}. Our published runtime carries the anatomy's compound list, which ` +
      `is empty, so nothing on the page ever wears the class those rules are written for. Nest ` +
      `the other variant's own selector in the variant body instead — ` +
      `\`size: { sm: { "&.button--variant_outline": { … } } }\`.`,
  );
}

type RecipeDelta = { defaultVariants?: Record<string, string>; compoundVariants?: unknown[] };

function recipeDeltasIn(skin: Skin): Array<[string, RecipeDelta]> {
  return [
    ...Object.entries(skin.recipes ?? {}),
    ...Object.entries(skin.slotRecipes ?? {}),
  ] as Array<[string, RecipeDelta]>;
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

/**
 * The bodies a skin's token table has to satisfy — all 75, `container` among them: a skin missing
 * `sizes.8xl` leaves Container full-bleed exactly as a skin missing `radii.l2` leaves Button
 * square-cornered.
 */
const recipeBodies = [...Object.values(recipes), ...Object.values(slotRecipes)];

function tokenReferencesInRecipes(utilities: UtilityMap, names: TokenNames): TokenReference[] {
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

  for (const recipe of recipeBodies) {
    walk(recipe.base);
    walk(recipe.variants);
    for (const compound of recipe.compoundVariants ?? []) {
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
 * skin that dropped that token would be warned about a declaration Panda still emits as `100%`.
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
