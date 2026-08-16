import { css } from "../../../styled-system/css";

/**
 * Typography for MDX-authored prose — one class per tag, worn by the element `~/mdx-components`
 * renders for that tag.
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
 * ## Why these are not descendant selectors on the wrapper
 *
 * As `& p` and `& h2` on {@link proseClass} these rules reached **everything inside an article**,
 * and an article contains more than prose: `<Example>` renders its live preview inside the same
 * wrapper, so a docs example's `<Text>` was painted `fg.muted` over its own `color` prop and its
 * `<Heading>` was resized to `1.3em` over the recipe's step. Both directions are lost causes for
 * the component:
 *
 * - against a style prop, `.\[\&_p\]\:c_fg\.muted p` is (0,1,1) and the atomic class is (0,1,0),
 *   and both sit in `@layer utilities`
 * - against a recipe, `@layer utilities` is above `@layer recipes` and layer order ignores
 *   specificity entirely
 *
 * The same collision hit the props table and the framework cards, which also render inside the
 * article. Styling the element the provider renders is the fix that was already applied to `a` and
 * `table` for the smaller version of this — see {@link mdxTableClass}.
 *
 * No `h1`: a page's title is frontmatter, rendered by the page header, so an `# H1` never reaches
 * the body (`docs-plan.md` §8.1).
 */
const headingScrollMargin = "calc(var(--header-height) + 1.5em)";

export const proseTagClasses: Record<string, string | undefined> = {
  h2: css({
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
  }),
  h3: css({
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
  }),
  h4: css({
    color: "fg",
    fontWeight: "semibold",
    letterSpacing: "-0.01em",
    lineHeight: "1.5em",
    mt: "2em",
    mb: "0.8em",
    scrollMarginTop: headingScrollMargin,
    "& + *": { marginTop: "0" },
  }),

  p: css({
    color: "fg.muted",
    lineHeight: "1.75",
    my: "1em",
    _first: { marginTop: "0" },
    _last: { marginBottom: "0" },
  }),
  strong: css({ fontWeight: "semibold", color: "fg" }),

  // `& > li` rather than a class on `li`, because the marker is the one thing an `li` cannot know
  // on its own — it is disc or decimal according to which list it sits in.
  ul: css({
    my: "1em",
    ps: "1.5em",
    color: "fg.muted",
    "& ol, & ul": { my: "0.5em" },
    "& > li": { listStyleType: "disc", ps: "0.4em" },
  }),
  ol: css({
    my: "1em",
    ps: "1.5em",
    color: "fg.muted",
    "& ol, & ul": { my: "0.5em" },
    "& > li": { listStyleType: "decimal", ps: "0.4em" },
  }),
  li: css({ my: "0.8em", _marker: { color: "fg.subtle" } }),

  blockquote: css({
    borderInlineStartWidth: "3px",
    borderColor: "border.emphasized",
    ps: "4",
    my: "1.285em",
    color: "fg.muted",
    "& p": { color: "fg.muted" },
  }),

  hr: css({ borderColor: "border", my: "10" }),
};

/**
 * An inline `code`'s chip, worn by the `code` component in `~/mdx-components`.
 *
 * Kept out of {@link proseTagClasses} because it is the one tag whose styling depends on where it
 * sits: a fence renders `pre > code` too, and giving that one the chip puts a box inside the code
 * pane's box. The provider tells them apart by the `data-language` `rehype-pretty-code` writes on
 * the fenced one — a runtime test rather than a `:not(pre > code)` selector, which would raise the
 * chip to (0,1,2) and beat the `& code` font-size a heading sets on its own inline code.
 */
export const mdxInlineCodeClass = css({
  bg: "bg.muted",
  borderRadius: "l1",
  px: "1",
  py: "0.5",
  fontSize: "0.875em",
  fontFamily: "mono",
  color: "fg",
});

/**
 * What is left on the article wrapper: an inherited base colour, and the parts of a highlighted
 * fence that only `rehype-pretty-code` ever emits.
 *
 * Those three selectors are keyed on `data-rehype-pretty-code-*`, so unlike a bare `& figure` they
 * cannot reach anything an example or the site's own chrome renders — which is the property the
 * tag classes above had to be rewritten to get.
 *
 * `rehype-pretty-code` wraps a fence in a `<figure>` and lifts ```` ```ts title="…" ```` into a
 * `<figcaption>`. Unstyled, the title reads as a stray line of prose above the block; joined to it,
 * it reads as the filename the snippet belongs in, which is the whole reason to write one.
 */
export const proseClass = css({
  color: "fg",

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

/**
 * A `remark-gfm` table's typography, worn by the `<table>` itself rather than reached from
 * `proseClass` — chakra-ui.com does the same, in `components/mdx/table.tsx`.
 *
 * As `& table` in `proseClass` these rules also hit the props table, which puts its own table
 * inside a bordered box: the 2em margin landed *inside* the border as a band of empty space above
 * and below the rows, and `& th`/`& td` outranked the cells' own padding, because a descendant
 * selector beats the single-class rule Panda emits for a style prop. Same hazard the anchor has,
 * same fix — style the element the provider renders, not every element beneath the article.
 */
export const mdxTableClass = css({
  width: "full",
  my: "2em",
  fontSize: "sm",
  borderCollapse: "collapse",

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
});
