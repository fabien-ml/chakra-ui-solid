/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/tokens/easings.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineTokens } from "@pandacss/dev";

export const easings = defineTokens.easings({
  "ease-in": {
    value: "cubic-bezier(0.42, 0, 1, 1)",
  },
  "ease-out": {
    value: "cubic-bezier(0, 0, 0.58, 1)",
  },
  "ease-in-out": {
    value: "cubic-bezier(0.42, 0, 0.58, 1)",
  },
  "ease-in-smooth": {
    value: "cubic-bezier(0.32, 0.72, 0, 1)",
  },
});
