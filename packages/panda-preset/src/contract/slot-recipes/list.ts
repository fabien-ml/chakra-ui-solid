import type { RecipeShape } from "../index";

/** The `list` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const listShape = {
  className: "list",
  slots: ["root", "item", "indicator"],
  variants: {
    variant: ["marker", "plain"],
    align: ["center", "start", "end"],
  },
  defaultVariants: { variant: "marker" },
} as const satisfies RecipeShape;
