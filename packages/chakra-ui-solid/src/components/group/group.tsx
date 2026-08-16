import {
  chakra,
  type HTMLChakraProps,
  useChakraContext,
  withDefaults,
} from "@chakra-ui-solid/core";
import type { SystemStyleObject } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

/**
 * A child that has taken itself out of the row — an absolutely positioned overlay, say. It is
 * nobody's neighbour, so it collects no seam and does not shift the positions of the children
 * around it. The React version asks the parent for a `skip` predicate because a parent is the only
 * thing that can reach a child there; here the child says it itself, and CSS reads it.
 */
const IN_ROW = ":not([data-group-skip])";
const FIRST_IN_ROW = `:nth-child(1 of ${IN_ROW})`;
const LAST_IN_ROW = `:nth-last-child(1 of ${IN_ROW})`;

/**
 * The `:not()` guards are Chakra's "a lone child is left alone" rule, expressed structurally: a
 * child that is at once the first and the last of the row is the only one in it, and a single
 * control has no neighbour to be attached to. Skipping is the usual way a row shrinks to one, and
 * because the count these selectors read is already skip-aware, that case needs nothing extra.
 */
const FIRST_OF_MANY = `& > *${FIRST_IN_ROW}:not(${LAST_IN_ROW})`;
const LAST_OF_MANY = `& > *${LAST_IN_ROW}:not(${FIRST_IN_ROW})`;
const BETWEEN = `& > *${IN_ROW}:not(${FIRST_IN_ROW}):not(${LAST_IN_ROW})`;
const HAS_A_NEIGHBOUR = `& > *${IN_ROW}:not(${FIRST_IN_ROW}${LAST_IN_ROW})`;

