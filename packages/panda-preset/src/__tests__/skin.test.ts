/**
 * The `skin` key on `defineChakraConfig()` — the seam that makes a different look a one-liner.
 *
 * A **skin** is the swappable half of the design system: the token tables, the compositions that
 * read them, and any recipe *deltas* on top. The **anatomy** — the 75 recipe bodies, the style-prop
 * utilities, the conditions — is fixed, because a recipe body is assembly rather than looks.
 *
 * The second half of this file reads a **generated stylesheet** rather than the config, and here
 * that is not only the reasoning `generated-css.test.ts` opens with — it is the only reachable
 * proof. A skin is a *preset*, so everything about how its deltas land is Panda's own merge across
 * the preset chain, and Panda's merge is not importable: `@pandacss/config` and `@pandacss/node` are
 * transitive and do not resolve from this package. What a config declares and what Panda emits are
 * two different things, and only one of them can be asserted here.
 *
 * `pnpm test:unit` runs `cssgen` first, so the fixture's sheet is always current.
 */

import { existsSync, readFileSync } from "node:fs";
import type { Config } from "@pandacss/dev";
import { describe, expect, it } from "vitest";
import { type ChakraConfigOverrides, defineChakraConfig } from "../config";
import { createChakraSolidPreset } from "../preset";
import { chakraSkin } from "../skin";
import { fixtureSkin } from "./__fixtures__/skin-consumer/skin";

const MINIMAL = { include: [] } satisfies ChakraConfigOverrides;

type PresetLike = { name?: string; theme?: Record<string, unknown> };

/**
 * The preset a skin becomes, read back out of the chain `defineChakraConfig()` built.
 *
 * Found by name rather than by index: `@chakra-ui-solid/skin` is one of three entries our preset
 * declares, and which slot it holds is not what any test here is about.
 */
function skinPresetIn(config: Config): PresetLike | undefined {
  const nested = (config.presets?.[0] as { presets?: PresetLike[] })?.presets;
  return nested?.find((preset) => preset.name === "@chakra-ui-solid/skin");
}

const skinThemeIn = (config: Config) => skinPresetIn(config)?.theme;
const skinExtendIn = (config: Config) =>
  skinThemeIn(config)?.extend as { recipes?: Record<string, unknown> } | undefined;

describe("defineChakraConfig — the skin key", () => {
  it("builds the stylesheet from Chakra's own skin when none is passed", () => {
    // Identity rather than equality: `chakraSkin` slices its tokens off the imported preset object,
    // so this is the same table upstream ships and not a copy of it.
    expect(skinThemeIn(defineChakraConfig(MINIMAL))?.tokens).toBe(chakraSkin.tokens);
  });

  it("keeps that default when the key arrives explicitly unset", () => {
    // *The third hazard.* `merge` and a spread both resolve a key by **presence**, so a wrapper
    // forwarding an unset `skin` hands this function the key with `undefined` in it. Resolved by
    // presence, the preset would be built out of nothing — no tokens at all, so every token
    // reference in all 75 anatomy bodies emits its own name as a literal and the page renders
    // wrong rather than unstyled, with nothing to report it.
    expect(skinThemeIn(defineChakraConfig({ ...MINIMAL, skin: undefined }))?.tokens).toBe(
      chakraSkin.tokens,
    );
  });

  it("hands a passed skin's token tables to the preset instead", () => {
    const theme = skinThemeIn(defineChakraConfig({ ...MINIMAL, skin: fixtureSkin }));

    expect(theme?.semanticTokens).toBe(fixtureSkin.semanticTokens);
    expect(theme?.tokens).toBe(chakraSkin.tokens);
  });

  it("puts its recipe deltas under `theme.extend`, never beside the token tables", () => {
    // The whole of this phase, in one assertion. A preset's bare `theme` sits in a **replacing**
    // position: Panda resolves each theme key from the last preset that declares it and takes that
    // value whole, so a delta written to `theme.recipes` here would leave the other 74 recipes with
    // no body at all — and a recipe with no body emits no rules and raises no error.
    const theme = skinThemeIn(defineChakraConfig({ ...MINIMAL, skin: fixtureSkin }));

    expect(theme).not.toHaveProperty("recipes");
    expect(theme).not.toHaveProperty("slotRecipes");
    expect((theme?.extend as { recipes?: Record<string, unknown> })?.recipes).toBe(
      fixtureSkin.recipes,
    );
  });

  it("leaves the consumer's own `theme` alone, whatever the skin carries", () => {
    // The deltas travel as a preset, so nothing about a skin reaches the config object. That is
    // what keeps the default stylesheet byte-identical and what keeps the two layers separable.
    expect(defineChakraConfig({ ...MINIMAL, skin: fixtureSkin }).theme).toBeUndefined();
  });

  it("keeps the library's `jsx` hint on a recipe the skin also wrote, one layer above it", () => {
    // Two `theme.extend` writers on one recipe name, and the reason they cannot collide: they are
    // separate objects on separate presets, so no spread in this package ever sees both. Whether
    // *Panda* keeps both is a different question, and only the stylesheet can answer it — see
    // "keeps the library's own recipe body beside a skin's delta on the same name" below.
    const preset = createChakraSolidPreset(fixtureSkin);
    const libraryLayer = preset.theme?.extend?.recipes ?? {};

    expect(libraryLayer.button?.jsx).toEqual(["Button"]);
    expect(libraryLayer.button).not.toHaveProperty("base");
    expect(
      skinExtendIn(defineChakraConfig({ ...MINIMAL, skin: fixtureSkin }))?.recipes,
    ).toHaveProperty("button");
  });

  it("keeps a skin's delta clear of the `staticCss` rules the opt-ins place", () => {
    // The two now live on different layers entirely — the rule list in the consumer's config, the
    // delta in the skin's preset — so neither can overwrite the other's body.
    const config = defineChakraConfig({
      ...MINIMAL,
      skin: fixtureSkin,
      responsive: { button: ["size"] },
    });

    expect(config.theme?.extend?.recipes?.button).toEqual({
      staticCss: ["*", { size: ["*"], responsive: true }],
    });
    expect(skinExtendIn(config)?.recipes).toBe(fixtureSkin.recipes);
  });
});

