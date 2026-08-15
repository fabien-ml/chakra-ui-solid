import type { RecipeShape } from "../index";

/** The `segmentGroup` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const segmentGroupShape = {
  className: "segment-group",
  slots: ["root", "label", "item", "itemText", "itemControl", "indicator"],
  variants: {
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
