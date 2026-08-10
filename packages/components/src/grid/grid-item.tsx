import { css } from "@chakra-ui-solid/styled-system/css";
import type { CssProperties, SystemStyleObject } from "@chakra-ui-solid/styled-system/types";
import {
  type CssProp,
  chakra,
  composeCss,
  composeStyle,
  type HTMLChakraProps,
  type PlainCssValue,
} from "@chakra-ui-solid/system";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

/** A track placement: a line number, or `auto` for "wherever the auto-placement algorithm puts it". */
type Placement = number | "auto";

export interface GridItemProps extends HTMLChakraProps<"div"> {
  /** A named area from the parent Grid's `templateAreas`, or a four-line shorthand. */
  area?: PlainCssValue<CssProperties["gridArea"]>;
  colSpan?: Placement;
  colStart?: Placement;
  colEnd?: Placement;
  rowSpan?: Placement;
  rowStart?: Placement;
  rowEnd?: Placement;
}

/**
 * The three placements a GridItem can make, each a literal Panda extracts and each applied **only
 * when one of its props is set**.
 *
 * Conditional rather than one always-on base, and this is the trap the shape exists to avoid: a
 * custom property with no value makes its declaration invalid at computed-value time, which is
 * harmless for a longhand — the property falls back to `auto`, exactly as if undeclared — but
 * `grid-area` is a *shorthand*, so an unset one resets all four line properties. Declared beside
 * the longhands it would silently cancel every `colSpan` on the page, or be cancelled by them,
 * depending on which atomic rule Panda happened to write first.
 *
 * Splitting column from row also reproduces Chakra's `compact()`: it emits the keys that have a
 * value and nothing else.
 */
const areaStyle = css.raw({ gridArea: "var(--grid-item-area)" });
const columnStyle = css.raw({
  gridColumnStart: "var(--grid-item-column-start)",
  gridColumnEnd: "var(--grid-item-column-end)",
});
const rowStyle = css.raw({
  gridRowStart: "var(--grid-item-row-start)",
  gridRowEnd: "var(--grid-item-row-end)",
});

const OPTIONS = ["area", "colSpan", "colStart", "colEnd", "rowSpan", "rowStart", "rowEnd"] as const;

/** `span 2` on both lines is the two-line spelling of Chakra's `span 2/span 2`. */
function spanned(span: Placement | undefined): string | undefined {
  if (span === undefined || span === "auto") {
    return span;
  }
  return `span ${span}`;
}

/**
 * GridItem — one cell of a {@link Grid}, placed by span, by explicit line, or by named area.
 *
 * Every value is a render-time computation over an unbounded number, so each rides an inline CSS
 * custom property read back by a static rule. An explicit `colStart` beats the start line `colSpan`
 * implies, which is the precedence Chakra's own key order gives it.
 *
 * As on Grid, the placement props take a plain value rather than Panda's conditional form: an
 * inline custom property has no breakpoints, so a responsive spelling is a type error here instead
 * of a prop that silently does nothing.
 */
export const GridItem: Component<GridItemProps> = (props) => {
  const elementProps = merge(omit(props, ...OPTIONS, "css", "style"), {
    get css(): CssProp {
      const placements: SystemStyleObject[] = [];
      if (props.area !== undefined) {
        placements.push(areaStyle);
      }
      if (
        props.colSpan !== undefined ||
        props.colStart !== undefined ||
        props.colEnd !== undefined
      ) {
        placements.push(columnStyle);
      }
      if (
        props.rowSpan !== undefined ||
        props.rowStart !== undefined ||
        props.rowEnd !== undefined
      ) {
        placements.push(rowStyle);
      }
      return composeCss(Object.assign({}, ...placements), props.css);
    },
    get style(): JSX.HTMLAttributes<HTMLElement>["style"] {
      return composeStyle(
        {
          "--grid-item-area": props.area,
          "--grid-item-column-start": props.colStart ?? spanned(props.colSpan),
          "--grid-item-column-end": props.colEnd ?? spanned(props.colSpan),
          "--grid-item-row-start": props.rowStart ?? spanned(props.rowSpan),
          "--grid-item-row-end": props.rowEnd ?? spanned(props.rowSpan),
        },
        props.style,
      );
    },
  });

  return <chakra.div {...elementProps} />;
};
