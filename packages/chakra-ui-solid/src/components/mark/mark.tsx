import {
  createRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PresetVariantProps,
} from "@chakra-ui-solid/core";
import type { MarkVariantProps } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/**
 * The one variant spelled out rather than inherited from the generated `MarkVariantProps`, so it
 * carries a description a reader can use and a type they can read. It names Chakra's own variant;
 * what the seam partitions by is whatever the system's `mark` recipe accepts.
 *
 * **No `@default` tag, and that is the recipe's answer rather than an omission**: `markRecipe`
 * declares no `defaultVariants`, so an unmarked `<Mark>` gets the base alone — a transparent
 * background and the inherited colour.
 */
export interface MarkProps extends HTMLChakraProps<"mark">, PresetVariantProps<"mark"> {
  /**
   * How the run is highlighted — `subtle` and `solid` fill it from `colorPalette`, `text` only
   * thickens the weight, and `plain` adds nothing to the base.
   */
  variant?: ConditionalValue<
    "subtle" | "solid" | "text" | "plain" | PresetVariant<"mark", "variant">
  >;
}

const { withContext, PropsProvider } = createRecipeContext<MarkProps, MarkVariantProps>({
  recipe: "mark",
});

/**
 * Mark — a run of text singled out inside a sentence, styled by the `mark` recipe.
 *
 * It renders a `mark` element, so the emphasis is in the markup and not only in the paint. The
 * recipe's base neutralises the browser's own yellow `mark` background — every colour comes from
 * `colorPalette` instead, which is why `<Mark>` with no `variant` looks like the text around it.
 */
export const Mark = withContext("mark");

/**
 * Supplies props to every {@link Mark} below it — `<MarkPropsProvider value={{ variant: "solid" }}>`
 * sets the variant for a subtree. A `Mark` that passes the prop itself still wins.
 */
export const MarkPropsProvider = PropsProvider;
