# The migration page is a delta table with a Cause column

The page for readers arriving from the React version lists every observable difference in one table, and each row carries a **Cause**: either "no runtime CSS-in-JS" (permanent, it follows from [0067](0067-zero-published-css.md)) or "React to Solid" (it would exist in any Solid port). An undifferentiated list makes every framework consequence look like a cost of the styling decision, and lets a reader believe a different styling choice would have brought `asChild` back.

The page also lists what is unchanged (part names, variant names, `defaultVariants`, tokens, the `data-*` vocabulary, import paths), because a page that only lists differences implies the whole API moved. Per-component corrections (`For` and `Show` are Solid's own, `Portal` ships without `disabled`, charts are absent because of a dependency, not a style) sit beside the table so a reader who finds one of them in our exports does not stop trusting the page.

Only a difference a consumer can observe belongs here ([0050](0050-port-rule-observable-difference.md)).
