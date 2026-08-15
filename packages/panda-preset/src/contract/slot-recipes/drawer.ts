import type { RecipeShape } from "../index";

/** The `drawer` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const drawerShape = {
  className: "drawer",
  slots: [
    "trigger",
    "backdrop",
    "positioner",
    "content",
    "title",
    "description",
    "closeTrigger",
    "header",
    "body",
    "footer",
    "backdrop",
  ],
  variants: {
    size: ["xs", "sm", "md", "lg", "xl", "full"],
    placement: ["start", "end", "top", "bottom"],
    contained: ["true"],
  },
  defaultVariants: { size: "xs", placement: "end" },
} as const satisfies RecipeShape;
