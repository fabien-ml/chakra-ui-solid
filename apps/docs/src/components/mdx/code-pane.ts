import { css, cx } from "@chakra-ui-solid/styled-system/css";

/**
 * Shiki's `--shiki-light` / `--shiki-dark` pair, resolved **once, here**.
 *
 * Shiki emits that pair per token rather than a committed colour (see `highlight-plugin.ts` and the
 * `rehype-pretty-code` config), so the mode switch is a **cascade** choice rather than a
 * re-highlight: two Panda rules, generated at build time into this app's own stylesheet, nothing
 * computed while the page runs.
 *
 * Three selectors, because a highlighted block arrives in two shapes and this class fits both: `&`
 * when it sits on the `<pre>` itself (an `.mdx` fence), `& pre` when it sits on a box holding
 * Shiki's own `<pre class="shiki">` (an example's source pane, the landing page's code panel), and
 * `& span` for the tokens either way. The rules used to be written out in each of the three files
 * that needed them.
 */
const shikiTokenColorClass = css({
  color: "var(--shiki-light)",
  "& pre": { color: "var(--shiki-light)" },
  "& span": { color: "var(--shiki-light)" },
  _dark: {
    color: "var(--shiki-dark)",
    "& pre": { color: "var(--shiki-dark)" },
    "& span": { color: "var(--shiki-dark)" },
  },
});

/** A fenced code block in an `.mdx` page: its own surface, so it draws its own border. */
export const codePaneClass = cx(
  shikiTokenColorClass,
  css({
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
  }),
);

/**
 * A box wrapping Shiki's own `<pre class="shiki">`, inside chrome that already has a border — a
 * `<Tabs.ContentGroup>` on an example, the panel box on the landing page. It contributes no border,
 * no rounding and no background: whatever it is nested in owns those, or the two disagree about
 * which one rounds the corner.
 */
export const embeddedCodePaneClass = cx(
  shikiTokenColorClass,
  css({ "& pre": { overflowX: "auto", p: "4", fontSize: "sm", lineHeight: "tall" } }),
);
