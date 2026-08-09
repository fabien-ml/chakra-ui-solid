import { css } from "@chakra-ui-solid/styled-system/css";

/**
 * Typography for MDX-authored prose, as one Panda class with descendant selectors.
 *
 * The scale is chakra-ui.com's, read off `apps/www/components/mdx/*` and expressed in the same
 * **em-relative** units they use, so a heading tracks the surrounding text rather than a fixed
 * step. Colours and radii are tokens; nothing here is a literal that the preset already names.
 *
 * `scrollMarginTop` on every heading is not decoration: the header is sticky, so an in-page
 * anchor without it lands the heading underneath the header and the reader sees the paragraph
 * after the one they clicked to.
 *
 * There is no typography plugin here and there will not be one: this is a consumer app, so every
 * rule below is generated into **this app's own stylesheet** by its own Panda run over its own
 * source. That is the same path a reader's app takes, which is the point of the docs app existing
 * at all (`docs-site.md` §1.1).
 *
 * No `& h1`: a page's title is frontmatter, rendered by the page header, so an `# H1` never
 * reaches the body (`docs-plan.md` §8.1).
 */
const headingScrollMargin = "calc(var(--header-height) + 1.5em)";

export const proseClass = css({
  color: "fg",

  "& h2": {
    color: "fg",
    fontSize: "1.3em",
    fontWeight: "semibold",
    letterSpacing: "-0.02em",
    lineHeight: "1.4em",
    mt: "1.6em",
    mb: "0.8em",
    scrollMarginTop: headingScrollMargin,
    "& code": { fontSize: "0.9em" },
    "& + *": { marginTop: "0" },
  },
  "& h3": {
    color: "fg",
    fontSize: "1.2em",
    fontWeight: "semibold",
    letterSpacing: "-0.01em",
    lineHeight: "1.5em",
    mt: "1.5em",
    mb: "0.4em",
    scrollMarginTop: headingScrollMargin,
    "& code": { fontSize: "0.9em" },
    "& + *": { marginTop: "0" },
  },
  "& h4": {
    color: "fg",
    fontWeight: "semibold",
    letterSpacing: "-0.01em",
    lineHeight: "1.5em",
    mt: "2em",
    mb: "0.8em",
    scrollMarginTop: headingScrollMargin,
    "& + *": { marginTop: "0" },
  },

  "& p": {
    color: "fg.muted",
    lineHeight: "1.75",
    my: "1em",
    _first: { marginTop: "0" },
    _last: { marginBottom: "0" },
  },
  "& strong": { fontWeight: "semibold", color: "fg" },

  "& ul, & ol": {
    my: "1em",
    ps: "1.5em",
    color: "fg.muted",
    "& ol, & ul": { my: "0.5em" },
  },
  "& ul > li": { listStyleType: "disc", ps: "0.4em" },
  "& ol > li": { listStyleType: "decimal", ps: "0.4em" },
  "& li": { my: "0.8em", _marker: { color: "fg.subtle" } },

  // No `& a` here. An anchor is styled by the `a` component in `~/mdx-components`, the way
  // chakra-ui.com styles its own — a descendant selector would also win against the cards and the
  // pagination, which render their own anchors inside this class.

  // `:not(pre code)` so an inline `code` gets the chip treatment and a fenced block does not —
  // the fence is styled by the code pane, and doubling the two produces a box inside a box.
  "& :not(pre) > code": {
    bg: "bg.muted",
    borderRadius: "l1",
    px: "1",
    py: "0.5",
    fontSize: "0.875em",
    fontFamily: "mono",
    color: "fg",
  },

  "& blockquote": {
    borderInlineStartWidth: "3px",
    borderColor: "border.emphasized",
    ps: "4",
    my: "1.285em",
    color: "fg.muted",
    "& p": { color: "fg.muted" },
  },

  "& table": { width: "full", my: "2em", fontSize: "sm", borderCollapse: "collapse" },
  "& th": {
    textAlign: "start",
    fontWeight: "semibold",
    color: "fg",
    borderBottomWidth: "1px",
    borderColor: "border",
    px: "3",
    py: "2",
  },
  "& td": {
    borderBottomWidth: "1px",
    borderColor: "border.subtle",
    px: "3",
    py: "2",
    color: "fg.muted",
    verticalAlign: "top",
  },

  "& hr": { borderColor: "border", my: "10" },

  // `rehype-pretty-code` wraps a fence in a `<figure>` and lifts ```` ```ts title="…" ```` into a
  // `<figcaption>`. Unstyled, the title reads as a stray line of prose above the block; joined to
  // it, it reads as the filename the snippet belongs in, which is the whole reason to write one.
  "& figure[data-rehype-pretty-code-figure]": { my: "1em" },
  "& [data-rehype-pretty-code-title]": {
    borderWidth: "1px",
    borderBottomWidth: "0",
    borderColor: "border",
    borderTopRadius: "l2",
    bg: "bg.muted",
    px: "4",
    py: "2",
    fontFamily: "mono",
    fontSize: "xs",
    color: "fg.muted",
  },
  "& [data-rehype-pretty-code-title] + pre": { borderTopRadius: "0" },
});
