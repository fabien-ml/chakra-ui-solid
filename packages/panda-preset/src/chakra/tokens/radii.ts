/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/tokens/radii.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineTokens } from "@pandacss/dev";

export const radii = defineTokens.radii({
  none: {
    value: "0",
  },
  "2xs": {
    value: "0.0625rem",
  },
  xs: {
    value: "0.125rem",
  },
  sm: {
    value: "0.25rem",
  },
  md: {
    value: "0.375rem",
  },
  lg: {
    value: "0.5rem",
  },
  xl: {
    value: "0.75rem",
  },
  "2xl": {
    value: "1rem",
  },
  "3xl": {
    value: "1.5rem",
  },
  "4xl": {
    value: "2rem",
  },
  full: {
    value: "9999px",
  },
});
