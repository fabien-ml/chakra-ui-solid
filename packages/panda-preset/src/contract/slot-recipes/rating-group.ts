import type { RecipeShape } from "../index";

/** The `ratingGroup` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const ratingGroupShape = {
  className: "rating-group",
  slots: ["root", "label", "item", "control", "itemIndicator"],
  variants: {
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
