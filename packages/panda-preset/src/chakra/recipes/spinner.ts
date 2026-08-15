/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/recipes/spinner.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineRecipe } from "@pandacss/dev";

export const spinnerRecipe = defineRecipe({
  className: "spinner",
  base: {
    display: "inline-block",
    borderColor: "currentColor",
    borderStyle: "solid",
    borderWidth: "2px",
    borderRadius: "full",
    width: "var(--spinner-size)",
    height: "var(--spinner-size)",
    animation: "spin",
    animationDuration: "slowest",
    "--spinner-track-color": "transparent",
    borderBottomColor: "var(--spinner-track-color)",
    borderInlineStartColor: "var(--spinner-track-color)",
  },
  variants: {
    size: {
      inherit: {
        "--spinner-size": "1em",
      },
      xs: {
        "--spinner-size": "sizes.3",
      },
      sm: {
        "--spinner-size": "sizes.4",
      },
      md: {
        "--spinner-size": "sizes.5",
      },
      lg: {
        "--spinner-size": "sizes.8",
      },
      xl: {
        "--spinner-size": "sizes.10",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
