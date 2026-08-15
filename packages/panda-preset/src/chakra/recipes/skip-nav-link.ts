/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/recipes/skip-nav-link.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineRecipe } from "@pandacss/dev";

export const skipNavLinkRecipe = defineRecipe({
  className: "skip-nav",
  base: {
    display: "inline-flex",
    bg: "bg.panel",
    padding: "2.5",
    borderRadius: "l2",
    fontWeight: "semibold",
    focusVisibleRing: "outside",
    textStyle: "sm",
    userSelect: "none",
    border: "0",
    height: "1px",
    width: "1px",
    margin: "-1px",
    outline: "0",
    overflow: "hidden",
    position: "absolute",
    clip: "rect(0 0 0 0)",
    _focusVisible: {
      clip: "auto",
      width: "auto",
      height: "auto",
      position: "fixed",
      top: "6",
      insetStart: "6",
    },
  },
});
