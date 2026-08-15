import type { Config } from "@pandacss/dev";
import { recipeKeys, slotRecipeKeys, variantKeysFor } from "./contract";
import { createChakraSolidPreset } from "./preset";
import { presetContractPlugin } from "./preset-contract";
import { recipeGatePlugin } from "./recipe-gate-plugin";
import { chakraSkin, type Skin } from "./skin";

/**
 * Which recipe variants should also be generated at every breakpoint, so a consumer can write
 * `<Button size={{ base: "sm", md: "lg" }}>`.
 *
 * Off by default: the default stylesheet already carries 488 recipe-variant values, and turning
 * responsive on for everything multiplies that by the six conditions (`base` + five breakpoints).
 * Three grains, so nobody pays for conditions they do not use:
 *
 * - `{ button: ["size"] }` — one variant key on one recipe
 * - `["button", "heading"]` — every variant key on those recipes
 * - `true` — every variant key on all 75
 */
export type ResponsiveGrain = true | string[] | Record<string, string[]>;

/**
 * Which recipe variants should also be generated under a **state** condition, so a consumer can
 * write `<IconButton variant={{ base: "ghost", _selected: "outline" }}>`.
 *
 * A separate knob from {@link ResponsiveGrain} because Panda keeps the two separate: a `staticCss`
 * recipe rule carries `responsive?: boolean` for breakpoints and `conditions?: string[]` for
 * everything else, and neither implies the other. `responsive` on `button.variant` generates
 * `md:button--variant_outline` and never `selected:button--variant_outline` — and a class with no
 * rule renders nothing and reports nothing, so the selected item just looks like the others.
 *
 * Condition names are Panda's own, spelled without the underscore a prop uses: `_selected` is
 * `"selected"`. Two grains:
 *
 * - `{ button: ["selected"] }` — every variant key on Button, under `_selected`
 * - `{ button: { variant: ["selected", "pressed"] } }` — one variant key, under two conditions
 *
 * No `true` grain, where `responsive` has one: breakpoints are a closed set this package can
 * enumerate and conditions are not, since a consumer's own `conditions` block adds to them.
 */
export type ConditionalGrain = Record<string, string[] | Record<string, string[]>>;

/**
 * The keys that decide a class *name* on both sides of the published-runtime boundary.
 *
 * In Panda's external-package model the consumer does not regenerate the runtime: `css()` comes from
 * our published `@chakra-ui-solid/styled-system` and their Panda run produces only the stylesheet.
 * Our runtime emits `p_4`, so a config that hashes, prefixes or re-separates produces a sheet in
 * which every class we compute is absent. Nothing errors; every component renders naked.
 */
type LockedKey =
  | "eject"
  | "hash"
  | "prefix"
  | "separator"
  | "jsxFramework"
  | "jsxFactory"
  | "importMap";

/**
 * Locked keys carry a message *as their type*, so passing one reads as a sentence in the editor
 * rather than as `Type 'boolean' is not assignable to type 'never'`.
 */
type LockedKeys = {
  [Key in LockedKey]?: `\`${Key}\` is set by defineChakraConfig, because our published runtime already committed to these names`;
};

/**
 * Panda merges a config's `theme.extend` and lets every sibling key **replace**, so `theme: {
 * tokens }` drops the preset's whole token table and all 19 recipes, silently. This narrows `theme`
 * to its `extend` alone, and derives the keys it forbids from Panda's own type — a Panda minor that
 * adds a theme key cannot leave a hole here.
 *
 * `staticCss` is **not** narrowed the same way, because `extend` does not rescue it: measured, a
 * config's `staticCss.css` replaces a preset's whole array in *either* spelling. What that key needs
 * is a merge, and `chakraStaticCss` below does it.
 */
type ExtendOnly<Option extends { extend?: unknown }, Name extends string> = Pick<
  Option,
  "extend"
> & {
  [Key in Exclude<keyof Option, "extend">]?: `\`${Name}.${Key &
    string}\` would replace ours outright — put it under \`${Name}.extend\``;
};

type ThemeOption = NonNullable<Config["theme"]>;
type StaticCssOption = NonNullable<Config["staticCss"]>;
/**
 * `PandaPlugin` is imported by `@pandacss/dev` but not re-exported from it, and a consumer holding
 * only the peer dependency cannot resolve `@pandacss/types` — so every type here is read off
 * `Config`, which is the one type that boundary does export.
 */
type Plugin = NonNullable<Config["plugins"]>[number];

