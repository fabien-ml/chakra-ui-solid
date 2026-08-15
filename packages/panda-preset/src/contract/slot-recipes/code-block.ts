import type { RecipeShape } from "../index";

/** The `codeBlock` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const codeBlockShape = {
  className: "code-block",
  slots: [
    "root",
    "content",
    "title",
    "header",
    "footer",
    "control",
    "overlay",
    "code",
    "codeText",
    "copyTrigger",
    "copyIndicator",
    "collapseTrigger",
    "collapseIndicator",
    "collapseText",
  ],
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
