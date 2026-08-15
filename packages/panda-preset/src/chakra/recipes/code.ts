/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/recipes/code.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineRecipe } from "@pandacss/dev";

export const codeRecipe = defineRecipe({
  className: "code",
  base: {
    fontFamily: "mono",
    alignItems: "center",
    display: "inline-flex",
    borderRadius: "l2",
  },
  variants: {
    variant: {
      solid: {
        bg: "colorPalette.solid",
        color: "colorPalette.contrast",
      },
      subtle: {
        bg: "colorPalette.subtle",
        color: "colorPalette.fg",
      },
      outline: {
        color: "colorPalette.fg",
        "--outline-shadow-legacy": "colors.colorPalette.muted",
        "--outline-shadow": "colors.colorPalette.border",
        shadow: "inset 0 0 0px 1px var(--shadow-color)",
        shadowColor: "var(--outline-shadow, var(--outline-shadow-legacy))",
      },
      surface: {
        bg: "colorPalette.subtle",
        color: "colorPalette.fg",
        shadow: "inset 0 0 0px 1px var(--shadow-color)",
        shadowColor: "colorPalette.muted",
      },
      plain: {
        color: "colorPalette.fg",
      },
    },
    size: {
      xs: {
        textStyle: "2xs",
        px: "1",
        minH: "4",
      },
      sm: {
        textStyle: "xs",
        px: "1.5",
        minH: "5",
      },
      md: {
        textStyle: "sm",
        px: "2",
        minH: "6",
      },
      lg: {
        textStyle: "sm",
        px: "2.5",
        minH: "7",
      },
    },
  },
  defaultVariants: {
    variant: "subtle",
    size: "sm",
  },
});
