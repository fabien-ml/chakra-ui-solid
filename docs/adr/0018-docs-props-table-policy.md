# A props table appears when the component adds its own props

A stated divergence from the 1:1 rule ([0009](0009-docs-content-1-to-1-with-upstream.md)). Every component page ends with `<PropsTable component="<dir>" />`, and the component decides what renders:

- If it declares props of its own, the table lists exactly those.
- If it declares none, no table renders: just its interface name and a sentence naming what it inherits plus the three props every component takes.

`as`, `render` and `unstyled` are never table rows: they arrive from the library-wide styling props, not from the component. They are documented once, on the Composition concepts page (*The as Prop*, *The render Prop*, *The unstyled Prop*), mirroring upstream's composition page whose `asChild` section ours replaces. `BoxProps` is the one table showing `as` and `render`, because Box declares them itself.

Why: showing library-wide props as if each component declared them put them in every table, while components with real props of their own had no table at all when upstream's page had none. The table is generated, never hand-written ([0056](0056-props-tables-generated.md)).
