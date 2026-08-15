import {
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PropsProviderProps,
} from "@chakra-ui-solid/core";
import {
  type CardVariantProps as CardRecipeVariants,
  card as cardRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { Component } from "solid-js";

/** The six names the slot recipe carries — the anatomy's parts exactly, with nothing added. */
export type CardSlot = "root" | "header" | "body" | "footer" | "title" | "description";

/**
 * The recipe's two variants, spelled out rather than inherited from the generated
 * `CardVariantProps`, so each carries a description a reader can use — badge's precedent, and the
 * interface the docs page's props table is built from.
 *
 * **No `@default` tag on either.** The recipe's own `defaultVariants` resolves `md` and `outline`
 * from `undefined`, so restating them here would be a second source of truth that drifts on a
 * preset bump.
 */
export interface CardVariantProps {
  /** The padding inside every slot and the title's type scale, as one step. */
  size?: ConditionalValue<"sm" | "md" | "lg" | PresetVariant<"card", "size">>;
  /** How the card separates itself from the page — a shadow, a border, or a tinted surface. */
  variant?: ConditionalValue<"elevated" | "outline" | "subtle" | PresetVariant<"card", "variant">>;
}

/** The Root's own props, without the `div`'s — what a `Card.PropsProvider` may supply. */
export interface CardRootBaseProps extends CardVariantProps {}

export interface CardRootProps extends HTMLChakraProps<"div">, CardRootBaseProps {}

export interface CardPropsProviderProps extends PropsProviderProps<CardRootBaseProps> {}

export interface CardHeaderProps extends HTMLChakraProps<"div"> {}

export interface CardBodyProps extends HTMLChakraProps<"div"> {}

export interface CardFooterProps extends HTMLChakraProps<"div"> {}

/**
 * An `h3`, where Chakra's own type says `HTMLChakraProps<"h2">` over an element that is one —
 * parity is what a consumer observes, and what they observe is the `h3` upstream renders.
 */
export interface CardTitleProps extends HTMLChakraProps<"h3"> {}

export interface CardDescriptionProps extends HTMLChakraProps<"p"> {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  CardSlot,
  CardRootProps,
  CardRecipeVariants
>({
  name: "Card",
  recipe: cardRecipe,
  variantKeys: ["size", "variant"],
});

/**
 * The classes the nearest {@link CardRoot} resolved, one per slot — for a consumer's own element
 * that wants a slot's styles: `class={useCardStyles()().body}`.
 */
export const useCardStyles = useStyles;

/**
 * Card.Root — a surface for content about one subject, and the only part that reads the recipe.
 *
 * It resolves the slot recipe once and publishes one class per slot to everything below, so
 * `size` and `variant` are its props alone: a `Card.Body` takes its padding from the Root's size
 * rather than from a prop of its own.
 *
 * The root is a `column` flex box, so the header, body and footer stack with no wrapper between
 * them — and a horizontal card is `flexDirection="row"` on this element plus a `div` around the
 * parts that should still stack.
 */
export const CardRoot = withProvider("div", "root");

/**
 * Supplies props to every {@link CardRoot} below it — `<Card.PropsProvider value={{ variant:
 * "subtle" }}>` restyles a whole grid of cards. A Root that passes the prop itself still wins.
 */
export const CardPropsProvider: Component<CardPropsProviderProps> = PropsProvider;

/** The band above the body — a title and description, with the root's padding and no bottom gap. */
export const CardHeader = withContext<CardHeaderProps>("div", "header");

/** The card's content. It is the slot that grows, so a footer stays at the bottom of a fixed card. */
export const CardBody = withContext<CardBodyProps>("div", "body");

/** The band below the body, laid out as a row — where the card's actions go. */
export const CardFooter = withContext<CardFooterProps>("div", "footer");

/** The card's heading. An `h3`, which is a level rather than a size — the size is the Root's. */
export const CardTitle = withContext<CardTitleProps>("h3", "title");

/** A muted paragraph under the title. */
export const CardDescription = withContext<CardDescriptionProps>("p", "description");
