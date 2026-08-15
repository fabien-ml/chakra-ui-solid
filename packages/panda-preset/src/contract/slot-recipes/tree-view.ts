import type { RecipeShape } from "../index";

/** The `treeView` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const treeViewShape = {
  className: "tree-view",
  slots: [
    "branch",
    "branchContent",
    "branchControl",
    "branchIndentGuide",
    "branchIndicator",
    "branchText",
    "branchTrigger",
    "item",
    "itemIndicator",
    "itemText",
    "label",
    "nodeCheckbox",
    "nodeRenameInput",
    "root",
    "tree",
  ],
  variants: {
    size: ["md", "sm", "xs"],
    variant: ["subtle", "solid"],
    animateContent: ["true"],
  },
  defaultVariants: { size: "md", variant: "subtle" },
} as const satisfies RecipeShape;
