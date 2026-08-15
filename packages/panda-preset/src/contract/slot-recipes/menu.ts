import type { RecipeShape } from "../index";

/** The `menu` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const menuShape = {
  className: "menu",
  slots: [
    "arrow",
    "arrowTip",
    "content",
    "contextTrigger",
    "indicator",
    "item",
    "itemGroup",
    "itemGroupLabel",
    "itemIndicator",
    "itemText",
    "positioner",
    "separator",
    "trigger",
    "triggerItem",
    "itemCommand",
  ],
  variants: {
    variant: ["subtle", "solid"],
    size: ["sm", "md"],
  },
  defaultVariants: { size: "md", variant: "subtle" },
} as const satisfies RecipeShape;
