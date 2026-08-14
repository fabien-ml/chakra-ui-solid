import {
  createPresence,
  createRenderStrategy,
  createSlotClasses,
  type UnstyledProp,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import {
  type PopoverVariantProps as PopoverRecipeVariants,
  popover as popoverRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { JSX } from "@solidjs/web";
import { type Accessor, type Component, merge } from "solid-js";
import { createPopover } from "./create-popover";
import type {
  CreatePopoverReturn,
  PopoverPresenceProps,
  PopoverRootProps,
  PopoverRootProviderProps,
  PopoverVariantProps,
} from "./popover.types";
import {
  PopoverProvider,
  type PopoverSlot,
  PropsProvider,
  usePropsContext,
} from "./popover-context";

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends PopoverVariantProps, UnstyledProp {}

/**
 * Everything both roots do once the machine exists: create the presence Content and Positioner
 * share, resolve the render strategy over it, resolve the slot recipe **once**, and put all of it
 * on context.
 *
 * A plain function rather than a component, so the two roots allocate the same hydration keys as
 * each other and as the markup around them.
 */
function renderRoot(
  store: CreatePopoverReturn,
  rootProps: PopoverPresenceProps & RootStylingProps,
  children: Accessor<JSX.Element>,
): JSX.Element {
  const presence = createPresence(() => ({
    // `??`, so a consumer's escape hatch wins and an unset one falls back to the machine.
    present: rootProps.present ?? store.open,
    onExitComplete: rootProps.onExitComplete,
    immediate: rootProps.immediate,
    skipAnimationOnMount: rootProps.skipAnimationOnMount,
  }));

  // The Root's own props are handed to the strategy directly, where Dialog builds a separate stable
  // object: that object exists so the Backdrop can read the same two props to build a presence
  // machine of its own, and Popover has no part that does. `rootProps` is already a props object of
  // getters, so the read stays lazy.
  const { unmounted } = createRenderStrategy(presence.present, () => rootProps);

  // Once, here — never per part. Thirteen parts each calling `sva()` is thirteen times the work for
  // one answer, and it puts thirteen copies of the variant-reading logic in the tree where they can
  // disagree. A memo, because a variant prop is a prop like any other and `size` can change.
  //
  // `size` is read lazily and passed straight through: `undefined` is what the recipe's own
  // `defaultVariants` resolves, so restating `"md"` here would be the second source of truth
  // `PopoverVariantProps` declines to be.
  const slots = createSlotClasses<PopoverSlot, PopoverRecipeVariants>(popoverRecipe, {
    variantProps: () => ({ size: rootProps.size }),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => rootProps.unstyled,
  });

  // `merge`, never `{ ...store, presence }`: the store is an object of getters over the machine, and
  // a spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { presence, unmounted, slots });

  return <PopoverProvider value={value}>{children()}</PopoverProvider>;
}

/**
 * Popover.Root — starts the machine and shares it, the content presence and the render strategy
 * with every part below.
 *
 * **It renders no host element.** `popover.anatomy` has no `root` part and Chakra's `PopoverRoot`
 * is `withRootProvider(ArkPopover.Root)` over a component that renders nothing; Solid matches
 * server and client nodes by position (its `_hk` key), so a wrapper element here would shift every
 * key after it in the consumer's own markup.
 *
 * A consumer's `id` seeds the machine — the parts become `popover:{id}:content` and friends. Pass
 * `ids` to name the elements themselves.
 */
export const PopoverRoot: Component<PopoverRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `defaultOpen={props.defaultOpen}` would
  // otherwise beat the provider above it with `undefined`.
  //
  // **And there is no `withDefaults` after it, deliberately.** Dialog's roots default `lazyMount`
  // and `unmountOnExit` to `true` because `dialog.tsx` passes exactly that to `withRootProvider`;
  // `popover.tsx` passes no options object at all, so nothing overrides `createRenderStrategy`'s
  // own `false`/`false` and a closed popover's content is in the DOM from the first render. The
  // recipe owns the `size` default, which leaves this component with none of its own.
  const merged = withContextDefaults<PopoverRootProps>(props, usePropsContext());

  const store = createPopover(merged);

  return renderRoot(store, merged, () => merged.children);
};

/**
 * Popover.RootProvider — the same context, over a machine the consumer built with
 * {@link createPopover} and holds a reference to.
 */
export const PopoverRootProvider: Component<PopoverRootProviderProps> = (props) => {
  const merged = withContextDefaults<PopoverRootProviderProps>(props, usePropsContext());

  return renderRoot(merged.value, merged, () => merged.children);
};

/**
 * Supplies props to every {@link PopoverRoot} below it — `<Popover.PropsProvider value={{ size:
 * "sm" }}>` sizes a whole subtree. A Root that passes the prop itself still wins.
 */
export const PopoverPropsProvider = PropsProvider;
