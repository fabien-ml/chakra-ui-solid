import {
  createSlotClasses,
  mergeProps,
  pickVariantProps,
  type RenderProp,
  renderStyled,
  useRecipeVariantKeys,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import type { AvatarVariantProps as AvatarRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useIsGroupItem } from "../group/group-item-context";
import type {
  AvatarRootBaseProps,
  AvatarRootProps,
  AvatarRootProviderProps,
  AvatarVariantProps,
  CreateAvatarReturn,
} from "./avatar.types";
import { AvatarProvider, type AvatarSlot, PropsProvider, usePropsContext } from "./avatar-context";
import { createAvatar } from "./create-avatar";

type DivProps = ComponentProps<"div">;

/**
 * The attribute the preset's avatar recipe rings with — `&[data-group-item]` sets `border-width:
 * 2px`, and that selector is a dependency's, so the attribute has to come from here.
 *
 * Returned as a **merge source rather than a JSX attribute**, so it can be placed after the
 * consumer's props: `merge` resolves a key by presence, so an avatar spelled
 * `<Avatar.Root data-group-item={undefined}>` inside a group would otherwise delete its own ring.
 * That is `InputElement`'s `data-group-skip` precedent, in reverse — there the child opts *out* of a
 * row, here it opts *in* to being ringed by one.
 *
 * Empty rather than absent when there is no `Group` above: an element is a group item or it is not,
 * and `{}` is the shape that adds no key at all.
 */
function groupItemAttrs(): { "data-group-item"?: "" } {
  return useIsGroupItem() ? { "data-group-item": "" } : {};
}

/**
 * The Root's own inputs, which are machine arguments rather than DOM attributes and would otherwise
 * reach the `div` as `onstatuschange="…"`. Literal keys rather than `avatar.props`, because `omit`
 * narrows the returned props by the keys it is handed and a `string[]` narrows nothing; `satisfies`
 * is what keeps this list and the interface one list.
 *
 * **The variants are deliberately absent, and here that is load-bearing rather than a formality.**
 * Where Collapsible's recipe ships none, this one ships four — so `shape="full"` is a real prop that
 * lands on the served markup as `shape="full"` unless something takes it off, and no bare `shape` or
 * `borderless` style prop exists for `renderStyled` to swallow on the way past. What counts as a
 * variant is whatever the system's own `avatar` recipe accepts, so the Root asks it
 * (`useRecipeVariantKeys`) and omits that list alongside this one.
 *
 * `unstyled` is absent for its own reason — `renderStyled` consumes it and keeps it off the element.
 */
const ROOT_OWN_KEYS = [
  "id",
  "ids",
  "onStatusChange",
] as const satisfies readonly (keyof AvatarRootBaseProps)[];

/** What both roots read for themselves, whichever machine they were handed. */
interface RootStylingProps extends AvatarVariantProps {
  as?: ValidComponent;
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
  store: CreateAvatarReturn,
  styling: RootStylingProps,
  variantKeys: readonly string[],
  elementProps: DivProps,
): JSX.Element {
  // Once, here — never per part. Three parts each calling `sva()` is three times the work for one
  // answer. A memo, because a variant prop is a prop like any other and `size` can change.
  //
  // The keys are the recipe's, picked inside the accessor so a changed variant re-resolves. An unset
  // one arrives as `undefined`, which is what the recipe's own `defaultVariants` fills — restating a
  // default here would be the second source of truth `AvatarVariantProps` declines to be.
  const slots = createSlotClasses<AvatarSlot, AvatarRecipeVariants>("avatar", {
    variantProps: () => pickVariantProps<AvatarRecipeVariants>(styling, variantKeys),
    // The Root-level opt-out, which empties every slot. A part opting out for itself is
    // `renderStyled`'s job, and it already suppresses its own `recipeClass` on `unstyled`.
    unstyled: () => styling.unstyled,
  });

  // `merge`, never `{ ...store, slots }`: the store is an object of getters over the machine, and a
  // spread would read every one of them here and freeze the context at the initial state.
  const value = merge(store, { slots });

  return (
    <AvatarProvider value={value}>
      {renderStyled<DivProps, HTMLDivElement>({
        as: (styling.as ?? "div") as ValidComponent,
        props: elementProps,
        render: styling.render,
        recipeClass: () => slots().root,
      })}
    </AvatarProvider>
  );
}

/**
 * Avatar.Root — starts the machine, and renders the box the image and the fallback share.
 *
 * Both children are always in the DOM; the machine puts `hidden` on whichever one is not showing, so
 * the swap costs no mount and the image is never re-fetched by a state change.
 *
 * A consumer's `id` seeds the machine rather than landing on the element — the root's own attribute
 * becomes `avatar:{id}` and the image's `avatar:{id}:image` — and `ids` is the way to control the
 * attributes themselves. That is Ark's split, which puts `id` in the machine's half.
 *
 * **No defaults.** Chakra passes the Root none, the four variants are resolved by the recipe's own
 * `defaultVariants`, and this machine ships no defaults of its own either — so there is no
 * `withDefaults` call here and no forwarded-`undefined` hazard to guard.
 */
export const AvatarRoot: Component<AvatarRootProps> = (props) => {
  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence: a wrapper forwarding an unset `size={props.size}` would otherwise beat
  // the provider above it with `undefined`. That path is the whole point here, because
  // `<AvatarGroup size="lg">` supplies every avatar under it through exactly this context.
  const merged = withContextDefaults<AvatarRootProps>(props, usePropsContext());
  const store = createAvatar(merged);

  // One read of the recipe's variant names, feeding both the `omit` that keeps them off the `div`
  // and the recipe call that consumes them.
  const variantKeys = useRecipeVariantKeys<AvatarRootProps>("avatar");

  const elementProps = mergeProps(
    () => store.getRootProps(),
    omit(merged, ...ROOT_OWN_KEYS, ...variantKeys),
    groupItemAttrs(),
  ) as DivProps;

  return renderRoot(store, merged, variantKeys, elementProps);
};

/**
 * Avatar.RootProvider — the same element and the same context, over a machine the consumer built
 * with {@link createAvatar} and holds a reference to.
 */
export const AvatarRootProvider: Component<AvatarRootProviderProps> = (props) => {
  const merged = withContextDefaults<AvatarRootProviderProps>(props, usePropsContext());
  const variantKeys = useRecipeVariantKeys<AvatarRootProviderProps>("avatar");

  const elementProps = mergeProps(
    () => merged.value.getRootProps(),
    omit(merged, "value", ...variantKeys),
    groupItemAttrs(),
  ) as DivProps;

  return renderRoot(merged.value, merged, variantKeys, elementProps);
};

/**
 * Supplies props to every {@link AvatarRoot} below it — `<Avatar.PropsProvider value={{ size: "lg",
 * shape: "rounded" }}>` sets the treatment for a whole subtree. An Avatar that passes the prop
 * itself still wins.
 */
export const AvatarPropsProvider = PropsProvider;
