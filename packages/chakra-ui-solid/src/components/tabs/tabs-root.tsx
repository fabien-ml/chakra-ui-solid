import {
  createSlotClasses,
  mergeProps,
  omitProps,
  type RenderProp,
  type RenderStrategyProps,
  renderStyled,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import {
  type TabsVariantProps as TabsRecipeVariants,
  tabs as tabsRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge } from "solid-js";
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
 * The Root's own inputs, which are machine arguments, mounting props or recipe variants rather than
 * DOM attributes. Literal keys rather than `tabs.props`, because `omitProps` narrows the returned
 * props by the keys it is handed and a `string[]` narrows nothing; `satisfies` is what keeps this
 * list and the interface one list.
 *
 * **The four variants are the trap.** There is no bare `fitted` or `justify` style prop, so one left
 * in the bag reaches the element as `fitted="true"` — a literal attribute on the served markup, with
 * nothing to catch it.
 *
 * `unstyled` is deliberately absent — `renderStyled` consumes it and keeps it off the element.
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
  "fitted",
  "justify",
  "size",
  "variant",
] as const satisfies readonly (keyof TabsRootBaseProps)[];

/** The same list for the other Root, which is handed a machine instead of the thirteen props. */
const ROOT_PROVIDER_OWN_KEYS = [
  "value",
  "lazyMount",
  "unmountOnExit",
  "fitted",
  "justify",
  "size",
  "variant",
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
  elementProps: DivProps,
): JSX.Element {
  // Once, here — never per part. Six parts each calling `sva()` is six times the work for one
  // answer, and it puts six copies of the variant-reading logic in the tree where they can disagree.
  // A memo, because a variant prop is a prop like any other and `size` can change.
  //
  // The four values are read lazily and passed straight through: `undefined` is what the recipe's
  // own `defaultVariants` resolves, so restating a default here would be the second source of truth
  // `TabsVariantProps` declines to be.
  const slots = createSlotClasses<TabsSlot, TabsRecipeVariants>(tabsRecipe, {
    variantProps: () => ({
      fitted: styling.fitted,
      justify: styling.justify,
      size: styling.size,
      variant: styling.variant,
    }),
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

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omitProps(merged, ...ROOT_OWN_KEYS),
  ) as DivProps;

  return renderRoot(store, merged, elementProps);
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
    omitProps(usePropsContext(), "value"),
  );

  const elementProps = mergeProps(
    () => merged.value.getRootProps(),
    omitProps(merged, ...ROOT_PROVIDER_OWN_KEYS),
  ) as DivProps;

  return renderRoot(merged.value, merged, elementProps);
};

/**
 * Supplies props to every {@link TabsRoot} below it — `<Tabs.PropsProvider value={{ variant:
 * "enclosed" }}>` sets the treatment for a whole subtree. A Root that passes the prop itself still
 * wins.
 */
export const TabsPropsProvider = PropsProvider;
