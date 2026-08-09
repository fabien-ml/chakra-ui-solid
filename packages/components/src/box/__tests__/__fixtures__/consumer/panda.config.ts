import { chakraConfig } from "@chakra-ui-solid/panda-preset";
import { defineConfig } from "@pandacss/dev";

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
 * `chakraConfig()` carries every knob that has to match ours — `hash` above all, since a
 * consumer who hashed would get a sheet whose rule names our runtime never emits, and every
 * component would render naked with no error anywhere.
 */
export default defineConfig({
  ...chakraConfig(),

  // Their source, not ours. Panda's `jsxStyleProps: "all"` extracts style props from any
  // capitalized JSX component with no factory and no registration, which is why `<Box p="4">` in a
  // consumer's file produces a rule at all.
  include: ["./src/**/*.tsx"],
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
