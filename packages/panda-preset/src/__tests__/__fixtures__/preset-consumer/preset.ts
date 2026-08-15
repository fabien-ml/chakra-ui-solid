import { chakraPreset } from "../../../chakra-preset";
import { defineChakraPreset } from "../../../define-chakra-preset";

/**
 * A consumer's own preset, written the way a real one is: **start from `chakraPreset.theme`, replace
 * what the look changes.** Every value it names is deliberately absurd, so a test asserting one
 * cannot pass by coincidence — `23px` is a radius nothing in Chakra's table carries, `#00ff00` a
 * colour nothing else in the sheet resolves to, and `0.5em` a letter-spacing no recipe writes.
 *
 * The spread is not politeness. A preset's bare `theme.recipes` sits in a **replacing** position:
 * Panda takes the last preset that declares the key and takes it whole, so `recipes: { button }`
 * alone would leave the other 18 with no body, no rules and no error. Spreading is how a preset
 * replaces the bodies it means to and inherits the rest, and `defineChakraPreset` is what says so
 * before the stylesheet does — the 13 `button` variant values below are required by its type.
 */
const chakraTheme = chakraPreset.theme;
const chakraSemanticTokens = chakraTheme.semanticTokens;
const chakraColors = chakraSemanticTokens.colors as Record<string, unknown>;
const gray = chakraColors.gray as Record<string, unknown>;

export const fixturePreset = defineChakraPreset({
  name: "fixture",

  theme: {
    ...chakraTheme,

    semanticTokens: {
      ...chakraSemanticTokens,

      // Chakra declares exactly these three, so replacing the scale loses nothing. They are the
      // radii the recipe bodies are built out of — 60-odd of them read one of the three.
      radii: {
        l1: { value: "3px" },
        l2: { value: "13px" },
        l3: { value: "23px" },
      },

      colors: {
        ...chakraColors,
        // `colorPalette.solid` is virtual: Panda points `--chakra-colors-color-palette-solid` at
        // the palette in scope, and the default palette is `gray`. So this is where a solid
        // Button's background is decided, and the recipe rule that reads it is untouched.
        gray: { ...gray, solid: { value: "#00ff00" } },
      },
    },

    recipes: {
      ...chakraTheme.recipes,

      /**
       * A body **replaced outright**, which is what a preset can do and a `theme.extend` delta
       * cannot: `extend` deep-merges and can never delete. Chakra's `button` sets 22 base
       * declarations and this sets three, so a sheet still carrying `display: inline-flex` on
       * `.button` would mean Panda merged where it is documented to replace.
       *
       * `textTransform` is here to be *contested*: the fixture's `panda.config.ts` writes the same
       * property through `theme.extend`, and a consumer's own config is the later writer.
       */
      button: {
        className: "button",
        base: {
          borderRadius: "l3",
          letterSpacing: "0.5em",
          textTransform: "uppercase",
        },
        variants: {
          size: {
            "2xs": { fontSize: "2xs" },
            xs: { fontSize: "xs" },
            sm: { fontSize: "sm" },
            md: { fontSize: "md" },
            lg: { fontSize: "lg" },
            xl: { fontSize: "xl" },
            "2xl": { fontSize: "2xl" },
          },
          variant: {
            solid: { background: "colorPalette.solid" },
            subtle: { background: "colorPalette.subtle" },
            surface: { background: "colorPalette.muted" },
            outline: { borderWidth: "1px" },
            ghost: { background: "transparent" },
            plain: { background: "none" },
          },
        },
        defaultVariants: { size: "md", variant: "solid" },
      },
    },
  },

  globalCss: chakraPreset.globalCss,
});
