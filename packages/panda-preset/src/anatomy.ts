import chakraPreset from "@chakra-ui/panda-preset";
import { definePreset } from "@pandacss/dev";

const chakraTheme = chakraPreset.theme ?? {};

/**
 * Chakra's design system minus its design: the 75 recipe bodies, the style-prop utilities, and the
 * conditions. Fixed — a skin never replaces any of it.
 *
 * The line falls here because a recipe body is *assembly* rather than looks. Measured across the
 * 4,231 declarations in those bodies, 56% are structural and 37% are token references, so swapping
 * a look is swapping the token table in `skin.ts` and leaving all four of these keys alone.
 *
 * **They are sliced off the imported preset object rather than copied into this file**, and the
 * difference is legal rather than tidiness. Reading four keys off a dependency reproduces none of
 * its expression, so this stays a dependency; transcribing a recipe body or a token table here
 * would make the file a derivative and owe an `attribution.config.ts` entry, an `@license` header
 * and two `NOTICE.md` rows (`CLAUDE.md`, *Reference use*). It is also what keeps a Chakra release
 * that reshapes a body covered by the version bump alone.
 */
export const anatomy = definePreset({
  name: "@chakra-ui-solid/anatomy",

  theme: {
    recipes: chakraTheme.recipes,
    slotRecipes: chakraTheme.slotRecipes,
  },

  utilities: chakraPreset.utilities,
  conditions: chakraPreset.conditions,
});
