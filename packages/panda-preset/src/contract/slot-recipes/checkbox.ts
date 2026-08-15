import type { RecipeShape } from "../index";

/** The `checkbox` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const checkboxShape = {
  className: "checkbox",
  slots: ["root", "label", "control", "indicator", "group"],
  variants: {
    size: ["xs", "sm", "md", "lg"],
    variant: ["outline", "solid", "subtle"],
  },
  defaultVariants: { variant: "solid", size: "md" },
} as const satisfies RecipeShape;
