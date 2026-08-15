/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/tokens/blurs.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineTokens } from "@pandacss/dev";

export const blurs = defineTokens.blurs({
  none: {
    value: " ",
  },
  sm: {
    value: "4px",
  },
  md: {
    value: "8px",
  },
  lg: {
    value: "12px",
  },
  xl: {
    value: "16px",
  },
  "2xl": {
    value: "24px",
  },
  "3xl": {
    value: "40px",
  },
  "4xl": {
    value: "64px",
  },
});
