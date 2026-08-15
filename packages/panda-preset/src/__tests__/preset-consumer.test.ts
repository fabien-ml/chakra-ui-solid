/**
 * A consumer's own preset — the seam that makes a different look a `presets` entry.
 *
 * A **preset** is the whole look: the token tables, the compositions that read them, and a body for
 * each of the 75 recipes. It arrives through Panda's own `presets` array rather than a key of ours,
 * after `chakraPreset`, which is what puts it in the position where a bare `theme.recipes`
 * **replaces** the bodies it declares.
 *
 * Most of this file reads a **generated stylesheet** rather than a config, and here that is not only
 * the reasoning `generated-css.test.ts` opens with — it is the only reachable proof. Everything
 * about how a preset lands is Panda's own merge across the chain, and that merge is not importable:
 * `@pandacss/config` and `@pandacss/node` are transitive and do not resolve from this package. What
 * a config declares and what Panda emits are two different things, and only one of them can be
 * asserted here.
 *
 * `pnpm test:unit` runs `cssgen` first, so the fixture's sheet is always current.
 */

import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { type ChakraConfigOverrides, defineChakraConfig } from "../config";
import { fixturePreset } from "./__fixtures__/preset-consumer/preset";

const MINIMAL = { include: [] } satisfies ChakraConfigOverrides;

describe("defineChakraConfig — where a consumer's preset lands", () => {
  it("puts it after ours, which is the position that replaces bodies", () => {
    // Panda resolves each theme key from the **last** preset that declares it and takes that value
    // whole. Ours first is therefore the whole mechanism: a consumer's `theme.recipes` outranks
    // `chakraPreset`'s, while our `theme.extend` — the `jsx` hints — merges back on top of whatever
    // replaced them.
    const presets = defineChakraConfig({ ...MINIMAL, presets: [fixturePreset] }).presets ?? [];

    expect(presets).toHaveLength(2);
    expect((presets[0] as { name?: string }).name).toBe("@chakra-ui-solid/panda-preset");
    expect(presets[1]).toBe(fixturePreset);
  });

  it("leaves the consumer's own `theme` alone", () => {
    // A preset travels as a preset, so nothing about it reaches the config object. That is what
    // keeps the default stylesheet byte-identical and what keeps the two layers separable.
    expect(defineChakraConfig({ ...MINIMAL, presets: [fixturePreset] }).theme).toBeUndefined();
  });
});

const stylesheetPath = new URL("./__fixtures__/preset-consumer/consumer.css", import.meta.url);

if (!existsSync(stylesheetPath)) {
  throw new Error(
    `The preset fixture's stylesheet is missing at ${stylesheetPath.pathname}. Run \`pnpm cssgen\` ` +
      "— these tests read what Panda actually emitted, and there is nothing to read yet.",
  );
}

const css = readFileSync(stylesheetPath, "utf8");
/** A recipe's base rule alone — every `--variant_*` and `:is(…)` selector is a different one. */
const baseRule = (recipe: string) => css.match(new RegExp(`\\.${recipe} \\{[^}]*\\}`))?.[0] ?? "";

describe("the stylesheet a consumer's preset generates", () => {
  it("declares the preset's radii where Chakra's semantic scale used to be", () => {
    expect(css).toMatch(/--chakra-radii-l1:\s*3px/);
    expect(css).toMatch(/--chakra-radii-l2:\s*13px/);
    expect(css).toMatch(/--chakra-radii-l3:\s*23px/);
    expect(css).not.toMatch(/--chakra-radii-l2:\s*var\(--chakra-radii-sm\)/);
  });

  it("repaints a solid Button through the variable its own body reads", () => {
    // `colorPalette.solid` is virtual — Panda points `--chakra-colors-color-palette-solid` at
    // whichever palette is in scope, and the default is `gray`. So the *token* is what moved, and
    // a preset that kept Chakra's `variant.solid` verbatim would repaint exactly the same way.
    expect(css).toMatch(/--chakra-colors-gray-solid:\s*#00ff00/);
    expect(css).toMatch(/--chakra-colors-color-palette-solid:\s*var\(--chakra-colors-gray-solid\)/);
    expect(css).toMatch(
      /\.button--variant_solid \{[^}]*background:\s*var\(--chakra-colors-color-palette-solid\)/,
    );
  });

  it("replaces a recipe body outright rather than merging into it", () => {
    // **The whole difference between the two positions.** `theme.extend` deep-merges and cannot
    // delete; a preset's bare `theme.recipes` replaces. Chakra's `button` sets 22 base declarations
    // and the fixture's sets three, so every one of Chakra's is gone — and what is left is the
    // fixture's own.
    expect(baseRule("button")).toMatch(/letter-spacing:\s*0\.5em/);
    expect(baseRule("button")).toMatch(/border-radius:\s*var\(--chakra-radii-l3\)/);
    expect(baseRule("button")).not.toMatch(/display:\s*inline-flex/);
    expect(baseRule("button")).not.toMatch(/font-weight:/);

    // Its variants are the fixture's too, at every value the contract requires.
    expect(css).toMatch(/\.button--size_2xl \{[^}]*font-size:\s*var\(--chakra-font-sizes-2xl\)/);
    expect(css).toMatch(/\.button--variant_ghost \{/);
  });

  it("keeps every body the preset inherited rather than replaced", () => {
    // The other half of "replaces the key whole": a preset that spreads `chakraPreset.theme.recipes`
    // and names one of them keeps the other 18 intact. A sheet where `container` had lost its width
    // and padding would mean the spread is not what makes that safe.
    expect(baseRule("container")).toMatch(/max-width:\s*var\(--chakra-sizes-8xl\)/);
    expect(baseRule("container")).toMatch(/padding-inline:\s*var\(--chakra-spacing-4\)/);
    expect(css).toMatch(/\.container--centerContent_true \{/);
  });

  it("keeps the library layer's own `staticCss` across the swap", () => {
    // Measured, and the reason the `jsx` hints and these rules are written one layer above the
    // look: an earlier preset's `theme.extend` survives a later preset replacing every body. These
    // atomic rules are what `<Flex inline>` and every StackSeparator resolve through, and a preset
    // swap that dropped them would unstyle a value no consumer's source ever spells.
    expect(css).toMatch(/\.d_inline-flex \{/);
    expect(css).toMatch(/\.flex-d_column \{/);
  });

  it("lets the consumer's own `theme.extend` beat the preset on a property both wrote", () => {
    // The ordering this package does not arrange: the preset is a preset and the consumer's
    // `panda.config.ts` is the config, so the config is the later `extend` writer and Panda settles
    // it. Both spell `textTransform` on `button`; only the consumer's reaches the sheet.
    expect(css).toMatch(/text-transform:\s*lowercase/);
    expect(css).not.toMatch(/text-transform:\s*uppercase/);
  });

  it("leaves every scale the preset did not name exactly as Chakra declares it", () => {
    // The other half of the merge tests, and the one that tells a working swap from a collapsed
    // sheet: this preset is Chakra's theme with three scales moved, not a new one.
    expect(css).toMatch(/--chakra-radii-md:\s*0\.375rem/);
    expect(css).toMatch(/--chakra-spacing-4:\s*1rem/);
    expect(css).toMatch(/--chakra-colors-red-500:/);
  });
});