export type ChakraConfigOverrides = Omit<Config, LockedKey | "theme" | "staticCss" | "include"> &
  LockedKeys & {
    /**
     * Required, because Panda's default (`src/**\/*.{js,jsx,ts,tsx}`) misses
     * `chakra-ui-solid/dist/panda.buildinfo.json` — the only channel carrying values our components
     * name and a consumer's source never writes.
     */
    include: NonNullable<Config["include"]>;
    theme?: ExtendOnly<ThemeOption, "theme">;
    staticCss?: StaticCssOption;
    /**
     * Which look to build the stylesheet from. Omit it and you get Chakra v3's.
     *
     * A **skin** is the swappable half of the design system — the token tables, the compositions
     * that read them, and any recipe *deltas* on top. The other half, the **anatomy**, is fixed: the
     * 75 recipe bodies, the style-prop utilities and the conditions are the same whichever skin is
     * loaded, because a recipe body is assembly rather than looks.
     *
     * ```ts
     * import { defineChakraConfig } from "@chakra-ui-solid/panda-preset";
     * import { someSkin } from "some-skin";
     *
     * export default defineChakraConfig({ skin: someSkin, include: [...], outdir: "styled-system" })
     * ```
     *
     * A skin **replaces** the default rather than extending it, and a skin that omits a token an
     * anatomy body references does not fail — Panda emits the unresolved name as a literal instead.
     * Measured: a skin missing `sizes.5` produced `width: 5px` where the default produces
     * `width: var(--chakra-sizes-5)`. Not unstyled, *wrong*, and green everywhere. So a skin is
     * written by starting from `chakraSkin` and overriding what it means to change.
     */
    skin?: Skin;
    responsive?: ResponsiveGrain;
    conditional?: ConditionalGrain;
    /**
     * Components to generate CSS for that no file in `include` imports.
     *
     * The stylesheet is otherwise decided by the import specifiers in the files Panda parses, so
     * only a component reaching the app from somewhere Panda does not scan needs naming here — a
     * dependency built on chakra-ui-solid, inside `node_modules`. For a package in your own
     * workspace, add it to `include` instead and this stays empty.
     *
     * It takes component names as they are imported, and it can only **widen**: nothing here can
     * remove a recipe the scan found.
     *
     * ```ts
     * components: ["Menu", "Toast"]
     * ```
     */
    components?: string[];
  };

/** Every knob a consumer's stylesheet has to agree with our published runtime on. */
const LOCKED = {
  // Drops `@pandacss/preset-panda`, Panda's default theme. Without it Panda's token palette merges
  // alongside Chakra's, the two disagree about `colors.gray.*`, and the result is a theme that is
  // neither — with nothing to say so. It costs the consumer no utilities, because
  // `chakraSolidPreset` declares `@pandacss/preset-base` itself.
  eject: true,
  // Must match the setting our published `styled-system` was generated with. See `LockedKey`.
  hash: false,
  // `cssVar` only, so class names keep their bare `p_4` spelling and everything above about `hash`
  // and `separator` still holds. `chakra` is the React version's own `cssVarsPrefix` default, and
  // the namespace earns its keep twice: it is what a reader who knows Chakra expects to find, and
  // it keeps our ~547 token variables — `--spacing-4`, `--colors-red-500`, `--sizes-md` — out of
  // a collision with the identically-named ones an app declares for itself.
  prefix: { cssVar: "chakra" },
  // Set rather than inherited. Panda's default is `_` on both sides, so today the two agree by
  // coincidence and a consumer who wrote `separator: "="` met no resistance at all — their sheet
  // would carry `p=4` while our runtime went on computing `p_4`.
  separator: "_",
  // With this set, Panda's default `jsxStyleProps: "all"` extracts style props from **any**
  // capitalized JSX component in the consumer's source, with no factory and no registration —
  // which is the only reason `<Box p={4}>` in their files produces a rule at all.
  jsxFramework: "solid",
  // A **different knob** from `jsxFramework`, and the one with the silent failure. Panda decides a
  // tag is styled by `isPandaComponent(tag) || isUpperCase(tag)`, and `chakra.button` is lowercase
  // — so without this the fallback declines it and every `<chakra.button bg="…">` in the consumer's
  // source produces ZERO rules, with no error and an unstyled page. It also renames the three
  // generated JSX types to Chakra v3's own names (`HTMLChakraProps`, `ChakraComponent`,
  // `ChakraVariantProps`).
  jsxFactory: "chakra",
  // Panda's external-package model: this tells the consumer's extractor that the styled-system API
  // it is looking for lives in our published package rather than in a directory they generated.
  //
  // The `jsx` half is the other half of `jsxFactory` above, and it is just as load-bearing: Panda
  // registers a factory only from an import whose NAME is the `jsxFactory` **and** whose MODULE is
  // listed here. `chakra` ships from `@chakra-ui-solid/core` and is re-exported by
  // `chakra-ui-solid`, so a consumer writes either import and both register.
  importMap: [
    "@chakra-ui-solid/styled-system",
    { jsx: ["@chakra-ui-solid/core", "chakra-ui-solid"] },
  ],
} as const satisfies Config;

