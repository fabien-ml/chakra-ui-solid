import { chakraConfig } from "@chakra-ui-solid/preset";
import { defineConfig } from "@pandacss/dev";

/**
 * The docs app's Panda config — **a consumer's config, not a privileged in-repo one**.
 *
 * This is the shape `plan.md` §3.4 documents and the install page tells a reader to write:
 * `chakraConfig()` spread, plus `include` and `outdir`, and nothing else. The knobs that have to
 * match our published runtime — `hash` above all — arrive inside `chakraConfig()`, so there is no
 * knob here to get wrong. `check:docs-consumer-config` asserts exactly that shape, because the
 * moment this file grows a hand-written knob the site stops being evidence that a consumer's build
 * works and becomes decoration (`docs-site.md` §1.1).
 *
 * Nothing imports the repo's own dev stylesheet either. `packages/styled-system/styled-system/
 * styles.css` is generated from *our* source for the browser tests and Storybook; the sheet this
 * app renders against is the one the `cssgen` script below writes from *this* config, over *this*
 * app's source. Those are two different Panda runs on purpose.
 */
export default defineConfig({
  ...chakraConfig(),

  include: [
    // The buildinfo channel: values *our* components name that a consumer's source never literally
    // writes — recipe variants above all — reach their extractor through this file rather than
    // through their own globs (`plan.md` §4.1, §3.4).
    //
    // It matches nothing today, and that is a fact rather than an oversight:
    // `@chakra-ui-solid/components` emits no buildinfo until it has a recipe to declare, which is
    // step 4. The path is written now so this file is already the documented consumer shape, and
    // it is the same step at which `check:css-coverage` against this app's sheet starts meaning
    // anything — a coverage check with no buildinfo to read has nothing to be wrong about.
    "./node_modules/@chakra-ui-solid/components/dist/panda.buildinfo.json",
    // Our own source, which is what a consumer's glob is. `.mdx` is in the list because a fenced
    // code block is not the only thing a content file carries — an MDX page may write JSX
    // directly, and a style prop Panda never scanned renders nothing and raises no error.
    "./src/**/*.{ts,tsx,mdx}",
  ],
  outdir: "styled-system",
});
