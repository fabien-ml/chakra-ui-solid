import {
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PropsProviderProps,
} from "@chakra-ui-solid/core";
import type { EmptyStateVariantProps as EmptyStateRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { Component } from "solid-js";

/** The five names the slot recipe carries — the anatomy's parts exactly. */
export type EmptyStateSlot = "root" | "content" | "indicator" | "title" | "description";

/**
 * The recipe's one variant, spelled out rather than inherited from the generated
 * `EmptyStateVariantProps`, so it carries a description a reader can use.
 *
 * **No `@default` tag.** The recipe's `defaultVariants` resolves `md` from `undefined` itself.
 */
export interface EmptyStateVariantProps {
  /**
   * The padding around the block, the gap between its parts, the title's type scale, and the
   * glyph's — all four move together, and the glyph moves furthest: `2xl` to `6xl`.
   */
  size?: ConditionalValue<"sm" | "md" | "lg" | PresetVariant<"emptyState", "size">>;
}

/** The Root's own props, without the `div`'s — what an `EmptyState.PropsProvider` may supply. */
export interface EmptyStateRootBaseProps extends EmptyStateVariantProps {}

export interface EmptyStateRootProps extends HTMLChakraProps<"div">, EmptyStateRootBaseProps {}

export interface EmptyStatePropsProviderProps extends PropsProviderProps<EmptyStateRootBaseProps> {}

export interface EmptyStateContentProps extends HTMLChakraProps<"div"> {}

export interface EmptyStateIndicatorProps extends HTMLChakraProps<"div"> {}

export interface EmptyStateTitleProps extends HTMLChakraProps<"h3"> {}

export interface EmptyStateDescriptionProps extends HTMLChakraProps<"p"> {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  EmptyStateSlot,
  EmptyStateRootProps,
  EmptyStateRecipeVariants
>({
  name: "EmptyState",
  recipe: "emptyState",
});

/** The classes the nearest {@link EmptyStateRoot} resolved, one per slot. */
export const useEmptyStateStyles = useStyles;

/**
 * EmptyState.Root — what a list, a table or a search result shows when it has nothing in it.
 *
 * The Root only spans the width and pads; the centring is {@link EmptyStateContent}'s, which is
 * why a full empty state is always two elements deep.
 */
export const EmptyStateRoot = withProvider("div", "root");

/**
 * Supplies props to every {@link EmptyStateRoot} below it. A Root that passes the prop itself still
 * wins.
 */
export const EmptyStatePropsProvider: Component<EmptyStatePropsProviderProps> = PropsProvider;

/** The centred column holding the glyph, the words, and whatever action follows them. */
export const EmptyStateContent = withContext<EmptyStateContentProps>("div", "content");

/**
 * The glyph above the title. It carries no glyph of its own — pass one as a child, sized `1em` so
 * it follows the type scale `size` set.
 */
export const EmptyStateIndicator = withContext<EmptyStateIndicatorProps>("div", "indicator");

/** The headline: what is missing. An `h3`, so it slots under a page or section heading. */
export const EmptyStateTitle = withContext<EmptyStateTitleProps>("h3", "title");

/** The line under the title: what the reader can do about it. */
export const EmptyStateDescription = withContext<EmptyStateDescriptionProps>("p", "description");
