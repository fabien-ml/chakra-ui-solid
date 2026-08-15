import type { RecipeShape } from "../index";

/** The `dataList` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const dataListShape = {
  className: "data-list",
  slots: ["root", "item", "itemLabel", "itemValue"],
  variants: {
    orientation: ["horizontal", "vertical"],
    size: ["sm", "md", "lg"],
    variant: ["subtle", "bold"],
  },
  defaultVariants: { size: "md", orientation: "vertical", variant: "subtle" },
} as const satisfies RecipeShape;
