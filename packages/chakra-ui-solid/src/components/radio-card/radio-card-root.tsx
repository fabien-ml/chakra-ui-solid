import {
  createSlotClasses,
  mergeProps,
  pickVariantProps,
  type RenderProp,
  renderStyled,
  useRecipeVariantKeys,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import type { RadioCardVariantProps as RadioCardRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { createRadioGroup } from "../radio-group";
import type {
  CreateRadioCardReturn,
  RadioCardRootBaseProps,
  RadioCardRootProps,
  RadioCardRootProviderProps,
  RadioCardVariantProps,
} from "./radio-card.types";
import {
  PropsProvider,
  RadioCardProvider,
  type RadioCardSlot,
  usePropsContext,
} from "./radio-card-context";

type DivProps = ComponentProps<"div">;

/**
 * The Root's own inputs, which are machine arguments rather than DOM attributes. Literal keys rather
 * than `zagRadioGroup.props`, because `omit` narrows the returned props by the keys it is handed and
 * a `string[]` narrows nothing; `satisfies` is what keeps this list and the interface one list.
 *
 * **`orientation` is absent, where the `radioGroup` Root lists it.** Here it is a recipe variant, so
 * the list below picks it up alongside the other four and it never reaches the machine — which is
 * what upstream's `splitVariantProps` does with it too.
 *
 * **The variants are deliberately absent.** What counts as a variant is whatever the system's own
 * `radioCard` recipe accepts, so the Root asks it (`useRecipeVariantKeys`) and omits that list
 * alongside this one — five keys here where `radioGroup` has two, and neither file names them.
 *
 * `unstyled` is absent for its own reason — `renderStyled` consumes it and keeps it off the element.
 */
const ROOT_OWN_KEYS = [
  "defaultValue",
  "disabled",
  "form",
  "id",
  "ids",
  "invalid",
  "name",
  "onValueChange",
  "readOnly",
  "required",
  "value",
] as const satisfies readonly (keyof RadioCardRootBaseProps)[];

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends RadioCardVariantProps {
  as?: ValidComponent;
  unstyled?: boolean;
  render?: RenderProp<DivProps>;
}

/**
 * Everything both roots do once the machine exists: resolve the slot recipe, publish the machine and
 * the classes on context, and render the `div` the machine's `getRootProps()` describes.
 *
 * A plain function rather than a component, so the two roots allocate the same hydration keys as
 * each other and as the markup around them.
 */
function renderRoot(
  store: CreateRadioCardReturn,
  styling: RootStylingProps,
  variantKeys: readonly string[],
  elementProps: DivProps,
): JSX.Element {
  // **Once, here — never once per card.** N cards asking the recipe for the same ten strings is N
  // times the work for one answer, and every `RadioCard.Item` in a group carries the identical
  // `item` class either way.
  //
  // A memo, because a variant prop is a prop like any other and `size` can change. The keys are the
  // recipe's, picked inside the accessor so a changed variant re-resolves. An unset one arrives as
  // `undefined`, which is what the recipe's own `defaultVariants` fills — and `justify` has no entry
  // there, so unset means `--radio-card-justify` is never written.
  const slots = createSlotClasses<RadioCardSlot, RadioCardRecipeVariants>("radioCard", {
    variantProps: () => pickVariantProps<RadioCardRecipeVariants>(styling, variantKeys),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => styling.unstyled,
  });

  // `merge`, never `{ ...store, slots }`: the store is an object of getters over the machine, and a
  // spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { slots });

  return (
    <RadioCardProvider value={value}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (styling.as ?? "div") as ValidComponent,
        props: elementProps,
        render: styling.render,
        recipeClass: () => slots().root,
      })}
    </RadioCardProvider>
  );
}

