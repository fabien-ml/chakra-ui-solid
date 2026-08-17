import {
  createSlotClasses,
  mergeProps,
  pickVariantProps,
  type RenderProp,
  renderStyled,
  useRecipeVariantKeys,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import type { SwittchVariantProps as SwitchRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { createSwitch } from "./create-switch";
import type {
  CreateSwitchReturn,
  SwitchRootBaseProps,
  SwitchRootProps,
  SwitchRootProviderProps,
  SwitchVariantProps,
} from "./switch.types";
import { PropsProvider, SwitchProvider, type SwitchSlot, usePropsContext } from "./switch-context";

type LabelProps = ComponentProps<"label">;

/**
 * The Root's own inputs, which are machine arguments rather than DOM attributes — every one of them
 * describes the hidden input rather than the `label` around it, so a forwarded `name` or `value`
 * would land on the wrong element. Literal keys rather than `zagSwitch.props`, because `omit`
 * narrows the returned props by the keys it is handed and a `string[]` narrows nothing; `satisfies`
 * is what keeps this list and the interface one list.
 *
 * **The variants are deliberately absent.** What counts as a variant is whatever the system's own
 * `swittch` recipe accepts, so the Root asks it (`useRecipeVariantKeys`) and omits that list
 * alongside this one — a consumer who adds `tone` to `theme.extend.slotRecipes.swittch` gets it fed
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
  "label",
  "name",
  "onCheckedChange",
  "readOnly",
  "required",
  "value",
] as const satisfies readonly (keyof SwitchRootBaseProps)[];

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends SwitchVariantProps {
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
  store: CreateSwitchReturn,
  styling: RootStylingProps,
  variantKeys: readonly string[],
  elementProps: LabelProps,
): JSX.Element {
  // Once, here — never per part. A memo, because a variant prop is a prop like any other and `size`
  // can change.
  //
  // **`"swittch"` is not a typo of ours.** `@chakra-ui/panda-preset` registers this slot recipe
  // under that key while its `className` is `switch`, so the classes below are `switch__control` and
  // the key that reaches them is the misspelled one. Aliasing it would emit the same body twice
  // (`packages/panda-preset/src/recipe-registry.ts`).
  //
  // The keys are the recipe's, picked inside the accessor so a changed variant re-resolves. An unset
  // one arrives as `undefined`, which is what the recipe's own `defaultVariants` fills — restating a
  // default here would be the second source of truth `SwitchVariantProps` declines to be.
  const slots = createSlotClasses<SwitchSlot, SwitchRecipeVariants>("swittch", {
    variantProps: () => pickVariantProps<SwitchRecipeVariants>(styling, variantKeys),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => styling.unstyled,
  });

  // `merge`, never `{ ...store, slots }`: the store is an object of getters over the machine, and a
  // spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { slots });

  return (
    <SwitchProvider value={value}>
      {renderStyled<LabelProps, HTMLLabelElement>({
        as: (styling.as ?? "label") as ValidComponent,
        props: elementProps,
        render: styling.render,
        recipeClass: () => slots().root,
      })}
    </SwitchProvider>
  );
}

/**
 * Switch.Root — starts the machine, and renders the `label` the track and the text live in.
 *
 * It is a `<label>`, which is what makes the whole row clickable: the machine points its `for` at
 * `<Switch.HiddenInput>`, so a click anywhere inside toggles the switch without a handler of ours.
 * The input is not optional — without it there is no focusable control and nothing submits.
 *
 * A consumer's `id` seeds the machine rather than landing on the element: the root's own attribute
 * becomes `switch:{id}`, the input's `switch:{id}:input`, and `ids` is the way to control the
 * attributes themselves.
 *
 * **No `withDefaults` call, unusually.** Chakra passes the Root no `defaultProps`, the two variants
 * are resolved by the recipe's own `defaultVariants`, and the machine's `value: "on"` and
 * `defaultChecked: false` survive a forwarded `undefined` on their own — the adapter runs `compact()`
 * over the machine's prop bag, so the spread never sees an `undefined` to overwrite a default with.
 */
export const SwitchRoot: Component<SwitchRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `size={props.size}` would otherwise beat
  // the provider above it with `undefined`.
  const merged = withContextDefaults<SwitchRootProps>(props, usePropsContext());
  const store = createSwitch(merged);

  // One read of the recipe's variant names, feeding both the `omit` that keeps them off the `label`
  // and the recipe call that consumes them. There is no bare `size` or `variant` style prop for
  // `renderStyled` to swallow, so a variant left in the bag lands on the served markup as
  // `size="lg"` with nothing to catch it.
  const variantKeys = useRecipeVariantKeys<SwitchRootProps>("swittch");

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omit(merged, ...ROOT_OWN_KEYS, ...variantKeys),
  ) as LabelProps;

  return renderRoot(store, merged, variantKeys, elementProps);
};

/**
 * Switch.RootProvider — the same element and the same context, over a machine the consumer built
 * with {@link createSwitch} and holds a reference to.
 *
 * Put the parts directly inside it; it is a Root, not a wrapper around one, so nesting a
 * `<Switch.Root>` under it would start a second machine and label a second input.
 */
export const SwitchRootProvider: Component<SwitchRootProviderProps> = (props) => {
  // The context bag is dropped of its `value` first, because the two roots do not mean the same
  // thing by the word: on `<Switch.PropsProvider>` it is the hidden input's submitted value, and
  // here it is the machine. Letting it through would hand this Root a string where a machine
  // belongs.
  const merged = withContextDefaults<SwitchRootProviderProps>(
    props,
    omit(usePropsContext(), "value"),
  );

  const variantKeys = useRecipeVariantKeys<SwitchRootProviderProps>("swittch");

  const elementProps = mergeProps(
    () => merged.value.getRootProps(),
    omit(merged, "value", ...variantKeys),
  ) as LabelProps;

  return renderRoot(merged.value, merged, variantKeys, elementProps);
};

/**
 * Supplies props to every {@link SwitchRoot} below it — `<Switch.PropsProvider value={{ size:
 * "lg" }}>` sets the treatment for a whole subtree. A Root that passes the prop itself still wins.
 */
export const SwitchPropsProvider = PropsProvider;
