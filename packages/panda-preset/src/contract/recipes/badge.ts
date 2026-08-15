import type { RecipeShape } from "../index";

/** The `badge` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const badgeShape = {
  className: "badge",
  slots: [],
  variants: {
    variant: ["solid", "subtle", "outline", "surface", "plain"],
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { variant: "subtle", size: "sm" },
} as const satisfies RecipeShape;
