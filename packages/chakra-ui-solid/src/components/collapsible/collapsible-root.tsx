import {
  createSlotClasses,
  mergeProps,
  type RenderProp,
  renderStyled,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import { collapsible } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import type {
  CollapsibleRootBaseProps,
  CollapsibleRootProps,
  CollapsibleRootProviderProps,
  CreateCollapsibleReturn,
} from "./collapsible.types";
import {
  CollapsibleProvider,
  type CollapsibleSlot,
  PropsProvider,
  usePropsContext,
} from "./collapsible-context";
import { createCollapsible } from "./create-collapsible";

type DivProps = ComponentProps<"div">;

/**
 * The Root's own inputs, which are machine arguments rather than DOM attributes and would otherwise
 * reach the `div` as `collapsedheight="120px"` and friends. Literal keys rather than
 * `collapsible.props`, because `omit` narrows the returned props by the keys it is handed and a
 * `string[]` narrows nothing; `satisfies` is what keeps this list and the interface one list.
 *
 * `unstyled` is deliberately absent — `renderStyled` consumes it and keeps it off the element.
 */
const ROOT_OWN_KEYS = [
  "id",
  "ids",
  "open",
  "defaultOpen",
  "onOpenChange",
  "onExitComplete",
  "disabled",
  "collapsedHeight",
  "collapsedWidth",
  "lazyMount",
  "unmountOnExit",
] as const satisfies readonly (keyof CollapsibleRootBaseProps)[];

/** The two styling props both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps {
  unstyled?: boolean;
  render?: RenderProp<DivProps>;
}

/**
 * Everything both roots do once the machine exists: resolve the slot recipe, put the machine and
 * the classes on context, and render the `div` the machine's `getRootProps()` describes.
 *
 * A plain function rather than a component, so the two roots allocate the same hydration keys as
 * each other and as the markup around them.
 */
function renderRoot(
  store: CreateCollapsibleReturn,
  styling: RootStylingProps,
  elementProps: DivProps,
): JSX.Element {
  const slots = createSlotClasses<CollapsibleSlot, Record<never, never>>(collapsible, {
    // Zero variants: `collapsibleVariantKeys` is `[]` and `defaultVariants` is `{}`, so the recipe
    // takes nothing and only its `content` slot has a body. The call still has to happen — it is
    // what produces the class names all four parts carry.
    variantProps: () => ({}),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => styling.unstyled,
  });

  // `merge`, never `{ ...store, slots }`: the store is an object of getters over the machine, and a
  // spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { slots });

  return (
    <CollapsibleProvider value={value}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: "div",
        props: elementProps,
        render: styling.render,
        recipeClass: () => slots().root,
      })}
    </CollapsibleProvider>
  );
}

/**
 * Collapsible.Root — starts the machine, and renders the element the trigger and content live in.
 *
 * It **does** render a host element, where a Dialog root does not: Ark's `CollapsibleRoot` is an
 * `ark.div` carrying `getRootProps()`, and Chakra wraps that with the `root` slot.
 *
 * A consumer's `id` seeds the machine rather than landing on the element — the root's own attribute
 * becomes `collapsible:{id}`, and `ids` is the way to control the attributes themselves. That is
 * Ark's split, which puts `id` in the machine's half of `splitCollapsibleProps`.
 *
 * **No defaults, unusually.** `lazyMount` and `unmountOnExit` are read as booleans by the render
 * strategy, and Chakra sets neither on Collapsible, so there is no `withDefaults` call here and no
 * forwarded-`undefined` hazard to guard.
 */
export const CollapsibleRoot: Component<CollapsibleRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `defaultOpen={props.defaultOpen}` would
  // otherwise beat the provider above it with `undefined`.
  const merged = withContextDefaults<CollapsibleRootProps>(props, usePropsContext());
  const store = createCollapsible(merged);

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omit(merged, ...ROOT_OWN_KEYS),
  ) as DivProps;

  return renderRoot(store, merged, elementProps);
};

/**
 * Collapsible.RootProvider — the same element and the same context, over a machine the consumer
 * built with `createCollapsible` and holds a reference to.
 */
export const CollapsibleRootProvider: Component<CollapsibleRootProviderProps> = (props) => {
  const merged = withContextDefaults<CollapsibleRootProviderProps>(props, usePropsContext());
  const elementProps = mergeProps(
    () => merged.value.getRootProps(),
    omit(merged, "value"),
  ) as DivProps;

  return renderRoot(merged.value, merged, elementProps);
};

/**
 * Supplies props to every {@link CollapsibleRoot} below it — `<Collapsible.PropsProvider value={{
 * unmountOnExit: true }}>` sets the strategy for a whole subtree. A Root that passes the prop itself
 * still wins.
 */
export const CollapsiblePropsProvider = PropsProvider;
