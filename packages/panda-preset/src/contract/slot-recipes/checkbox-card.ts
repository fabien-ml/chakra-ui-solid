import type { RecipeShape } from "../index";

/** The `checkboxCard` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const checkboxCardShape = {
  className: "checkbox-card",
  slots: ["root", "control", "label", "description", "addon", "indicator", "content"],
  variants: {
    size: ["sm", "md", "lg"],
    variant: ["surface", "subtle", "outline", "solid"],
    justify: ["start", "end", "center"],
    align: ["start", "end", "center"],
    orientation: ["vertical", "horizontal"],
  },
  defaultVariants: { size: "md", variant: "outline", align: "start", orientation: "horizontal" },
} as const satisfies RecipeShape;
