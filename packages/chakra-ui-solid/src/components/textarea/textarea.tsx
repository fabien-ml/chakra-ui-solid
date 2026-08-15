import {
  createRecipeClass,
  createRecipeContext,
  type HTMLChakraProps,
  mergeProps,
  omitProps,
  type PresetVariant,
  renderStyled,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import { type TextareaVariantProps, textarea } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { autoresizeTextarea } from "@zag-js/auto-resize";
import { type Component, createEffect, createSignal } from "solid-js";
import { useOptionalFieldContext } from "../field/field-context";

/**
 * The two variants spelled out rather than inherited from the generated `TextareaVariantProps`, so
 * each carries a description a reader can use and a type they can read — Badge's precedent, and
 * Input's. Drift is caught at the seam below, whose keys are typed against the generated variants.
 */
export interface TextareaProps extends HTMLChakraProps<"textarea"> {
  /**
   * The minimum height, padding and text style together.
   *
   * @default "md"
   */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg" | "xl" | PresetVariant<"textarea", "size">>;
  /**
   * How the field is drawn — `outline` is a full border, `subtle` fills it instead, and `flushed`
   * keeps only the bottom edge with no radius or horizontal padding.
   *
   * @default "outline"
   */
  variant?: ConditionalValue<
    "outline" | "subtle" | "flushed" | PresetVariant<"textarea", "variant">
  >;
  /**
   * Whether the box grows to fit its value as you type, instead of scrolling.
   *
   * It also takes the drag handle away — a box that sizes itself and a box the reader sizes are two
   * different controls. Cap the growth with a `maxHeight` in line units: `<Textarea autoresize
   * maxH="5lh" />`.
   *
   * @default false
   */
  autoresize?: boolean;
}

/** The DOM props Textarea forwards to the rendered element. */
type TextareaElementProps = ComponentProps<"textarea">;

/**
 * The recipe's own inputs, as literal keys rather than `textarea.variantKeys` — `omitProps` narrows
 * the returned props by the keys it is given, and a `string[]` narrows nothing. `satisfies` keeps
 * the two lists one list at compile time, and the test asserts the same equality at runtime.
 *
 * `autoresize` rides along because it is not the element's attribute either: it drives an effect and
 * an inline `resize`, and forwarded it would reach the DOM as `autoresize=""`.
 */
const VARIANT_KEYS = ["size", "variant"] as const satisfies readonly (keyof TextareaVariantProps &
  keyof TextareaProps)[];
const NON_ELEMENT_KEYS = [...VARIANT_KEYS, "autoresize"] as const;

/** Input's shape: the props context off the seam, and the body's own third source under it. */
const { PropsProvider, usePropsContext } = createRecipeContext<TextareaProps>();

/**
 * Textarea — a multi-line text field, styled by the `textarea` recipe.
 *
 * It renders a `textarea` and takes every native attribute, so `rows`, `placeholder`, `disabled` and
 * the rest work as they do on the element itself.
 *
 * **Inside a `<Field.Root>` it adopts the field**: the control's id (so the label's `for` reaches
 * it), `disabled`, `required`, `readonly`, `aria-invalid` and the `aria-describedby` /
 * `aria-errormessage` pointing at the field's texts. Outside one it is exactly the element it looks
 * like, which is why the field is read through the non-strict reader.
 *
 * Two CSS custom properties are the seams for recolouring it without reaching for a variant:
 * `--focus-color` paints the focus ring, `--error-color` the invalid border.
 */
export const Textarea: Component<TextareaProps> = (props) => {
  const field = useOptionalFieldContext();

  // Context first, local props second, so a local prop wins — Chakra's order, and the seam's — and
  // resolved by value, so a wrapper's unset `size={props.size}` cannot beat the provider with
  // `undefined` (`CLAUDE.md`, *The third hazard*).
  const fromContext = withContextDefaults(props, usePropsContext());

  // The field goes *under* both, and through `mergeProps` rather than a spread: it resolves a key
  // by value, so `<Textarea disabled={undefined}>` inside a disabled Root stays disabled; and it is
  // a lazy proxy, so `getTextareaProps()` is called on each read instead of once here — an object
  // of live state called once at construction would freeze `invalid`, `required` and the two IDREFs
  // at whatever they were when the control mounted.
  //
  // The middle layer is the drag handle `autoresize` takes away — an inline `style`, which
  // `mergeProps` *composes* rather than replaces, so a caller's own `style` still lands on top.
  const merged = mergeProps(
    () => field?.getTextareaProps() ?? {},
    () => (fromContext.autoresize ? { style: { resize: "none" } } : {}),
    fromContext,
  ) as TextareaProps;

  const recipeClass = createRecipeClass(textarea, {
    variantProps: () => ({ size: merged.size, variant: merged.variant }),
  });

  // A **signal**, not a plain `let`: the effect below has to re-run once the ref lands, and the
  // element is assigned after the component body has already registered the effect.
  const [element, setElement] = createSignal<HTMLTextAreaElement | undefined>(undefined);

  // Zag's own primitive, and the one Ark's `Field.Textarea` calls — measuring `scrollHeight` against
  // the box model, watching the element, the fonts and a form reset, and patching the `value` setter
  // so a programmatic write resizes too.
  //
  // The split `createEffect(compute, effect)` pair rather than `onSettled`: `onSettled` registers a
  // single fire and tracks nothing, so a subtree that turns `autoresize` on after mount would never
  // subscribe. The effect phase runs after the queue flushes — the element is in the document by
  // then, which the `getComputedStyle` inside needs — and its returned cleanup unsubscribes before
  // the next run.
  createEffect(
    () => (fromContext.autoresize ? element() : undefined),
    (node) => (node === undefined ? undefined : autoresizeTextarea(node)),
  );

  return renderStyled<TextareaElementProps, HTMLTextAreaElement>({
    // Read off `fromContext`, never off `merged`: the lazy merge resolves each key through a memo,
    // and a memo read in a component body is `[STRICT_READ_UNTRACKED]`. The field supplies none of
    // these keys, so the two bags answer the same thing.
    as: (fromContext.as ?? "textarea") as ValidComponent,
    render: fromContext.render,
    props: omitProps(merged, ...NON_ELEMENT_KEYS) as unknown as TextareaElementProps,
    recipeClass,
    ref: setElement,
  });
};

/**
 * Supplies props to every {@link Textarea} below it — `<TextareaPropsProvider value={{ size: "lg"
 * }}>` sets the size for a subtree. A `Textarea` that passes the prop itself still wins.
 */
export const TextareaPropsProvider = PropsProvider;
