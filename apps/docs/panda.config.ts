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
    // writes — a style config handed to `chakra()` inside a component — reach their extractor
    // through our published files rather than through their own globs.
    //
    // **Recipe variants do not come through here.** The plugin `defineChakraConfig()` appends emits
    // each recipe's variants for the components this app's own source imports, and this file
    // carries the `chakra()` half only: `scripts/ship-buildinfo.mjs` runs `panda ship` over the 129
    // built files at build time and drops the recipe entries, so what a consumer replays is 182
    // atomic style entries and nothing that could widen their recipe layer.
    //
    // One path rather than the recursive glob it replaces, and the difference is not only that it
    // is shorter to type. Panda routes a `.json` include straight to the encoder without firing
    // `parser:before`, so our own files can no longer look like a successful scan to the import
    // gate — a wrong `src` glob now prints the loud "0 components detected" line instead of
    // quietly producing a sheet with no recipes in it.
    "./node_modules/chakra-ui-solid/dist/panda.buildinfo.json",
    // Our own source, which is what a consumer's glob is. `.mdx` is in the list because a fenced
    // code block is not the only thing a content file carries — an MDX page may write JSX
    // directly, and a style prop Panda never scanned renders nothing and raises no error.
    "./src/**/*.{ts,tsx,mdx}",
  ],
  // The one opt-in this site needs, and the `responsive` knob's own worked example:
  // `dialog-with-responsive-size` writes `size={{ mdDown: "full", md: "lg" }}`, and the recipe
  // runtime answers that with `mdDown:dialog__content--size_full md:dialog__content--size_lg` —
  // classes no default `staticCss` run generates (`CLAUDE.md`, *silent unstyling*).
  //
  // **This app would survive without the line and a consumer's would not**, which is why it stays.
  // The literal is in *this* app's own scanned source, so Panda extracts it from the example file
  // and both classes appear either way — measured by deleting the line. That rescue is the `jsx`
  // tracking hint doing its job on `<Dialog.Root size={…}>`, and `preset.ts` writes out why it
  // cannot be relied on: a hint is a component *name*, so an alias, a wrapper or a re-export breaks
  // it silently. The opt-in is what holds in all four cases.
  //
  // It is a knob a consumer writes too, so the file stays the shape the install page documents.
  //
  // `separator-with-responsive-orientation` is the second, and it needs the same line for the same
  // reason: `orientation={{ base: "vertical", sm: "horizontal" }}` resolves to
  // `separator--orientation_vertical sm:separator--orientation_horizontal`, and the rule goes into
  // the recipe *body* as `["*", …]` — a body's `staticCss` is assigned over whatever the config
  // asked for that recipe, so the body is the only place a rule for one of ours lands, and the
  // `"*"` in front of it is what keeps the import gate's own entry for that recipe.
  responsive: { dialog: ["size"], separator: ["orientation"] },
  outdir: "styled-system",
});
