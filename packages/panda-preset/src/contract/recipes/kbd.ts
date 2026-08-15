import type { RecipeShape } from "../index";

/** The `kbd` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const kbdShape = {
  className: "kbd",
  slots: [],
  variants: {
    variant: ["raised", "outline", "subtle", "plain"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md", variant: "raised" },
} as const satisfies RecipeShape;
