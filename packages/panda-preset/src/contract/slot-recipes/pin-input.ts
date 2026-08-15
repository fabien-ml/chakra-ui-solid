import type { RecipeShape } from "../index";

/** The `pinInput` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const pinInputShape = {
  className: "pin-input",
  slots: ["root", "label", "input", "control"],
  variants: {
    size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
    variant: ["outline", "subtle", "flushed"],
    attached: ["true"],
  },
  defaultVariants: { size: "md", variant: "outline" },
} as const satisfies RecipeShape;
