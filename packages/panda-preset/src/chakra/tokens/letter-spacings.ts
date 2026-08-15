/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/tokens/letter-spacings.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineTokens } from "@pandacss/dev";

export const letterSpacings = defineTokens.letterSpacings({
  tighter: {
    value: "-0.05em",
  },
  tight: {
    value: "-0.025em",
  },
  wide: {
    value: "0.025em",
  },
  wider: {
    value: "0.05em",
  },
  widest: {
    value: "0.1em",
  },
});
