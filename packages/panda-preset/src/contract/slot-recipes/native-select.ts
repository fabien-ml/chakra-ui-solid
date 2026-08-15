import type { RecipeShape } from "../index";

/** The `nativeSelect` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const nativeSelectShape = {
  className: "native-select",
  slots: ["root", "field", "indicator"],
  variants: {
    variant: ["outline", "subtle", "plain", "ghost"],
    size: ["xs", "sm", "md", "lg", "xl"],
  },
  defaultVariants: { size: "md", variant: "outline" },
} as const satisfies RecipeShape;
