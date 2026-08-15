import type { RecipeShape } from "../index";

/** The `tag` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const tagShape = {
  className: "tag",
  slots: ["root", "label", "closeTrigger", "startElement", "endElement"],
  variants: {
    size: ["sm", "md", "lg", "xl"],
    variant: ["subtle", "solid", "outline", "surface"],
  },
  defaultVariants: { size: "md", variant: "surface" },
} as const satisfies RecipeShape;
