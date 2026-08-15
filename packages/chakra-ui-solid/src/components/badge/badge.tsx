import {
  createRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PresetVariantProps,
} from "@chakra-ui-solid/core";
import type { BadgeVariantProps } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/**
 * The two variants spelled out rather than inherited from the generated `BadgeVariantProps`, so each
 * carries a description a reader can use and a type they can read — a generated type has neither,
 * and this is the interface the docs page's props table is built from. Heading's precedent, and
 * the same division of labour: this names Chakra's own variants, while what the seam partitions by
 * is whatever the system's `badge` recipe accepts.
 */
export interface BadgeProps extends HTMLChakraProps<"span">, PresetVariantProps<"badge"> {
  /**
   * How much of the palette the badge spends — `solid` fills it, `subtle` and `surface` tint it,
   * `outline` is a ring alone, and `plain` is the text with no box at all.
   *
   * @default "subtle"
   */
  variant?: ConditionalValue<
    "solid" | "subtle" | "outline" | "surface" | "plain" | PresetVariant<"badge", "variant">
  >;
  /**
   * The text style and horizontal padding together, with a matching minimum height.
   *
   * @default "sm"
   */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg" | PresetVariant<"badge", "size">>;
}

const { withContext, PropsProvider } = createRecipeContext<BadgeProps, BadgeVariantProps>({
  recipe: "badge",
});

/**
 * Badge — a short status label, styled by the `badge` recipe.
 *
 * It renders a `span` and takes its colour from `colorPalette`, which is why the recipe names no
 * colour of its own: `<Badge colorPalette="green">` and `<Badge colorPalette="red">` are the same
 * four variants resolved against a different palette.
 *
 * The base is an `inline-flex` with a `gap`, so an icon beside the text needs no wrapper — put the
 * glyph before or after the label and the row spaces itself.
 */
export const Badge = withContext("span");

/**
 * Supplies props to every {@link Badge} below it — `<BadgePropsProvider value={{ size: "lg" }}>`
 * sets the size for a subtree. A `Badge` that passes the prop itself still wins.
 */
export const BadgePropsProvider = PropsProvider;
