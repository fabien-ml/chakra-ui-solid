import { describe, expect, it } from "vitest";
import { recipes } from "../chakra/recipes";
import { slotRecipes } from "../chakra/slot-recipes";
import {
  componentNameFor,
  contract,
  defaultVariantsFor,
  type RecipeShape,
  recipeContract,
  recipeKeys,
  slotRecipeContract,
  slotRecipeKeys,
  variantKeysFor,
} from "../contract";

/**
 * `contract/` is **authored** — 75 shapes written out by hand, one file per recipe, rather than
 * computed from whichever preset is loaded, because every reader of them runs at config time,
 * before a theme exists. The price of that is drift, and this file is the whole mechanism that
 * catches it: the vendored Chakra bodies under `chakra/` are one preset that must satisfy the
 * contract, so their shape and the contract are compared here on every `vitest --project=unit` run.
 *
 * A body edited upstream that adds a variant value therefore turns this red, and the fix is a
 * deliberate edit to that recipe's file — which is also the diff telling a reviewer that every
 * third-party preset just stopped satisfying the contract.
 */

/** The four keys the contract records, out of the far wider body Panda's own types describe. */
type VendoredBody = {
  className: string;
  slots?: readonly string[];
  variants?: Record<string, Record<string, unknown>>;
  defaultVariants?: Record<string, string | boolean>;
  compoundVariants?: unknown[];
};

const vendoredRecipes = recipes as unknown as Record<string, VendoredBody>;
const vendoredSlotRecipes = slotRecipes as unknown as Record<string, VendoredBody>;

function shapeOf(body: VendoredBody): RecipeShape {
  return {
    className: body.className,
    slots: body.slots ?? [],
    variants: Object.fromEntries(
      Object.entries(body.variants ?? {}).map(([key, values]) => [key, Object.keys(values)]),
    ),
    defaultVariants: body.defaultVariants ?? {},
  };
}

function shapesOf(table: Record<string, VendoredBody>): Record<string, RecipeShape> {
  return Object.fromEntries(Object.entries(table).map(([key, body]) => [key, shapeOf(body)]));
}

describe("the drift guard", () => {
  it("matches the vendored atomic bodies", () => {
    expect(recipeContract).toEqual(shapesOf(vendoredRecipes));
  });

  it("matches the vendored slot bodies", () => {
    expect(slotRecipeContract).toEqual(shapesOf(vendoredSlotRecipes));
  });

  it("lists them in the order the vendored barrels do", () => {
    // Not cosmetic: `preset.ts` walks these keys to write one jsx hint per recipe and `config.ts`
    // walks them to expand `responsive`, so a reordering here is a reordering of what Panda is
    // handed — and `toEqual` above would not see it.
    expect(recipeKeys).toEqual(Object.keys(vendoredRecipes));
    expect(slotRecipeKeys).toEqual(Object.keys(vendoredSlotRecipes));
  });

  it("has nowhere to record a `compoundVariants`, and no body needs one", () => {
    // The contract's four keys are exhaustive only while this holds. It has held across all 75
    // bodies since the vendoring, and phase 4's validator warns a preset author who declares one:
    // our runtime is compiled with the contract's compound list, which is empty, so a compound rule
    // is generated and worn by nothing.
    const declaring = Object.entries({ ...vendoredRecipes, ...vendoredSlotRecipes })
      .filter(([, body]) => (body.compoundVariants ?? []).length > 0)
      .map(([key]) => key);
    expect(declaring).toEqual([]);
  });

  it("counts what the vendoring measured", () => {
    // A count is what a reviewer can read; the `toEqual` diffs above are 75 objects deep. 476 slots
    // and 488 values are the upstream 74's — `container` adds neither, and two variant keys.
    const shapes = Object.values(contract);
    const variants = shapes.flatMap((shape) => Object.values(shape.variants));

    expect(shapes).toHaveLength(75);
    expect(shapes.flatMap((shape) => shape.slots)).toHaveLength(476);
    expect(variants).toHaveLength(144);
    expect(variants.flat()).toHaveLength(490);
    expect(shapes.filter((shape) => Object.keys(shape.defaultVariants).length > 0)).toHaveLength(
      64,
    );
  });
});

/**
 * `container` is the one key upstream's own generator strips, since Panda ships a `container`
 * pattern of its own; `chakra/recipes/index.ts` registers our reproduction of Chakra's body beside
 * the other eighteen. The atomic count is therefore 18 + 1.
 */
describe("the recipe list", () => {
  it("carries 18 atomic and 56 slot recipes, plus the one upstream's generator strips", () => {
    expect(recipeKeys).toHaveLength(19);
    expect(slotRecipeKeys).toHaveLength(56);
    expect(recipeKeys).toContain("button");
    expect(slotRecipeKeys).toContain("dialog");
  });

  it("registers `container` alongside them rather than beside them", () => {
    // The whole point of putting the ported recipe in this list: the `staticCss` declaration, the
    // jsx hint and `defineChakraConfig({ responsive })` all walk `recipeKeys`, so a recipe bolted
    // onto the preset alone would be missing from all three — and each of those three fails
    // silently.
    expect(recipeKeys).toContain("container");
    expect(componentNameFor("container")).toBe("Container");
    expect(variantKeysFor().find((entry) => entry.recipe === "container")).toEqual({
      recipe: "container",
      keys: ["centerContent", "fluid"],
    });
  });

  it("carries Switch under `switchRecipe`, because `switch` is not a legal key", () => {
    // Panda emits the key as a JS identifier into the consumer's `styled-system/recipes/`, and
    // `export const switch` is a syntax error there, so the key is `switchRecipe`. A preset
    // satisfying the contract has to spell it the same way; the `className` is the plain `switch`
    // either way, so no CSS depends on which.
    expect(slotRecipeKeys).toContain("switchRecipe");
    expect(slotRecipeKeys).not.toContain("switch");
    expect(slotRecipeContract.switchRecipe.className).toBe("switch");
  });

  it("keeps the two other `className`s that are not the kebab-cased key", () => {
    expect(recipeContract.skipNavLink.className).toBe("skip-nav");
    expect(slotRecipeContract.colorPicker.className).toBe("colorPicker");
  });
});

describe("componentNameFor", () => {
  it("derives the name from the recipe's `className`, not its contract key", () => {
    // The whole reason it goes through `className`: the key is `switchRecipe` and the component is
    // `Switch`. Going through the key would hand Panda a jsx tracking hint for a `SwitchRecipe`
    // that does not exist — and a wrong hint fails silently, because a hint is only an
    // optimization.
    expect(componentNameFor("switchRecipe")).toBe("Switch");
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
    // Nine of the 75 have none. Dropping them would make `defineChakraConfig({ responsive: true })`
    // cover 66 recipes while reporting that it covers all of them.
    const withoutVariants = variantKeysFor().filter((entry) => entry.keys.length === 0);
    expect(withoutVariants.map((entry) => entry.recipe)).toContain("tooltip");
    expect(withoutVariants.length).toBeGreaterThan(0);
  });
});

describe("defaultVariantsFor", () => {
  it("reports a recipe's own defaults", () => {
    expect(defaultVariantsFor("button")).toEqual({ size: "md", variant: "solid" });
  });

  it("keeps a boolean default a boolean", () => {
    // The docs site's props tables render this through `String()`, so a `"false"` here would print
    // the same and hide the change — but a preset validator comparing values would not.
    expect(defaultVariantsFor("alert").inline).toBe(false);
  });

  it("reports nothing for a recipe that declares none", () => {
    expect(defaultVariantsFor("tooltip")).toEqual({});
  });
});
