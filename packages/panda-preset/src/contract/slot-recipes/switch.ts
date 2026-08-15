import type { RecipeShape } from "../index";

/**
 * The `switchRecipe` recipe's shape. What a row is, and why it is authored: `../index.ts`.
 *
 * **The key is not `switch`, and every preset has to spell it the same way.** Panda names the
 * generated export after the key, and `export const switch` is a syntax error in the consumer's
 * `styled-system/recipes/`, so the key has to be a legal identifier — upstream reaches for
 * `swittch` and we reach for `switchRecipe`. That is why the file is `switch.ts` while the key is
 * not. The `className` is the plain `switch`, so nothing about the emitted CSS is affected.
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
