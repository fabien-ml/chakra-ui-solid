# Props tables are generated from TypeScript, never hand-written

Each component's props table is produced at docs build time from the library's own types: the headless layer's props, our own part props (`render`, `unstyled`, `as`, the style-prop surface) and the recipe's variant map with its `defaultVariants`. A hand-written table omits a new prop silently, and a reader concludes the prop does not exist. Whether a page shows a table is decided in [0018](0018-docs-props-table-policy.md).
