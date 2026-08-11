import type { Config } from "@pandacss/dev";
import { chakraSolidPreset } from "./preset";
import { variantKeysFor } from "./recipe-registry";

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
     * Required, because Panda's default (`src/**\/*.{js,jsx,ts,tsx}`) misses our `dist/` glob — the
     * only channel carrying values our components name and a consumer's source never writes.
     */
    include: NonNullable<Config["include"]>;
    theme?: ExtendOnly<ThemeOption, "theme">;
    staticCss?: StaticCssOption;
    responsive?: ResponsiveGrain;
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
  // listed here. `chakra` ships from `@chakra-ui-solid/system` and is re-exported by
  // `chakra-ui-solid`, so a consumer writes either import and both register.
  importMap: [
    "@chakra-ui-solid/styled-system",
    { jsx: ["@chakra-ui-solid/system", "chakra-ui-solid"] },
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
 *     "./node_modules/chakra-ui-solid/dist/**\/*.jsx",
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
  const { responsive, presets, theme, staticCss, plugins, ...rest } = overrides;
  const responsiveRecipes = expandResponsive(responsive);

  return {
    // Before their keys, so `preflight: false` and `preflight: { scope }` both win. After their
    // keys is where the locked ones go, for the opposite reason.
    preflight: true,
    ...(rest as Config),
    ...LOCKED,
    // `LOCKED` cannot carry this: the agreed value is *absent*, and a `prefix` key holding
    // `undefined` is what overwrites one that arrived from an untyped config.
    prefix: undefined,
    // Ours first, so a consumer's preset is later and therefore wins on a conflict.
    presets: [chakraSolidPreset, ...(presets ?? [])],
    theme: theme as Config["theme"],
    staticCss: chakraStaticCss(responsiveRecipes, staticCss),
    // Last, so it corrects after a consumer's own plugins have had their say.
    plugins: [...(plugins ?? []), lockedKeysPlugin],
  };
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
 * `recipes` needs the same treatment for the same reason, because `responsive` writes that key and
 * a consumer may write it too.
 */
function chakraStaticCss(
  responsiveRecipes: ResponsiveStaticCss | undefined,
  theirs: StaticCssOption | undefined,
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

  return {
    // `patterns` and `themes` from whichever spelling carried them; theirs wins on a clash.
    ...extend,
    ...rest,
    css: [...(chakraSolidPreset.staticCss?.css ?? []), ...(extend?.css ?? []), ...(rest.css ?? [])],
    ...withRecipes(
      mergeRecipeRules(mergeRecipeRules(responsiveRecipes, extend?.recipes), rest.recipes),
    ),
  };
}

/** Omit the key entirely when nobody asked for a recipe, so `responsive`'s default stays "off". */
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
          `runtime emits class names like "p_4", and a stylesheet named any other way contains no ` +
          `such rule, so every component would render unstyled with no error anywhere.`,
      );

      return { ...config, ...LOCKED, prefix: undefined };
    },
  },
};

function lockedKeysOverriddenIn(config: Config): string[] {
  const overridden = Object.entries(LOCKED)
    .filter(([key, locked]) => {
      const actual = config[key as keyof Config];
      // `importMap` is the one array in the table, so identity says nothing about it.
      return typeof locked === "object"
        ? JSON.stringify(actual) !== JSON.stringify(locked)
        : actual !== locked;
    })
    .map(([key]) => key);

  return config.prefix === undefined ? overridden : [...overridden, "prefix"];
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
