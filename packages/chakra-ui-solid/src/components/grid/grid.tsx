import {
  chakra,
  composeStyle,
  type HTMLChakraProps,
  omitProps,
  type PlainCssValue,
} from "@chakra-ui-solid/core";
import type { CssProperties } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import { type Component, merge } from "solid-js";

export interface GridOptions {
  /** The column track list — `"repeat(3, 1fr)"`, `"200px 1fr"`. Not responsive; see the note below. */
  templateColumns?: PlainCssValue<CssProperties["gridTemplateColumns"]>;
  /** The row track list — `"repeat(2, 1fr)"`, `"auto 1fr auto"`. */
  templateRows?: PlainCssValue<CssProperties["gridTemplateRows"]>;
  /** Named areas a child can be placed into by name, as `"'header header' 'sidebar main'"`. */
  templateAreas?: PlainCssValue<CssProperties["gridTemplateAreas"]>;
  /** Which way children with no explicit placement flow — `"row"`, `"column"`, `"dense"`. */
  autoFlow?: PlainCssValue<CssProperties["gridAutoFlow"]>;
  /** The size of rows the grid creates on its own, beyond `templateRows`. */
  autoRows?: PlainCssValue<CssProperties["gridAutoRows"]>;
  /** The size of columns the grid creates on its own, beyond `templateColumns`. */
  autoColumns?: PlainCssValue<CssProperties["gridAutoColumns"]>;
  /** This grid's own column placement in a parent grid — the `grid-column` shorthand. */
  column?: PlainCssValue<CssProperties["gridColumn"]>;
  /** This grid's own row placement in a parent grid — the `grid-row` shorthand. */
  row?: PlainCssValue<CssProperties["gridRow"]>;
  /** Lay the children out inline, as `inline-grid` rather than `grid`. */
  inline?: boolean;
}

export interface GridProps extends HTMLChakraProps<"div">, GridOptions {}

/**
 * Every declaration Grid can make, reading a custom property the component sets inline.
 *
 * **This is the only shape that works for Grid**, and the reason is worth the paragraph. A track
 * list is an arbitrary string — `repeat(3, minmax(0, 1fr))` — so no `staticCss` entry can enumerate
 * it, and it arrives as a prop, so no source file contains it as a style value. Worse, a consumer's
 * `<Grid templateColumns="…">` is *actively* mangled: Panda's own `grid` pattern claims the JSX
 * name `Grid` and its property list is `columns`/`minChildWidth`/`gap`, so `templateColumns` falls
 * through to `...rest`, is not a CSS property, and produces **no rule at all**. Measured, not
 * assumed.
 *
 * So the value goes in an inline style and the rule reads it back. Every declaration below is a
 * literal in this file, which is what a consumer's build extracts.
 *
 * An unset custom property makes its declaration invalid at computed-value time, which resolves to
 * the property's initial value — `none`, `auto`, `row` — exactly what an absent declaration would
 * have given. None of these properties inherits, so there is nothing for the fallback to swallow.
 */
const StyledGrid = chakra("div", {
  base: {
    display: "grid",
    gridTemplateAreas: "var(--grid-template-areas)",
    gridTemplateColumns: "var(--grid-template-columns)",
    gridTemplateRows: "var(--grid-template-rows)",
    gridAutoColumns: "var(--grid-auto-columns)",
    gridAutoRows: "var(--grid-auto-rows)",
    gridAutoFlow: "var(--grid-auto-flow)",
    gridColumn: "var(--grid-column)",
    gridRow: "var(--grid-row)",
  },
  variants: {
    inline: {
      true: { display: "inline-grid" },
    },
  },
});

const OPTIONS = [
  "templateColumns",
  "templateRows",
  "templateAreas",
  "autoFlow",
  "autoRows",
  "autoColumns",
  "column",
  "row",
] as const;

/**
 * Grid — a Box that lays its children out on a CSS grid, with Chakra's `grid*`-less shorthands.
 *
 * The values are unbounded, so each rides an inline CSS custom property that {@link StyledGrid}'s
 * static rules read. One consequence a consumer meets: a **responsive** value has nowhere to go on
 * that route, so the props take a plain CSS value rather than Panda's conditional form — writing
 * `templateColumns={{ base: "1fr", md: "1fr 1fr" }}` is a type error here rather than a prop that
 * silently does nothing. Reach for the `gridTemplateColumns` style prop, which is conditional.
 */
export const Grid: Component<GridProps> = (props) => {
  const elementProps = merge(omitProps(props, ...OPTIONS, "style"), {
    get style(): JSX.HTMLAttributes<HTMLElement>["style"] {
      return composeStyle(
        {
          "--grid-template-areas": props.templateAreas,
          "--grid-template-columns": props.templateColumns,
          "--grid-template-rows": props.templateRows,
          "--grid-auto-columns": props.autoColumns,
          "--grid-auto-rows": props.autoRows,
          "--grid-auto-flow": props.autoFlow,
          "--grid-column": props.column,
          "--grid-row": props.row,
        },
        props.style,
      );
    },
  });

  return <StyledGrid {...elementProps} />;
};
