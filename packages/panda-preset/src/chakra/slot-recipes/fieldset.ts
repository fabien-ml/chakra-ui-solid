/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/fieldset.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const fieldsetSlotRecipe = defineSlotRecipe({
  className: "fieldset",
  slots: ["root", "errorText", "helperText", "legend", "content"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      width: "full",
    },
    content: {
      display: "flex",
      flexDirection: "column",
      width: "full",
    },
    legend: {
      color: "fg",
      fontWeight: "medium",
      _disabled: {
        opacity: "0.5",
      },
    },
    helperText: {
      color: "fg.muted",
      textStyle: "sm",
    },
    errorText: {
      display: "inline-flex",
      alignItems: "center",
      color: "fg.error",
      gap: "2",
      fontWeight: "medium",
      textStyle: "sm",
    },
  },
  variants: {
    size: {
      sm: {
        root: {
          spaceY: "2",
        },
        content: {
          gap: "1.5",
        },
        legend: {
          textStyle: "sm",
        },
      },
      md: {
        root: {
          spaceY: "4",
        },
        content: {
          gap: "4",
        },
        legend: {
          textStyle: "sm",
        },
      },
      lg: {
        root: {
          spaceY: "6",
        },
        content: {
          gap: "4",
        },
        legend: {
          textStyle: "md",
        },
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
