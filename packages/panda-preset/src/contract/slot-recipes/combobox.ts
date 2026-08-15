import type { RecipeShape } from "../index";

/** The `combobox` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const comboboxShape = {
  className: "combobox",
  slots: [
    "root",
    "clearTrigger",
    "content",
    "control",
    "input",
    "item",
    "itemGroup",
    "itemGroupLabel",
    "itemIndicator",
    "itemText",
    "label",
    "list",
    "positioner",
    "trigger",
    "empty",
    "indicatorGroup",
    "empty",
  ],
  variants: {
    variant: ["outline", "subtle", "flushed"],
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { size: "md", variant: "outline" },
} as const satisfies RecipeShape;
