/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/status.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const statusSlotRecipe = defineSlotRecipe({
  className: "status",
  slots: ["root", "indicator"],
  base: {
    root: {
      display: "inline-flex",
      alignItems: "center",
      gap: "2",
    },
    indicator: {
      width: "0.64em",
      height: "0.64em",
      flexShrink: 0,
      borderRadius: "full",
      forcedColorAdjust: "none",
      bg: "colorPalette.solid",
    },
  },
  variants: {
    size: {
      sm: {
        root: {
          textStyle: "xs",
        },
      },
      md: {
        root: {
          textStyle: "sm",
        },
      },
      lg: {
        root: {
          textStyle: "md",
        },
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
