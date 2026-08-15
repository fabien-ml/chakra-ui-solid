import type { RecipeShape } from "../index";

/** The `carousel` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const carouselShape = {
  className: "carousel",
  slots: [
    "root",
    "itemGroup",
    "item",
    "control",
    "nextTrigger",
    "prevTrigger",
    "indicatorGroup",
    "indicator",
    "autoplayTrigger",
    "progressText",
    "progressText",
    "autoplayIndicator",
  ],
  variants: {},
  defaultVariants: {},
} as const satisfies RecipeShape;
