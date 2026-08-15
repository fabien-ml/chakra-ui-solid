/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/recipes/icon.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineRecipe } from "@pandacss/dev";

export const iconRecipe = defineRecipe({
  className: "icon",
  base: {
    display: "inline-block",
    lineHeight: "1em",
    flexShrink: "0",
    color: "currentcolor",
    verticalAlign: "middle",
  },
  variants: {
    size: {
      inherit: {},
      xs: {
        boxSize: "3",
      },
      sm: {
        boxSize: "4",
      },
      md: {
        boxSize: "5",
      },
      lg: {
        boxSize: "6",
      },
      xl: {
        boxSize: "7",
      },
      "2xl": {
        boxSize: "8",
      },
    },
  },
  defaultVariants: {
    size: "inherit",
  },
});
