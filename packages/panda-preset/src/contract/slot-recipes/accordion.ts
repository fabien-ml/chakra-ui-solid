import type { RecipeShape } from "../index";

/** The `accordion` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const accordionShape = {
  className: "accordion",
  slots: ["root", "item", "itemTrigger", "itemContent", "itemIndicator", "itemBody"],
  variants: {
    variant: ["outline", "subtle", "enclosed", "plain"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md", variant: "outline" },
} as const satisfies RecipeShape;
