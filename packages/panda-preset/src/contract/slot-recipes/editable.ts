import type { RecipeShape } from "../index";

/** The `editable` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const editableShape = {
  className: "editable",
  slots: [
    "root",
    "area",
    "label",
    "preview",
    "input",
    "editTrigger",
    "submitTrigger",
    "cancelTrigger",
    "control",
    "textarea",
  ],
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
