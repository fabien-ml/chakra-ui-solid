import {
  createRecipeClass,
  createRecipeContext,
  type HTMLChakraProps,
  mergeProps,
  type PresetVariant,
  renderStyled,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import { type InputVariantProps, input } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import type { Component } from "solid-js";
import { omit } from "solid-js";
import { useOptionalFieldContext } from "../field/field-context";

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
  size?: ConditionalValue<
    "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | PresetVariant<"input", "size">
  >;
  /**
   * How the field is drawn — `outline` is a full border, `subtle` fills it instead, and `flushed`
   * keeps only the bottom edge with no radius or horizontal padding.
   *
   * @default "outline"
   */
  variant?: ConditionalValue<"outline" | "subtle" | "flushed" | PresetVariant<"input", "variant">>;
}

/** The DOM props Input forwards to the rendered element. */
type InputElementProps = ComponentProps<"input">;

/**
 * The recipe's own inputs, as literal keys rather than `input.variantKeys` — `omit` narrows
 * the returned props by the keys it is given, and a `string[]` narrows nothing. `satisfies` keeps
 * the two lists one list at compile time, and the test asserts the same equality at runtime.
 */
const VARIANT_KEYS = ["size", "variant"] as const satisfies readonly (keyof InputVariantProps &
  keyof InputProps)[];

/**
 * The props context on its own — no `withContext`, and no recipe handed to the seam.
 *
 * `withContext` mints a body that is only the props context, the recipe class and the style-prop
 * pipeline; Input's body is that plus a third source underneath — the surrounding field. So it takes
 * the half of the seam it can use and calls `createRecipeClass` + `renderStyled` itself, which is
 * Button's shape.
 */
const { PropsProvider, usePropsContext } = createRecipeContext<InputProps>();

/**
 * Input — a single-line text field, styled by the `input` recipe.
 *
 * It renders an `input` and takes every native attribute, so `type`, `placeholder`, `disabled` and
 * the rest work as they do on the element itself.
 *
 * **Inside a `<Field.Root>` it adopts the field**: the control's id (so the label's `for` reaches
 * it), `disabled`, `required`, `readonly`, `aria-invalid` and the `aria-describedby` /
 * `aria-errormessage` pointing at the field's texts. Outside one it is exactly the element it looks
 * like — a bare `<Input>` on a page is not a mistake, which is why the field is read through the
 * non-strict reader.
 *
 * Two CSS custom properties are the seams for recolouring it without reaching for a variant:
 * `--focus-color` paints the focus ring, `--error-color` the invalid border. Set either through
 * `css` — `<Input css={{ "--focus-color": "lime" }} />`.
 */
export const Input: Component<InputProps> = (props) => {
  const field = useOptionalFieldContext();

  // Context first, local props second, so a local prop wins — Chakra's order, and the seam's — and
  // resolved by value, so a wrapper's unset `size={props.size}` cannot beat the provider with
  // `undefined` (`CLAUDE.md`, *The third hazard*).
  const fromContext = withContextDefaults(props, usePropsContext());

  // The field goes *under* both, and through `mergeProps` rather than a spread for two reasons.
  // It resolves a key by value, so `<Input disabled={undefined}>` inside a disabled Root stays
  // disabled; and it is a lazy proxy, so `getInputProps()` is called on each read instead of once
  // here — an object of live state called once at construction would freeze `invalid`, `required`
  // and the two IDREFs at whatever they were when the input mounted.
  const merged = mergeProps(() => field?.getInputProps() ?? {}, fromContext) as InputProps;

  const recipeClass = createRecipeClass(input, {
    variantProps: () => ({ size: merged.size, variant: merged.variant }),
  });

  return renderStyled<InputElementProps>({
    // Read off `fromContext`, never off `merged`: the lazy merge resolves each key through a memo,
    // and a memo read in a component body is `[STRICT_READ_UNTRACKED]`. The field supplies neither
    // key, so the two bags answer the same thing.
    as: (fromContext.as ?? "input") as ValidComponent,
    render: fromContext.render,
    // The variant keys are the recipe's inputs, not the element's: forwarded, `size` would reach
    // the DOM as an attribute.
    props: omit(merged, ...VARIANT_KEYS) as unknown as InputElementProps,
    recipeClass,
  });
};

/**
 * Supplies props to every {@link Input} below it — `<InputPropsProvider value={{ size: "lg" }}>`
 * sets the size for a subtree. An `Input` that passes the prop itself still wins.
 */
export const InputPropsProvider = PropsProvider;
