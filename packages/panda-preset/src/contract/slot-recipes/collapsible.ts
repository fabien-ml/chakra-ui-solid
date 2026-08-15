import type { RecipeShape } from "../index";

/** The `collapsible` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const collapsibleShape = {
  className: "collapsible",
  slots: ["root", "trigger", "content", "indicator"],
  variants: {},
  defaultVariants: {},
} as const satisfies RecipeShape;
