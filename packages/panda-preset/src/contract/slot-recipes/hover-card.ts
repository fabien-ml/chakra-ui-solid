import type { RecipeShape } from "../index";

/** The `hoverCard` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const hoverCardShape = {
  className: "hover-card",
  slots: ["arrow", "arrowTip", "trigger", "positioner", "content"],
  variants: {
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
