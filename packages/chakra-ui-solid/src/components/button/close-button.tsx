import { withDefaults } from "@chakra-ui-solid/core";
import type { Component } from "solid-js";
import { CloseIcon } from "../icons";
import { IconButton, type IconButtonProps } from "./icon-button";

export interface CloseButtonProps extends IconButtonProps {}

/**
 * CloseButton — the dismiss control a dialog, drawer, alert or tag closes from: an
 * {@link IconButton} that already carries the ghost variant, the label and the ✕.
 *
 * All three are defaults rather than fixtures — `variant`, `aria-label` and the children each sit
 * before the spread, so a caller can pass their own icon or relabel the control for what it
 * actually dismisses.
 */
export const CloseButton: Component<CloseButtonProps> = (props) => {
  // Neither is a style prop, so neither has to stay a JSX attribute for Panda to extract: `variant`
  // is a recipe variant the preset pre-generates every value of, and `aria-label` is an attribute.
  // As defaults they survive a wrapper's `variant={props.variant}` with nothing set, which the
  // attribute-before-spread form does not (`CLAUDE.md`, *The third hazard*).
  const merged = withDefaults(props, {
    variant: "ghost",
    "aria-label": "Close",
  } satisfies Partial<CloseButtonProps>);

  return (
    <IconButton {...merged}>
      {/* Read exactly once, so no `children()` — `??` evaluates its left side one time, and the
          default is built only when there is nothing to fall back from. The spread carries a
          `children` key too, but the written-in child is the last source and the one that wins, so
          the getter beside it is never read. */}
      {merged.children ?? <CloseIcon />}
    </IconButton>
  );
};
