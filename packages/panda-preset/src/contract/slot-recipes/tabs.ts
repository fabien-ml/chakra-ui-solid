import type { RecipeShape } from "../index";

/** The `tabs` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const tabsShape = {
  className: "tabs",
  slots: ["root", "trigger", "list", "content", "contentGroup", "indicator"],
  variants: {
    fitted: ["true"],
    justify: ["start", "center", "end"],
    size: ["sm", "md", "lg"],
    variant: ["line", "subtle", "enclosed", "outline", "plain"],
  },
  defaultVariants: { size: "md", variant: "line" },
} as const satisfies RecipeShape;
