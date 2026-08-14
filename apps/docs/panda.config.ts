import { defineChakraConfig } from "@chakra-ui-solid/panda-preset";

/**
 * The docs app's Panda config — **a consumer's config, not a privileged in-repo one**.
 *
 * This is the shape the install page tells a reader to write: `defineChakraConfig()` with `include`
 * and `outdir`, and nothing else. There is no `defineConfig` import and no spread, because the knobs
 * that have to match our published runtime — `hash` above all — are set inside the call and are a
 * type error to pass. The moment this file grows a hand-written knob the site stops being evidence
 * that a consumer's build works and becomes decoration (`docs-site.md` §1.1).
 *
 * Nothing imports the repo's own dev stylesheet either. `packages/styled-system/styled-system/
 * styles.css` is generated from *our* source for the browser tests and Storybook; the sheet this
 * app renders against is the one the `cssgen` script below writes from *this* config, over *this*
 * app's source. Those are two different Panda runs on purpose.
 */
export default defineChakraConfig({
  include: [
    // The library channel: values *our* components name that a consumer's source never literally
    // writes — a style config handed to `chakra()` inside a component, recipe variants — reach
    // their extractor through our published files rather than through their own globs.
    //
    // A glob over `dist/` rather than a buildinfo artifact, because `tsdown` builds with
    // `transform.jsx: "preserve"`: what we publish IS JSX-preserved source, so a consumer's
    // extractor can read it the same way it reads their own `src`. It matches nothing until the
    // package is built, and nothing in it needs a rule until a component calls `chakra()`.
    "./node_modules/chakra-ui-solid/dist/**/*.jsx",
    // Our own source, which is what a consumer's glob is. `.mdx` is in the list because a fenced
    // code block is not the only thing a content file carries — an MDX page may write JSX
    // directly, and a style prop Panda never scanned renders nothing and raises no error.
    "./src/**/*.{ts,tsx,mdx}",
  ],
  // The one opt-in this site actually needs, and the `responsive` knob's own worked example:
  // `dialog-with-responsive-size` writes `size={{ mdDown: "full", md: "lg" }}`, and the recipe
  // runtime answers that with `mdDown:dialog__content--size_full md:dialog__content--size_lg` —
  // classes no default `staticCss` run generates. Without this line the example renders with no
  // size rules at any width and nothing errors (`CLAUDE.md`, *silent unstyling*).
  //
  // It is a knob a consumer writes too, so the file stays the shape the install page documents.
  responsive: { dialog: ["size"] },
  outdir: "styled-system",
});