/**
 * RadioCard.Root — starts the machine and renders the `role="radiogroup"` box the cards live in.
 *
 * One machine drives every `<RadioCard.Item>` inside it, so the group owns the picked value and a
 * card owns only its `value`:
 *
 * ```tsx
 * <RadioCard.Root defaultValue="next">
 *   <RadioCard.Label>Select framework</RadioCard.Label>
 *   <RadioCard.Item value="next">
 *     <RadioCard.ItemHiddenInput />
 *     <RadioCard.ItemControl>
 *       <RadioCard.ItemText>Next.js</RadioCard.ItemText>
 *       <RadioCard.ItemIndicator />
 *     </RadioCard.ItemControl>
 *   </RadioCard.Item>
 * </RadioCard.Root>
 * ```
 *
 * It runs the same `@zag-js/radio-group` machine a `RadioGroup.Root` does, so a `<Fieldset.Root>`
 * above it supplies the legend's id and both states exactly as it does there.
 *
 * A consumer's `id` seeds the machine rather than landing on the element: the root's own attribute
 * becomes `radio-group:{id}`, a card's input `radio-group:{id}:radio:input:{value}`, and `ids` is
 * the way to control the attributes themselves.
 *
 * **`orientation` here is the card's layout, not the machine's keyboard model** — it is one of this
 * recipe's five variants, so it turns the control's contents and stops there. The group keeps the
 * machine's own `vertical` for its arrow keys and its `aria-orientation`; to change *that*, build
 * the machine with {@link createRadioCard} and drive a {@link RadioCardRootProvider}.
 *
 * **No `withDefaults` call, unusually.** Chakra passes the Root no `defaultProps` and the four
 * variants that have one are resolved by the recipe's own `defaultVariants`.
 */
export const RadioCardRoot: Component<RadioCardRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `size={props.size}` would otherwise beat
  // the provider above it with `undefined`.
  const merged = withContextDefaults<RadioCardRootProps>(props, usePropsContext());

  // Dropped before the machine sees it, because the two libraries agree that a card's `orientation`
  // is the recipe's: upstream splits the variant props off before the Ark Root is rendered, so the
  // machine is left with its own `vertical` however the card is laid out. Passing it through here
  // would put `aria-orientation="horizontal"` on a group whose arrow keys still run vertically.
  const store = createRadioGroup(omit(merged, "orientation"));

  // One read of the recipe's variant names, feeding both the `omit` that keeps them off the `div`
  // and the recipe call that consumes them. `align`, `justify` and `orientation` in particular are
  // plain words a reader could mistake for DOM attributes, and left in the bag they land on the
  // served markup.
  const variantKeys = useRecipeVariantKeys<RadioCardRootProps>("radioCard");

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omit(merged, ...ROOT_OWN_KEYS, ...variantKeys),
  ) as DivProps;

  return renderRoot(store, merged, variantKeys, elementProps);
};

/**
 * RadioCard.RootProvider — the same element and the same context, over a machine the consumer built
 * with {@link createRadioCard} and holds a reference to.
 *
 * Put the cards directly inside it; it is a Root, not a wrapper around one, so nesting a
 * `<RadioCard.Root>` under it would start a second machine over the same cards.
 */
export const RadioCardRootProvider: Component<RadioCardRootProviderProps> = (props) => {
  // The context bag is dropped of its `value` first, because the two roots do not mean the same
  // thing by the word: on `<RadioCard.PropsProvider>` it is the picked card's value, and here it is
  // the machine. Letting it through would hand this Root a string where a machine belongs.
  const merged = withContextDefaults<RadioCardRootProviderProps>(
    props,
    omit(usePropsContext(), "value"),
  );

  const variantKeys = useRecipeVariantKeys<RadioCardRootProviderProps>("radioCard");

  const elementProps = mergeProps(
    () => merged.value.getRootProps(),
    omit(merged, "value", ...variantKeys),
  ) as DivProps;

  return renderRoot(merged.value, merged, variantKeys, elementProps);
};

/**
 * Supplies props to every {@link RadioCardRoot} below it — `<RadioCard.PropsProvider value={{
 * variant: "surface" }}>` sets the treatment for a whole subtree. A Root that passes the prop itself
 * still wins.
 */
export const RadioCardPropsProvider = PropsProvider;
