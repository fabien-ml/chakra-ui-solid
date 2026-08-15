import type { RecipeShape } from "../index";

/** The `link` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const linkShape = {
  className: "link",
  slots: [],
  variants: {
    variant: ["underline", "plain"],
  },
  defaultVariants: { variant: "plain" },
} as const satisfies RecipeShape;
