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
  // Mirrors `chakraConfig()`, and for the same reason: `chakra.button` is lowercase, so without
  // this Panda's `isUpperCase` fallback declines the tag and every factory element in our own
  // source — tests and stories included — emits zero rules with no error.
  jsxFactory: "chakra",
  // Unhashed class names, and it is load-bearing across the library/consumer boundary rather than
  // merely tidy: our published runtime computes `p_4`, and a consumer whose config hashes gets a
  // stylesheet carrying different names — every class we emit is then absent from their sheet,
  // silently. `chakraConfig()` is what stops that being constructable (`plan.md` §3.4).
  hash: false,
  preflight: true,
  // **Our own source only, for the dev stylesheet** Storybook and the browser tests render
  // against. It is not the consumer's extraction channel — that is our published `dist/`, which
  // they add to their own `include`. Keeping the two apart is what stops a green local suite from
  // hiding a broken consumer (`plan.md` §4.1).
  include: ["../{system,components}/src/**/*.{ts,tsx}"],
  // Set explicitly so an inherited default cannot quietly drop a directory.
  exclude: [],
  outdir: "styled-system",
  // The same `importMap` a consumer gets from `chakraConfig()`, and it has to be written out here
  // rather than left to the default. The default is `<outdir>/…`, which our `css()` imports match
  // only by accident — `"@chakra-ui-solid/styled-system/css".includes("styled-system/css")` — and
  // which the factory does not match at all: `chakra` is registered only when the module it was
  // imported from is in `importMap.jsx`, and ours is imported from `@chakra-ui-solid/system`. Left
  // unset, `jsxFactory` above would be inert here and every `<chakra.*>` in our own source would
  // emit nothing.
  importMap: [
    "@chakra-ui-solid/styled-system",
    { jsx: ["@chakra-ui-solid/system", "@chakra-ui-solid/components"] },
  ],
});
