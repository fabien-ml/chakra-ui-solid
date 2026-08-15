/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/tokens/line-heights.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineTokens } from "@pandacss/dev";

export const lineHeights = defineTokens.lineHeights({
  shorter: {
    value: 1.25,
  },
  short: {
    value: 1.375,
  },
  moderate: {
    value: 1.5,
  },
  tall: {
    value: 1.625,
  },
  taller: {
    value: 2,
  },
});
