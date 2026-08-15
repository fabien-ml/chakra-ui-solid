import type { RecipeShape } from "../index";

/** The `mark` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const markShape = {
  className: "mark",
  slots: [],
  variants: {
    variant: ["subtle", "solid", "text", "plain"],
  },
  defaultVariants: {},
} as const satisfies RecipeShape;
