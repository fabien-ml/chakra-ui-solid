import type { Component } from "solid-js";
import { Square, type SquareProps } from "../square";

export interface CircleProps extends SquareProps {}

/**
 * Circle — a {@link Square} with its corners rounded away.
 *
 * `borderRadius` sits **before** the spread so a consumer's own `borderRadius` overrides it, which
 * is the precedence Chakra gives it. As a literal style prop on a `Square` it is also what Panda
 * extracts, from this file and from the published `dist/` a consumer's build scans.
 */
export const Circle: Component<CircleProps> = (props) => (
  <Square borderRadius="9999px" {...props} />
);
