/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/list.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const listSlotRecipe = defineSlotRecipe({
  className: "list",
  slots: ["root", "item", "indicator"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--list-gap)",
      "& :where(ul, ol)": {
        marginTop: "var(--list-gap)",
      },
    },
    item: {
      whiteSpace: "normal",
      display: "list-item",
    },
    indicator: {
      marginEnd: "2",
      minHeight: "1lh",
      flexShrink: 0,
      display: "inline-block",
      verticalAlign: "middle",
    },
  },
  variants: {
    variant: {
      marker: {
        root: {
          listStyle: "revert",
        },
        item: {
          _marker: {
            color: "fg.subtle",
          },
        },
      },
      plain: {
        item: {
          alignItems: "flex-start",
          display: "inline-flex",
        },
      },
    },
    align: {
      center: {
        item: {
          alignItems: "center",
        },
      },
      start: {
        item: {
          alignItems: "flex-start",
        },
      },
      end: {
        item: {
          alignItems: "flex-end",
        },
      },
    },
  },
  defaultVariants: {
    variant: "marker",
  },
});
