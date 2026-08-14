/**
 * @license
 * The two style objects below are derived from Chakra UI (`@chakra-ui/react`,
 * `packages/react/src/components/link/link-box.tsx`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { chakra, type HTMLChakraProps } from "@chakra-ui-solid/core";
import { cx } from "@chakra-ui-solid/styled-system/css";
import { type Component, merge, omit } from "solid-js";

export interface LinkOverlayProps extends HTMLChakraProps<"a"> {}

/**
 * The overlay's own rule, and the only one of the pair a consumer can see the effect of directly:
 * a zero-inset `::before` that grows to the nearest positioned ancestor — the {@link LinkBox} — so
 * a click anywhere in that box lands on this anchor. `position: static` is what makes the pseudo
 * element resolve against the box rather than against the anchor itself.
 */
const StyledLinkOverlay = chakra("a", {
  base: {
    position: "static",
    "&::before": {
      content: '""',
      cursor: "inherit",
      display: "block",
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: "0",
      width: "100%",
      height: "100%",
    },
  },
});

/**
 * LinkOverlay — the anchor that stretches over its {@link LinkBox}, so the whole card is clickable
 * while only this element is a link.
 *
 * The `chakra-linkbox__overlay` class is not decoration: {@link LinkBox}'s rule lifts every *other*
 * anchor inside it above the overlay, and it excludes this one by that class name. A consumer's own
 * `class` is appended after it, so both survive.
 */
export const LinkOverlay: Component<LinkOverlayProps> = (props) => {
  const elementProps = merge(omit(props, "class"), {
    get class() {
      return cx("chakra-linkbox__overlay", props.class as string | undefined);
    },
  });

  return <StyledLinkOverlay {...elementProps} />;
};

export interface LinkBoxProps extends HTMLChakraProps<"div"> {}

/**
 * The box's own rule: every anchor inside it that is *not* the overlay, plus any `abbr[title]`, is
 * given a stacking context above the overlay's `::before` — which is what keeps an inner link
 * clickable inside a card that is itself one big link.
 */
const StyledLinkBox = chakra("div", {
  base: {
    "& a[href]:not(.chakra-linkbox__overlay), & abbr[title]": {
      position: "relative",
      zIndex: "1",
    },
  },
});

/**
 * LinkBox — the container a {@link LinkOverlay} stretches over, so a whole card can be a link
 * without nesting interactive elements inside an anchor.
 *
 * `position="relative"` is a style prop **before** the spread rather than part of the base config,
 * which is the precedence Chakra gives it: it is what the overlay's `::before` resolves against, and
 * a consumer who wants `absolute` or `sticky` instead overrides it by passing one.
 */
export const LinkBox: Component<LinkBoxProps> = (props) => {
  const elementProps = merge(omit(props, "class"), {
    get class() {
      return cx("chakra-linkbox", props.class as string | undefined);
    },
  });

  return <StyledLinkBox position="relative" {...elementProps} />;
};
