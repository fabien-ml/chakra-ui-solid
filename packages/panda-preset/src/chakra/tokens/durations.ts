/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/tokens/durations.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineTokens } from "@pandacss/dev";

export const durations = defineTokens.durations({
  fastest: {
    value: "50ms",
  },
  faster: {
    value: "100ms",
  },
  fast: {
    value: "150ms",
  },
  moderate: {
    value: "200ms",
  },
  slow: {
    value: "300ms",
  },
  slower: {
    value: "400ms",
  },
  slowest: {
    value: "500ms",
  },
});
