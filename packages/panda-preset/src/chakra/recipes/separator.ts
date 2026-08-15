/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/recipes/separator.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineRecipe } from "@pandacss/dev";

export const separatorRecipe = defineRecipe({
  className: "separator",
  base: {
    display: "block",
    borderColor: "border",
  },
  variants: {
    variant: {
      solid: {
        borderStyle: "solid",
      },
      dashed: {
        borderStyle: "dashed",
      },
      dotted: {
        borderStyle: "dotted",
      },
    },
    orientation: {
      vertical: {
        borderInlineStartWidth: "var(--separator-thickness)",
      },
      horizontal: {
        borderTopWidth: "var(--separator-thickness)",
      },
    },
    size: {
      xs: {
        "--separator-thickness": "0.5px",
      },
      sm: {
        "--separator-thickness": "1px",
      },
      md: {
        "--separator-thickness": "2px",
      },
      lg: {
        "--separator-thickness": "3px",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "solid",
    orientation: "horizontal",
  },
});
