import type { RecipeShape } from "../index";

/** The `toast` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const toastShape = {
  className: "toast",
  slots: ["root", "title", "description", "indicator", "closeTrigger", "actionTrigger"],
  variants: {},
  defaultVariants: {},
} as const satisfies RecipeShape;
