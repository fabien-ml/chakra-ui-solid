import type { RecipeShape } from "../index";

/** The `fieldset` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const fieldsetShape = {
  className: "fieldset",
  slots: ["root", "errorText", "helperText", "legend", "content"],
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
