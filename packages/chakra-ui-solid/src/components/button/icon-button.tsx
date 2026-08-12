import type { Component } from "solid-js";
import { Button, type ButtonProps } from "./button";

export interface IconButtonProps extends ButtonProps {}

/**
 * IconButton — a {@link Button} whose whole content is one icon: square, with the horizontal
 * padding removed so the recipe's `min-width` decides the shape.
 *
 * It has no `aria-label` of its own and Chakra gives it none either: an icon with no text is a
 * control with no accessible name, and only the caller knows what it does.
 *
 * The three declarations are written as **JSX props before the spread**, not folded into an object
 * — Panda extracts style props from a capitalized JSX component, and a `merge({ px: "0" }, props)`
 * is a function call it cannot see. That failure is the silent one: the class is computed, the rule
 * was never generated, and the button renders with the ordinary padding and no error anywhere.
 */
export const IconButton: Component<IconButtonProps> = (props) => (
  <Button px="0" py="0" _icon={{ fontSize: "1.2em" }} {...props} />
);