const StyledGroup = chakra("div", {
  base: {
    display: "inline-flex",
    gap: "var(--group-gap, 0.5rem)",
    isolation: "isolate",
    position: "relative",
    [HAS_A_NEIGHBOUR]: {
      _focusVisible: { zIndex: 1 },
    },
  },
  variants: {
    orientation: {
      horizontal: { flexDirection: "row" },
      vertical: { flexDirection: "column" },
    },
    attached: {
      true: { gap: "0!" },
    },
    grow: {
      true: {
        display: "flex",
        "& > *": { flex: 1 },
      },
    },
    // Each child's layer is its position in the row. The React version writes that position into a
    // `--group-index` custom property and lets `calc()` do the arithmetic; the numbers are knowable
    // at build time, so the ladders below are that arithmetic unrolled, one rule per position, and
    // they land in the server's first byte where a custom property cannot.
    //
    // A stylesheet cannot count, so the ladder needs a ceiling. Eight covers the readable range —
    // overlapping avatars, upstream's only consumer, stop being legible well before it — and the
    // catch-all rung **above** each ladder keeps a longer row safe rather than broken: every child
    // past the eighth shares one layer over the counted ones instead of falling underneath them.
    //
    // Spelled out rather than generated. A loop does extract, but Panda's evaluator is not JS: it
    // read `CEILING + 1` as string concatenation and emitted `z-index: 81`, silently.
    stacking: {
      "first-on-top": {
        [`& > *${IN_ROW}`]: { zIndex: 9 },
        [`& > *:nth-last-child(1 of ${IN_ROW})`]: { zIndex: 1 },
        [`& > *:nth-last-child(2 of ${IN_ROW})`]: { zIndex: 2 },
        [`& > *:nth-last-child(3 of ${IN_ROW})`]: { zIndex: 3 },
        [`& > *:nth-last-child(4 of ${IN_ROW})`]: { zIndex: 4 },
        [`& > *:nth-last-child(5 of ${IN_ROW})`]: { zIndex: 5 },
        [`& > *:nth-last-child(6 of ${IN_ROW})`]: { zIndex: 6 },
        [`& > *:nth-last-child(7 of ${IN_ROW})`]: { zIndex: 7 },
        [`& > *:nth-last-child(8 of ${IN_ROW})`]: { zIndex: 8 },
      },
      // Counting from the start, the layers are the same numbers the React version's
      // `var(--group-index)` produces — zero-based, so the first child sits at 0.
      "last-on-top": {
        [`& > *${IN_ROW}`]: { zIndex: 9 },
        [`& > *:nth-child(1 of ${IN_ROW})`]: { zIndex: 0 },
        [`& > *:nth-child(2 of ${IN_ROW})`]: { zIndex: 1 },
        [`& > *:nth-child(3 of ${IN_ROW})`]: { zIndex: 2 },
        [`& > *:nth-child(4 of ${IN_ROW})`]: { zIndex: 3 },
        [`& > *:nth-child(5 of ${IN_ROW})`]: { zIndex: 4 },
        [`& > *:nth-child(6 of ${IN_ROW})`]: { zIndex: 5 },
        [`& > *:nth-child(7 of ${IN_ROW})`]: { zIndex: 6 },
        [`& > *:nth-child(8 of ${IN_ROW})`]: { zIndex: 7 },
      },
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      attached: true,
      css: {
        [FIRST_OF_MANY]: { borderEndRadius: "0!", marginEnd: "-1px" },
        [BETWEEN]: { borderRadius: "0!", marginEnd: "-1px" },
        [LAST_OF_MANY]: { borderStartRadius: "0!" },
      },
    },
    {
      orientation: "vertical",
      attached: true,
      css: {
        [FIRST_OF_MANY]: { borderBottomRadius: "0!", marginBottom: "-1px" },
        [BETWEEN]: { borderRadius: "0!", marginBottom: "-1px" },
        [LAST_OF_MANY]: { borderTopRadius: "0!" },
      },
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
  },
});

type GroupVariantProps = Omit<ComponentProps<typeof StyledGroup>, keyof HTMLChakraProps<"div">>;

export interface GroupProps extends HTMLChakraProps<"div">, GroupVariantProps {
  /** Shorthand for `alignItems`. @default "center" */
  align?: SystemStyleObject["alignItems"];
  /** Shorthand for `justifyContent`. @default "flex-start" */
  justify?: SystemStyleObject["justifyContent"];
  /** Shorthand for `flexWrap`. */
  wrap?: SystemStyleObject["flexWrap"];
}

/**
 * Group — the container that makes a row of controls read as one: an equal gap, or no gap at all
 * with the seam between neighbours collapsed (`attached`).
 *
 * Which child is first, last or in between is a fact about the markup, so the seam is CSS the
 * browser applies to the server's first byte — nothing is written onto a child and there is no
 * frame with square corners. A child that sits outside the row, such as an absolutely positioned
 * overlay, marks itself with `data-group-skip` and is not counted.
 *
 * `align`, `justify` and `wrap` are placed **before** the consumer's own props, so an explicit
 * `alignItems` overrides the shorthand. Their values arrive as props and no Panda pattern claims
 * the name `Group`, so the keywords they can take are pre-generated in the preset's `staticCss`.
 */
export const Group: Component<GroupProps> = (props) => {
  const merged = withDefaults(props, {
    align: "center",
    justify: "flex-start",
  } satisfies Partial<GroupProps>);
  const system = useChakraContext();

  // The three shorthands are computed **before** the consumer's own props, so an explicit
  // `alignItems` overrides one — Chakra's order. They are getters over `merged`, so the defaults
  // survive the `omit` beside them.
  const elementProps = merge(
    {
      get alignItems() {
        return merged.align;
      },
      get justifyContent() {
        return merged.justify;
      },
      get flexWrap() {
        return merged.wrap;
      },
    },
    omit(merged, "align", "justify", "wrap", "class"),
    {
      get class() {
        return system().cx("chakra-group", merged.class as string | undefined);
      },
    },
  );

  return <StyledGroup {...elementProps} />;
};
