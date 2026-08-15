import type { RecipeShape } from "../index";

/** The `icon` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const iconShape = {
  className: "icon",
  slots: [],
  variants: {
    size: ["inherit", "xs", "sm", "md", "lg", "xl", "2xl"],
  },
  defaultVariants: { size: "inherit" },
} as const satisfies RecipeShape;
