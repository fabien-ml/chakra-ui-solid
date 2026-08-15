import {
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PropsProviderProps,
  renderStyled,
  withDefaults,
} from "@chakra-ui-solid/core";
import {
  type TagVariantProps as TagRecipeVariants,
  tag as tagRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { type Component, merge } from "solid-js";
import { CloseIcon } from "../icons";

/** The five names the slot recipe carries — the anatomy's parts exactly. */
export type TagSlot = "root" | "label" | "closeTrigger" | "startElement" | "endElement";

/**
 * The recipe's two variants, spelled out rather than inherited from the generated
 * `TagVariantProps`, so each carries a description a reader can use.
 *
 * **No `@default` tag on either.** The recipe's `defaultVariants` resolves `md` and `surface` from
 * `undefined` itself.
 */
export interface TagVariantProps {
  /** The label's type scale, the tag's minimum height, and the size of a start or end element. */
  size?: ConditionalValue<"sm" | "md" | "lg" | "xl" | PresetVariant<"tag", "size">>;
  /**
   * How much of the palette the tag spends — `solid` fills it, `subtle` tints it, `outline` is a
   * ring alone, and `surface` is the tint plus the ring.
   */
  variant?: ConditionalValue<
    "subtle" | "solid" | "outline" | "surface" | PresetVariant<"tag", "variant">
  >;
}

/** The Root's own props, without the element's — what a `Tag.RootPropsProvider` may supply. */
export interface TagRootBaseProps extends TagVariantProps {}

/**
 * A **`div`**, where Chakra's own type says `HTMLChakraProps<"span", …>` over an element that is
 * one: `TagRoot` is `withProvider("div", "root")` upstream and the type is wrong about it. Parity
 * is what a consumer observes, and what they observe is a `div`.
 */
export interface TagRootProps extends HTMLChakraProps<"div">, TagRootBaseProps {}

export interface TagPropsProviderProps extends PropsProviderProps<TagRootBaseProps> {}

export interface TagLabelProps extends HTMLChakraProps<"span"> {}

export interface TagStartElementProps extends HTMLChakraProps<"span"> {}

export interface TagEndElementProps extends HTMLChakraProps<"span"> {}

export interface TagCloseTriggerProps extends HTMLChakraProps<"button"> {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  TagSlot,
  TagRootProps,
  TagRecipeVariants
>({
  name: "Tag",
  recipe: tagRecipe,
  variantKeys: ["size", "variant"],
});

/** The classes the nearest {@link TagRoot} resolved, one per slot. */
export const useTagStyles = useStyles;

/**
 * Tag.Root — a short label for categorising content, with room for a glyph at either end.
 *
 * An `inline-flex` row whose gap and minimum height come from `size`, so a start or end element
 * needs no spacing of its own. Its colour is `colorPalette`, which is why the recipe names none.
 *
 * Rendering it as an interactive control is the `render` prop's job:
 * `<Tag.Root render={(props) => <button type="submit" {...props} />}>`.
 */
export const TagRoot = withProvider("div", "root");

/**
 * Supplies props to every {@link TagRoot} below it — `<Tag.RootPropsProvider value={{ size: "lg"
 * }}>` sizes a row of tags at once. A Root that passes the prop itself still wins.
 */
export const TagRootPropsProvider: Component<TagPropsProviderProps> = PropsProvider;

/** The tag's text. It is clamped to one line, so a long label truncates rather than wrapping. */
export const TagLabel = withContext<TagLabelProps>("span", "label");

/** A glyph before the label — an icon or an avatar, sized by the Root's `size`. */
export const TagStartElement = withContext<TagStartElementProps>("span", "startElement");

/** A glyph after the label, and where a {@link TagCloseTrigger} goes. */
export const TagEndElement = withContext<TagEndElementProps>("span", "endElement");

type ButtonProps = ComponentProps<"button">;

/**
 * The ✕ that dismisses the tag. It is a `button`, so it needs an `onClick` of the consumer's own —
 * the tag has no state to remove itself from.
 *
 * The one part `withContext` cannot mint, because it carries two defaults. Both are `withDefaults`
 * entries rather than JSX attributes before a spread: a wrapper forwarding an unset `type` would
 * otherwise win with `undefined` and the control would submit its form (`CLAUDE.md`, *The third
 * hazard*).
 */
export const TagCloseTrigger: Component<TagCloseTriggerProps> = (props) => {
  const styles = useStyles();
  const merged = withDefaults(props, { type: "button" } satisfies Partial<TagCloseTriggerProps>);

  const elementProps = merge(merged, {
    // A **getter**, not a `withDefaults` entry: `withDefaults` evaluates its defaults object where
    // it is written, so a JSX-valued default there would construct the glyph on every render and
    // throw it away whenever the consumer passed their own.
    //
    // `!== undefined` rather than `??`: Chakra applies a part's default children through
    // `mergeProps`, which yields only to a value that is not `undefined`, so
    // `<Tag.CloseTrigger>{null}</Tag.CloseTrigger>` renders an empty button there — and
    // `{cond() ? <X/> : null}` is ordinary Solid. Read into a local first, because the prop is a
    // getter that rebuilds its element on every read and the test plus the result would be two
    // constructions.
    get children() {
      const provided = merged.children;
      return provided !== undefined ? provided : <CloseIcon />;
    },
  }) as ButtonProps;

  return renderStyled<ButtonProps, HTMLButtonElement>({
    as: (merged.as ?? "button") as ValidComponent,
    props: elementProps,
    render: merged.render,
    recipeClass: () => styles().closeTrigger,
  });
};
