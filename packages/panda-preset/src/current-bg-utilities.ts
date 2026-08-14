/**
 * @license
 * The transform below is derived from Chakra UI (`@chakra-ui/react`,
 * `packages/react/src/preset-base.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import type { PropertyConfig } from "@pandacss/dev";
import basePreset from "@pandacss/preset-base";

/**
 * `@pandacss/dev` re-exports the config type but not the two inside it.
 *
 * `StyleObject` is a closed shape of known CSS properties, and every object below is keyed by a
 * `"background" | "backgroundColor"` variable or by a custom property name — neither of which
 * narrows to a literal key. The casts are at the boundary and nowhere else.
 */
type PropertyTransform = NonNullable<PropertyConfig["transform"]>;
type StyleObject = ReturnType<PropertyTransform>;

/**
 * The keyword two recipes in `@chakra-ui/panda-preset` write, the custom property it compiles to,
 * and the reference that reads it back.
 *
 * The spelling is upstream's, and it has to be: the property is published by one rule and read by
 * another, so a different name here would simply never meet the value.
 */
const CURRENT_BG_KEYWORD = "currentBg";
const CURRENT_BG_VAR = "--bg-currentcolor";
const CURRENT_BG_REF = `var(${CURRENT_BG_VAR})`;

/**
 * The one background value that publishes nothing, and **the one delta from upstream's transform**.
 *
 * Panda's preflight declares `background: transparent` on `button, input, optgroup, select,
 * textarea`, and it goes through this utility — so publishing unconditionally would put
 * `--bg-currentcolor: transparent` on every control in the document. A `tabs.trigger` is a
 * `button`, and `currentBg` on it would then read the button's own reset rather than the page:
 * measured, `rgba(0, 0, 0, 0)` here against `rgb(9, 9, 11)` on chakra-ui.com, whose preflight emits
 * that same reset as plain CSS and never reaches the transform. Ours would be observably worse than
 * the React version's, which the port rule answers by fixing (`CLAUDE.md`, *The port rule*).
 *
 * Guarding the value rather than the selector, because a selector list copied out of Panda's
 * preflight would drift with a Panda release and go quiet when it did. It also says what the
 * keyword means: `currentBg` is *the background painted behind me*, and an element painting none
 * has no claim to be it.
 */
const TRANSPARENT = "transparent";

type BackgroundProperty = "background" | "backgroundColor";

/**
 * Panda's own transform for the property, which already handles the token lookup and the `/40`
 * opacity modifier (`bg: "blue.500/40"` becomes a `color-mix` behind a `--mix-background` fallback).
 *
 * Read off the imported preset rather than rewritten, for the reason `alias-utilities.ts` reads its
 * shorthands the same way: `utilities.extend` merges a property's config **shallowly**, so a
 * `transform` declared here replaces Panda's outright — and reimplementing the half we do not care
 * about would fork it against every Panda release, silently, since a lost `color-mix` renders as a
 * flat colour rather than as an error.
 */
function inheritedTransform(property: BackgroundProperty): PropertyTransform {
  const utilities = basePreset.utilities as Record<string, PropertyConfig | undefined> | undefined;
  return utilities?.[property]?.transform ?? ((value) => ({ [property]: value }) as StyleObject);
}

/**
 * One background utility, taught to resolve `currentBg` and to publish what the keyword resolves
 * *to*.
 *
 * **`currentBg` is a Chakra keyword, not CSS.** It means "the background of the nearest ancestor
 * that set one", which CSS has no equivalent of — `currentColor` exists for the foreground and
 * nothing exists for the other side. Chakra builds it out of a custom property: every ordinary
 * background declaration publishes `--bg-currentcolor` alongside itself, custom properties inherit,
 * and an element asking for `currentBg` reads the nearest published value.
 *
 * The installed `@chakra-ui/panda-preset` **uses** the keyword — `timeline.indicator` under
 * `variant="outline"` and `tabs.trigger` when a selected trigger is `outline` — and ships no utility
 * resolving it, because that half lives in `@chakra-ui/react`'s own runtime config rather than in
 * the published preset. Left alone Panda emits `background: currentBg` verbatim, the browser drops
 * the declaration as invalid, and the indicator computes `rgba(0, 0, 0, 0)` where chakra-ui.com
 * computes the page background — so a Timeline's separator paints straight through its own circles.
 *
 * Only these two utilities are extended. Upstream also accepts the keyword as a *value* on the
 * border-colour and gradient utilities, and no recipe in the installed preset writes it there.
 */
function resolvingCurrentBg(property: BackgroundProperty): PropertyConfig {
  const inherited = inheritedTransform(property);

  return {
    transform(value, args) {
      // `args.raw` is the authored value, `value` is what the token lookup made of it. `currentBg`
      // is in no token scale, so both read the keyword — matching either keeps a consumer who
      // writes the resolved `var(…)` form working too, which is upstream's behaviour.
      if (args.raw === CURRENT_BG_KEYWORD || args.raw === CURRENT_BG_REF) {
        return { [property]: CURRENT_BG_REF } as unknown as StyleObject;
      }

      const styles = inherited(value, args) as Record<string, unknown> | undefined;
      if (args.raw === TRANSPARENT) {
        return styles as StyleObject;
      }
      return { ...styles, [CURRENT_BG_VAR]: styles?.[property] } as StyleObject;
    },
  };
}

export const currentBgUtilities: Record<string, PropertyConfig> = {
  background: resolvingCurrentBg("background"),
  backgroundColor: resolvingCurrentBg("backgroundColor"),
};
