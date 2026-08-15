/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/carousel.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const carouselSlotRecipe = defineSlotRecipe({
  className: "carousel",
  slots: [
    "root",
    "itemGroup",
    "item",
    "control",
    "nextTrigger",
    "prevTrigger",
    "indicatorGroup",
    "indicator",
    "autoplayTrigger",
    "progressText",
    "progressText",
    "autoplayIndicator",
  ],
  base: {
    root: {
      position: "relative",
      display: "flex",
      gap: "2",
      _horizontal: {
        flexDirection: "column",
      },
      _vertical: {
        flexDirection: "row",
      },
    },
    item: {
      _horizontal: {
        width: "100%",
      },
      _vertical: {
        height: "100%",
      },
    },
    control: {
      display: "flex",
      alignItems: "center",
      _horizontal: {
        flexDirection: "row",
        width: "100%",
      },
      _vertical: {
        flexDirection: "column",
        height: "100%",
      },
    },
    indicatorGroup: {
      display: "flex",
      justifyContent: "center",
      gap: "3",
      _horizontal: {
        flexDirection: "row",
      },
      _vertical: {
        flexDirection: "column",
      },
    },
    indicator: {
      width: "2.5",
      height: "2.5",
      borderRadius: "full",
      bg: "colorPalette.subtle",
      cursor: "button",
      _current: {
        bg: "colorPalette.solid",
      },
    },
  },
  defaultVariants: {},
});
