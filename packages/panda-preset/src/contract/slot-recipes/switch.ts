import type { RecipeShape } from "../index";

/**
 * The `swittch` recipe's shape. What a row is, and why it is authored: `../index.ts`.
 *
 * **The key is misspelled, and every preset has to misspell it too.** Panda names the generated
 * function after the key, and `export const switch` is a syntax error — which is why upstream's own
 * generator renames it, and why the file is `switch.ts` while the key is not. The `className` is
 * the correctly spelled `switch`, so the misspelling is confined to the key a preset author types
 * (`roadmap.md` §1.3c).
 */
export const switchShape = {
  className: "switch",
  slots: ["root", "label", "control", "thumb", "indicator"],
  variants: {
    variant: ["solid", "raised"],
    size: ["xs", "sm", "md", "lg"],
  },
  defaultVariants: { variant: "solid", size: "md" },
} as const satisfies RecipeShape;
