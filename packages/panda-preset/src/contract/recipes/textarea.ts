import type { RecipeShape } from "../index";

/** The `textarea` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const textareaShape = {
  className: "textarea",
  slots: [],
  variants: {
    size: ["xs", "sm", "md", "lg", "xl"],
    variant: ["outline", "subtle", "flushed"],
  },
  defaultVariants: { size: "md", variant: "outline" },
} as const satisfies RecipeShape;
