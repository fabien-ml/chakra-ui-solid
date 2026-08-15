/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/floating-panel.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const floatingPanelSlotRecipe = defineSlotRecipe({
  slots: [
    "trigger",
    "positioner",
    "content",
    "header",
    "body",
    "title",
    "resizeTrigger",
    "dragTrigger",
    "stageTrigger",
    "closeTrigger",
    "control",
  ],
  className: "floating-panel",
  base: {
    positioner: {
      "--floating-panel-z-index": "zIndex.popover",
      zIndex: "calc(var(--floating-panel-z-index) + var(--layer-index, 0))",
      "&:has([data-topmost])": {
        "--layer-index": "100",
      },
      "&:has([data-behind])": {
        "--layer-index": "-100",
      },
    },
    content: {
      display: "flex",
      flexDirection: "column",
      bg: "bg.panel",
      borderRadius: "l2",
      boxShadow: "lg",
      overflow: "hidden",
      outline: 0,
      position: "relative",
      _open: {
        animationName: "scale-in, fade-in",
        animationDuration: "moderate",
      },
    },
    dragTrigger: {
      flex: "1",
      display: "flex",
      alignItems: "center",
      gap: "2",
      minW: "0",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "2",
      px: "3",
      py: "2",
      borderBottomWidth: "1px",
      bg: "bg.subtle",
      flex: "none",
    },
    title: {
      fontWeight: "semibold",
      textStyle: "sm",
      flex: "1",
      truncate: true,
    },
    body: {
      flex: "1",
      overflow: "auto",
      p: "3",
      textStyle: "sm",
    },
    resizeTrigger: {
      zIndex: "1",
      "--size": "sizes.2.5",
      '&[data-axis="n"], &[data-axis="s"]': {
        h: "var(--size)",
      },
      '&[data-axis="e"], &[data-axis="w"]': {
        w: "var(--size)",
      },
      '&[data-axis]:is([data-axis="ne"], [data-axis="nw"], [data-axis="se"], [data-axis="sw"])': {
        w: "var(--size)",
        h: "var(--size)",
      },
    },
  },
});
