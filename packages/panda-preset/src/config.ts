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

export interface ChakraConfigOptions {
  responsive?: ResponsiveGrain;
}

/**
 * The `defineConfig`-shaped fragment a consumer spreads into their own `panda.config.ts`.
 *
 * It exists because of one failure mode that has no other guard. In Panda's external-package model
 * the consumer does **not** regenerate the runtime: `css()` comes from our published
 * `@chakra-ui-solid/styled-system`, and their Panda run produces only the stylesheet. So `hash` and
 * `prefix` have to agree across that boundary — our runtime emits `p_4`, and a consumer who sets
 * `hash: true` gets a stylesheet whose rules are hashed instead, at which point every class our
 * runtime computes is absent from their sheet. Nothing errors; every component renders naked. A
 * fragment makes that unconstructable, where a documented sentence only makes it unlikely
 * (`plan.md` §3.4).
 *
 * ```ts
 * // the consumer's panda.config.ts
 * export default defineConfig({
 *   ...chakraConfig(),
 *   include: [
 *     "./node_modules/@chakra-ui-solid/components/dist/**\/*.jsx",
 *     "./src/**\/*.{ts,tsx}",
 *   ],
 *   outdir: "styled-system-app",
 * })
 * ```
 *
 * **Spreading is shallow**, so any key the consumer re-declares replaces ours outright. That is
 * intended for `include` and `outdir`, and measured per key everywhere else (`plan.md` §3.4):
 *
 * - `presets` — a re-declare drops **every** Chakra token and recipe. Name the call (`const base =
 *   chakraConfig()`) and spread ours back in: `presets: [...(base.presets ?? []), myPreset]`.
 * - `staticCss` — the same wipe, and only reachable when the consumer passed `responsive`, because
 *   that is the one case where this function writes a top-level `staticCss` block of its own.
 * - `importMap` — a re-declare unregisters the `chakra` factory, and every `<chakra.button bg="…">`
 *   then emits nothing at all. Add to `base.importMap` rather than replacing it.
 * - `theme` — safe under `theme.extend`, which merges. A bare `theme` drops about half of Chakra's
 *   tokens.
 *
 * **Not `mergeConfigs`.** It is not exported from `@pandacss/dev`, so a consumer who installed only
 * the peer dependency cannot reach it, and it returns `any` — which discards the `Config` types
 * this function exists to supply.
 *
 * It is a function even with no arguments so that the responsive opt-in below is a change of
 * argument rather than a change of call shape.
 */
export function chakraConfig(options: ChakraConfigOptions = {}): Config {
  const config: Config = {
    // Drops `@pandacss/preset-panda`, Panda's default theme. Without it Panda's token palette
    // merges alongside Chakra's, the two disagree about `colors.gray.*`, and the result is a theme
    // that is neither — with nothing to say so. It costs the consumer no utilities, because
    // `chakraSolidPreset` declares `@pandacss/preset-base` itself.
    eject: true,
    presets: [chakraSolidPreset],
    // With this set, Panda's default `jsxStyleProps: "all"` extracts style props from **any**
    // capitalized JSX component in the consumer's source, with no factory and no registration —
    // which is the only reason `<Box p={4}>` in their files produces a rule at all.
    jsxFramework: "solid",
    // A **different knob** from `jsxFramework`, and the one with the silent failure. Panda decides
    // a tag is styled by `isPandaComponent(tag) || isUpperCase(tag)`, and `chakra.button` is
    // lowercase — so without this the fallback declines it and every `<chakra.button bg="…">` in
    // the consumer's source produces ZERO rules, with no error and an unstyled page. It also
    // renames the three generated JSX types to Chakra v3's own names (`HTMLChakraProps`,
    // `ChakraComponent`, `ChakraVariantProps`).
    jsxFactory: "chakra",
    // Must match the setting our published `styled-system` was generated with. See above.
    hash: false,
    preflight: true,
    // Panda's external-package model: this tells the consumer's extractor that the styled-system
    // API it is looking for lives in our published package rather than in a directory they
    // generated.
    //
    // The `jsx` half is the other half of `jsxFactory` above, and it is just as load-bearing:
    // Panda registers a factory only from an import whose NAME is the `jsxFactory` **and** whose
    // MODULE is listed here. `chakra` ships from `@chakra-ui-solid/system` and is re-exported by
    // `@chakra-ui-solid/components`, so a consumer writes either import and both register.
    importMap: [
      "@chakra-ui-solid/styled-system",
      { jsx: ["@chakra-ui-solid/system", "@chakra-ui-solid/components"] },
    ],
  };

  const responsive = expandResponsive(options.responsive);
  if (responsive !== undefined) {
    // A **top-level** `staticCss` block, which is the opposite of how the per-recipe declarations
    // in `preset.ts` are written, and for the opposite reason: those avoid a top-level block
    // because ours would compete with a consumer's own, whereas this block *is* the consumer's —
    // written into their config by a function they called.
    config.staticCss = { recipes: responsive };
  }

  return config;
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
