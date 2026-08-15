/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/animation-styles.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineAnimationStyles } from "@pandacss/dev";

export const animationStyles = defineAnimationStyles({
  "slide-fade-in": {
    value: {
      transformOrigin: "var(--transform-origin)",
      "&[data-placement^=top]": {
        animationName: "slide-from-bottom, fade-in",
      },
      "&[data-placement^=bottom]": {
        animationName: "slide-from-top, fade-in",
      },
      "&[data-placement^=left]": {
        animationName: "slide-from-right, fade-in",
      },
      "&[data-placement^=right]": {
        animationName: "slide-from-left, fade-in",
      },
    },
  },
  "slide-fade-out": {
    value: {
      transformOrigin: "var(--transform-origin)",
      "&[data-placement^=top]": {
        animationName: "slide-to-bottom, fade-out",
      },
      "&[data-placement^=bottom]": {
        animationName: "slide-to-top, fade-out",
      },
      "&[data-placement^=left]": {
        animationName: "slide-to-right, fade-out",
      },
      "&[data-placement^=right]": {
        animationName: "slide-to-left, fade-out",
      },
    },
  },
  "scale-fade-in": {
    value: {
      transformOrigin: "var(--transform-origin)",
      animationName: "scale-in, fade-in",
    },
  },
  "scale-fade-out": {
    value: {
      transformOrigin: "var(--transform-origin)",
      animationName: "scale-out, fade-out",
    },
  },
});
