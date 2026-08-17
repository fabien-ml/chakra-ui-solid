import {
  createSlotClasses,
  mergeProps,
  pickVariantProps,
  type RenderProp,
  renderStyled,
  useRecipeVariantKeys,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import type { CheckboxVariantProps as CheckboxRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import type {
  CheckboxRootBaseProps,
  CheckboxRootProps,
  CheckboxRootProviderProps,
  CheckboxVariantProps,
  CreateCheckboxReturn,
} from "./checkbox.types";
import {
  CheckboxProvider,
  type CheckboxSlot,
  PropsProvider,
  usePropsContext,
} from "./checkbox-context";
import { createCheckbox } from "./create-checkbox";

type LabelProps = ComponentProps<"label">;

/**
 * The Root's own inputs, which are machine arguments rather than DOM attributes — every one of them
 * describes the hidden input rather than the `label` around it, so a forwarded `name` or `value`
 * would land on the wrong element. Literal keys rather than `checkbox.props`, because `omit` narrows
 * the returned props by the keys it is handed and a `string[]` narrows nothing; `satisfies` is what
 * keeps this list and the interface one list.
 *
 * **The variants are deliberately absent.** What counts as a variant is whatever the system's own
 * `checkbox` recipe accepts, so the Root asks it (`useRecipeVariantKeys`) and omits that list
 * alongside this one — a consumer who adds `tone` to `theme.extend.slotRecipes.checkbox` gets it fed
 * to the recipe and kept off the `label` without this file naming it.
 *
 * `unstyled` is absent for its own reason — `renderStyled` consumes it and keeps it off the element.
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
] as const satisfies readonly (keyof CheckboxRootBaseProps)[];

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends CheckboxVariantProps {
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
  store: CreateCheckboxReturn,
  styling: RootStylingProps,
  variantKeys: readonly string[],
  elementProps: LabelProps,
): JSX.Element {
  // Once, here — never per part. Four parts each calling `sva()` is four times the work for one
  // answer, and it puts four copies of the variant-reading logic in the tree where they can
  // disagree. A memo, because a variant prop is a prop like any other and `size` can change.
  //
  // The keys are the recipe's, picked inside the accessor so a changed variant re-resolves. An unset
  // one arrives as `undefined`, which is what the recipe's own `defaultVariants` fills — restating a
  // default here would be the second source of truth `CheckboxVariantProps` declines to be.
  const slots = createSlotClasses<CheckboxSlot, CheckboxRecipeVariants>("checkbox", {
    variantProps: () => pickVariantProps<CheckboxRecipeVariants>(styling, variantKeys),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => styling.unstyled,
  });

  // `merge`, never `{ ...store, slots }`: the store is an object of getters over the machine, and a
  // spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { slots });

  return (
    <CheckboxProvider value={value}>
      {renderStyled<LabelProps, HTMLLabelElement>({
        as: (styling.as ?? "label") as ValidComponent,
        props: elementProps,
        render: styling.render,
        recipeClass: () => slots().root,
      })}
    </CheckboxProvider>
  );
}

/**
 * Checkbox.Root — starts the machine, and renders the `label` the box and the text live in.
 *
 * It is a `<label>`, which is what makes the whole row clickable: the machine points its `for` at
 * `<Checkbox.HiddenInput>`, so a click anywhere inside toggles the box without a handler of ours.
 * The input is not optional — without it there is no focusable control and nothing submits.
 *
 * A consumer's `id` seeds the machine rather than landing on the element: the root's own attribute
 * becomes `checkbox:{id}`, the input's `checkbox:{id}:input`, and `ids` is the way to control the
 * attributes themselves.
 *
 * **No `withDefaults` call, unusually.** Chakra passes the Root no `defaultProps`, the two variants
 * are resolved by the recipe's own `defaultVariants`, and the machine's `value: "on"` survives a
 * forwarded `undefined` on its own — the adapter runs `compact()` over the machine's prop bag, so
 * the spread never sees an `undefined` to overwrite a default with.
 */
export const CheckboxRoot: Component<CheckboxRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `size={props.size}` would otherwise beat
  // the provider above it with `undefined`.
  const merged = withContextDefaults<CheckboxRootProps>(props, usePropsContext());
  const store = createCheckbox(merged);

  // One read of the recipe's variant names, feeding both the `omit` that keeps them off the `label`
  // and the recipe call that consumes them. There is no bare `size` or `variant` style prop for
  // `renderStyled` to swallow, so a variant left in the bag lands on the served markup as
  // `size="lg"` with nothing to catch it.
  const variantKeys = useRecipeVariantKeys<CheckboxRootProps>("checkbox");

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omit(merged, ...ROOT_OWN_KEYS, ...variantKeys),
  ) as LabelProps;

  return renderRoot(store, merged, variantKeys, elementProps);
};

/**
 * Checkbox.RootProvider — the same element and the same context, over a machine the consumer built
 * with {@link createCheckbox} and holds a reference to.
 *
 * Put the parts directly inside it; it is a Root, not a wrapper around one, so nesting a
 * `<Checkbox.Root>` under it would start a second machine and label a second input.
 */
export const CheckboxRootProvider: Component<CheckboxRootProviderProps> = (props) => {
  // The context bag is dropped of its `value` first, because the two roots do not mean the same
  // thing by the word: on `<Checkbox.PropsProvider>` it is the hidden input's submitted value, and
  // here it is the machine. Letting it through would hand this Root a string where a machine
  // belongs.
  const merged = withContextDefaults<CheckboxRootProviderProps>(
    props,
    omit(usePropsContext(), "value"),
  );

  const variantKeys = useRecipeVariantKeys<CheckboxRootProviderProps>("checkbox");

  const elementProps = mergeProps(
    () => merged.value.getRootProps(),
    omit(merged, "value", ...variantKeys),
  ) as LabelProps;

  return renderRoot(merged.value, merged, variantKeys, elementProps);
};

/**
 * Supplies props to every {@link CheckboxRoot} below it — `<Checkbox.PropsProvider value={{ size:
 * "lg" }}>` sets the treatment for a whole subtree. A Root that passes the prop itself still wins.
 */
export const CheckboxPropsProvider = PropsProvider;
