import type { RecipeShape } from "../index";

/** The `select` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const selectShape = {
  className: "select",
  slots: [
    "label",
    "positioner",
    "trigger",
    "indicator",
    "clearTrigger",
    "item",
    "itemText",
    "itemIndicator",
    "itemGroup",
    "itemGroupLabel",
    "list",
    "content",
    "root",
    "control",
    "valueText",
    "indicatorGroup",
  ],
  variants: {
    variant: ["outline", "subtle", "ghost"],
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { size: "md", variant: "outline" },
} as const satisfies RecipeShape;
