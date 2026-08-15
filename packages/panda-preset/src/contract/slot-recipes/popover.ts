import type { RecipeShape } from "../index";

/** The `popover` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const popoverShape = {
  className: "popover",
  slots: [
    "arrow",
    "arrowTip",
    "anchor",
    "trigger",
    "indicator",
    "positioner",
    "content",
    "title",
    "description",
    "closeTrigger",
    "header",
    "body",
    "footer",
  ],
  variants: {
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
