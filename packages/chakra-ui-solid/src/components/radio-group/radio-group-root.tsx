import {
  createSlotClasses,
  mergeProps,
  pickVariantProps,
  type RenderProp,
  renderStyled,
  useRecipeVariantKeys,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import type { RadioGroupVariantProps as RadioGroupRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { createRadioGroup } from "./create-radio-group";
import type {
  CreateRadioGroupReturn,
  RadioGroupRootBaseProps,
  RadioGroupRootProps,
  RadioGroupRootProviderProps,
  RadioGroupVariantProps,
} from "./radio-group.types";
import {
  PropsProvider,
  RadioGroupProvider,
  type RadioGroupSlot,
  usePropsContext,
} from "./radio-group-context";

type DivProps = ComponentProps<"div">;

/**
 * The Root's own inputs, which are machine arguments rather than DOM attributes. `orientation` is
 * the one worth naming: the machine takes it *and* writes it back out as `data-orientation`, so
 * leaving it in the bag would put a raw `orientation="vertical"` on the `div` beside the attribute
 * the machine already wrote. Literal keys rather than `zagRadioGroup.props`, because `omit` narrows
 * the returned props by the keys it is handed and a `string[]` narrows nothing; `satisfies` is what
 * keeps this list and the interface one list.
 *
 * **The variants are deliberately absent.** What counts as a variant is whatever the system's own
 * `radioGroup` recipe accepts, so the Root asks it (`useRecipeVariantKeys`) and omits that list
 * alongside this one — a consumer who adds `tone` to `theme.extend.slotRecipes.radioGroup` gets it
 * fed to the recipe and kept off the `div` without this file naming it.
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
  "orientation",
  "readOnly",
  "required",
  "value",
] as const satisfies readonly (keyof RadioGroupRootBaseProps)[];

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends RadioGroupVariantProps {
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
  store: CreateRadioGroupReturn,
  styling: RootStylingProps,
  variantKeys: readonly string[],
  elementProps: DivProps,
): JSX.Element {
  // **Once, here — never once per item.** This is the whole reason a repeated part reads its class
  // off context: N items asking the recipe for the same eight strings is N times the work for one
  // answer, and every `RadioGroup.Item` in a group carries the identical `item` class either way.
  //
  // A memo, because a variant prop is a prop like any other and `size` can change. The keys are the
  // recipe's, picked inside the accessor so a changed variant re-resolves. An unset one arrives as
  // `undefined`, which is what the recipe's own `defaultVariants` fills.
  const slots = createSlotClasses<RadioGroupSlot, RadioGroupRecipeVariants>("radioGroup", {
    variantProps: () => pickVariantProps<RadioGroupRecipeVariants>(styling, variantKeys),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => styling.unstyled,
  });

  // `merge`, never `{ ...store, slots }`: the store is an object of getters over the machine, and a
  // spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { slots });

  return (
    <RadioGroupProvider value={value}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (styling.as ?? "div") as ValidComponent,
        props: elementProps,
        render: styling.render,
        recipeClass: () => slots().root,
      })}
    </RadioGroupProvider>
  );
}

/**
 * RadioGroup.Root — starts the machine and renders the `role="radiogroup"` box the radios live in.
 *
 * One machine drives every `<RadioGroup.Item>` inside it, so the group owns the checked value and an
 * item owns only its `value`:
 *
 * ```tsx
 * <RadioGroup.Root defaultValue="solid">
 *   <RadioGroup.Item value="solid">
 *     <RadioGroup.ItemHiddenInput />
 *     <RadioGroup.ItemIndicator />
 *     <RadioGroup.ItemText>Solid</RadioGroup.ItemText>
 *   </RadioGroup.Item>
 * </RadioGroup.Root>
 * ```
 *
 * A consumer's `id` seeds the machine rather than landing on the element: the root's own attribute
 * becomes `radio-group:{id}`, an item's input `radio-group:{id}:radio:input:{value}`, and `ids` is
 * the way to control the attributes themselves.
 *
 * It also sets `position: relative` from the machine's own inline style, so an absolutely-positioned
 * indicator has something to measure against.
 *
 * **No `withDefaults` call, unusually.** Chakra passes the Root no `defaultProps`, the two variants
 * are resolved by the recipe's own `defaultVariants`, and the machine's `orientation: "horizontal"`
 * survives a forwarded `undefined` on its own — the adapter runs `compact()` over the machine's prop
 * bag, so the spread never sees an `undefined` to overwrite a default with.
 */
export const RadioGroupRoot: Component<RadioGroupRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `size={props.size}` would otherwise beat
  // the provider above it with `undefined`.
  const merged = withContextDefaults<RadioGroupRootProps>(props, usePropsContext());
  const store = createRadioGroup(merged);

  // One read of the recipe's variant names, feeding both the `omit` that keeps them off the `div`
  // and the recipe call that consumes them. There is no bare `size` or `variant` style prop for
  // `renderStyled` to swallow, so a variant left in the bag lands on the served markup as
  // `size="lg"` with nothing to catch it.
  const variantKeys = useRecipeVariantKeys<RadioGroupRootProps>("radioGroup");

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omit(merged, ...ROOT_OWN_KEYS, ...variantKeys),
  ) as DivProps;

  return renderRoot(store, merged, variantKeys, elementProps);
};

/**
 * RadioGroup.RootProvider — the same element and the same context, over a machine the consumer built
 * with {@link createRadioGroup} and holds a reference to.
 *
 * Put the items directly inside it; it is a Root, not a wrapper around one, so nesting a
 * `<RadioGroup.Root>` under it would start a second machine over the same radios.
 */
export const RadioGroupRootProvider: Component<RadioGroupRootProviderProps> = (props) => {
  // The context bag is dropped of its `value` first, because the two roots do not mean the same
  // thing by the word: on `<RadioGroup.PropsProvider>` it is the checked radio's value, and here it
  // is the machine. Letting it through would hand this Root a string where a machine belongs.
  const merged = withContextDefaults<RadioGroupRootProviderProps>(
    props,
    omit(usePropsContext(), "value"),
  );

  const variantKeys = useRecipeVariantKeys<RadioGroupRootProviderProps>("radioGroup");

  const elementProps = mergeProps(
    () => merged.value.getRootProps(),
    omit(merged, "value", ...variantKeys),
  ) as DivProps;

  return renderRoot(merged.value, merged, variantKeys, elementProps);
};

/**
 * Supplies props to every {@link RadioGroupRoot} below it — `<RadioGroup.PropsProvider value={{
 * size: "lg" }}>` sets the treatment for a whole subtree. A Root that passes the prop itself still
 * wins.
 */
export const RadioGroupPropsProvider = PropsProvider;
