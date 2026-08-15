/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/tokens/aspect-ratios.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineTokens } from "@pandacss/dev";

export const aspectRatios = defineTokens.aspectRatios({
  square: {
    value: "1 / 1",
  },
  landscape: {
    value: "4 / 3",
  },
  portrait: {
    value: "3 / 4",
  },
  wide: {
    value: "16 / 9",
  },
  ultrawide: {
    value: "18 / 5",
  },
  golden: {
    value: "1.618 / 1",
  },
});
