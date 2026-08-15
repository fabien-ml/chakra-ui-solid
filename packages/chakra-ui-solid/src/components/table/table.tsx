import {
  chakra,
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PropsProviderProps,
  withDefaults,
} from "@chakra-ui-solid/core";
import {
  type TableVariantProps as TableRecipeVariants,
  table as tableRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { Component } from "solid-js";

/** The eight names the slot recipe carries — the anatomy's parts exactly. */
export type TableSlot =
  | "root"
  | "header"
  | "body"
  | "row"
  | "columnHeader"
  | "cell"
  | "footer"
  | "caption";

/**
 * The recipe's six variants, spelled out rather than inherited from the generated
 * `TableVariantProps`, so each carries a description a reader can use.
 *
 * **No `@default` tag on any of them.** The recipe's `defaultVariants` resolves `line` and `md`
 * from `undefined` itself, and the four booleans have no default at all.
 */
export interface TableVariantProps {
  /** Highlight a body row on hover, for a table whose rows are clickable. */
  interactive?: ConditionalValue<boolean>;
  /**
   * Pin the header row while the body scrolls under it. It only does anything inside a
   * {@link TableScrollArea} — that is the box with the scrollbar — and offsets from
   * `--table-sticky-offset`.
   */
  stickyHeader?: ConditionalValue<boolean>;
  /** Zebra-stripe the body: every odd row's cells take `bg.muted`. */
  striped?: ConditionalValue<boolean>;
  /** Draw a rule between columns as well as between rows. */
  showColumnBorder?: ConditionalValue<boolean>;
  /** `line` rules each row off; `outline` boxes the whole table and tints the header. */
  variant?: ConditionalValue<"line" | "outline">;
  /** The cell padding and the table's type scale. */
  size?: ConditionalValue<"sm" | "md" | "lg">;
}

/** The Root's own props, without the `table`'s — what a `Table.RootPropsProvider` may supply. */
export interface TableRootBaseProps extends TableVariantProps {}

export interface TableRootProps extends HTMLChakraProps<"table">, TableRootBaseProps {}

export interface TablePropsProviderProps extends PropsProviderProps<TableRootBaseProps> {}

export interface TableHeaderProps extends HTMLChakraProps<"thead"> {}

export interface TableBodyProps extends HTMLChakraProps<"tbody"> {}

export interface TableFooterProps extends HTMLChakraProps<"tfoot"> {}

export interface TableRowProps extends HTMLChakraProps<"tr"> {}

export interface TableColumnHeaderProps extends HTMLChakraProps<"th"> {}

export interface TableCellProps extends HTMLChakraProps<"td"> {}

export interface TableCaptionProps extends HTMLChakraProps<"caption"> {}

export interface TableColumnGroupProps extends HTMLChakraProps<"colgroup"> {}

export interface TableColumnProps extends HTMLChakraProps<"col"> {}

export interface TableScrollAreaProps extends HTMLChakraProps<"div"> {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  TableSlot,
  TableRootProps,
  TableRecipeVariants
>({
  name: "Table",
  recipe: tableRecipe,
  variantKeys: ["interactive", "stickyHeader", "striped", "showColumnBorder", "variant", "size"],
});

/** The classes the nearest {@link TableRoot} resolved, one per slot. */
export const useTableStyles = useStyles;

/**
 * Table.Root — a real `table`, with a slot for each of the sections HTML already has.
 *
 * `border-collapse: collapse` and `width: 100%`, so the width comes from the box around it rather
 * than from the content: put it inside a {@link TableScrollArea} to give it one that scrolls.
 *
 * **No `native` prop.** The React version's takes the styles of every slot and re-hangs them on
 * `& thead`, `& tr`, `& td` so a consumer can write plain HTML inside — a runtime composition of
 * style *objects*, which is exactly what this port does not have: a slot here resolves to a class
 * name, and the rules behind it live in the consumer's Panda build. What the prop buys upstream is
 * stated on their page as performance — "eliminating the runtime styling and React Context
 * overhead" — and neither cost exists here: a part is one context read and one class.
 */
export const TableRoot = withProvider("table", "root");

/**
 * Supplies props to every {@link TableRoot} below it. A Root that passes the prop itself still
 * wins.
 */
export const TableRootPropsProvider: Component<TablePropsProviderProps> = PropsProvider;

/**
 * The header section. Under `stickyHeader` this is where the row is pinned from, and under
 * `variant="outline"` it takes `bg.muted`.
 */
export const TableHeader = withContext<TableHeaderProps>("thead", "header");

/** The body section. Under `interactive` this is where the hover rule is scoped. */
export const TableBody = withContext<TableBodyProps>("tbody", "body");

/** The footer section — a totals row, usually. Ruled off the body under `variant="outline"`. */
export const TableFooter = withContext<TableFooterProps>("tfoot", "footer");

/**
 * One row, in any of the three sections. It is the part `striped` stripes and `[aria-selected]`
 * tints, so a selectable table needs nothing here but the attribute.
 */
export const TableRow = withContext<TableRowProps>("tr", "row");

/** A `th`. Bolder than a cell and start-aligned, with the rule `variant` asks for underneath. */
export const TableColumnHeader = withContext<TableColumnHeaderProps>("th", "columnHeader");

/** A `td`. Start-aligned, padded by `size`. */
export const TableCell = withContext<TableCellProps>("td", "cell");

const StyledTableCaption = withContext<TableCaptionProps>("caption", "caption");

/**
 * The table's own label, as a real `caption` — announced with the table rather than read as a
 * stray line above it. HTML puts a caption at the top; this one sits at the bottom, which is
 * Chakra's default and the one place in this family a default lives.
 *
 * `<Table.Caption captionSide="top">` overrides it.
 */
export const TableCaption: Component<TableCaptionProps> = (props) => {
  // A `withDefaults` entry, **not** `captionSide="bottom"` as a JSX attribute before the spread.
  // That spelling loses a style prop the same way it loses an attribute, and losing it is silent:
  // a JSX spread is a presence merge, so a wrapper forwarding an unset `captionSide` beats the
  // literal with `undefined`, `css()` is handed `undefined`, and no rule is emitted at all
  // (measured — the test below is the measurement).
  const merged = withDefaults(props, {
    captionSide: "bottom",
  } satisfies Partial<TableCaptionProps>);

  return <StyledTableCaption {...merged} />;
};

/**
 * A `colgroup`, for distributing column widths. It has **no slot** — the recipe styles nothing
 * here, and neither does Chakra — so it is a styled element with a class from nothing but the
 * style props you pass.
 */
export const TableColumnGroup = withContext<TableColumnGroupProps>("colgroup");

/**
 * A `col` inside a {@link TableColumnGroup}. Also slotless.
 *
 * CSS on a `col` is largely inert: `htmlWidth` is the one property a browser honours here, which
 * is why the width goes there rather than through `width`.
 */
export const TableColumn = withContext<TableColumnProps>("col");

/**
 * The box that scrolls. A plain `div` with its own base styles rather than a slot of the recipe —
 * it wraps the `table` instead of being part of it, so it exists whether or not a Root is above it.
 *
 * It is also what makes `stickyHeader` mean anything: `position: sticky` needs a scroll container,
 * and a bare `table` on the page does not have one.
 */
export const TableScrollArea = chakra("div", {
  base: {
    display: "block",
    whiteSpace: "nowrap",
    // Four declarations where Chakra's has five: `WebkitOverflowScrolling: "touch"` is not carried.
    // It was iOS Safari's momentum-scroll switch, Chromium never implemented it and modern WebKit
    // ignores it, so it is a no-op wherever it lands — and `check:declaration-support` rejects a
    // declaration no browser parses, with no allowance available for one our own source emitted.
    overflow: "auto",
    maxWidth: "100%",
  },
}) as Component<TableScrollAreaProps>;
