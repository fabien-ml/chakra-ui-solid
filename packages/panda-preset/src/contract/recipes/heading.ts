import type { RecipeShape } from "../index";

/** The `heading` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const headingShape = {
  className: "heading",
  slots: [],
  variants: {
    size: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"],
  },
  defaultVariants: { size: "xl" },
} as const satisfies RecipeShape;
