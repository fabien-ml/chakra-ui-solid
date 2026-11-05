# `hideMode: "activity"` is not shipped; hidden presence is `display: none` only

The React version's presence accepts `hideMode: "activity"`, which wraps children in React 19's `<Activity mode="hidden">` to keep the subtree mounted with effects paused. Solid has no equivalent, and it is not emulated with `<Show>`. Only the `display: none` behaviour ships. This is a "React to Solid" row on the migration page ([0036](0036-migration-page-delta-table.md)).