/**
 * The consumer's whole `panda.config.ts`, and the only export they call.
 *
 * ```ts
 * import { defineChakraConfig } from "@chakra-ui-solid/panda-preset";
 *
 * export default defineChakraConfig({
 *   include: [
 *     "./node_modules/chakra-ui-solid/dist/panda.buildinfo.json",
 *     "./src/**\/*.{ts,tsx}",
 *   ],
 *   outdir: "styled-system-app",
 * })
 * ```
 *
 * It owns the merge, which is the whole reason it is a function rather than a fragment to spread.
 * Spreading is shallow, so a fragment puts the merge burden on the consumer and every key they get
 * wrong fails the same way: a stylesheet whose class names our compiled runtime never emits. Three
 * classes of key, and the type carries all three:
 *
 * - **Locked** — `LockedKey` above. A type error to pass, stripped by `...LOCKED` if one arrives
 *   from an untyped `panda.config.js`, and re-imposed on the fully merged config by
 *   `lockedKeysPlugin`.
 * - **Merged** — `presets` and `plugins` concatenate after ours; `theme` is narrowed to its
 *   `extend`, which is the form Panda deep-merges rather than replaces; `staticCss` has no such
 *   form and is unioned by `chakraStaticCss`.
 * - **Theirs** — `include`, `outdir`, `globalCss`, `preflight`, `conditions`, `cssVarRoot`, `hooks`
 *   and the rest, passed straight through. `conditions`, `utilities`, `globalCss` and `patterns`
 *   are safe unnarrowed because Panda merges those **per name**, so a clash is only ever on the one
 *   name the consumer wrote.
 *
 * **Not `mergeConfigs`.** It is not exported from `@pandacss/dev`, so a consumer who installed only
 * the peer dependency cannot reach it, and it returns `any` — which discards the `Config` types
 * this function exists to supply.
 */
export function defineChakraConfig(overrides: ChakraConfigOverrides): Config {
  const { skin, responsive, conditional, components, presets, theme, staticCss, plugins, ...rest } =
    overrides;
  // `??` rather than presence, which is the whole of *the third hazard*: a wrapper that forwards an
  // unset `skin` passes the key with `undefined`, and a presence merge would hand Panda a preset
  // built out of nothing — no tokens, so every token reference in all 75 anatomy bodies emits its
  // own name as a literal and the page is wrong rather than unstyled.
  const resolvedSkin = skin ?? chakraSkin;
  const preset = createChakraSolidPreset(resolvedSkin);
  const { extend, ...bareStaticCss } = staticCss ?? {};
  // Both opt-ins and the consumer's own `staticCss.recipes`, in one list per recipe. Ours first, so
  // two writers on one recipe read as two rules and neither replaces the other.
  const requested = mergeRecipeRules(
    mergeRecipeRules(expandResponsive(responsive), expandConditional(conditional)),
    mergeRecipeRules(extend?.recipes, bareStaticCss.recipes),
  );
  const placed = placeRecipeRules(requested);

  return {
    // Before their keys, so `preflight: false` and `preflight: { scope }` both win. After their
    // keys is where the locked ones go, for the opposite reason.
    preflight: true,
    ...(rest as Config),
    ...LOCKED,
    // Ours first, so a consumer's preset is later and therefore wins on a conflict.
    presets: [preset, ...(presets ?? [])],
    theme: themeWithRecipeRules(theme, placed.bodies),
    staticCss: chakraStaticCss(placed.unplaceable, { extend, ...bareStaticCss }, preset),
    // The gate reads the consumer's imports and adds the recipes they reach, the contract check
    // reads the result and only warns; `lockedKeysPlugin` stays last, so it corrects after a
    // consumer's own plugins have had their say.
    plugins: [
      ...(plugins ?? []),
      recipeGatePlugin(components),
      presetContractPlugin(),
      lockedKeysPlugin,
    ],
  };
}

