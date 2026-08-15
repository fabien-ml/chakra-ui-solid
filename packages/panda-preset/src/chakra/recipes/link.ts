/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/recipes/link.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineRecipe } from "@pandacss/dev";

export const linkRecipe = defineRecipe({
  className: "link",
  base: {
    display: "inline-flex",
    alignItems: "center",
    outline: "none",
    gap: "1.5",
    cursor: "pointer",
    borderRadius: "l1",
    focusVisibleRing: "outside",
  },
  variants: {
    variant: {
      underline: {
        color: "colorPalette.fg",
        textDecoration: "underline",
        textUnderlineOffset: "3px",
        textDecorationColor: "currentColor/20",
      },
      plain: {
        color: "colorPalette.fg",
        _hover: {
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          textDecorationColor: "currentColor/20",
        },
      },
    },
  },
  defaultVariants: {
    variant: "plain",
  },
});
