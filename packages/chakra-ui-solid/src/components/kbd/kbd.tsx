import { createRecipeContext, type HTMLChakraProps } from "@chakra-ui-solid/core";
import { type KbdVariantProps, kbd } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/**
 * The two variants spelled out rather than inherited from the generated `KbdVariantProps`, so each
 * carries a description a reader can use and a type they can read — Badge's precedent, and this is
 * the interface the docs page's props table is built from. Drift is caught at the call below, whose
 * key tuple is typed against the generated variants.
 */
export interface KbdProps extends HTMLChakraProps<"kbd"> {
  /**
   * How the key is drawn — `raised` gives it the thicker bottom border that reads as a keycap,
   * `outline` is a ring, `subtle` a fill, and `plain` the glyph alone.
   *
   * @default "raised"
   */
  variant?: ConditionalValue<"raised" | "outline" | "subtle" | "plain">;
  /**
   * The text style and height together.
   *
   * @default "md"
   */
  size?: ConditionalValue<"sm" | "md" | "lg">;
}

const { withContext, PropsProvider } = createRecipeContext<KbdProps, KbdVariantProps>({
  recipe: kbd,
  variantKeys: ["variant", "size"],
});

/**
 * Kbd — a keyboard key or a chord, styled by the `kbd` recipe.
 *
 * It renders a `kbd` element and takes its colour from `colorPalette`. The recipe sets
 * `wordSpacing: -0.5em`, which is what lets one element carry a whole chord — `<Kbd>Shift + Tab</Kbd>`
 * reads as a single cap rather than as three spaced words.
 */
export const Kbd = withContext("kbd");

/**
 * Supplies props to every {@link Kbd} below it — `<KbdPropsProvider value={{ size: "lg" }}>` sets
 * the size for a subtree. A `Kbd` that passes the prop itself still wins.
 */
export const KbdPropsProvider = PropsProvider;
