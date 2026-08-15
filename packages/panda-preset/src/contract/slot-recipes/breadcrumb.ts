import type { RecipeShape } from "../index";

/** The `breadcrumb` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const breadcrumbShape = {
  className: "breadcrumb",
  slots: ["link", "currentLink", "item", "list", "root", "ellipsis", "separator"],
  variants: {
    variant: ["underline", "plain"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "plain", size: "md" },
} as const satisfies RecipeShape;