type RecipeRuleList = Exclude<RecipeRules, "*">[string];
type PlacedRules = {
  bodies: { recipes: Record<string, RecipeRuleList>; slotRecipes: Record<string, RecipeRuleList> };
  unplaceable: RecipeRules | undefined;
};

/**
 * Which recipe each rule list belongs to — and the reason this function exists rather than the rules
 * going where Panda's own docs put them.
 *
 * **A recipe body's own `staticCss` outranks the config's.** Panda's `StaticCss.process()` walks
 * `theme.recipes` and `theme.slotRecipes` and, for any recipe whose *body* carries a `staticCss`
 * key, assigns that value over whatever the config asked for:
 * `staticCss.recipes[name] = recipe.staticCss`. So the body is where a rule for one of our recipes
 * has to land, and it is also why {@link withStaticCssBodies} keeps `"*"` at the head of the list —
 * the assignment is a replacement, and the import gate's own entry for that recipe is what would be
 * replaced.
 *
 * Measured, back when all 75 bodies carried `staticCss: ["*"]` and the config's key was therefore
 * dead on arrival: `responsive: { button: ["variant"] }` generated no `md:button--variant_*` rule at
 * all, and the `dialog` opt-in that appeared to work generated nothing either — the docs app writes
 * `size={{ mdDown: "full", md: "lg" }}` in `dialog-with-responsive-size.tsx` and Panda extracted the
 * literal out of its own source. Deleting the opt-in left both classes in the sheet.
 */
function placeRecipeRules(requested: RecipeRules | undefined): PlacedRules {
  const bodies: PlacedRules["bodies"] = { recipes: {}, slotRecipes: {} };

  // `"*"` names no recipe, so there is nothing to place. Every body already carries it.
  if (requested === undefined || requested === "*") {
    return { bodies, unplaceable: requested };
  }

  const unplaceable: Record<string, RecipeRuleList> = {};
  for (const [name, rules] of Object.entries(requested)) {
    const target = recipeKeys.includes(name)
      ? bodies.recipes
      : slotRecipeKeys.includes(name)
        ? bodies.slotRecipes
        : undefined;

    // A name no registry knows cannot be written into `theme.extend` — that declares a recipe with
    // no body rather than extending one. It goes back to `staticCss.recipes`, where Panda skips it
    // for want of a recipe node, which is the same nothing it did before and is visible in the
    // config a consumer is debugging.
    if (target === undefined) {
      unplaceable[name] = rules;
      continue;
    }
    target[name] = rules;
  }

  return {
    bodies,
    unplaceable: Object.keys(unplaceable).length > 0 ? unplaceable : undefined,
  };
}

type ThemeExtend = NonNullable<ThemeOption["extend"]>;

/**
 * The consumer's `theme.extend` with each placed rule list appended to its recipe's own `staticCss`.
 *
 * Merged into their body rather than assigned over it, so a consumer who extends `recipes.button`
 * with a `base` keeps it. The preset's `jsx` hint and a skin's recipe delta both survive on their
 * own — each is a key on a body Panda deep-merges, written one preset layer below this one, and
 * only the `staticCss` array is replaced.
 */
function themeWithRecipeRules(
  theirs: ChakraConfigOverrides["theme"],
  bodies: PlacedRules["bodies"],
): Config["theme"] {
  if (Object.keys(bodies.recipes).length === 0 && Object.keys(bodies.slotRecipes).length === 0) {
    return theirs as Config["theme"];
  }

  const extend = (theirs?.extend ?? {}) as ThemeExtend;

  return {
    ...(theirs as Config["theme"]),
    extend: {
      ...extend,
      ...withStaticCssBodies("recipes", extend.recipes, bodies.recipes),
      ...withStaticCssBodies("slotRecipes", extend.slotRecipes, bodies.slotRecipes),
    },
  };
}

function withStaticCssBodies<Key extends "recipes" | "slotRecipes">(
  key: Key,
  theirs: ThemeExtend[Key],
  rulesByRecipe: Record<string, RecipeRuleList>,
) {
  if (Object.keys(rulesByRecipe).length === 0) {
    return {};
  }

  const merged = { ...theirs } as Record<string, { staticCss?: unknown }>;
  for (const [name, rules] of Object.entries(rulesByRecipe)) {
    // `"*"` leads and appears once, and it is what makes naming a recipe here safe rather than
    // narrowing: a body's `staticCss` **replaces** whatever the config asked for that recipe, so a
    // list of `[{ size: ["*"], responsive: true }]` alone would drop every rule the import gate and
    // the `components` option put there. Once, because a consumer who spelled `"*"` themselves
    // should not turn the list into `["*", "*"]`.
    const rest = rules.filter((rule) => rule !== "*");
    merged[name] = { ...merged[name], staticCss: ["*", ...rest] };
  }

  return { [key]: merged } as { [K in Key]: ThemeExtend[Key] };
}

