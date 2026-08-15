import type { RecipeShape } from "../index";

/** The `progress` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const progressShape = {
  className: "progress",
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
    variant: ["outline", "subtle"],
    shape: ["square", "rounded", "full"],
    striped: ["true"],
    animated: ["true"],
    size: ["xs", "sm", "md", "lg", "xl"],
  },
  defaultVariants: { variant: "outline", size: "md", shape: "rounded" },
} as const satisfies RecipeShape;
