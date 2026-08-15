import type { RecipeShape } from "../index";

/** The `emptyState` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const emptyStateShape = {
  className: "empty-state",
  slots: ["root", "content", "indicator", "title", "description"],
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
