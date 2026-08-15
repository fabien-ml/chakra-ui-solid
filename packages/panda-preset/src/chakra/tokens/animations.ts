/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/tokens/animations.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineTokens } from "@pandacss/dev";

export const animations = defineTokens.animations({
  spin: {
    value: "spin 1s linear infinite",
  },
  ping: {
    value: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
  },
  pulse: {
    value: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  },
  bounce: {
    value: "bounce 1s infinite",
  },
});
