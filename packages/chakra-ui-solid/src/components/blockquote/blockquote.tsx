import {
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PropsProviderProps,
  type SkinVariant,
} from "@chakra-ui-solid/core";
import {
  type BlockquoteVariantProps as BlockquoteRecipeVariants,
  blockquote as blockquoteRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { Component } from "solid-js";
import { QuoteIcon } from "../icons";

/** The four names the slot recipe carries — the anatomy's parts exactly. */
export type BlockquoteSlot = "root" | "icon" | "content" | "caption";

/**
 * The recipe's two variants, spelled out rather than inherited from the generated
 * `BlockquoteVariantProps`, so each carries a description a reader can use.
 *
 * **No `@default` tag on either.** The recipe's `defaultVariants` resolves `start` and `subtle`
 * from `undefined` itself.
 */
export interface BlockquoteVariantProps {
  /** Which edge the quote and its caption line up against, and how the text is aligned. */
  justify?: ConditionalValue<"start" | "center" | "end" | SkinVariant<"blockquote", "justify">>;
  /**
   * The rule down the leading edge — `subtle` draws it in the muted palette step, `solid` in the
   * solid one, and `plain` leaves the padding without the rule.
   */
  variant?: ConditionalValue<"subtle" | "solid" | "plain" | SkinVariant<"blockquote", "variant">>;
}

/** The Root's own props, without the `figure`'s — what a `Blockquote.PropsProvider` may supply. */
export interface BlockquoteRootBaseProps extends BlockquoteVariantProps {}

export interface BlockquoteRootProps extends HTMLChakraProps<"figure">, BlockquoteRootBaseProps {}

export interface BlockquotePropsProviderProps extends PropsProviderProps<BlockquoteRootBaseProps> {}

export interface BlockquoteContentProps extends HTMLChakraProps<"blockquote"> {}

export interface BlockquoteCaptionProps extends HTMLChakraProps<"figcaption"> {}

export interface BlockquoteIconProps extends HTMLChakraProps<"svg"> {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  BlockquoteSlot,
  BlockquoteRootProps,
  BlockquoteRecipeVariants
>({
  name: "Blockquote",
  recipe: blockquoteRecipe,
  variantKeys: ["justify", "variant"],
});

/** The classes the nearest {@link BlockquoteRoot} resolved, one per slot. */
export const useBlockquoteStyles = useStyles;

/**
 * Blockquote.Root — quoted text from somewhere else, with the source named beneath it.
 *
 * A `figure`, so the quote and its attribution are one unit to a screen reader: the `blockquote`
 * carries the words and the `figcaption` says whose they are. Its colour is `colorPalette`, which
 * is why the recipe names none of its own.
 */
export const BlockquoteRoot = withProvider("figure", "root");

/**
 * Supplies props to every {@link BlockquoteRoot} below it. A Root that passes the prop itself still
 * wins.
 */
export const BlockquotePropsProvider: Component<BlockquotePropsProviderProps> = PropsProvider;

/**
 * The quoted words, as a real `blockquote`. Its `cite` attribute takes the URL the quote came from
 * — a machine-readable source, where the visible attribution is {@link BlockquoteCaption}.
 */
export const BlockquoteContent = withContext<BlockquoteContentProps>("blockquote", "content");

/** Who said it, as the `figure`'s caption. Upstream's examples put a `<cite>` inside it. */
export const BlockquoteCaption = withContext<BlockquoteCaptionProps>("figcaption", "caption");

/**
 * The double-quote glyph, coloured by the Root's variant. It is not laid out by the recipe — it is
 * positioned by whatever wraps it, which upstream's examples do with a `<Float>`.
 */
export const BlockquoteIcon = withContext<BlockquoteIconProps>(QuoteIcon, "icon");
