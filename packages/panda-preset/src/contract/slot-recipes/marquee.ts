import type { RecipeShape } from "../index";

/** The `marquee` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const marqueeShape = {
  className: "marquee",
  slots: ["root", "viewport", "content", "edge", "item"],
  variants: {},
  defaultVariants: {},
} as const satisfies RecipeShape;
