import { chakraConfig } from "@chakra-ui-solid/panda-preset";
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
    // The library channel: values *our* components name that a consumer's source never literally
    // writes — a style config handed to `chakra()` inside a component, recipe variants — reach
    // their extractor through our published files rather than through their own globs.
    //
    // A glob over `dist/` rather than a buildinfo artifact, because `tsdown` builds with
    // `transform.jsx: "preserve"`: what we publish IS JSX-preserved source, so a consumer's
    // extractor can read it the same way it reads their own `src`. It matches nothing until the
    // package is built, and nothing in it needs a rule until a component calls `chakra()`.
    "./node_modules/@chakra-ui-solid/components/dist/**/*.jsx",
    // Our own source, which is what a consumer's glob is. `.mdx` is in the list because a fenced
    // code block is not the only thing a content file carries — an MDX page may write JSX
    // directly, and a style prop Panda never scanned renders nothing and raises no error.
    "./src/**/*.{ts,tsx,mdx}",
  ],
  outdir: "styled-system",
});
