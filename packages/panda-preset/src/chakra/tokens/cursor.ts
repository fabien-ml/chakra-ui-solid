/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/tokens/cursor.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { defineTokens } from "@pandacss/dev";

export const cursor = defineTokens.cursor({
  button: {
    value: "pointer",
  },
  checkbox: {
    value: "default",
  },
  disabled: {
    value: "not-allowed",
  },
  menuitem: {
    value: "default",
  },
  option: {
    value: "default",
  },
  radio: {
    value: "default",
  },
  slider: {
    value: "default",
  },
  // Deliberate divergence from the vendored file: upstream spells this key `swittch` while its own
  // Switch slot recipe references `cursor: "switch"`, so the token never resolved and Switch lost
  // its pointer cursor.
  switch: {
    value: "pointer",
  },
});
