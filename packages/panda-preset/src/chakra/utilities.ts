/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/utilities.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import type { Config } from "@pandacss/dev";

/**
 * The one upstream `define*` call with no counterpart in `@pandacss/dev`: it exports
 * `defineUtility` (one utility) and no `defineUtilities` (the whole table). So the annotation does
 * the checking the helper would have done, read off `Config` for the reason `config.ts` states —
 * `UtilityConfig` lives in `@pandacss/types`, which `@pandacss/dev` imports without re-exporting,
 * and a consumer holding only the peer dependency cannot resolve it.
 *
 * Reached through `extend` rather than as the bare `Config["utilities"]`, because those two are not
 * the same type: the outer one lets every key be a whole nested table as well as one utility, and a
 * literal this size checked against that union is a `TS2590` — "union type that is too complex to
 * represent" — reported against whatever `definePreset` call it eventually reaches.
 */
type UtilityConfig = NonNullable<NonNullable<Config["utilities"]>["extend"]>;

const createFocusRing = (selector: string) => {
  return {
    values: ["outside", "inside", "mixed", "none"],
    transform(value: any, { token }: any) {
      const focusRingColor = token("colors.colorPalette.focusRing");
      const styles: Record<string, any> = {
        inside: {
          "--focus-ring-color": focusRingColor,
          [selector]: {
            outlineOffset: "0px",
            outlineWidth: "var(--focus-ring-width, 1px)",
            outlineColor: "var(--focus-ring-color)",
            outlineStyle: "var(--focus-ring-style, solid)",
            borderColor: "var(--focus-ring-color)",
          },
        },
        outside: {
          "--focus-ring-color": focusRingColor,
          [selector]: {
            outlineWidth: "var(--focus-ring-width, 2px)",
            outlineOffset: "var(--focus-ring-offset, 2px)",
            outlineStyle: "var(--focus-ring-style, solid)",
            outlineColor: "var(--focus-ring-color)",
          },
        },
        mixed: {
          "--focus-ring-color": focusRingColor,
          [selector]: {
            outlineWidth: "var(--focus-ring-width, 3px)",
            outlineStyle: "var(--focus-ring-style, solid)",
            outlineColor: "color-mix(in srgb, var(--focus-ring-color), transparent 60%)",
            borderColor: "var(--focus-ring-color)",
          },
        },
        none: {
          "--focus-ring-color": focusRingColor,
          [selector]: {
            outline: "none",
          },
        },
      };

      return styles[value] ?? {};
    },
  };
};

export const utilities: UtilityConfig = {
  focusRing: createFocusRing("&:is(:focus, [data-focus])"),
  focusVisibleRing: createFocusRing("&:is(:focus-visible, [data-focus-visible])"),
  focusRingColor: {
    values: "colors",
    transform(value, { utils }) {
      const prop = "--focus-ring-color";
      const mix = utils.colorMix(value);
      if (mix.invalid) return { [prop]: value };
      const cssVar = "--mix-" + prop;
      return {
        [cssVar]: mix.value,
        [prop]: `var(${cssVar}, ${mix.color})`,
      };
    },
  },
  focusRingOffset: {
    values: "spacing",
    transform: (v) => ({ "--focus-ring-offset": v }),
  },
  focusRingWidth: {
    values: "borderWidths",
    property: "outlineWidth",
    transform: (v) => ({ "--focus-ring-width": v }),
  },
  focusRingStyle: {
    values: "borderStyles",
    property: "outlineStyle",
    transform: (v) => ({ "--focus-ring-style": v }),
  },
  boxSize: {
    values: "sizes",
    transform: (value) => ({ width: value, height: value }),
  },
};
