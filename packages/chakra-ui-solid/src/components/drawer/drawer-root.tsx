import {
  createPresence,
  createRenderStrategy,
  createSlotClasses,
  type RenderStrategyProps,
  type UnstyledProp,
  withContextDefaults,
  withDefaults,
} from "@chakra-ui-solid/core";
import {
  type DrawerVariantProps as DrawerRecipeVariants,
  drawer as drawerRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { JSX } from "@solidjs/web";
import { type Accessor, type Component, merge } from "solid-js";
// The same machine under a second name, which is what a drawer *is* here: Chakra's `drawer.tsx`
// imports `@ark-ui/react/dialog` and aliases `useDialog as useDrawer`. Imported from the module
// rather than from `../dialog`, so this entry pulls in the dialog recipe's CSS for nobody.
import { createDialog as createDrawer } from "../dialog/create-dialog";
import type {
  CreateDrawerReturn,
  DrawerPresenceProps,
  DrawerRootProps,
  DrawerRootProviderProps,
  DrawerVariantProps,
} from "./drawer.types";
import { DrawerProvider, type DrawerSlot, PropsProvider, usePropsContext } from "./drawer-context";

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends DrawerVariantProps, UnstyledProp {}

/**
 * Everything both roots do once the machine exists: create the presence Content and Positioner
 * share, resolve the render strategy over it, resolve the slot recipe **once**, and put all of it
 * on context.
 *
 * A plain function rather than a component, so the two roots allocate the same hydration keys as
 * each other and as the markup around them.
 */
function renderRoot(
  store: CreateDrawerReturn,
  rootProps: DrawerPresenceProps & RootStylingProps,
  children: Accessor<JSX.Element>,
): JSX.Element {
  const presence = createPresence(() => ({
    // `??`, so a consumer's escape hatch wins and an unset one falls back to the machine. Ark spells
    // the same resolution as `mergeProps({ present: dialog.open }, presenceProps)` over a split that
    // has already dropped `undefined`.
    present: rootProps.present ?? store.open,
    onExitComplete: rootProps.onExitComplete,
    immediate: rootProps.immediate,
    skipAnimationOnMount: rootProps.skipAnimationOnMount,
  }));

  // One stable object with reactive getters, not a getter returning a fresh object: the Backdrop
  // reads this to build its *own* presence, and a new identity on every read would rebuild that
  // machine every time the strategy is consulted.
  const renderStrategy: RenderStrategyProps = {
    get lazyMount() {
      return rootProps.lazyMount;
    },
    get unmountOnExit() {
      return rootProps.unmountOnExit;
    },
  };

  // The composition `createPresence` and `createRenderStrategy` were split for: presence answers
  // "is the node still animating out", the strategy answers "should the node be in the DOM at all".
  const { unmounted } = createRenderStrategy(presence.present, () => renderStrategy);

  // Once, here — never per part. Ten parts each calling `sva()` is ten times the work for one
  // answer, and it puts ten copies of the variant-reading logic in the tree where they can disagree.
  // A memo, because a variant prop is a prop like any other and `size` can change.
  //
  // The three values are read lazily and passed straight through: `undefined` is what the recipe's
  // own `defaultVariants` resolves, so restating a default here would be the second source of truth
  // `DrawerVariantProps` declines to be.
  const slots = createSlotClasses<DrawerSlot, DrawerRecipeVariants>(drawerRecipe, {
    variantProps: () => ({
      size: rootProps.size,
      placement: rootProps.placement,
      contained: rootProps.contained,
    }),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => rootProps.unstyled,
  });

  // `merge`, never `{ ...store, presence }`: the store is an object of getters over the machine, and
  // a spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { presence, unmounted, renderStrategy, slots });

  return <DrawerProvider value={value}>{children()}</DrawerProvider>;
}

/**
 * Drawer.Root — starts the machine and shares it, the content presence and the render strategy with
 * every part below.
 *
 * **It renders no host element.** The anatomy has no `root` part and Chakra's `DrawerRoot` is
 * `withRootProvider(ArkDialog.Root)` over a component that renders nothing; Solid matches server and
 * client nodes by position (its `_hk` key), so a wrapper element here would shift every key after it
 * in the consumer's own markup.
 *
 * A consumer's `id` seeds the machine — the parts become `dialog:{id}:content` and friends, named
 * for the machine a drawer runs rather than for the component. Pass `ids` to name the elements
 * themselves.
 */
export const DrawerRoot: Component<DrawerRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `defaultOpen={props.defaultOpen}` would
  // otherwise beat the provider above it with `undefined`.
  const fromContext = withContextDefaults<DrawerRootProps>(props, usePropsContext());

  // Chakra's two defaults, verbatim: `drawer.tsx` ships `{ unmountOnExit: true, lazyMount: true }`
  // on both roots. The recipe's own `defaultVariants` owns the variant defaults, so restating one
  // here would be a second source of truth that drifts on a preset bump.
  const merged = withDefaults(fromContext, { lazyMount: true, unmountOnExit: true });

  const store = createDrawer(merged);

  return renderRoot(store, merged, () => merged.children);
};

/**
 * Drawer.RootProvider — the same context, over a machine the consumer built with {@link createDrawer}
 * and holds a reference to.
 */
export const DrawerRootProvider: Component<DrawerRootProviderProps> = (props) => {
  const fromContext = withContextDefaults<DrawerRootProviderProps>(props, usePropsContext());
  const merged = withDefaults(fromContext, { lazyMount: true, unmountOnExit: true });

  return renderRoot(merged.value, merged, () => merged.children);
};

/**
 * Supplies props to every {@link DrawerRoot} below it — `<Drawer.PropsProvider value={{ placement:
 * "start" }}>` sets the edge for a whole subtree. A Root that passes the prop itself still wins.
 */
export const DrawerPropsProvider = PropsProvider;
