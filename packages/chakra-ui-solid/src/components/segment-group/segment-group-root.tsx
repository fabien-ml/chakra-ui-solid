import {
  createSlotClasses,
  mergeProps,
  pickVariantProps,
  type RenderProp,
  renderStyled,
  useRecipeVariantKeys,
  withContextDefaults,
  withDefaults,
} from "@chakra-ui-solid/core";
import type { SegmentGroupVariantProps as SegmentGroupRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
// The store hook's own module rather than the `../radio-group` barrel: a value import of the barrel
// pulls `Radiomark` in with it, and `generate-component-recipes.mjs` would then put the `radiomark`
// recipe in every stylesheet that imports `chakra-ui-solid/segment-group`. A segmented control draws
// no mark.
import { createRadioGroup } from "../radio-group/create-radio-group";
import type {
  CreateSegmentGroupReturn,
  SegmentGroupRootBaseProps,
  SegmentGroupRootProps,
  SegmentGroupRootProviderProps,
  SegmentGroupVariantProps,
} from "./segment-group.types";
import { parts } from "./segment-group-anatomy";
import {
  PropsProvider,
  SegmentGroupProvider,
  type SegmentGroupSlot,
  usePropsContext,
} from "./segment-group-context";

type DivProps = ComponentProps<"div">;

/**
 * The Root's own inputs, which are machine arguments rather than DOM attributes.
 *
 * **`orientation` is here, and that is this component's one real difference from its two siblings.**
 * `radioGroup` lists it for the same reason — the machine takes it *and* writes it back out as
 * `data-orientation`, so leaving it in the bag would put a raw `orientation="horizontal"` on the
 * `div` beside the attribute the machine already wrote. `radioCard` reaches the opposite answer:
 * there it is a recipe variant, so the variant omit eats it and the machine never sees it. Here the
 * recipe has no such variant — it reads `data-orientation` through `_horizontal` / `_vertical` — so
 * the machine is the only thing that can produce the layout, and dropping the key would leave a
 * `orientation="vertical"` segmented control running left to right.
 *
 * Literal keys rather than `zagRadioGroup.props`, because `omit` narrows the returned props by the
 * keys it is handed and a `string[]` narrows nothing; `satisfies` is what keeps this list and the
 * interface one list.
 *
 * **The variant is deliberately absent.** What counts as a variant is whatever the system's own
 * `segmentGroup` recipe accepts, so the Root asks it (`useRecipeVariantKeys`) and omits that list
 * alongside this one. `unstyled` is absent for its own reason — `renderStyled` consumes it and keeps
 * it off the element.
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
] as const satisfies readonly (keyof SegmentGroupRootBaseProps)[];

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends SegmentGroupVariantProps {
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
  store: CreateSegmentGroupReturn,
  styling: RootStylingProps,
  variantKeys: readonly string[],
  elementProps: DivProps,
): JSX.Element {
  // **Once, here — never once per segment.** N segments asking the recipe for the same six strings
  // is N times the work for one answer, and every `SegmentGroup.Item` in a group carries the
  // identical `item` class either way.
  //
  // A memo, because a variant prop is a prop like any other and `size` can change. The keys are the
  // recipe's, picked inside the accessor so a changed variant re-resolves. An unset one arrives as
  // `undefined`, which is what the recipe's own `defaultVariants` fills.
  const slots = createSlotClasses<SegmentGroupSlot, SegmentGroupRecipeVariants>("segmentGroup", {
    variantProps: () => pickVariantProps<SegmentGroupRecipeVariants>(styling, variantKeys),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => styling.unstyled,
  });

  // `merge`, never `{ ...store, slots }`: the store is an object of getters over the machine, and a
  // spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { slots });

  return (
    <SegmentGroupProvider value={value}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (styling.as ?? "div") as ValidComponent,
        props: elementProps,
        render: styling.render,
        recipeClass: () => slots().root,
      })}
    </SegmentGroupProvider>
  );
}

/**
 * SegmentGroup.Root — starts the machine and renders the `role="radiogroup"` track the segments sit
 * in.
 *
 * One machine drives every `<SegmentGroup.Item>` inside it, so the group owns the picked value and a
 * segment owns only its `value`:
 *
 * ```tsx
 * <SegmentGroup.Root defaultValue="React">
 *   <SegmentGroup.Indicator />
 *   <SegmentGroup.Items items={["React", "Vue", "Solid"]} />
 * </SegmentGroup.Root>
 * ```
 *
 * It runs the same `@zag-js/radio-group` machine a `RadioGroup.Root` does, so a `<Fieldset.Root>`
 * above it supplies the legend's id and both states exactly as it does there.
 *
 * A consumer's `id` seeds the machine rather than landing on the element: the root's own attribute
 * becomes `radio-group:{id}`, a segment's input `radio-group:{id}:radio:input:{value}`, and `ids` is
 * the way to control the attributes themselves.
 *
 * It also sets `position: relative` from the machine's own inline style, which is what the
 * absolutely-positioned `<SegmentGroup.Indicator>` measures against.
 */
export const SegmentGroupRoot: Component<SegmentGroupRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `size={props.size}` would otherwise beat
  // the provider above it with `undefined`.
  const fromContext = withContextDefaults<SegmentGroupRootProps>(props, usePropsContext());

  // Chakra's one default, verbatim: `segment-group.tsx` ships `defaultProps: { orientation:
  // "horizontal" }` on this Root and on neither of its siblings. It has to be resolved by value —
  // the machine's own default is `vertical`, so a wrapper forwarding an unset
  // `orientation={props.orientation}` through a `merge` would turn the control on its side
  // (`CLAUDE.md`, *The third hazard*).
  const merged = withDefaults(fromContext, { orientation: "horizontal" as const });

  const store = createRadioGroup(merged);

  // One read of the recipe's variant names, feeding both the `omit` that keeps them off the `div`
  // and the recipe call that consumes them. There is no bare `size` style prop for `renderStyled` to
  // swallow, so a variant left in the bag lands on the served markup as `size="lg"` with nothing to
  // catch it.
  const variantKeys = useRecipeVariantKeys<SegmentGroupRootProps>("segmentGroup");

  const elementProps = mergeProps(
    () => store.getRootProps(),
    // Over the getter's output, under the consumer's — Ark's own order. The machine stamps
    // `data-scope="radio-group"` and this is what makes the element announce the component a
    // consumer actually wrote.
    parts.root.attrs,
    omit(merged, ...ROOT_OWN_KEYS, ...variantKeys),
  ) as DivProps;

  return renderRoot(store, merged, variantKeys, elementProps);
};