/**
 * The one key Panda gives us no merging seam for, so this function is the seam.
 *
 * Measured against `mergeConfigs`: a config's `staticCss.css` **replaces** a preset's whole array,
 * and `staticCss: { extend: { css } }` does exactly the same — the `extend` escape that rescues
 * `theme` does not rescue this one. So a consumer who declares any `css` entry at all silently loses
 * the preset's seven, which are what `<Flex inline>`, `<Wrap>` and every `StackSeparator` resolve
 * through: a boolean or shorthand prop flips a value at runtime, Panda's usage scan cannot see it,
 * and a pre-generated rule is the only thing that makes the prop do anything.
 *
 * Carrying them here rather than leaving them in the preset is what makes the union survive. The
 * cost is that this array now also outranks a *third-party* preset's `staticCss.css` — but Panda
 * was going to drop one of the two either way, and ours is the one whose absence unstyles Chakra's
 * own components.
 *
 * `recipes` is no longer merged here at all — every rule that names a recipe we ship is placed in
 * that recipe's own body instead, where Panda actually reads it (`placeRecipeRules`). What arrives
 * here is only what could not be placed.
 */
function chakraStaticCss(
  unplaceableRecipes: RecipeRules | undefined,
  theirs: StaticCssOption | undefined,
  preset: ReturnType<typeof createChakraSolidPreset>,
): StaticCssOption {
  // `extend` is **folded in here rather than passed through**, and that is the whole subtlety of
  // this key. Panda's `extend` path does not add to a top-level `css` array, it replaces it
  // (measured) — so an untouched `staticCss: { extend: { css } }` reaching Panda would undo exactly
  // the union this function exists to build, and take the preset's seven entries with it.
  //
  // And it is the spelling Panda **tells you to use**: its Extend page lists `staticCss` among the
  // parts `extend` extends, beside `conditions`, `globalCss` and `utilities`. Measured against
  // those three on one merge, the other three keep both sides and `staticCss` keeps only the
  // consumer's — because they are objects keyed by name and `staticCss.css` is an array. So a
  // consumer following Panda's own documentation is the case this branch exists for, not an exotic
  // one.
  const { extend, ...rest } = theirs ?? {};
  // `recipes` is dropped from both spellings rather than carried: every rule that names a recipe we
  // ship has already been placed in that recipe's body, and re-emitting it here would put a dead
  // copy in the config beside the live one.
  const { css: extendCss, recipes: _placedFromExtend, ...extendRest } = extend ?? {};
  const { css: bareCss, recipes: _placedFromBare, ...bareRest } = rest;

  return {
    // `patterns` and `themes` from whichever spelling carried them; theirs wins on a clash.
    ...extendRest,
    ...bareRest,
    css: [...(preset.staticCss?.css ?? []), ...(extendCss ?? []), ...(bareCss ?? [])],
    ...withRecipes(unplaceableRecipes),
  };
}

/** Omit the key entirely when nothing is left for it, so `responsive`'s default stays "off". */
function withRecipes(recipes: RecipeRules | undefined) {
  return recipes === undefined ? {} : { recipes };
}

type RecipeRules = NonNullable<StaticCssOption["recipes"]>;

function mergeRecipeRules(
  ours: RecipeRules | undefined,
  theirs: RecipeRules | undefined,
): RecipeRules | undefined {
  if (ours === undefined || theirs === undefined) {
    return theirs ?? ours;
  }
  // `"*"` is every recipe at every value, so it already contains whatever the other side asked for.
  if (ours === "*" || theirs === "*") {
    return "*";
  }

  const merged: Record<string, RecipeRule[]> = { ...ours };
  for (const [recipe, rules] of Object.entries(theirs)) {
    merged[recipe] = [...(merged[recipe] ?? []), ...rules];
  }
  return merged;
}

type RecipeRule = Exclude<RecipeRules, "*">[string][number];

