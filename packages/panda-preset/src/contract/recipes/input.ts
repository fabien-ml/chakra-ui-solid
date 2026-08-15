import type { RecipeShape } from "../index";

/** The `input` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const inputShape = {
  className: "input",
  slots: [],
  variants: {
    size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
    variant: ["outline", "subtle", "flushed"],
  },
  defaultVariants: { size: "md", variant: "outline" },
} as const satisfies RecipeShape;
