import type { RecipeShape } from "../index";

/** The `button` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const buttonShape = {
  className: "button",
  slots: [],
  variants: {
    size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
    variant: ["solid", "subtle", "surface", "outline", "ghost", "plain"],
  },
  defaultVariants: { size: "md", variant: "solid" },
} as const satisfies RecipeShape;
