import { createRecipeContext, type HTMLChakraProps } from "@chakra-ui-solid/core";
import { type CodeVariantProps, code } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/**
 * The two variants spelled out rather than inherited from the generated `CodeVariantProps`, so each
 * carries a description a reader can use and a type they can read — Badge's precedent, and this is
 * the interface the docs page's props table is built from. Drift is caught at the call below, whose
 * key tuple is typed against the generated variants.
 */
export interface CodeProps extends HTMLChakraProps<"code"> {
  /**
   * How much of the palette the snippet spends — `solid` fills it, `subtle` and `surface` tint it,
   * `outline` is a ring alone, and `plain` is the text with no box at all.
   *
   * @default "subtle"
   */
  variant?: ConditionalValue<"solid" | "subtle" | "outline" | "surface" | "plain">;
  /**
   * The text style and horizontal padding together, with a matching minimum height.
   *
   * @default "sm"
   */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg">;
}

const { withContext, PropsProvider } = createRecipeContext<CodeProps, CodeVariantProps>({
  recipe: code,
  variantKeys: ["variant", "size"],
});

/**
 * Code — a fragment of source rendered inline, styled by the `code` recipe.
 *
 * It is {@link Badge} in a monospace face: upstream's recipe destructures `badgeRecipe`'s whole
 * `variants` and `defaultVariants` and adds a base of its own, so the five variants and four sizes
 * are the same ones, resolved against `colorPalette` the same way. What differs is the element —
 * `code`, so the snippet is marked up as source rather than as a label — and the `fontFamily`.
 */
export const Code = withContext("code");

/**
 * Supplies props to every {@link Code} below it — `<CodePropsProvider value={{ size: "lg" }}>`
 * sets the size for a subtree. A `Code` that passes the prop itself still wins.
 */
export const CodePropsProvider = PropsProvider;
