import type { RecipeShape } from "../index";

/** The `tagsInput` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const tagsInputShape = {
  className: "tags-input",
  slots: [
    "root",
    "label",
    "control",
    "input",
    "clearTrigger",
    "item",
    "itemPreview",
    "itemInput",
    "itemText",
    "itemDeleteTrigger",
  ],
  variants: {
    size: ["xs", "sm", "md", "lg"],
    variant: ["outline", "subtle", "flushed"],
  },
  defaultVariants: { size: "md", variant: "outline" },
} as const satisfies RecipeShape;
