import { css } from "@chakra-ui-solid/styled-system/css";

/**
 * Typography for MDX-authored prose, as one Panda class with descendant selectors.
 *
 * There is no typography plugin here and there will not be one: this is a consumer app, so every
 * rule below is generated into **this app's own stylesheet** by its own Panda run over its own
 * source. That is the same path a reader's app takes, which is the point of the docs app existing
 * at all (`docs-site.md` §1.1).
 */
export const proseClass = css({
  color: "fg",
  lineHeight: "relaxed",

  "& h1": { fontSize: "4xl", fontWeight: "bold", letterSpacing: "tight", mb: "3" },
  "& h2": {
    fontSize: "2xl",
    fontWeight: "semibold",
    letterSpacing: "tight",
    mt: "10",
    mb: "3",
    pt: "2",
    borderTopWidth: "1px",
    borderColor: "border",
  },
  "& h3": { fontSize: "lg", fontWeight: "semibold", mt: "8", mb: "2" },
  "& h4": { fontSize: "md", fontWeight: "semibold", mt: "6", mb: "2" },
  "& p": { my: "4", color: "fg.muted" },
  "& ul": { my: "4", pl: "6", listStyleType: "disc", color: "fg.muted" },
  "& ol": { my: "4", pl: "6", listStyleType: "decimal", color: "fg.muted" },
  "& li": { my: "1" },
  "& a": { color: "colorPalette.fg", textDecoration: "underline" },
  "& strong": { fontWeight: "semibold", color: "fg" },
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
    borderLeftWidth: "3px",
    borderColor: "border.emphasized",
    pl: "4",
    my: "4",
    color: "fg.muted",
  },
  "& table": { width: "full", my: "6", fontSize: "sm", borderCollapse: "collapse" },
  "& th": {
    textAlign: "start",
    fontWeight: "semibold",
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
  "& hr": { borderColor: "border", my: "8" },
});
