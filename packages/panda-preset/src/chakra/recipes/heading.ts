/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/recipes/heading.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineRecipe } from "@pandacss/dev";

export const headingRecipe = defineRecipe({
  className: "heading",
  base: {
    fontFamily: "heading",
    fontWeight: "semibold",
  },
  variants: {
    size: {
      xs: {
        textStyle: "xs",
      },
      sm: {
        textStyle: "sm",
      },
      md: {
        textStyle: "md",
      },
      lg: {
        textStyle: "lg",
      },
      xl: {
        textStyle: "xl",
      },
      "2xl": {
        textStyle: "2xl",
      },
      "3xl": {
        textStyle: "3xl",
      },
      "4xl": {
        textStyle: "4xl",
      },
      "5xl": {
        textStyle: "5xl",
      },
      "6xl": {
        textStyle: "6xl",
      },
      "7xl": {
        textStyle: "7xl",
      },
    },
  },
  defaultVariants: {
    size: "xl",
  },
});
