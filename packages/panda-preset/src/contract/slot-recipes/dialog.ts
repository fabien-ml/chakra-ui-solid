import type { RecipeShape } from "../index";

/** The `dialog` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const dialogShape = {
  className: "dialog",
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
    placement: ["center", "top", "bottom"],
    scrollBehavior: ["inside", "outside"],
    size: ["xs", "sm", "md", "lg", "xl", "cover", "full"],
    motionPreset: [
      "scale",
      "slide-in-bottom",
      "slide-in-top",
      "slide-in-left",
      "slide-in-right",
      "none",
    ],
  },
  defaultVariants: {
    size: "md",
    scrollBehavior: "outside",
    placement: "top",
    motionPreset: "scale",
  },
} as const satisfies RecipeShape;
