import type { RecipeShape } from "../index";

/** The `radioCard` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const radioCardShape = {
  className: "radio-card",
  slots: [
    "root",
    "label",
    "item",
    "itemText",
    "itemControl",
    "indicator",
    "itemAddon",
    "itemIndicator",
    "itemContent",
    "itemDescription",
  ],
  variants: {
    size: ["sm", "md", "lg"],
    variant: ["surface", "subtle", "outline", "solid"],
    justify: ["start", "end", "center"],
    align: ["start", "end", "center"],
    orientation: ["vertical", "horizontal"],
  },
  defaultVariants: { size: "md", variant: "outline", align: "start", orientation: "horizontal" },
} as const satisfies RecipeShape;
