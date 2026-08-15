import { animationStyles } from "./chakra/animation-styles";
import { breakpoints } from "./chakra/breakpoints";
import { globalCss } from "./chakra/global-css";
import { keyframes } from "./chakra/keyframes";
import { layerStyles } from "./chakra/layer-styles";
import { recipes } from "./chakra/recipes";
import { semanticTokens } from "./chakra/semantic-tokens";
import { slotRecipes } from "./chakra/slot-recipes";
import { textStyles } from "./chakra/text-styles";
import { tokens } from "./chakra/tokens";
import { defineChakraPreset } from "./define-chakra-preset";

/**
 * Chakra v3's look, as a Panda preset — the token tables, the compositions that read them, and a
 * body for each of the 75 recipes our components compute their classes through.
 *
 * **It is one preset among several, not a base to override.** `createChakraSolidPreset()` puts it in
 * the chain because it is the default; a consumer who writes their own passes it to
 * `defineChakraConfig({ presets })` and Panda's own merge decides the rest. Nothing here is
 * privileged, and `defineChakraPreset` is the same door both go through.
 *
 * **Vendored rather than depended on**, which is the one exception `CLAUDE.md` makes: a shape
 * contract cannot be designed around bodies nobody can see, and a preset that can only override
 * `@chakra-ui/panda-preset` is `theme.extend` with extra steps. The modules under `chakra/` are one
 * file per upstream file, each with its own `@license` header, so a Chakra bump is a `diff -r`.
 *
 * Declared in upstream's own key order, so the merged theme keeps the emission order the stylesheet
 * already had.
 */
export const chakraPreset = defineChakraPreset({
  name: "@chakra-ui-solid/chakra",

  theme: {
    breakpoints,
    keyframes,
    tokens,
    semanticTokens,
    recipes,
    slotRecipes,
    textStyles,
    layerStyles,
    animationStyles,
  },

  globalCss,
});
