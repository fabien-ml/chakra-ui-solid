import type { RecipeShape } from "../index";

/** The `avatar` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const avatarShape = {
  className: "avatar",
  slots: ["root", "image", "fallback"],
  variants: {
    size: ["full", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
    variant: ["solid", "subtle", "outline"],
    shape: ["square", "rounded", "full"],
    borderless: ["true"],
  },
  defaultVariants: { size: "md", shape: "full", variant: "subtle" },
} as const satisfies RecipeShape;
