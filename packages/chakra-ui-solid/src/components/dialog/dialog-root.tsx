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
  type DialogVariantProps as DialogRecipeVariants,
  dialog as dialogRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { JSX } from "@solidjs/web";
import { type Accessor, type Component, merge } from "solid-js";
import { createDialog } from "./create-dialog";
import type {
  CreateDialogReturn,
  DialogPresenceProps,
  DialogRootProps,
  DialogRootProviderProps,
  DialogVariantProps,
} from "./dialog.types";
import { DialogProvider, type DialogSlot, PropsProvider, usePropsContext } from "./dialog-context";

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends DialogVariantProps, UnstyledProp {}

/**
 * Everything both roots do once the machine exists: create the presence Content and Positioner
 * share, resolve the render strategy over it, resolve the slot recipe **once**, and put all of it
 * on context.
 *
 * A plain function rather than a component, so the two roots allocate the same hydration keys as
 * each other and as the markup around them.
 */
function renderRoot(
  store: CreateDialogReturn,
  rootProps: DialogPresenceProps & RootStylingProps,
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
  // The four values are read lazily and passed straight through: `undefined` is what the recipe's
  // own `defaultVariants` resolves, so restating a default here would be the second source of truth
  // `DialogVariantProps` declines to be.
  const slots = createSlotClasses<DialogSlot, DialogRecipeVariants>(dialogRecipe, {
    variantProps: () => ({
      size: rootProps.size,
      placement: rootProps.placement,
      scrollBehavior: rootProps.scrollBehavior,
      motionPreset: rootProps.motionPreset,
    }),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => rootProps.unstyled,
  });

  // `merge`, never `{ ...store, presence }`: the store is an object of getters over the machine, and
  // a spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { presence, unmounted, renderStrategy, slots });

  return <DialogProvider value={value}>{children()}</DialogProvider>;
}

/**
 * Dialog.Root — starts the machine and shares it, the content presence and the render strategy with
 * every part below.
 *
 * **It renders no host element.** `dialog.anatomy` has no `root` part and Chakra's `DialogRoot` is
 * `withRootProvider(ArkDialog.Root)` over a component that renders nothing; Solid matches server and
 * client nodes by position (its `_hk` key), so a wrapper element here would shift every key after it
 * in the consumer's own markup.
 *
 * A consumer's `id` seeds the machine — the parts become `dialog:{id}:content` and friends. Pass
 * `ids` to name the elements themselves.
 */
export const DialogRoot: Component<DialogRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `defaultOpen={props.defaultOpen}` would
  // otherwise beat the provider above it with `undefined`.
  const fromContext = withContextDefaults<DialogRootProps>(props, usePropsContext());

  // Chakra's two defaults, verbatim: `dialog.tsx` ships `{ unmountOnExit: true, lazyMount: true }`
  // on both roots. The recipe's own `defaultVariants` owns the variant defaults, so restating one
  // here would be a second source of truth that drifts on a preset bump.
  const merged = withDefaults(fromContext, { lazyMount: true, unmountOnExit: true });

  const store = createDialog(merged);

  return renderRoot(store, merged, () => merged.children);
};

/**
 * Dialog.RootProvider — the same context, over a machine the consumer built with {@link createDialog}
 * and holds a reference to.
 */
export const DialogRootProvider: Component<DialogRootProviderProps> = (props) => {
  const fromContext = withContextDefaults<DialogRootProviderProps>(props, usePropsContext());
  const merged = withDefaults(fromContext, { lazyMount: true, unmountOnExit: true });

  return renderRoot(merged.value, merged, () => merged.children);
};

/**
 * Supplies props to every {@link DialogRoot} below it — `<Dialog.PropsProvider value={{ modal:
 * false }}>` sets the modality for a whole subtree. A Root that passes the prop itself still wins.
 */
export const DialogPropsProvider = PropsProvider;
