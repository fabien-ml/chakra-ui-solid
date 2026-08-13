import { withDefaults } from "@chakra-ui-solid/core";
import type { Component } from "solid-js";
import { CloseIcon } from "../icons";
import type { ButtonVariant } from "./button";
import { IconButton, type IconButtonProps } from "./icon-button";

export interface CloseButtonProps extends IconButtonProps {
  // Re-declared only for the `@default` beside it. The values are Button's, through
  // {@link ButtonVariant}, so this cannot drift into offering a different set — but the default is
  // this component's own, and an inherited `@default "solid"` is what the docs table printed until
  // this declaration existed (`docs-site.md` §4.2).
  /**
   * How much of the colour palette the button spends — `ghost` carries no background until it is
   * hovered, which is what a control sitting in the corner of a dialog wants.
   *
   * @default "ghost"
   */
  variant?: ButtonVariant;
}

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
