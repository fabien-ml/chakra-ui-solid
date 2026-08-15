import type { RecipeShape } from "../index";

/** The `timeline` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const timelineShape = {
  className: "timeline",
  slots: ["root", "item", "content", "separator", "indicator", "connector", "title", "description"],
  variants: {
    variant: ["subtle", "solid", "outline", "plain"],
    showLastSeparator: ["true", "false"],
    size: ["sm", "md", "lg", "xl"],
  },
  defaultVariants: { size: "md", variant: "solid", showLastSeparator: false },
} as const satisfies RecipeShape;
