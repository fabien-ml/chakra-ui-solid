import type { RecipeShape } from "../index";

/** The `skeleton` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const skeletonShape = {
  className: "skeleton",
  slots: [],
  variants: {
    loading: ["true", "false"],
    variant: ["pulse", "shine", "none"],
  },
  defaultVariants: { variant: "pulse", loading: true },
} as const satisfies RecipeShape;
