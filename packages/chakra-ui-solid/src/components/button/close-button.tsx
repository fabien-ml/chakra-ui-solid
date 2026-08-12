/**
 * @license
 * The `CloseIcon` path data below is copied from Chakra UI (`@chakra-ui/react`,
 * `packages/react/src/components/icons.tsx`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 *
 * Two changes. The glyph is a leaf `<svg>` rather than a `chakra.svg` — `svg` is not in the
 * factory's `exceptionPropMap`, so `fill` is a style prop there and would become a Panda class
 * instead of an attribute, which renders nothing and raises nothing. And it is internal here, where
 * upstream's is one of a shared set; `roadmap.md` line 167 assigns that set to the `icon` row, and
 * this one moves there when it ships rather than being invented twice.
 */

import { withDefaults } from "@chakra-ui-solid/core";
import type { Component } from "solid-js";
import { IconButton, type IconButtonProps } from "./icon-button";

export interface CloseButtonProps extends IconButtonProps {}

// `aria-hidden` is the lint's marker for a decorative glyph, not behavior Chakra lacks: the button
// above carries `aria-label="Close"`, which already ends the accessible-name computation before the
// icon is reached. The docs site's icon set marks its glyphs the same way.
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711Z"
    />
  </svg>
);

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
