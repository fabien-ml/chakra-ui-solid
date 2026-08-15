import {
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PropsProviderProps,
} from "@chakra-ui-solid/core";
import type { StatusVariantProps as StatusRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { Component } from "solid-js";

/** The two names the slot recipe carries — the anatomy's parts exactly. */
export type StatusSlot = "root" | "indicator";

/**
 * The recipe's one variant, spelled out rather than inherited from the generated
 * `StatusVariantProps`, so it carries a description a reader can use.
 *
 * **No `@default` tag.** The recipe's `defaultVariants` resolves `md` from `undefined` itself.
 */
export interface StatusVariantProps {
  /**
   * The label's type scale. The dot follows it rather than taking a size of its own — it is
   * `0.64em`, so it scales with whatever the root's font size resolves to.
   */
  size?: ConditionalValue<"sm" | "md" | "lg" | PresetVariant<"status", "size">>;
}

/** The Root's own props, without the `div`'s — what a `Status.PropsProvider` may supply. */
export interface StatusRootBaseProps extends StatusVariantProps {}

export interface StatusRootProps extends HTMLChakraProps<"div">, StatusRootBaseProps {}

export interface StatusPropsProviderProps extends PropsProviderProps<StatusRootBaseProps> {}

export interface StatusIndicatorProps extends HTMLChakraProps<"div"> {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  StatusSlot,
  StatusRootProps,
  StatusRecipeVariants
>({
  name: "Status",
  recipe: "status",
});

/** The classes the nearest {@link StatusRoot} resolved, one per slot. */
export const useStatusStyles = useStyles;

/**
 * Status.Root — a coloured dot and, optionally, a word beside it: "In Review", "Approved".
 *
 * It is an `inline-flex` row with a gap, so the label is written as a plain child of the Root
 * rather than through a part of its own — there is no `Status.Label`, upstream included.
 *
 * The dot's colour is the root's `colorPalette` and nothing else, which is why the recipe names no
 * colour: `<Status.Root colorPalette="green">` is the same component as `colorPalette="red"`.
 */
export const StatusRoot = withProvider("div", "root");

/**
 * Supplies props to every {@link StatusRoot} below it. A Root that passes the prop itself still
 * wins.
 */
export const StatusPropsProvider: Component<StatusPropsProviderProps> = PropsProvider;

/** The dot. It takes its colour from the Root's `colorPalette` and its size from the font size. */
export const StatusIndicator = withContext<StatusIndicatorProps>("div", "indicator");
