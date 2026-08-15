/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/popover.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const popoverSlotRecipe = defineSlotRecipe({
  className: "popover",
  slots: [
    "arrow",
    "arrowTip",
    "anchor",
    "trigger",
    "indicator",
    "positioner",
    "content",
    "title",
    "description",
    "closeTrigger",
    "header",
    "body",
    "footer",
  ],
  base: {
    content: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      textStyle: "sm",
      "--popover-bg": "colors.bg.panel",
      bg: "var(--popover-bg)",
      boxShadow: "lg",
      "--popover-size": "sizes.xs",
      "--popover-mobile-size": "calc(100dvw - 1rem)",
      width: {
        base: "min(var(--popover-mobile-size), var(--popover-size))",
        sm: "var(--popover-size)",
      },
      borderRadius: "l3",
      "--popover-z-index": "zIndex.popover",
      zIndex: "calc(var(--popover-z-index) + var(--layer-index, 0))",
      outline: "0",
      transformOrigin: "var(--transform-origin)",
      maxHeight: "var(--available-height)",
      _open: {
        animationStyle: "scale-fade-in",
        animationDuration: "fast",
      },
      _closed: {
        animationStyle: "scale-fade-out",
        animationDuration: "faster",
      },
    },
    header: {
      paddingInline: "var(--popover-padding)",
      paddingTop: "var(--popover-padding)",
    },
    body: {
      padding: "var(--popover-padding)",
      flex: "1",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      paddingInline: "var(--popover-padding)",
      paddingBottom: "var(--popover-padding)",
    },
    arrow: {
      "--arrow-size": "sizes.3",
      "--arrow-background": "var(--popover-bg)",
    },
    arrowTip: {
      borderTopWidth: "1px",
      borderLeftWidth: "1px",
    },
  },
  variants: {
    size: {
      xs: {
        content: {
          "--popover-padding": "spacing.3",
        },
      },
      sm: {
        content: {
          "--popover-padding": "spacing.4",
        },
      },
      md: {
        content: {
          "--popover-padding": "spacing.5",
        },
      },
      lg: {
        content: {
          "--popover-padding": "spacing.6",
        },
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
