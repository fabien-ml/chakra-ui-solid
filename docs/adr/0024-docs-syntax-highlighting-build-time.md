# Code is highlighted at build time

Syntax highlighting is Shiki at build time through `rehype-pretty-code`, baked into the compiled MDX module. Headings get ids and the table of contents is extracted into a module export rather than computed in the browser.

A client-side highlighter ships a highlighter to every reader for content that never changes, and most create a `<style>` element on first render. That is what the project forbids of its own code ([0067](0067-zero-published-css.md)), and the docs site is the most visible place for it to appear: a reader who finds one there reasonably concludes the rule is negotiable.