const stylesheetPath = new URL("./__fixtures__/skin-consumer/consumer.css", import.meta.url);

if (!existsSync(stylesheetPath)) {
  throw new Error(
    `The skin fixture's stylesheet is missing at ${stylesheetPath.pathname}. Run \`pnpm cssgen\` ` +
      "— these tests read what Panda actually emitted, and there is nothing to read yet.",
  );
}

const css = readFileSync(stylesheetPath, "utf8");
/** A recipe's base rule alone — every `--variant_*` and `:is(…)` selector is a different one. */
const baseRule = (recipe: string) => css.match(new RegExp(`\\.${recipe} \\{[^}]*\\}`))?.[0] ?? "";

describe("the stylesheet a skin generates", () => {
  it("declares the skin's radii where Chakra's semantic scale used to be", () => {
    expect(css).toMatch(/--chakra-radii-l1:\s*3px/);
    expect(css).toMatch(/--chakra-radii-l2:\s*13px/);
    expect(css).toMatch(/--chakra-radii-l3:\s*23px/);
    expect(css).not.toMatch(/--chakra-radii-l2:\s*var\(--chakra-radii-sm\)/);
  });

  it("repaints a solid Button through the variable it was already reading", () => {
    // `colorPalette.solid` is virtual — Panda points `--chakra-colors-color-palette-solid` at
    // whichever palette is in scope, and the default is `gray`. So the recipe rule is untouched and
    // the *token* underneath it is what moved, which is the whole shape of a skin.
    expect(css).toMatch(/--chakra-colors-gray-solid:\s*#00ff00/);
    expect(css).toMatch(/--chakra-colors-color-palette-solid:\s*var\(--chakra-colors-gray-solid\)/);
    expect(css).toMatch(
      /\.button--variant_solid \{[^}]*background:\s*var\(--chakra-colors-color-palette-solid\)/,
    );
  });

  it("merges a recipe delta into the anatomy's body instead of replacing it", () => {
    expect(baseRule("button")).toMatch(/border-radius:\s*var\(--chakra-radii-l3\)/);
    expect(baseRule("button")).not.toMatch(/border-radius:\s*var\(--chakra-radii-l2\)/);

    // `theme.extend` deep-merges and **cannot delete**, so the 21 base declarations the delta never
    // mentioned are still there — and so are all four variant keys. That is what separates "the
    // skin applied" from "the body was replaced by a one-property recipe", which would emit a
    // Button with no layout, no variants and no error.
    expect(baseRule("button")).toMatch(/display:\s*inline-flex/);
    expect(baseRule("button")).toMatch(/font-weight:\s*var\(--chakra-font-weights-medium\)/);
    expect(css).toMatch(/\.button--variant_outline \{/);
    expect(css).toMatch(/\.button--size_md \{/);
  });

  it("keeps the library's own recipe body beside a skin's delta on the same name", () => {
    // `container` is the one recipe this package **reproduces itself** — upstream's generator
    // strips it, so `container-recipe.ts` is what `chakra/recipes/index.ts` registers. The fixture
    // skin writes a delta on that same name, which is the case a merge can silently collapse: keep
    // only the skin's and the Container loses its width, its padding and its variants; keep only
    // the body and the skin's radius never lands.
    expect(baseRule("container")).toMatch(/border-radius:\s*var\(--chakra-radii-l1\)/);
    expect(baseRule("container")).toMatch(/max-width:\s*var\(--chakra-sizes-8xl\)/);
    expect(baseRule("container")).toMatch(/padding-inline:\s*var\(--chakra-spacing-4\)/);
    expect(baseRule("container")).toMatch(/margin-inline:\s*auto/);
    expect(css).toMatch(/\.container--centerContent_true \{/);
    expect(css).toMatch(/\.container--fluid_true \{/);
  });

  it("lets the consumer's own `theme.extend` beat the skin on a property both wrote", () => {
    // The ordering this package no longer arranges: the skin is a preset and the consumer's
    // `panda.config.ts` is the config, so the config is the later `extend` writer and Panda settles
    // it. Both spell `textTransform` on `button`; only the consumer's reaches the sheet.
    expect(css).toMatch(/text-transform:\s*lowercase/);
    expect(css).not.toMatch(/text-transform:\s*uppercase/);
  });

  it("leaves every scale the skin did not name exactly as Chakra declares it", () => {
    // The other half of the merge tests, and the one that tells a working swap from a collapsed
    // sheet: a skin is a delta on a token table, not a new one.
    expect(css).toMatch(/--chakra-radii-md:\s*0\.375rem/);
    expect(css).toMatch(/--chakra-spacing-4:\s*1rem/);
    expect(css).toMatch(/--chakra-colors-red-500:/);
  });
});
