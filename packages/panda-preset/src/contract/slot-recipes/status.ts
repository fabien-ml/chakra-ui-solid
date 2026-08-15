import type { RecipeShape } from "../index";

/** The `status` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const statusShape = {
  className: "status",
  slots: ["root", "indicator"],
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
