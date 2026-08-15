/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/collapsible.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const collapsibleSlotRecipe = defineSlotRecipe({
  slots: ["root", "trigger", "content", "indicator"],
  className: "collapsible",
  base: {
    content: {
      overflow: "hidden",
      _open: {
        animationName: "expand-height, fade-in",
        animationDuration: "moderate",
        "&[data-has-collapsed-size]": {
          animationName: "expand-height",
        },
      },
      _closed: {
        animationName: "collapse-height, fade-out",
        animationDuration: "moderate",
        "&[data-has-collapsed-size]": {
          animationName: "collapse-height",
        },
      },
    },
  },
});
