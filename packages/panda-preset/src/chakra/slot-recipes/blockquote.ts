/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/blockquote.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const blockquoteSlotRecipe = defineSlotRecipe({
  className: "blockquote",
  slots: ["root", "icon", "content", "caption"],
  base: {
    root: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "2",
    },
    caption: {
      textStyle: "sm",
      color: "fg.muted",
    },
    icon: {
      boxSize: "5",
    },
  },
  variants: {
    justify: {
      start: {
        root: {
          alignItems: "flex-start",
          textAlign: "start",
        },
      },
      center: {
        root: {
          alignItems: "center",
          textAlign: "center",
        },
      },
      end: {
        root: {
          alignItems: "flex-end",
          textAlign: "end",
        },
      },
    },
    variant: {
      subtle: {
        root: {
          paddingX: "5",
          borderStartWidth: "4px",
          borderStartColor: "colorPalette.muted",
        },
        icon: {
          color: "colorPalette.fg",
        },
      },
      solid: {
        root: {
          paddingX: "5",
          borderStartWidth: "4px",
          borderStartColor: "colorPalette.solid",
        },
        icon: {
          color: "colorPalette.solid",
        },
      },
      plain: {
        root: {
          paddingX: "5",
        },
        icon: {
          color: "colorPalette.solid",
        },
      },
    },
  },
  defaultVariants: {
    variant: "subtle",
    justify: "start",
  },
});
