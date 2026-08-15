import type { RecipeShape } from "../index";

/** The `stat` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const statShape = {
  className: "stat",
  slots: ["root", "label", "helpText", "valueText", "valueUnit", "indicator"],
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
