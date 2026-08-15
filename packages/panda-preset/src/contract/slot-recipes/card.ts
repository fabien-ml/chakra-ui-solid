import type { RecipeShape } from "../index";

/** The `card` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const cardShape = {
  className: "card",
  slots: ["root", "header", "body", "footer", "title", "description"],
  variants: {
    size: ["sm", "md", "lg"],
    variant: ["elevated", "outline", "subtle"],
  },
  defaultVariants: { variant: "outline", size: "md" },
} as const satisfies RecipeShape;
