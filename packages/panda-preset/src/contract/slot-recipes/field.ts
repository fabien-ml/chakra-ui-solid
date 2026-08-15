import type { RecipeShape } from "../index";

/** The `field` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const fieldShape = {
  className: "field",
  slots: [
    "root",
    "errorText",
    "helperText",
    "input",
    "label",
    "select",
    "textarea",
    "requiredIndicator",
    "requiredIndicator",
  ],
  variants: {
    orientation: ["vertical", "horizontal"],
  },
  defaultVariants: { orientation: "vertical" },
} as const satisfies RecipeShape;
