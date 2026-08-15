import { defineChakraConfig } from "../../../config";
import { fixtureSkin } from "./skin";

/**
 * A consumer's `panda.config.ts` with a skin on it, and the only thing that can answer the question
 * the `skin` key exists for: *does swapping it change the CSS a component's class names resolve
 * through?*
 *
 * It has to be a real Panda run rather than an assertion on what this config returns, because those
 * are two different things — a config declares a token table and Panda decides what a rule ends up
 * naming. The same reasoning `generated-css.test.ts` opens with.
 *
 * `defineChakraConfig` is imported from source rather than through the package's `exports` map: this
 * fixture lives inside the package it is testing, so `dist/` would be whatever was last built.
 */
export default defineChakraConfig({
  skin: fixtureSkin,
  include: ["./src/**/*.ts"],
  outdir: "styled-system-app",

  /**
   * The consumer's own word on a recipe the skin also wrote, and the third writer on
   * `theme.extend.recipes.button` — the library's `jsx` hint and the skin's delta are the other two.
   *
   * It has to win: a consumer's `panda.config.ts` is the last layer in the chain, and a skin they
   * installed cannot outrank the config they wrote. Nothing here arranges that any more — the skin
   * is a preset and this is the config, so the ordering is Panda's own.
   */
  theme: {
    extend: {
      recipes: { button: { base: { textTransform: "lowercase" } } },
    },
  },
});
