import { defineChakraConfig } from "../../../config";
import { fixturePreset } from "./preset";

/**
 * A consumer's `panda.config.ts` with a preset of their own on it, and the only thing that can
 * answer the question a swappable look exists for: *does replacing the bodies change the CSS a
 * component's class names resolve through, and does the library layer survive it?*
 *
 * It has to be a real Panda run rather than an assertion on what this config returns, because those
 * are two different things — a config declares a token table and Panda decides what a rule ends up
 * naming. The same reasoning `generated-css.test.ts` opens with.
 *
 * **There is no key of ours for this.** A look is a preset, so it arrives through the `presets`
 * array Panda already has, after ours, which is what puts it in the replacing position.
 *
 * `defineChakraConfig` is imported from source rather than through the package's `exports` map: this
 * fixture lives inside the package it is testing, so `dist/` would be whatever was last built.
 */
export default defineChakraConfig({
  presets: [fixturePreset],
  include: ["./src/**/*.ts"],
  outdir: "styled-system-app",

  /**
   * The consumer's own word on a recipe their preset also replaced, and the later `theme.extend`
   * writer of the two — the library's `jsx` hint is the third writer on this name.
   *
   * It has to win: a consumer's `panda.config.ts` is the last layer in the chain, and a preset they
   * installed cannot outrank the config they wrote. Nothing here arranges that — the preset is a
   * preset and this is the config, so the ordering is Panda's own.
   */
  theme: {
    extend: {
      recipes: { button: { base: { textTransform: "lowercase" } } },
    },
  },
});
