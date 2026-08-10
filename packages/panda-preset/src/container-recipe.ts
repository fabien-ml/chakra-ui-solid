/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/react`, `packages/react/src/theme/recipes/container.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineRecipe } from "@pandacss/dev";

/**
 * The one recipe body this package reproduces rather than inherits.
 *
 * `container` is a key `@chakra-ui/react`'s own theme defines and `@chakra-ui/panda-preset` does
 * **not** — the preset we depend on carries 18 atomic recipes and this is not one of them. A
 * Container resolved against it would compute a class with no rule behind it and render as a bare
 * `div`: full-bleed, unpadded, and with nothing to say so. Every other recipe in this package is
 * reached through the dependency, and adding a second one here would be a theme fork
 * (`CLAUDE.md`, *Reference use*).
 *
 * **One modification: the `className`.** Upstream spells it `chakra-container` where every recipe
 * in the preset spells the unprefixed form (`button`, `input-addon`), and `componentNameFor()`
 * derives a component's JSX tracking hint from exactly that string — left alone it would hand Panda
 * a hint for a component called `ChakraContainer`.
 */
export const containerRecipe = defineRecipe({
  className: "container",
  base: {
    position: "relative",
    maxWidth: "8xl",
    w: "100%",
    mx: "auto",
    px: { base: "4", md: "6", lg: "8" },
  },
  variants: {
    centerContent: {
      true: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
    },
    fluid: {
      true: {
        maxWidth: "full",
      },
    },
  },
});
