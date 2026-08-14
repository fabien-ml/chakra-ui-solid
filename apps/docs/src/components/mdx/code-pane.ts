import { css } from "@chakra-ui-solid/styled-system/css";

/**
 * The one class both code surfaces wear: fenced code inside an `.mdx` page, and the source pane
 * beside a live example.
 *
 * Shiki emits `--shiki-light` and `--shiki-dark` per token rather than a committed colour (see
 * `highlight-plugin.ts` and the `rehype-pretty-code` config), so the mode switch is a **cascade**
 * choice rather than a re-highlight: two Panda rules, generated at build time into this app's own
 * stylesheet, nothing computed while the page runs.
 */
export const codePaneClass = css({
  overflowX: "auto",
  borderWidth: "1px",
  borderColor: "border",
  borderRadius: "l2",
  bg: "bg.subtle",
  p: "4",
  fontSize: "sm",
  // `tall`, not Chakra v2's `relaxed` — the v3 preset renamed the scale, and an unknown token is
  // emitted as its own name (`line-height: relaxed`), which the browser drops with no error.
  lineHeight: "tall",
  color: "var(--shiki-light)",
  "& span": { color: "var(--shiki-light)" },
  _dark: {
    color: "var(--shiki-dark)",
    "& span": { color: "var(--shiki-dark)" },
  },
});
