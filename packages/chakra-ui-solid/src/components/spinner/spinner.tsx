import { createRecipeContext, type HTMLChakraProps, type SkinVariant } from "@chakra-ui-solid/core";
import { type SpinnerVariantProps, spinner } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/**
 * The one variant spelled out rather than inherited from the generated `SpinnerVariantProps`, so it
 * carries a description a reader can use and a type they can read — a generated type has neither,
 * and this is the interface the docs page's props table is built from. Container's precedent, and
 * drift is caught the same way: `variantKeys` below is typed against the generated variants, so a
 * variant renamed in the recipe stops the build at the call rather than at the interface.
 */
export interface SpinnerProps extends HTMLChakraProps<"span"> {
  /**
   * The diameter, as a scale step. `inherit` takes `1em` from the surrounding font size, which is
   * how a spinner inside a button matches its label.
   *
   * @default "md"
   */
  size?: ConditionalValue<
    "inherit" | "xs" | "sm" | "md" | "lg" | "xl" | SkinVariant<"spinner", "size">
  >;
}

const { withContext, PropsProvider } = createRecipeContext<SpinnerProps, SpinnerVariantProps>({
  recipe: spinner,
  variantKeys: ["size"],
});

/**
 * Spinner — an indeterminate progress indicator.
 *
 * The recipe draws it as a `2px` ring in `currentColor` with two of its four borders replaced by
 * `--spinner-track-color` (`transparent` by default), spun by the `spin` animation. So `color`
 * recolours the arc, `borderWidth` thickens it, `animationDuration` changes the speed, and setting
 * `--spinner-track-color` fills in the gap behind it — the four style props its docs page is about.
 *
 * It renders a bare `span` with no ARIA of its own, which is Chakra's shape: what is loading, and
 * how to announce it, belongs to whatever is waiting — an `aria-busy` region, a `role="status"`
 * label beside it, or a Button's `loading` prop.
 */
export const Spinner = withContext("span");

/**
 * Supplies props to every {@link Spinner} below it — `<SpinnerPropsProvider value={{ size: "sm" }}>`
 * sets the diameter for a subtree. A `Spinner` that passes the prop itself still wins.
 */
export const SpinnerPropsProvider = PropsProvider;
