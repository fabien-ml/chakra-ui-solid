/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/field.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const fieldSlotRecipe = defineSlotRecipe({
  className: "field",
  slots: [
    "root",
    "errorText",
    "helperText",
    "input",
    "label",
    "select",
    "textarea",
    "requiredIndicator",
    "requiredIndicator",
  ],
  base: {
    requiredIndicator: {
      color: "fg.error",
      lineHeight: "1",
    },
    root: {
      display: "flex",
      width: "100%",
      position: "relative",
      gap: "1.5",
    },
    label: {
      display: "flex",
      alignItems: "center",
      textAlign: "start",
      textStyle: "sm",
      fontWeight: "medium",
      gap: "1",
      userSelect: "none",
      _disabled: {
        opacity: "0.5",
      },
    },
    errorText: {
      display: "inline-flex",
      alignItems: "center",
      fontWeight: "medium",
      gap: "1",
      color: "fg.error",
      textStyle: "xs",
    },
    helperText: {
      color: "fg.muted",
      textStyle: "xs",
    },
  },
  variants: {
    orientation: {
      vertical: {
        root: {
          flexDirection: "column",
          alignItems: "flex-start",
        },
      },
      horizontal: {
        root: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        label: {
          flex: "0 0 var(--field-label-width, 80px)",
        },
      },
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});
