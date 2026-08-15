/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/tokens/borders.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineTokens } from "@pandacss/dev";

export const borders = defineTokens.borders({
  xs: {
    value: "0.5px solid",
  },
  sm: {
    value: "1px solid",
  },
  md: {
    value: "2px solid",
  },
  lg: {
    value: "4px solid",
  },
  xl: {
    value: "8px solid",
  },
});
