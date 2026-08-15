import type { RecipeShape } from "../index";

/** The `alert` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const alertShape = {
  className: "alert",
  slots: ["title", "description", "root", "indicator", "content"],
  variants: {
    status: ["info", "warning", "success", "error", "neutral"],
    inline: ["true", "false"],
    variant: ["subtle", "surface", "outline", "solid"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { status: "info", variant: "subtle", size: "md", inline: false },
} as const satisfies RecipeShape;
