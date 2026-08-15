import type { RecipeShape } from "../index";

/** The `radioGroup` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const radioGroupShape = {
  className: "radio-group",
  slots: [
    "root",
    "label",
    "item",
    "itemText",
    "itemControl",
    "indicator",
    "itemAddon",
    "itemIndicator",
  ],
  variants: {
    variant: ["outline", "subtle", "solid"],
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { size: "md", variant: "solid" },
} as const satisfies RecipeShape;
