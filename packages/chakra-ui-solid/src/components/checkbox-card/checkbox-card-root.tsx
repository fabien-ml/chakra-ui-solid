import {
  createSlotClasses,
  mergeProps,
  pickVariantProps,
  type RenderProp,
  renderStyled,
  useRecipeVariantKeys,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import type { CheckboxCardVariantProps as CheckboxCardRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { createCheckbox } from "../checkbox";
import type {
  CheckboxCardRootBaseProps,
  CheckboxCardRootProps,
  CheckboxCardRootProviderProps,
  CheckboxCardVariantProps,
  CreateCheckboxCardReturn,
} from "./checkbox-card.types";
import {
  CheckboxCardProvider,
  type CheckboxCardSlot,
  PropsProvider,
  usePropsContext,
} from "./checkbox-card-context";

type LabelProps = ComponentProps<"label">;

/**
 * The Root's own inputs, which are machine arguments rather than DOM attributes — every one of them
 * describes the hidden input rather than the `label` around it, so a forwarded `name` or `value`
 * would land on the wrong element. Literal keys rather than `checkbox.props`, because `omit` narrows
 * the returned props by the keys it is handed and a `string[]` narrows nothing; `satisfies` is what
 * keeps this list and the interface one list.
 *
 * **The variants are deliberately absent.** What counts as a variant is whatever the system's own
 * `checkboxCard` recipe accepts, so the Root asks it (`useRecipeVariantKeys`) and omits that list
 * alongside this one — five keys here where `checkbox` has two, and neither file names them.
 */
const ROOT_OWN_KEYS = [
  "checked",
  "defaultChecked",
  "disabled",
  "form",
  "id",
  "ids",
  "invalid",
  "name",
  "onCheckedChange",
  "readOnly",
  "required",
  "value",
] as const satisfies readonly (keyof CheckboxCardRootBaseProps)[];

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends CheckboxCardVariantProps {
  as?: ValidComponent;
  unstyled?: boolean;
  render?: RenderProp<LabelProps>;
}

/**
 * Everything both roots do once the machine exists: resolve the slot recipe, publish the machine and
 * the classes on context, and render the `label` the machine's `getRootProps()` describes.
 *
 * A plain function rather than a component, so the two roots allocate the same hydration keys as
 * each other and as the markup around them.
 */
function renderRoot(
  store: CreateCheckboxCardReturn,
  styling: RootStylingProps,
  variantKeys: readonly string[],
  elementProps: LabelProps,
): JSX.Element {
  // Once, here — never per part. Seven parts each calling `sva()` is seven times the work for one
  // answer. A memo, because a variant prop is a prop like any other and `size` can change.
  //
  // The keys are the recipe's, picked inside the accessor so a changed variant re-resolves. An unset
  // one arrives as `undefined`, which is what the recipe's own `defaultVariants` fills — and
  // `justify` has no entry there, so unset means `--checkbox-card-justify` is never written and the
  // control keeps the browser's own `justify-content`.
  const slots = createSlotClasses<CheckboxCardSlot, CheckboxCardRecipeVariants>("checkboxCard", {
    variantProps: () => pickVariantProps<CheckboxCardRecipeVariants>(styling, variantKeys),
    unstyled: () => styling.unstyled,
  });

  // `merge`, never `{ ...store, slots }`: the store is an object of getters over the machine, and a
  // spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { slots });

  return (
    <CheckboxCardProvider value={value}>
      {renderStyled<LabelProps, HTMLLabelElement>({
        as: (styling.as ?? "label") as ValidComponent,
        props: elementProps,
        render: styling.render,
        recipeClass: () => slots().root,
      })}
    </CheckboxCardProvider>
  );
}

/**
 * CheckboxCard.Root — starts the machine, and renders the `label` the whole card lives in.
 *
 * It is a `<label>`, which is what makes the whole card clickable: the machine points its `for` at
 * `<CheckboxCard.HiddenInput>`, so a click anywhere inside toggles the box without a handler of
 * ours. The input is not optional — without it there is no focusable control and nothing submits.
 *
 * ```tsx
 * <CheckboxCard.Root>
 *   <CheckboxCard.HiddenInput />
 *   <CheckboxCard.Control>
 *     <CheckboxCard.Content>
 *       <CheckboxCard.Label>Next.js</CheckboxCard.Label>
 *       <CheckboxCard.Description>Best for apps</CheckboxCard.Description>
 *     </CheckboxCard.Content>
 *     <CheckboxCard.Indicator />
 *   </CheckboxCard.Control>
 * </CheckboxCard.Root>
 * ```
 *
 * It runs the same `@zag-js/checkbox` machine a `Checkbox.Root` does, so a `<CheckboxGroup>` above
 * it drives a set of cards exactly as it drives a column of boxes, and a `<Field.Root>` supplies its
 * ids and its states.
 *
 * A consumer's `id` seeds the machine rather than landing on the element: the root's own attribute
 * becomes `checkbox:{id}`, the input's `checkbox:{id}:input`, and `ids` is the way to control the
 * attributes themselves.
 */
export const CheckboxCardRoot: Component<CheckboxCardRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `size={props.size}` would otherwise beat
  // the provider above it with `undefined`.
  const merged = withContextDefaults<CheckboxCardRootProps>(props, usePropsContext());
  const store = createCheckbox(merged);

  // One read of the recipe's variant names, feeding both the `omit` that keeps them off the `label`
  // and the recipe call that consumes them. `align` and `justify` in particular are plain words a
  // reader could mistake for DOM attributes, and left in the bag they land on the served markup.
  const variantKeys = useRecipeVariantKeys<CheckboxCardRootProps>("checkboxCard");

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omit(merged, ...ROOT_OWN_KEYS, ...variantKeys),
  ) as LabelProps;

  return renderRoot(store, merged, variantKeys, elementProps);
};

/**
 * CheckboxCard.RootProvider — the same element and the same context, over a machine the consumer
 * built with {@link createCheckboxCard} and holds a reference to.
 *
 * Put the parts directly inside it; it is a Root, not a wrapper around one, so nesting a
 * `<CheckboxCard.Root>` under it would start a second machine and label a second input.
 */
export const CheckboxCardRootProvider: Component<CheckboxCardRootProviderProps> = (props) => {
  // The context bag is dropped of its `value` first, because the two roots do not mean the same
  // thing by the word: on `<CheckboxCard.RootPropsProvider>` it is the hidden input's submitted
  // value, and here it is the machine.
  const merged = withContextDefaults<CheckboxCardRootProviderProps>(
    props,
    omit(usePropsContext(), "value"),
  );

  const variantKeys = useRecipeVariantKeys<CheckboxCardRootProviderProps>("checkboxCard");

  const elementProps = mergeProps(
    () => merged.value.getRootProps(),
    omit(merged, "value", ...variantKeys),
  ) as LabelProps;

  return renderRoot(merged.value, merged, variantKeys, elementProps);
};

/**
 * Supplies props to every {@link CheckboxCardRoot} below it — `<CheckboxCard.RootPropsProvider
 * value={{ variant: "surface" }}>` sets the treatment for a whole subtree. A Root that passes the
 * prop itself still wins.
 */
export const CheckboxCardRootPropsProvider = PropsProvider;
