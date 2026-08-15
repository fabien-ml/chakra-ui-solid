import type { RecipeShape } from "../index";

/** The `floatingPanel` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const floatingPanelShape = {
  className: "floating-panel",
  slots: [
    "trigger",
    "positioner",
    "content",
    "header",
    "body",
    "title",
    "resizeTrigger",
    "dragTrigger",
    "stageTrigger",
    "closeTrigger",
    "control",
  ],
  variants: {},
  defaultVariants: {},
} as const satisfies RecipeShape;
