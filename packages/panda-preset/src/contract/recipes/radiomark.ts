import type { RecipeShape } from "../index";

/** The `radiomark` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const radiomarkShape = {
  className: "radiomark",
  slots: [],
  variants: {
    variant: ["solid", "subtle", "outline", "inverted"],
    size: ["xs", "sm", "md", "lg"],
    filled: ["true"],
  },
  defaultVariants: { variant: "solid", size: "md" },
} as const satisfies RecipeShape;