/**
 * SegmentGroup.RootProvider — the same element and the same context, over a machine the consumer
 * built with {@link createSegmentGroup} and holds a reference to.
 *
 * Put the segments directly inside it; it is a Root, not a wrapper around one, so nesting a
 * `<SegmentGroup.Root>` under it would start a second machine over the same segments.
 *
 * **It defaults no orientation**, where `<SegmentGroup.Root>` defaults `horizontal` — Chakra passes
 * this Root no `defaultProps`, and the machine here is the consumer's. Build it with
 * `createSegmentGroup({ orientation: "horizontal" })` to get the same layout.
 */
export const SegmentGroupRootProvider: Component<SegmentGroupRootProviderProps> = (props) => {
  // The context bag is dropped of its `value` first, because the two roots do not mean the same
  // thing by the word: on `<SegmentGroup.PropsProvider>` it is the picked segment's value, and here
  // it is the machine. Letting it through would hand this Root a string where a machine belongs.
  const merged = withContextDefaults<SegmentGroupRootProviderProps>(
    props,
    omit(usePropsContext(), "value"),
  );

  const variantKeys = useRecipeVariantKeys<SegmentGroupRootProviderProps>("segmentGroup");

  const elementProps = mergeProps(
    () => merged.value.getRootProps(),
    parts.root.attrs,
    omit(merged, "value", ...variantKeys),
  ) as DivProps;

  return renderRoot(merged.value, merged, variantKeys, elementProps);
};

/**
 * Supplies props to every {@link SegmentGroupRoot} below it — `<SegmentGroup.PropsProvider value={{
 * size: "sm" }}>` sets the treatment for a whole subtree. A Root that passes the prop itself still
 * wins.
 */
export const SegmentGroupPropsProvider = PropsProvider;
