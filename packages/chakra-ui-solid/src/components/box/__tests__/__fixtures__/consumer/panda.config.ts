import { defineChakraConfig } from "@chakra-ui-solid/panda-preset";

/**
 * A consumer's `panda.config.ts`, written the way the docs will tell a consumer to write one, and
 * the second half of the styling seam's gate: *does an override in **their** config change what
 * **our** component renders?*
 *
 * It has to be a separate Panda run rather than a variation on ours, because that is the actual
 * architecture. Their build produces the **stylesheet**; our published `@chakra-ui-solid/styled-system`
 * produces the **class names**. So a consumer override is not a code path in this library at all —
 * it is their sheet giving a different rule to a class name our runtime already computed, and the
 * only way to test that is to generate their sheet and read it.
 *
 * `defineChakraConfig()` sets every knob that has to match ours — `hash` above all, since a
 * consumer who hashed would get a sheet whose rule names our runtime never emits, and every
 * component would render naked with no error anywhere.
 */
export default defineChakraConfig({
  include: [
    // Their source. Panda's `jsxStyleProps: "all"` extracts style props from any capitalized JSX
    // component with no factory and no registration, which is why `<Box p="4">` in a consumer's
    // file produces a rule at all — and it is the only channel for a value a *component's* logic
    // never spells, such as `<Flex direction="row">`, which reaches their sheet through Panda's
    // own `flex` pattern claiming the JSX name.
    "./src/**/*.tsx",
    // **The library channel**, and it is a second channel rather than a convenience: a style
    // config handed to `chakra()` inside a component is not in a consumer's source at all. The
    // install docs spell it `./node_modules/chakra-ui-solid/dist/panda.buildinfo.json`, which is
    // `panda ship` run over these same files at build time — same style entries, resolved once
    // instead of re-scanned. Pointing at `src` keeps the fixture free of a build step.
    "../../../../*/*.tsx",
  ],
  outdir: "styled-system-app",

  // A **style prop this library has never heard of**, and the first of the three things only the
  // consumer's config can decide. `elevation` is nobody's CSS property and no preset in the chain
  // declares it, so both halves are theirs: their `isCssProperty` is what folds it into a class
  // instead of setting a DOM attribute, and the `SystemProperties` row `panda codegen` writes into
  // `styled-system-app/chakra-system-types.d.ts` is what makes `<Box elevation="high">` type-check —
  // in `css`, in a condition, and anywhere else a style key goes, since that interface is what every
  // style object in the library is derived from.
  //
  // A colour no Chakra shadow uses, for the same reason the token overrides below are absurd: the
  // assertion cannot pass against a rule from any other run.
  utilities: {
    extend: {
      elevation: {
        className: "elevation",
        values: ["low", "high"],
        transform: (value: string) => ({
          boxShadow: value === "high" ? "0 0 0 8px #00ff00" : "0 0 0 2px #00ff00",
        }),
      },
    },
  },

  // The second — a condition of their own. `@supports (display: grid)` rather than the
  // `@media (hover: hover)` a real app would write, because it is *deterministically true* in the
  // headless Chromium the browser project runs: a hover query answers whatever the launcher decided
  // about pointing devices, and a test that is only sometimes styled is worse than no test.
  conditions: {
    extend: { supportsGrid: "@supports (display: grid)" },
  },

  // Override path 3 — `theme.extend` deep-merges into the preset's own theme, which is the
  // build-time equivalent of Chakra's `createSystem(defaultConfig, { theme: … })`. Both token
  // overrides are deliberately absurd values, so a test asserting them cannot pass by coincidence.
  //
  // `button.variants.tone` is the third of the three: a variant **key** Chakra's own recipe does not
  // have. The runtime reads its key list off the recipe this config produced, so `tone` is passed to
  // that recipe rather than leaked onto the `<button>`; `PresetVariantProps<"button">` reads the
  // generated `RecipeVariantOverrides` row and is what makes `<Button tone="brand">` type-check.
  theme: {
    extend: {
      tokens: {
        spacing: { 4: { value: "99px" } },
        colors: { red: { 500: { value: "#00ff00" } } },
      },
      recipes: {
        button: { variants: { tone: { brand: { background: "red.500" } } } },
      },
      // The same key on a **slot recipe** — one style object per anatomy part rather than one for
      // the whole component — and three of them, because a Root comes in three shapes and each
      // reaches the recipe by a different route:
      //
      // - `tabs` renders an element of its own, so the key has to reach the recipe *and* stay off
      //   the `div`;
      // - `dialog` renders no element at all and publishes a class per slot to its parts, so a part
      //   is the only place the key is observable;
      // - `field` is hand-written over the slot-recipe seam, which reads the key list for it.
      //
      // A different CSS property each, on top of the absurd values, so no assertion can pass against
      // another recipe's rule.
      slotRecipes: {
        tabs: { variants: { tone: { brand: { root: { letterSpacing: "13px" } } } } },
        dialog: { variants: { tone: { brand: { content: { wordSpacing: "17px" } } } } },
        field: { variants: { tone: { brand: { root: { textIndent: "23px" } } } } },
      },
    },
  },
});
