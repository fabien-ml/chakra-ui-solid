import { describe, expect, it } from "vitest";
import { componentNameFor, recipeKeys, slotRecipeKeys, variantKeysFor } from "../recipe-registry";

/**
 * The registry reads the recipe list off the vendored barrels under `chakra/` rather than from a
 * list typed out here, so a Chakra release that adds a recipe is covered by the `diff -r` that
 * brings its file in. These tests pin the reads, not the list — a count that moves is a real
 * upstream change and worth seeing.
 *
 * `container` is the one key upstream's own generator strips, since Panda ships a `container`
 * pattern of its own; `chakra/recipes/index.ts` registers our reproduction of Chakra's body beside
 * the other eighteen. The count is therefore 18 + 1, and a 19 that became a 20 by itself is the
 * upstream change to look at.
 */

describe("the recipe list, read off the vendored bodies", () => {
  it("finds 18 atomic and 56 slot recipes, plus the one upstream's generator strips", () => {
    expect(recipeKeys).toHaveLength(19);
    expect(slotRecipeKeys).toHaveLength(56);
    // Zero would also be a "successful" read: `Object.keys(theme?.recipes ?? {})` on a preset whose
    // shape changed returns an empty array, and every downstream `staticCss` declaration would
    // quietly cover nothing.
    expect(recipeKeys).toContain("button");
    expect(slotRecipeKeys).toContain("dialog");
  });

  it("registers `container` alongside them rather than beside them", () => {
    // The whole point of putting the ported recipe in this list: `staticCss: ["*"]`, the jsx hint
    // and `defineChakraConfig({ responsive })` all walk `recipeKeys`, so a delta bolted onto the preset
    // alone would be missing from all three — and each of those three fails silently.
    expect(recipeKeys).toContain("container");
    expect(componentNameFor("container")).toBe("Container");
    expect(variantKeysFor().find((entry) => entry.recipe === "container")).toEqual({
      recipe: "container",
      keys: ["centerContent", "fluid"],
    });
  });

  it("carries `swittch` verbatim, misspelling and all", () => {
    // Panda names the generated function after the key, and `export const switch` is a syntax
    // error — which is why upstream's own generator renames it on the way out. Aliasing it back
    // would register the same `className: "switch"` body under two keys and emit its CSS twice.
    expect(slotRecipeKeys).toContain("swittch");
    expect(slotRecipeKeys).not.toContain("switch");
  });
});

describe("componentNameFor", () => {
  it("derives the name from the recipe's `className`, not its registry key", () => {
    // The whole reason it goes through `className`: the key is `swittch` and the component is
    // `Switch`. Going through the key would hand Panda a jsx tracking hint for a component that
    // does not exist — and a wrong hint fails silently, because a hint is only an optimization.
    expect(componentNameFor("swittch")).toBe("Switch");
  });

  it("pascal-cases a hyphenated name", () => {
    expect(componentNameFor("action-bar")).toBe("ActionBar");
  });

  it("falls back to the key when there is no entry", () => {
    expect(componentNameFor("not-a-recipe")).toBe("NotARecipe");
  });
});

describe("variantKeysFor", () => {
  it("covers every recipe, atomic and slot alike", () => {
    expect(variantKeysFor()).toHaveLength(recipeKeys.length + slotRecipeKeys.length);
  });

  it("reports a recipe's own variant key names", () => {
    expect(variantKeysFor().find((entry) => entry.recipe === "button")).toEqual({
      recipe: "button",
      keys: ["size", "variant"],
    });
  });

  it("reports an empty list for a recipe with no variants rather than dropping it", () => {
    // Nine of the 75 have none. Dropping them would make `defineChakraConfig({ responsive: true })` cover
    // 65 recipes while reporting that it covers all of them.
    const withoutVariants = variantKeysFor().filter((entry) => entry.keys.length === 0);
    expect(withoutVariants.map((entry) => entry.recipe)).toContain("tooltip");
    expect(withoutVariants.length).toBeGreaterThan(0);
  });
});
