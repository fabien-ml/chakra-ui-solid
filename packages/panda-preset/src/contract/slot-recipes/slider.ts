import type { RecipeShape } from "../index";

/** The `slider` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const sliderShape = {
  className: "slider",
  slots: [
    "root",
    "label",
    "thumb",
    "valueText",
    "track",
    "range",
    "control",
    "markerGroup",
    "marker",
    "draggingIndicator",
    "markerIndicator",
    "markerLabel",
  ],
  variants: {
    size: ["sm", "md", "lg"],
    variant: ["outline", "solid"],
    orientation: ["vertical", "horizontal"],
  },
  defaultVariants: { size: "md", variant: "outline", orientation: "horizontal" },
} as const satisfies RecipeShape;
