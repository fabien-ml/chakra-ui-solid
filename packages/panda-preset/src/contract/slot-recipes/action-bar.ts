import type { RecipeShape } from "../index";

/** The `actionBar` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const actionBarShape = {
  className: "action-bar",
  slots: ["positioner", "content", "separator", "selectionTrigger", "closeTrigger"],
  variants: {
    placement: ["bottom", "bottom-start", "bottom-end"],
  },
  defaultVariants: { placement: "bottom" },
} as const satisfies RecipeShape;
