# Token and style-prop pages are generated

Two page families have no prose to write, so they are generated, never hand-written:

- **Token pages** render the installed preset's token groups: name, value, and the CSS custom property each compiles to. Chakra's Design Tokens group is eleven pages; `tokens` and `semantic-tokens` are Concepts pages with prose, not generated tables.
- **Style-prop pages** render the prop-to-CSS-property mapping from our utilities and the generated `isCssProperty`, so the list is our vocabulary. A hand-written list is wrong the first time an alias lands. Upstream declares sixteen in nav and holds seventeen in content (`divide` has a page and no nav entry); ours takes the seventeen.

Both regenerate on a preset bump, so they change in the same PR as the bump rather than months later.
