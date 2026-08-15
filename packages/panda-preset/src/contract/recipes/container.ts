import type { RecipeShape } from "../index";

/**
 * The `container` recipe's shape. What a row is, and why it is authored: `../index.ts`. Its body is
 * `containerRecipe` in `../../container-recipe.ts`, not `chakra/recipes/` — upstream's generator
 * strips the key, so this is the one row with no vendored file beside it.
 */
export const containerShape = {
  className: "container",
  slots: [],
  variants: {
    centerContent: ["true"],
    fluid: ["true"],
  },
  defaultVariants: {},
} as const satisfies RecipeShape;
