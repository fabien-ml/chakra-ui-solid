/**
 * @license
 * Derived from chakra-ui/chakra-ui — `apps/compositions/src/lib/decorative-box.tsx`.
 * Copyright (c) 2019 Chakra Systems Inc.
 *
 * Licensed under the MIT License. A copy of the license is at the repository root as LICENSE,
 * and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 *
 * One change: the data URI is written inline rather than hoisted to a `const`. A style value must
 * be statically extractable or it renders nothing and raises no error (`CLAUDE.md`, *The hazard*),
 * and a literal in the JSX is the form no extractor has to reason about.
 */

import { Box, type BoxProps } from "chakra-ui-solid";

/**
 * The surface every layout example stands on: a hatched, bordered panel that centres whatever it is
 * given. It exists so a Flex demo reads as *three boxes in a row* rather than as three grey
 * rectangles — the diagonal hatch is what makes an item's edges visible against a page whose
 * background is the same family of greys.
 *
 * `width`/`height` are defaults an example overrides per property — `<DecorativeBox height="10" />`
 * is 40px tall and still full width — because a style prop outranks `css` (`DECISIONS.md`, *Style
 * props outrank the `css` prop*).
 *
 * It is documentation furniture, not a component: nothing under `packages/` knows it exists, and it
 * is never the subject of the page it appears on.
 */
export function DecorativeBox(props: BoxProps) {
  return (
    <Box
      {...props}
      css={{
        width: "100%",
        height: "100%",
        bg: "bg.emphasized",
        backgroundClip: "padding-box",
        borderWidth: "1px",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E\")",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}
