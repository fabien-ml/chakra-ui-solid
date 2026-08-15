import type { RecipeShape } from "../index";

/** The `table` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const tableShape = {
  className: "table",
  slots: ["root", "header", "body", "row", "columnHeader", "cell", "footer", "caption"],
  variants: {
    interactive: ["true"],
    stickyHeader: ["true"],
    striped: ["true"],
    showColumnBorder: ["true"],
    variant: ["line", "outline"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "line", size: "md" },
} as const satisfies RecipeShape;
