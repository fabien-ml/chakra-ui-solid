import type { RecipeShape } from "../index";

/** The `colorSwatch` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const colorSwatchShape = {
  className: "color-swatch",
  slots: [],
  variants: {
    size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inherit", "full"],
    shape: ["square", "circle", "rounded"],
  },
  defaultVariants: { size: "md", shape: "rounded" },
} as const satisfies RecipeShape;
