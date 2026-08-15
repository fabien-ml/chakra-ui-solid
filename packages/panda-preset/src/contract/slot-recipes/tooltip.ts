import type { RecipeShape } from "../index";

/** The `tooltip` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const tooltipShape = {
  className: "tooltip",
  slots: ["trigger", "arrow", "arrowTip", "positioner", "content"],
  variants: {},
  defaultVariants: {},
} as const satisfies RecipeShape;
