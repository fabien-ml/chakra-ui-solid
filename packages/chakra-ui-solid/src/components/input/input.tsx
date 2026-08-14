import { createRecipeContext, type HTMLChakraProps } from "@chakra-ui-solid/core";
import { type InputVariantProps, input } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";

/**
 * The two variants spelled out rather than inherited from the generated `InputVariantProps`, so each
 * carries a description a reader can use and a type they can read — Badge's precedent. Drift is
 * caught at the seam below, whose keys are typed against the generated variants, and the tuple
 * order follows `input.variantKeys` rather than the order they are declared here.
 */
export interface InputProps extends HTMLChakraProps<"input"> {
  /**
   * The height, horizontal padding and text style together. The height is published as
   * `--input-height`, so anything positioned against the field can read it back.
   *
   * @default "md"
   */
  size?: ConditionalValue<"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl">;
  /**
   * How the field is drawn — `outline` is a full border, `subtle` fills it instead, and `flushed`
   * keeps only the bottom edge with no radius or horizontal padding.
   *
   * @default "outline"
   */
  variant?: ConditionalValue<"outline" | "subtle" | "flushed">;
}

const { withContext, PropsProvider } = createRecipeContext<InputProps, InputVariantProps>({
  recipe: input,
  variantKeys: ["size", "variant"],
});

/**
 * Input — a single-line text field, styled by the `input` recipe.
 *
 * It renders an `input` and takes every native attribute, so `type`, `placeholder`, `disabled` and
 * the rest work as they do on the element itself.
 *
 * Two CSS custom properties are the seams for recolouring it without reaching for a variant:
 * `--focus-color` paints the focus ring, `--error-color` the invalid border. Set either through
 * `css` — `<Input css={{ "--focus-color": "lime" }} />`.
 */
export const Input = withContext("input");

/**
 * Supplies props to every {@link Input} below it — `<InputPropsProvider value={{ size: "lg" }}>`
 * sets the size for a subtree. An `Input` that passes the prop itself still wins.
 */
export const InputPropsProvider = PropsProvider;
