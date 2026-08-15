import type { RecipeShape } from "../index";

/** The `steps` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const stepsShape = {
  className: "steps",
  slots: [
    "root",
    "list",
    "item",
    "trigger",
    "indicator",
    "separator",
    "content",
    "title",
    "description",
    "nextTrigger",
    "prevTrigger",
    "progress",
  ],
  variants: {
    orientation: ["vertical", "horizontal"],
    variant: ["solid", "subtle"],
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { size: "md", variant: "solid", orientation: "horizontal" },
} as const satisfies RecipeShape;
