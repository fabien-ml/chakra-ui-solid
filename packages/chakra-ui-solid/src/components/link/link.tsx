import {
  createRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
} from "@chakra-ui-solid/core";
import { type LinkVariantProps, link } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/**
 * The one variant spelled out rather than inherited from the generated `LinkVariantProps`, so it
 * carries a description a reader can use and a type they can read. Drift is caught at the call
 * below, whose key tuple is typed against the generated variants.
 */
export interface LinkProps extends HTMLChakraProps<"a"> {
  /**
   * Whether the underline is always there or only on hover.
   *
   * @default "plain"
   */
  variant?: ConditionalValue<"underline" | "plain" | PresetVariant<"link", "variant">>;
}

const { withContext, PropsProvider } = createRecipeContext<LinkProps, LinkVariantProps>({
  recipe: link,
  variantKeys: ["variant"],
});

/**
 * Link — an anchor, styled by the `link` recipe.
 *
 * It renders an `a` and takes its colour from `colorPalette`, so `<Link colorPalette="teal">` is the
 * same two variants against a different palette. The base is an `inline-flex` row with a gap, which
 * is what lets an external-link glyph sit beside the label with no wrapper.
 *
 * **To wrap a router's own link, use `render`** — `<Link render={(props) => <A {...props} />}>`.
 * Chakra spells that `asChild`, which is `cloneElement` and does not port; `render` is handed the
 * computed props to place itself, which is the Solid-native form of the same composition.
 */
export const Link = withContext("a");

/**
 * Supplies props to every {@link Link} below it — `<LinkPropsProvider value={{ variant: "underline" }}>`
 * sets the variant for a subtree. A `Link` that passes the prop itself still wins.
 */
export const LinkPropsProvider = PropsProvider;
