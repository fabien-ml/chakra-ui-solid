import {
  createRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PresetVariantProps,
} from "@chakra-ui-solid/core";
import type { HeadingVariantProps } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/**
 * The one variant spelled out rather than inherited from the generated `HeadingVariantProps`, so it
 * carries a description a reader can use and a type they can read — a generated type has neither,
 * and this is the interface the docs page's props table is built from. Container's precedent, and
 * the same division of labour: this names Chakra's own variant, while what the seam partitions by is
 * whatever the system's `heading` recipe accepts.
 */
export interface HeadingProps extends HTMLChakraProps<"h2">, PresetVariantProps<"heading"> {
  /**
   * The type scale step — font size and line height together.
   *
   * @default "xl"
   */
  size?: ConditionalValue<
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | PresetVariant<"heading", "size">
  >;
}

const { withContext, PropsProvider } = createRecipeContext<HeadingProps, HeadingVariantProps>({
  recipe: "heading",
});

/**
 * Heading — a section title, styled by the `heading` recipe.
 *
 * It renders an `h2` because a heading's *level* is the document's business rather than the
 * component's; pass `as="h1"` for the one at the top of a page. The recipe supplies the family and
 * weight, and `size` picks the step — the two are independent, which is what lets an `h4` look like
 * a `2xl` heading without lying about the outline.
 */
export const Heading = withContext("h2");

/**
 * Supplies props to every {@link Heading} below it — `<HeadingPropsProvider value={{ size: "sm" }}>`
 * sets the step for a subtree. A `Heading` that passes the prop itself still wins.
 */
export const HeadingPropsProvider = PropsProvider;