/**
 * The tier the types cannot reach: an untyped `panda.config.js`, an `as any`, and — the likeliest of
 * the three — a consumer who spreads what this function returned and overrides a key afterwards.
 * Panda's `config:resolved` hook runs on the fully merged config and its **return value replaces
 * it**, so re-imposing is what works here. Throwing is not: `mergeHooks` wraps every hook in a
 * `try`/`catch` that logs and continues, so a thrown error cannot fail the build.
 */
const lockedKeysPlugin: Plugin = {
  name: "chakra-ui-solid:locked-keys",
  hooks: {
    "config:resolved": ({ config }) => {
      const overridden = lockedKeysOverriddenIn(config);
      if (overridden.length === 0) {
        return;
      }

      // `console.warn` rather than Panda's logger, which would be a dependency for one line and
      // which respects a level a consumer may have turned down. This one is about a config that
      // would otherwise fail in total silence.
      console.warn(
        `[chakra-ui-solid] restoring ${overridden.join(", ")} in panda.config — our published ` +
          `runtime emits class names like "p_4" and variables like "--chakra-spacing-4", and a ` +
          `stylesheet naming either differently contains no such rule and declares no such ` +
          `variable, so every component would render unstyled with no error anywhere.`,
      );

      return { ...config, ...LOCKED };
    },
  },
};

function lockedKeysOverriddenIn(config: Config): string[] {
  return Object.entries(LOCKED)
    .filter(([key, locked]) => {
      const actual = config[key as keyof Config];
      // `importMap` and `prefix` are the two structural values in the table, so identity says
      // nothing about them — and for `prefix` this branch is also what catches the string
      // spelling, since `"chakra"` would prefix class names too.
      return typeof locked === "object"
        ? JSON.stringify(actual) !== JSON.stringify(locked)
        : actual !== locked;
    })
    .map(([key]) => key);
}

/**
 * `{ button: ["size"] }` → `{ button: [{ size: ["*"], responsive: true }] }` — the form Panda
 * already understands, so the opt-in asks nothing new of Panda.
 */
type ResponsiveStaticCss = Record<string, Array<Record<string, ["*"] | true>>>;

function expandResponsive(grain: ResponsiveGrain | undefined): ResponsiveStaticCss | undefined {
  if (grain === undefined) {
    return undefined;
  }

  const perRecipe: Record<string, string[]> =
    grain === true
      ? Object.fromEntries(variantKeysFor().map(({ recipe, keys }) => [recipe, keys]))
      : Array.isArray(grain)
        ? Object.fromEntries(
            variantKeysFor()
              .filter(({ recipe }) => grain.includes(recipe))
              .map(({ recipe, keys }) => [recipe, keys]),
          )
        : grain;

  return Object.fromEntries(
    Object.entries(perRecipe).map(([recipe, keys]) => [
      recipe,
      [{ ...Object.fromEntries(keys.map((key) => [key, ["*"]])), responsive: true }],
    ]),
  );
}

/**
 * `{ button: { variant: ["selected"] } }` → `{ button: [{ variant: ["*"], conditions: ["selected"] }] }`
 * — the other half of the form Panda already understands, so this opt-in asks nothing new of it
 * either.
 *
 * **One rule per variant key**, where {@link expandResponsive} emits one rule per recipe: a
 * condition set belongs to the key that is conditioned, and `{ variant: ["hover"], size: ["open"] }`
 * has no single-rule spelling. Panda reads a recipe's rules as a list, so two entries under one name
 * is a shape it already handles.
 */
type ConditionalStaticCss = Record<string, Array<Record<string, string[]>>>;

function expandConditional(grain: ConditionalGrain | undefined): ConditionalStaticCss | undefined {
  if (grain === undefined) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(grain).map(([recipe, forRecipe]) => [
      recipe,
      Object.entries(conditionsPerKey(recipe, forRecipe)).map(([key, conditions]) => ({
        [key]: ["*"],
        conditions,
      })),
    ]),
  );
}

/**
 * An array names conditions for every variant key the recipe has; a record names them per key.
 *
 * A recipe with no variant keys yields no rules rather than an empty one — there is nothing for a
 * condition to multiply, and `responsive`'s `[{ responsive: true }]` counterpart only exists because
 * its `true` grain reaches all 75 whether or not a consumer meant them.
 */
function conditionsPerKey(
  recipe: string,
  grain: string[] | Record<string, string[]>,
): Record<string, string[]> {
  if (!Array.isArray(grain)) {
    return grain;
  }

  const keys = variantKeysFor().find((entry) => entry.recipe === recipe)?.keys ?? [];
  return Object.fromEntries(keys.map((key) => [key, grain]));
}
