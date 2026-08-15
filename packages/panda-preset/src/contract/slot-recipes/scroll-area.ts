import type { RecipeShape } from "../index";

/** The `scrollArea` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const scrollAreaShape = {
  className: "scroll-area",
  slots: ["root", "viewport", "content", "scrollbar", "thumb", "corner"],
  variants: {
    variant: ["hover", "always"],
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { size: "md", variant: "hover" },
} as const satisfies RecipeShape;
