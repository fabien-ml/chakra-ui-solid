import type { RecipeShape } from "../index";

/** The `splitter` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const splitterShape = {
  className: "splitter",
  slots: [
    "root",
    "panel",
    "resizeTrigger",
    "resizeTriggerIndicator",
    "resizeTriggerSeparator",
    "resizeTriggerIndicator",
  ],
  variants: {},
  defaultVariants: {},
} as const satisfies RecipeShape;
