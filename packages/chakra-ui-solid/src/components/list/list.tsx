import {
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PropsProviderProps,
  withDefaults,
} from "@chakra-ui-solid/core";
import type { ListVariantProps as ListRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { Component } from "solid-js";

/** The three names the slot recipe carries — the anatomy's parts exactly. */
export type ListSlot = "root" | "item" | "indicator";

/**
 * The recipe's two variants, spelled out rather than inherited from the generated
 * `ListVariantProps`, so each carries a description a reader can use.
 *
 * **No `@default` tag on either.** The recipe's `defaultVariants` resolves `marker` from
 * `undefined` itself, and `align` has no default at all.
 */
export interface ListVariantProps {
  /**
   * Whether the browser draws its own bullets or numbers — `marker` restores them and tints them
   * `fg.subtle`, `plain` leaves the item an `inline-flex` row for a {@link ListIndicator} to sit in.
   */
  variant?: ConditionalValue<"marker" | "plain" | PresetVariant<"list", "variant">>;
  /** How an item's own children line up across its cross axis. Only visible on `plain`. */
  align?: ConditionalValue<"center" | "start" | "end" | PresetVariant<"list", "align">>;
}

/** The Root's own props, without the `ul`'s — what a `List.RootPropsProvider` may supply. */
export interface ListRootBaseProps extends ListVariantProps {}

export interface ListRootProps extends HTMLChakraProps<"ul">, ListRootBaseProps {}

export interface ListPropsProviderProps extends PropsProviderProps<ListRootBaseProps> {}

export interface ListItemProps extends HTMLChakraProps<"li"> {}

export interface ListIndicatorProps extends HTMLChakraProps<"span"> {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  ListSlot,
  ListRootProps,
  ListRecipeVariants
>({
  name: "List",
  recipe: "list",
});

/** The classes the nearest {@link ListRoot} resolved, one per slot. */
export const useListStyles = useStyles;

const StyledListRoot = withProvider("ul", "root");

/**
 * List.Root — a `ul` whose items stack in a column, or an `ol` through `as="ol"`.
 *
 * `role="list"` is not redundant: Safari drops list semantics from a `ul` whose `list-style` is
 * `none`, and `variant="plain"` is exactly that list. Stating the role keeps VoiceOver announcing
 * "list, 3 items" in both variants.
 *
 * The gap between items is `var(--list-gap)`, which nothing defines — pass `gap` to set it, as
 * upstream's own icon example does. A nested list is indented by the consumer (`ps="5"`), not by
 * the recipe.
 */
export const ListRoot: Component<ListRootProps> = (props) => {
  // A `withDefaults` entry rather than a JSX attribute before the spread: a wrapper forwarding an
  // unset `role={props.role}` would otherwise win with `undefined` and the semantics would go back
  // to Safari's, silently (`CLAUDE.md`, *The third hazard*).
  const merged = withDefaults(props, { role: "list" } satisfies Partial<ListRootProps>);

  return <StyledListRoot {...merged} />;
};

/**
 * Supplies props to every {@link ListRoot} below it. A Root that passes the prop itself still wins.
 */
export const ListRootPropsProvider: Component<ListPropsProviderProps> = PropsProvider;

/**
 * One entry. It is `display: list-item`, so it draws the browser's marker under `variant="marker"`
 * and lays its children out inline under `variant="plain"`.
 */
export const ListItem = withContext<ListItemProps>("li", "item");

/**
 * The glyph that replaces the marker on `variant="plain"` — an inline-block box before the item's
 * text. Give it the icon through `render`: `<List.Indicator render={(props) => <CheckIcon
 * {...props} />} />`.
 */
export const ListIndicator = withContext<ListIndicatorProps>("span", "indicator");
