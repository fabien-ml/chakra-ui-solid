import type { RecipeShape } from "../index";

/** The `separator` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const separatorShape = {
  className: "separator",
  slots: [],
  variants: {
    variant: ["solid", "dashed", "dotted"],
    orientation: ["vertical", "horizontal"],
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { size: "sm", variant: "solid", orientation: "horizontal" },
} as const satisfies RecipeShape;
