/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/recipes/mark.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineRecipe } from "@pandacss/dev";

export const markRecipe = defineRecipe({
  className: "mark",
  base: {
    bg: "transparent",
    color: "inherit",
    whiteSpace: "nowrap",
  },
  variants: {
    variant: {
      subtle: {
        bg: "colorPalette.subtle",
        color: "inherit",
      },
      solid: {
        bg: "colorPalette.solid",
        color: "colorPalette.contrast",
      },
      text: {
        fontWeight: "medium",
      },
      plain: {},
    },
  },
});
