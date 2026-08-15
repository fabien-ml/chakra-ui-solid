import type { RecipeShape } from "../index";

/** The `blockquote` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const blockquoteShape = {
  className: "blockquote",
  slots: ["root", "icon", "content", "caption"],
  variants: {
    justify: ["start", "center", "end"],
    variant: ["subtle", "solid", "plain"],
  },
  defaultVariants: { variant: "subtle", justify: "start" },
} as const satisfies RecipeShape;
