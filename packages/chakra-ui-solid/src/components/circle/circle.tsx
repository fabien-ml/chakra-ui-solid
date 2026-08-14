import { withDefaults } from "@chakra-ui-solid/core";
import type { Component } from "solid-js";
import { Square, type SquareProps } from "../square";

export interface CircleProps extends SquareProps {}

/**
 * Circle — a {@link Square} with its corners rounded away.
 *
 * A consumer's own `borderRadius` overrides it, which is the precedence Chakra gives it. The
 * default is a `withDefaults` entry rather than a JSX attribute before the spread: that spelling
 * loses it outright to a wrapper forwarding an unset `borderRadius`, because a Solid JSX spread is
 * a presence merge (`CLAUDE.md`, *The third hazard*). The value then reaches no extractor, so the
 * preset carries a `borderRadius: ["9999px"]` `staticCss` row for it.
 */
export const Circle: Component<CircleProps> = (props) => {
  const merged = withDefaults(props, {
    borderRadius: "9999px",
  } satisfies Partial<CircleProps>);

  return <Square {...merged} />;
};
