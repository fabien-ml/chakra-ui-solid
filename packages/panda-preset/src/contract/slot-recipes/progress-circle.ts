import type { RecipeShape } from "../index";

/** The `progressCircle` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const progressCircleShape = {
  className: "progress-circle",
  slots: [
    "root",
    "label",
    "track",
    "range",
    "valueText",
    "view",
    "circle",
    "circleTrack",
    "circleRange",
  ],
  variants: {
    size: ["xs", "sm", "md", "lg", "xl"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
