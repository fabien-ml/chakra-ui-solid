import type { RecipeShape } from "../index";

/** The `checkmark` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const checkmarkShape = {
  className: "checkmark",
  slots: [],
  variants: {
    size: ["xs", "sm", "md", "lg"],
    variant: ["solid", "outline", "subtle", "plain", "inverted"],
    filled: ["true"],
  },
  defaultVariants: { variant: "solid", size: "md" },
} as const satisfies RecipeShape;
