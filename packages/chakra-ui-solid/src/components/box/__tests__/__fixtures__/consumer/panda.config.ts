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

  // Override path 3 — `theme.extend` deep-merges into the preset's own theme, which is the
  // build-time equivalent of Chakra's `createSystem(defaultConfig, { theme: … })`. Both overrides
  // are deliberately absurd values, so a test asserting them cannot pass by coincidence.
  theme: {
    extend: {
      tokens: {
        spacing: { 4: { value: "99px" } },
        colors: { red: { 500: { value: "#00ff00" } } },
      },
    },
  },
});
