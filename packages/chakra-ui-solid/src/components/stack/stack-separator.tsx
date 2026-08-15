import {
  type CssProp,
  chakra,
  composeCss,
  type HTMLChakraProps,
  omitProps,
} from "@chakra-ui-solid/core";
import type { ConditionalValue, SystemStyleObject } from "@chakra-ui-solid/styled-system/types";
import { type Component, merge, useContext } from "solid-js";
import { type StackDirection, StackDirectionContext } from "./stack";

export interface StackSeparatorProps extends HTMLChakraProps<"div"> {}

const StyledStackSeparator = chakra("div", {
  base: {
    borderWidth: 0,
    alignSelf: "stretch",
    borderColor: "inherit",
    width: "auto",
    height: "auto",
  },
});

type PlainDirection = Extract<StackDirection, string>;

/**
 * Which of the separator's four borders is the line — a stack that runs down is divided by a
 * horizontal rule, one that runs across by a vertical one. Both sides are always declared, so the
 * off side is `0` rather than absent and a direction change cannot leave the previous line behind.
 */
const BORDER_WIDTHS: Record<PlainDirection, { top: string; inlineStart: string }> = {
  column: { top: "1px", inlineStart: "0" },
  "column-reverse": { top: "1px", inlineStart: "0" },
  row: { top: "0", inlineStart: "1px" },
  "row-reverse": { top: "0", inlineStart: "1px" },
};

/**
 * A conditional direction mapped to a conditional value, per property — `{ base: "column", md:
 * "row" }` becomes `{ base: "1px", md: "0" }` on one border and its mirror on the other.
 *
 * Transposed rather than nested, which is where this parts company with Chakra's `getSeparatorStyles`:
 * a conditional *value* is the one form Panda accepts in all three spellings, so the array
 * `direction={["column", "row"]}` maps as faithfully as the object does. Neither the values nor
 * their conditions are literals any file spells, so the rules they need come from the preset's
 * `staticCss` — the `borderTopWidth` / `borderInlineStartWidth` rows, which carry `responsive: true`
 * for exactly this.
 */
function mapDirection(
  direction: StackDirection,
  pick: (value: PlainDirection) => string,
): ConditionalValue<string> {
  if (typeof direction === "string") {
    return pick(direction);
  }
  if (Array.isArray(direction)) {
    return direction.map((value) => (value == null ? null : pick(value)));
  }
  return Object.fromEntries(
    Object.entries(direction).map(([condition, value]) => [
      condition,
      typeof value === "string" ? pick(value) : undefined,
    ]),
  );
}

function separatorStyle(direction: StackDirection): SystemStyleObject {
  return {
    borderTopWidth: mapDirection(direction, (value) => BORDER_WIDTHS[value].top),
    borderInlineStartWidth: mapDirection(direction, (value) => BORDER_WIDTHS[value].inlineStart),
  };
}

/**
 * StackSeparator — the line a {@link Stack} draws between each pair of its children.
 *
 * It takes no `direction` prop and asks the Stack instead, because a separator is passed *into* the
 * Stack and a prop would have to be written by the consumer on every one.
 *
 * **It carries no margins, where Chakra's carries the gap on each side.** Chakra unsets the flex
 * `gap` when a separator is present and spaces the items with the separator's own `marginY` /
 * `marginX`; that margin is the `gap` prop's value, which is a runtime value with no rule in
 * anyone's stylesheet — the failure this library has no runtime CSS to paper over. So the flex
 * `gap` stays on and does the spacing instead. The geometry is the same one either way — a gap
 * either side of a 1px line — and `stack.browser.test.tsx` measures it rather than assuming it.
 */
export const StackSeparator: Component<StackSeparatorProps> = (props) => {
  const direction = useContext(StackDirectionContext);

  const elementProps = merge(omitProps(props, "css"), {
    get css(): CssProp {
      return composeCss(separatorStyle(direction()), props.css);
    },
  });

  return <StyledStackSeparator {...elementProps} />;
};
