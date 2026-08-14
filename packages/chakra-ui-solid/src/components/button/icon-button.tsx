import { withDefaults } from "@chakra-ui-solid/core";
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
 * The three declarations are `withDefaults` entries, **not** JSX props before the spread: that
 * spelling is a presence merge, so a wrapper forwarding an unset `px` beats the literal with
 * `undefined` and the button comes back with a text button's padding (`CLAUDE.md`, *The third
 * hazard*). An object literal inside a function call is invisible to Panda's extractor, so all
 * three values are declared in the preset's `staticCss.css` instead — without that the class is
 * computed, the rule was never generated, and nothing errors anywhere.
 */
export const IconButton: Component<IconButtonProps> = (props) => {
  const merged = withDefaults(props, {
    px: "0",
    py: "0",
    _icon: { fontSize: "1.2em" },
  } satisfies Partial<IconButtonProps>);

  return <Button {...merged} />;
};
