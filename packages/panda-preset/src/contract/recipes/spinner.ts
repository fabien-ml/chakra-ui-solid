import type { RecipeShape } from "../index";

/** The `spinner` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const spinnerShape = {
  className: "spinner",
  slots: [],
  variants: {
    size: ["inherit", "xs", "sm", "md", "lg", "xl"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
