import chakraPreset from "@chakra-ui/panda-preset";
import { definePreset } from "@pandacss/dev";
import { utilities } from "./chakra/utilities";

const chakraTheme = chakraPreset.theme ?? {};

/**
 * Chakra's design system minus its design: the 75 recipe bodies, the style-prop utilities, and the
 * conditions. Fixed — a skin never replaces any of it.
 *
 * The line falls here because a recipe body is *assembly* rather than looks. Measured across the
 * 4,231 declarations in those bodies, 56% are structural and 37% are token references, so swapping
 * a look is swapping the token table in `skin.ts` and leaving all four of these keys alone.
 *
 * **The recipe bodies and the conditions are still sliced off the imported preset object**, and
 * that is where the vendoring stops for now: `CLAUDE.md` settles that Chakra v3's preset becomes
 * ours to maintain, and `chakra/` holds the token tables and compositions that already moved. The
 * 75 bodies follow; until they do, reading two keys off a dependency reproduces none of its
 * expression and owes nothing.
 *
 * `utilities` is vendored, because it is not swappable and never was: every utility *name* is
 * compiled into the published `styled-system/jsx/is-valid-prop.mjs`, so `focusRing` and `boxSize`
 * are sealed by exactly the mechanism that seals a recipe's variant keys.
 */
export const anatomy = definePreset({
  name: "@chakra-ui-solid/anatomy",

  theme: {
    recipes: chakraTheme.recipes,
    slotRecipes: chakraTheme.slotRecipes,
  },

  utilities: { extend: utilities },
  conditions: chakraPreset.conditions,
});
