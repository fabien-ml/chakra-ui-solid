import { omitProps } from "@chakra-ui-solid/core";
import { token } from "@chakra-ui-solid/styled-system/tokens";
import { type Component, merge } from "solid-js";
import { Grid, type GridProps } from "../grid";

export interface SimpleGridProps extends Omit<GridProps, "columns"> {
  /** How many equal columns to lay out. */
  columns?: number;
  /** Break into as many columns as fit at this width or wider. A sizes token, or any CSS length. */
  minChildWidth?: string | number;
}

/**
 * `minChildWidth` names a **sizes token** when it can, and is a raw length otherwise.
 *
 * Chakra reaches into its runtime theme for this (`sys.tokens.getVar`). We have no runtime theme,
 * so the lookup goes to Panda's generated `token` map, which is the same question asked of the
 * build's output: a hit gives the custom property the stylesheet declares, and a miss means the
 * value was already a length.
 */
function resolveWidth(value: string | number): string {
  return token.var(`sizes.${value}` as Parameters<typeof token.var>[0]) ?? toPx(value);
}

function toPx(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * SimpleGrid — a {@link Grid} for the two layouts people actually reach for: N equal columns, or as
 * many columns as fit.
 *
 * It is a track list either way, and it delegates to Grid rather than re-deriving one — so the
 * value takes the same inline-custom-property route, for the same reason: `<SimpleGrid columns={3}>`
 * puts nothing in a consumer's source that Panda could turn into a rule, and `repeat(3, …)` is one
 * of unboundedly many track lists.
 *
 * `minChildWidth` wins when both are given, which is Chakra's precedence.
 */
export const SimpleGrid: Component<SimpleGridProps> = (props) => {
  const gridProps = merge(omitProps(props, "columns", "minChildWidth"), {
    get templateColumns(): string | undefined {
      const minChildWidth = props.minChildWidth;
      if (minChildWidth !== undefined) {
        return `repeat(auto-fit, minmax(${resolveWidth(minChildWidth)}, 1fr))`;
      }
      return props.columns === undefined ? undefined : `repeat(${props.columns}, minmax(0, 1fr))`;
    },
  });

  return <Grid {...gridProps} />;
};
