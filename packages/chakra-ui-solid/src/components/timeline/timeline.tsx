import {
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PropsProviderProps,
  withDefaults,
} from "@chakra-ui-solid/core";
import type { TimelineVariantProps as TimelineRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { Component } from "solid-js";

/** The eight names the slot recipe carries — the anatomy's parts exactly. */
export type TimelineSlot =
  | "root"
  | "item"
  | "content"
  | "separator"
  | "indicator"
  | "connector"
  | "title"
  | "description";

/**
 * The recipe's three variants, spelled out rather than inherited from the generated
 * `TimelineVariantProps`, so each carries a description a reader can use.
 *
 * **No `@default` tag on any of them.** The recipe's `defaultVariants` resolves `solid`, `false`
 * and `md` from `undefined` itself.
 */
export interface TimelineVariantProps {
  /** How the indicator is filled — `solid` and `subtle` tint it, `outline` rings it, `plain` leaves it bare. */
  variant?: ConditionalValue<
    "subtle" | "solid" | "outline" | "plain" | PresetVariant<"timeline", "variant">
  >;
  /**
   * Whether the line continues past the last item. It sets `--timeline-separator-display` on the
   * last item, which is the only thing that hides that item's separator.
   */
  showLastSeparator?: ConditionalValue<boolean>;
  /** The diameter of the indicator, the glyph inside it, and the title's type scale. */
  size?: ConditionalValue<"sm" | "md" | "lg" | "xl" | PresetVariant<"timeline", "size">>;
}

/** The Root's own props, without the `div`'s — what a `Timeline.RootPropsProvider` may supply. */
export interface TimelineRootBaseProps extends TimelineVariantProps {}

export interface TimelineRootProps extends HTMLChakraProps<"div">, TimelineRootBaseProps {}

export interface TimelinePropsProviderProps extends PropsProviderProps<TimelineRootBaseProps> {}

export interface TimelineItemProps extends HTMLChakraProps<"div"> {}

export interface TimelineSeparatorProps extends HTMLChakraProps<"div"> {}

export interface TimelineIndicatorProps extends HTMLChakraProps<"div"> {}

export interface TimelineContentProps extends HTMLChakraProps<"div"> {}

export interface TimelineTitleProps extends HTMLChakraProps<"div"> {}

export interface TimelineDescriptionProps extends HTMLChakraProps<"div"> {}

export interface TimelineConnectorProps extends HTMLChakraProps<"div"> {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  TimelineSlot,
  TimelineRootProps,
  TimelineRecipeVariants
>({
  name: "Timeline",
  recipe: "timeline",
});

/** The classes the nearest {@link TimelineRoot} resolved, one per slot. */
export const useTimelineStyles = useStyles;

const StyledTimelineRoot = withProvider("div", "root");

/**
 * Timeline.Root — events in the order they happened, each on a line that runs between them.
 *
 * A `div`, so the list semantics are stated rather than inherited: `role="list"` here and
 * `role="listitem"` on each {@link TimelineItem} is what makes a screen reader announce "list, 3
 * items" over markup that is nested flex boxes.
 *
 * The line is drawn by the item's own separator, positioned from `--timeline-indicator-size`, which
 * `size` sets on this element.
 */
export const TimelineRoot: Component<TimelineRootProps> = (props) => {
  // A `withDefaults` entry rather than a JSX attribute before the spread: a wrapper forwarding an
  // unset `role={props.role}` would otherwise win with `undefined` and the semantics would go back
  // to a stack of anonymous `div`s, silently (`CLAUDE.md`, *The third hazard*).
  const merged = withDefaults(props, { role: "list" } satisfies Partial<TimelineRootProps>);

  return <StyledTimelineRoot {...merged} />;
};

/**
 * Supplies props to every {@link TimelineRoot} below it. A Root that passes the prop itself still
 * wins.
 */
export const TimelineRootPropsProvider: Component<TimelinePropsProviderProps> = PropsProvider;

const StyledTimelineItem = withContext<TimelineItemProps>("div", "item");

/**
 * One event. It is the row a connector and a content column sit in, and the last one zeroes
 * `--timeline-content-gap` so the timeline does not end in empty space.
 *
 * Carries `role="listitem"` for the reason {@link TimelineRoot} carries `role="list"` — and as the
 * same kind of default, so a wrapper forwarding an unset `role` cannot delete half the pair.
 */
export const TimelineItem: Component<TimelineItemProps> = (props) => {
  const merged = withDefaults(props, { role: "listitem" } satisfies Partial<TimelineItemProps>);

  return <StyledTimelineItem {...merged} />;
};

/**
 * The column holding the line and the marker — `align-self: stretch`, which is what lets the
 * separator span the item's full height however tall the content beside it grows.
 */
export const TimelineConnector = withContext<TimelineConnectorProps>("div", "connector");

/**
 * The line between two markers. Absolutely positioned inside the connector and centred on the
 * indicator, so it needs no width of its own.
 */
export const TimelineSeparator = withContext<TimelineSeparatorProps>("div", "separator");

/**
 * The marker on the line — a filled circle sized by `size`, and a box for a glyph, a number or an
 * avatar. It is outlined in the page background, which is what makes the line appear to stop at it.
 */
export const TimelineIndicator = withContext<TimelineIndicatorProps>("div", "indicator");

/**
 * The event's own column, beside the connector. A `flex` column, so a title, a description and
 * anything else stack with a gap rather than needing one each.
 */
export const TimelineContent = withContext<TimelineContentProps>("div", "content");

/** What happened. A wrapping flex row, so a badge or an avatar sits inline with the text. */
export const TimelineTitle = withContext<TimelineTitleProps>("div", "title");

/** When it happened, or any second line — muted and a step smaller than the title. */
export const TimelineDescription = withContext<TimelineDescriptionProps>("div", "description");
