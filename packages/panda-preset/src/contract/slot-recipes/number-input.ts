import type { RecipeShape } from "../index";

/** The `numberInput` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const numberInputShape = {
  className: "number-input",
  slots: [
    "root",
    "label",
    "input",
    "control",
    "valueText",
    "incrementTrigger",
    "decrementTrigger",
    "scrubber",
  ],
  variants: {
    size: ["xs", "sm", "md", "lg"],
    variant: ["outline", "subtle", "flushed"],
  },
  defaultVariants: { size: "md", variant: "outline" },
} as const satisfies RecipeShape;
