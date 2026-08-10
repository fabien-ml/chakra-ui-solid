import { css } from "@chakra-ui-solid/styled-system/css";

/**
 * The page frame's two custom properties, on the `<body>` class.
 *
 * **The one place on this site that is still `css()` beside a raw element, and it has to be**: the
 * element is `<body>`, which the root layout renders itself. Everything a component owns is `Box`
 * and style props — see `~/components/container`, which is what the old `containerClass` became.
 *
 * chakra-ui.com's shell is a sticky header of a known height with two sticky columns beside the
 * article, and every one of those three pieces measures itself against the header. Their theme
 * declares the two numbers as `globalCss` custom properties; ours cannot, because a consumer's
 * `panda.config.ts` is `chakraConfig()` plus `include`/`outdir` and nothing else — the docs app
 * writes the config it tells readers to write, and `check:docs-consumer-config` enforces that
 * (`docs-site.md` §1.1). So the same two properties are declared here instead, which is an ordinary
 * Panda rule in this app's own sheet.
 *
 * One height at every breakpoint, where theirs grows to 104px from `md`: their header has a second
 * row for picking a docs section, because their first row is a site-level nav over five content
 * types. This site has one, so the sections are the top bar and there is no second row.
 */
export const shellClass = css({
  "--header-height": "64px",
  "--content-height": "calc(100dvh - var(--header-height))",
  display: "flex",
  flexDirection: "column",
  minH: "100dvh",
  bg: "bg",
  // Their sidebar's current page, their tab underline and their link colour all read
  // `colorPalette`, and their docs set it to teal. Setting it once on the root is the token-level
  // way to inherit that everywhere rather than naming `teal.*` at each site.
  colorPalette: "teal",
});
