import { describe, expect, it } from "vitest";
import { componentNameFor, recipeKeys, slotRecipeKeys, variantKeysFor } from "../recipe-registry";

/**
 * The registry reads the recipe list off the imported `@chakra-ui/panda-preset` rather than from a
 * list typed out here, which is what *depend, do not vendor* buys: a Chakra release that adds a
 * recipe is covered by the version bump alone. These tests pin the reads, not the list — a count
 * that moves is a real upstream change and worth seeing.
 */

describe("the recipe list, read off the upstream preset", () => {
  it("finds 18 atomic and 56 slot recipes", () => {
    expect(recipeKeys).toHaveLength(18);
    expect(slotRecipeKeys).toHaveLength(56);
    // Zero would also be a "successful" read: `Object.keys(theme?.recipes ?? {})` on a preset whose
    // shape changed returns an empty array, and every downstream `staticCss` declaration would
    // quietly cover nothing.
    expect(recipeKeys).toContain("button");
    expect(slotRecipeKeys).toContain("dialog");
  });

  it("carries `swittch` verbatim, misspelling and all", () => {
    // Aliasing it to `switch` would register the same `className: "switch"` body under two keys and
    // emit its CSS twice; renaming it forks the package we depend on. So the key stays wrong.
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
    // Nine of the 74 have none. Dropping them would make `chakraConfig({ responsive: true })` cover
    // 65 recipes while reporting that it covers all of them.
    const withoutVariants = variantKeysFor().filter((entry) => entry.keys.length === 0);
    expect(withoutVariants.map((entry) => entry.recipe)).toContain("tooltip");
    expect(withoutVariants.length).toBeGreaterThan(0);
  });
});
