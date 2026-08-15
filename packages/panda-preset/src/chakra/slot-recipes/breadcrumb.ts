/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/slot-recipes/breadcrumb.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineSlotRecipe } from "@pandacss/dev";

export const breadcrumbSlotRecipe = defineSlotRecipe({
  className: "breadcrumb",
  slots: ["link", "currentLink", "item", "list", "root", "ellipsis", "separator"],
  base: {
    list: {
      display: "flex",
      alignItems: "center",
      wordBreak: "break-word",
      color: "fg.muted",
      listStyle: "none",
    },
    link: {
      outline: "0",
      textDecoration: "none",
      borderRadius: "l1",
      focusRing: "outside",
      display: "inline-flex",
      alignItems: "center",
      gap: "2",
    },
    item: {
      display: "inline-flex",
      alignItems: "center",
    },
    separator: {
      color: "fg.muted",
      opacity: "0.8",
      _icon: {
        boxSize: "1em",
      },
      _rtl: {
        rotate: "180deg",
      },
    },
    ellipsis: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      _icon: {
        boxSize: "1em",
      },
    },
  },
  variants: {
    variant: {
      underline: {
        link: {
          color: "colorPalette.fg",
          textDecoration: "underline",
          textUnderlineOffset: "0.2em",
          textDecorationColor: "colorPalette.muted",
        },
        currentLink: {
          color: "colorPalette.fg",
        },
      },
      plain: {
        link: {
          color: "fg.muted",
          _hover: {
            color: "fg",
          },
        },
        currentLink: {
          color: "fg",
        },
      },
    },
    size: {
      sm: {
        list: {
          gap: "1",
          textStyle: "xs",
        },
      },
      md: {
        list: {
          gap: "1.5",
          textStyle: "sm",
        },
      },
      lg: {
        list: {
          gap: "2",
          textStyle: "md",
        },
      },
    },
  },
  defaultVariants: {
    variant: "plain",
    size: "md",
  },
});
