import { chakraSolidPreset } from "@chakra-ui-solid/panda-preset";
import { defineConfig } from "@pandacss/dev";

/**
 * Panda's config for **our own** generated output — the `css()` / `cva()` / `sva()` runtime this
 * repo publishes, and the dev stylesheet the browser tests assert against.
 *
 * It is not the consumer's config and does not try to be: a consumer spreads `chakraConfig()` from
 * `@chakra-ui-solid/panda-preset`, which carries the knobs that must match this
 * one and leaves `include` and `outdir` to them. Two knobs differ deliberately, and both are
 * commented below.
 */
export default defineConfig({
  // Drops `@pandacss/preset-panda` — Panda's default *theme*. Without it Panda's token palette
  // merges alongside Chakra's, the two disagree about `colors.gray.*`, and the result is a theme
  // that is neither, with nothing to say so. It costs us none of Panda's *utilities*, because
  // `chakraSolidPreset` declares `@pandacss/preset-base` itself (`plan.md` §3.2).
  eject: true,
  // One entry. The chain underneath it — base preset, then Chakra's — is the preset's business
  // rather than this file's, which is what makes the same one-liner correct in a consumer's config.
  presets: [chakraSolidPreset],
  // Generates `jsx/is-valid-prop`, whose `isCssProperty` knows *our* utilities and tokens — the
  // standalone `@pandacss/is-valid-prop` package knows only Panda's defaults, so swapping it in
  // would make every custom style prop silently become a DOM attribute. It also switches on
  // Panda's default `jsxStyleProps: "all"`, which is what extracts style props from a plain
  // capitalized JSX component with no factory and no registration. The generated `jsx/index`
  // factory itself targets Solid 1.x and is never exported (`prior-art.md` §2.3).
  jsxFramework: "solid",
  // Unhashed class names, and it is load-bearing across the library/consumer boundary rather than
  // merely tidy: our published runtime computes `p_4`, and a consumer whose config hashes gets a
  // stylesheet carrying different names — every class we emit is then absent from their sheet,
  // silently. `chakraConfig()` is what stops that being constructable (`plan.md` §3.4).
  hash: false,
  preflight: true,
  // **Our own source only, for the dev stylesheet** Storybook and the browser tests render
  // against. It is not the consumer's extraction channel — that is the buildinfo `panda ship`
  // writes, which they add to their own `include`. Keeping the two apart is what stops a green
  // local suite from hiding a broken consumer (`plan.md` §4.1).
  include: ["../{system,components}/src/**/*.{ts,tsx}"],
  // Set explicitly so an inherited default cannot quietly drop a directory.
  exclude: [],
  outdir: "styled-system",
  // `importMap` is deliberately unset. It is the *consumer's* knob — it points their extractor at
  // our published package — and this config generates into its own package and imports by
  // relative path.
});
