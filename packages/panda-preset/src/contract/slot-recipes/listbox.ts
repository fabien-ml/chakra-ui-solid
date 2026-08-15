import type { RecipeShape } from "../index";

/** The `listbox` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const listboxShape = {
  className: "listbox",
  slots: [
    "label",
    "input",
    "item",
    "itemText",
    "itemIndicator",
    "itemGroup",
    "itemGroupLabel",
    "content",
    "root",
    "valueText",
    "empty",
  ],
  variants: {
    variant: ["subtle", "solid", "plain"],
  },
  defaultVariants: { variant: "subtle" },
} as const satisfies RecipeShape;
