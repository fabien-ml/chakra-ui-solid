import type { RecipeShape } from "../index";

/** The `skipNavLink` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const skipNavLinkShape = {
  className: "skip-nav",
  slots: [],
  variants: {},
  defaultVariants: {},
} as const satisfies RecipeShape;
