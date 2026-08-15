import type { Config } from "@pandacss/dev";
import { animationStyles } from "./chakra/animation-styles";
import { breakpoints } from "./chakra/breakpoints";
import { globalCss } from "./chakra/global-css";
import { keyframes } from "./chakra/keyframes";
import { layerStyles } from "./chakra/layer-styles";
import { semanticTokens } from "./chakra/semantic-tokens";
import { textStyles } from "./chakra/text-styles";
import { tokens } from "./chakra/tokens";

/**
 * Every type here is read off `Config` rather than off `@pandacss/types`, which `@pandacss/dev`
 * imports without re-exporting — a consumer holding only the peer dependency cannot resolve it.
 */
type ThemeOption = NonNullable<Config["theme"]>;
type ThemeDelta = NonNullable<ThemeOption["extend"]>;

/**
 * The swappable half of the design system: the token tables and the compositions that read them.
 * Chakra's own is {@link chakraSkin}, and it is the default.
 *
 * These eight keys plus the four in `anatomy.ts` are exactly the keys `@chakra-ui/panda-preset`
 * declares, which is what makes the split free — the union is the same object, so loading the
 * default skin cannot move a byte of the generated stylesheet.
 */
export interface Skin
  extends Pick<
    ThemeOption,
    | "tokens"
    | "semanticTokens"
    | "textStyles"
    | "layerStyles"
    | "animationStyles"
    | "keyframes"
    | "breakpoints"
  > {
  globalCss?: Config["globalCss"];

  /**
   * Recipe **deltas**, typed as partials because that is all they can be: they reach the anatomy
   * through `theme.extend`, which deep-merges at every level and cannot delete. A delta adds a
   * property to a body or a value to a variant; it can never remove a recipe, a slot or a variant
   * key, so a skin that names one it does not fully redefine keeps everything it did not mention.
   */
  recipes?: ThemeDelta["recipes"];
  slotRecipes?: ThemeDelta["slotRecipes"];
}

/**
 * Identity, for the checking and completion a skin author gets from writing it in a `.ts` file.
 * Panda's own `defineRecipe` / `definePreset` are the same shape for the same reason.
 */
export function defineSkin(skin: Skin): Skin {
  return skin;
}

/**
 * Chakra v3's look, assembled from the vendored modules under `chakra/` — one file per upstream
 * file, so a Chakra bump is a `diff -r` against `@chakra-ui/panda-preset`'s own `src/`.
 *
 * **Vendored rather than sliced off the dependency**, which is the one exception `CLAUDE.md` makes
 * and which those files pay for with an `@license` header each. A skin is a *replaceable* half, and
 * a shape contract cannot be designed around bodies we cannot see; a skin that can only override
 * `@chakra-ui/panda-preset` is `theme.extend` with extra steps.
 *
 * Declared in the upstream theme's own key order, so the merged theme this half contributes to
 * keeps the token and keyframe emission order the stylesheet already had.
 */
export const chakraSkin: Skin = defineSkin({
  breakpoints,
  keyframes,
  tokens,
  semanticTokens,
  textStyles,
  layerStyles,
  animationStyles,
  globalCss,
});
