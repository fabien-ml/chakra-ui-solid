import { chakraSkin, defineSkin } from "../../../skin";

/**
 * A skin whose every value is deliberately absurd, so a test asserting one cannot pass by
 * coincidence — `13px` is a radius nothing in Chakra's own table carries, and `#00ff00` is a colour
 * nothing else in the sheet resolves to.
 *
 * It is written the way a real skin is written: **spread `chakraSkin`, override what it means to
 * change.** A skin *replaces* the default rather than extending it, so one that declared only these
 * three keys would leave every other token undefined — and Panda answers an unresolved token by
 * emitting its name as a literal, which is wrong CSS rather than absent CSS and reports nothing.
 */
const chakraColors = chakraSkin.semanticTokens?.colors ?? {};
const gray = chakraColors.gray as Record<string, unknown>;

export const fixtureSkin = defineSkin({
  ...chakraSkin,

  semanticTokens: {
    ...chakraSkin.semanticTokens,

    // Chakra declares exactly these three, so replacing the scale loses nothing. They are the
    // radii the anatomy is built out of — `button`'s base reads `l2`, and 60-odd other bodies read
    // one of the three.
    radii: {
      l1: { value: "3px" },
      l2: { value: "13px" },
      l3: { value: "23px" },
    },

    colors: {
      ...chakraColors,
      // `colorPalette.solid` is virtual: Panda points `--chakra-colors-color-palette-solid` at the
      // palette in scope, and the default palette is `gray`. So this is where a solid Button's
      // background is decided.
      gray: { ...gray, solid: { value: "#00ff00" } },
    },
  },

  /**
   * The half of a skin that is not a token table, and the half that only works from `theme.extend`:
   * **deltas** on two recipe bodies, chosen so that one run of Panda answers three questions.
   *
   * `button` is the ordinary case. Its own base already sets `borderRadius: "l2"`, and this replaces
   * that one property; everything else in the body — the other 21 base declarations, all four
   * variant keys — is inherited, because `extend` deep-merges and cannot delete. `textTransform` is
   * here to be *contested*: the fixture's `panda.config.ts` sets the same property, and a consumer's
   * own config is the later `extend` writer and has to win it.
   *
   * `container` is the case with the loud failure, and the reason it is in this fixture at all. It
   * is the one recipe this package **declares itself** — `@chakra-ui/panda-preset` has no
   * `container`, so `container-recipe.ts` reaches Panda through the library layer's own
   * `theme.extend.recipes`, one preset above this one. That makes it two `theme.extend` writers on a
   * single recipe name, which is exactly the case a merge can silently collapse: keep only this
   * delta and the Container loses its width, its padding and its `centerContent` variant, with
   * nothing to report it.
   */
  recipes: {
    button: { base: { borderRadius: "l3", textTransform: "uppercase" } },
    container: { base: { borderRadius: "l1" } },
  },
});
