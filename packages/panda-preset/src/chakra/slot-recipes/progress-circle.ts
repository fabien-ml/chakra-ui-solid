/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/progress-circle.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const progressCircleSlotRecipe = defineSlotRecipe({
  className: "progress-circle",
  slots: [
    "root",
    "label",
    "track",
    "range",
    "valueText",
    "view",
    "circle",
    "circleTrack",
    "circleRange",
  ],
  base: {
    root: {
      display: "inline-flex",
      textStyle: "sm",
      position: "relative",
    },
    circle: {
      _indeterminate: {
        animation: "spin 2s linear infinite",
      },
    },
    circleTrack: {
      "--track-color": "colors.colorPalette.muted",
      stroke: "var(--track-color)",
    },
    circleRange: {
      stroke: "colorPalette.solid",
      transitionProperty: "stroke-dashoffset, stroke-dasharray",
      transitionDuration: "0.6s",
      _indeterminate: {
        animation: "circular-progress 1.5s linear infinite",
      },
    },
    label: {
      display: "inline-flex",
    },
    valueText: {
      lineHeight: "1",
      fontWeight: "medium",
      letterSpacing: "tight",
      fontVariantNumeric: "tabular-nums",
    },
  },
  variants: {
    size: {
      xs: {
        circle: {
          "--size": "24px",
          "--thickness": "4px",
        },
        valueText: {
          textStyle: "2xs",
        },
      },
      sm: {
        circle: {
          "--size": "32px",
          "--thickness": "5px",
        },
        valueText: {
          textStyle: "2xs",
        },
      },
      md: {
        circle: {
          "--size": "40px",
          "--thickness": "6px",
        },
        valueText: {
          textStyle: "xs",
        },
      },
      lg: {
        circle: {
          "--size": "48px",
          "--thickness": "7px",
        },
        valueText: {
          textStyle: "sm",
        },
      },
      xl: {
        circle: {
          "--size": "64px",
          "--thickness": "8px",
        },
        valueText: {
          textStyle: "sm",
        },
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
