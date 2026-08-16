import {
  createSlotClasses,
  mergeProps,
  pickVariantProps,
  type RenderProp,
  type RenderStrategyProps,
  renderStyled,
  useRecipeVariantKeys,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import type { TabsVariantProps as TabsRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { createTabs } from "./create-tabs";
import type {
  CreateTabsReturn,
  TabsRootBaseProps,
  TabsRootProps,
  TabsRootProviderProps,
  TabsVariantProps,
} from "./tabs.types";
import { PropsProvider, TabsProvider, type TabsSlot, usePropsContext } from "./tabs-context";

type DivProps = ComponentProps<"div">;

/**
 * The Root's own inputs, which are machine arguments or mounting props rather than DOM attributes.
 * Literal keys rather than `tabs.props`, because `omit` narrows the returned props by the keys it is
 * handed and a `string[]` narrows nothing; `satisfies` is what keeps this list and the interface one
 * list.
 *
 * **The variants are deliberately absent, and that is the point.** What counts as a variant is
 * whatever the system's own `tabs` recipe accepts, so the Root asks it (`useRecipeVariantKeys`) and
 * omits that list alongside this one. A consumer who adds `tone` to `theme.extend.slotRecipes.tabs`
 * gets it fed to the recipe and kept off the `div` without this file naming it.
 *
 * `unstyled` is absent for its own reason — `renderStyled` consumes it and keeps it off the element.
 */
const ROOT_OWN_KEYS = [
  "activationMode",
  "composite",
  "defaultValue",
  "deselectable",
  "id",
  "ids",
  "loopFocus",
  "navigate",
  "onFocusChange",
  "onValueChange",
  "orientation",
  "translations",
  "value",
  "lazyMount",
  "unmountOnExit",
] as const satisfies readonly (keyof TabsRootBaseProps)[];

/** The same list for the other Root, which is handed a machine instead of the thirteen props. */
const ROOT_PROVIDER_OWN_KEYS = [
  "value",
  "lazyMount",
  "unmountOnExit",
] as const satisfies readonly (keyof TabsRootProviderProps)[];

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends TabsVariantProps, RenderStrategyProps {
  as?: ValidComponent;
  unstyled?: boolean;
  render?: RenderProp<DivProps>;
}

/**
 * Everything both roots do once the machine exists: resolve the slot recipe, publish the machine,
 * the classes and the render strategy on context, and render the `div` the machine's
 * `getRootProps()` describes.
 *
 * A plain function rather than a component, so the two roots allocate the same hydration keys as
 * each other and as the markup around them.
 */
function renderRoot(
  store: CreateTabsReturn,
  styling: RootStylingProps,
  variantKeys: readonly string[],
  elementProps: DivProps,
): JSX.Element {
  // Once, here — never per part. Six parts each calling `sva()` is six times the work for one
  // answer, and it puts six copies of the variant-reading logic in the tree where they can disagree.
  // A memo, because a variant prop is a prop like any other and `size` can change.
  //
  // The keys are the recipe's, picked inside the accessor so a changed variant re-resolves. An unset
  // one arrives as `undefined`, which is what the recipe's own `defaultVariants` fills — restating a
  // default here would be the second source of truth `TabsVariantProps` declines to be.
  const slots = createSlotClasses<TabsSlot, TabsRecipeVariants>("tabs", {
    variantProps: () => pickVariantProps<TabsRecipeVariants>(styling, variantKeys),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => styling.unstyled,
  });

  // One stable object with reactive getters, not a getter returning a fresh object: every
  // `Tabs.Content` reads this to build its *own* presence, and a new identity on every read would
  // rebuild all of those machines every time the strategy is consulted.
  const renderStrategy: RenderStrategyProps = {
    get lazyMount() {
      return styling.lazyMount;
    },
    get unmountOnExit() {
      return styling.unmountOnExit;
    },
  };

  // `merge`, never `{ ...store, slots }`: the store is an object of getters over the machine, and a
  // spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { slots, renderStrategy });

  return (
    <TabsProvider value={value}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (styling.as ?? "div") as ValidComponent,
        props: elementProps,
        render: styling.render,
        recipeClass: () => slots().root,
      })}
    </TabsProvider>
  );
}

/**
 * Tabs.Root — starts the machine, and renders the element the list and the panels live in.
 *
 * A consumer's `id` seeds the machine rather than landing on the element: the root's own attribute
 * becomes `tabs:{id}`, a trigger's `tabs:{id}:trigger-{value}`, and `ids` is the way to control the
 * attributes themselves. That matters most for `<Tabs.Indicator>`, which the machine finds by id and
 * attaches no ref to — an `id` passed to that part wins on the DOM and leaves the machine looking
 * for the old one.
 *
 * **No defaults, unusually.** Chakra passes Tabs no `defaultProps`, and the machine's own defaults
 * survive a forwarded `undefined` on their own ({@link createTabs}), so there is no `withDefaults`
 * call here.
 */
export const TabsRoot: Component<TabsRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `orientation={props.orientation}` would
  // otherwise beat the provider above it with `undefined`.
  const merged = withContextDefaults<TabsRootProps>(props, usePropsContext());
  const store = createTabs(merged);

  // One read of the recipe's variant names, feeding both the `omit` that keeps them off the `div`
  // and the recipe call that consumes them. There is no bare `fitted` or `justify` style prop for
  // `renderStyled` to swallow, so a variant left in the bag lands on the served markup as
  // `fitted="true"` with nothing to catch it.
  const variantKeys = useRecipeVariantKeys<TabsRootProps>("tabs");

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omit(merged, ...ROOT_OWN_KEYS, ...variantKeys),
  ) as DivProps;

  return renderRoot(store, merged, variantKeys, elementProps);
};

/**
 * Tabs.RootProvider — the same element and the same context, over a machine the consumer built with
 * {@link createTabs} and holds a reference to.
 */
export const TabsRootProvider: Component<TabsRootProviderProps> = (props) => {
  // The context bag is dropped of its `value` first, because the two roots do not mean the same
  // thing by the word: on `<Tabs.PropsProvider>` it is the selected tab, and here it is the machine.
  // Letting it through would hand this Root a string where a machine belongs.
  const merged = withContextDefaults<TabsRootProviderProps>(
    props,
    omit(usePropsContext(), "value"),
  );

  const variantKeys = useRecipeVariantKeys<TabsRootProviderProps>("tabs");

  const elementProps = mergeProps(
    () => merged.value.getRootProps(),
    omit(merged, ...ROOT_PROVIDER_OWN_KEYS, ...variantKeys),
  ) as DivProps;

  return renderRoot(merged.value, merged, variantKeys, elementProps);
};

/**
 * Supplies props to every {@link TabsRoot} below it — `<Tabs.PropsProvider value={{ variant:
 * "enclosed" }}>` sets the treatment for a whole subtree. A Root that passes the prop itself still
 * wins.
 */
export const TabsPropsProvider = PropsProvider;
