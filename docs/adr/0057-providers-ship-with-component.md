# `RootProvider`, `PropsProvider` and `Context` ship with each component

They are rows in each component's batch, never a later sweep, which would mean about 131 namespace edits after the fact. Upstream carries `Context` on 43 components, `RootProvider` on 41 and `PropsProvider` on 47. The `useX` / `useXContext` hooks are exported from the component's own subpath (`chakra-ui-solid/dialog`), as upstream does, not from `./hooks`, which holds unrelated utility hooks. `RootProvider` needs the `useX` hook first, and `PropsProvider` is one cross-cutting mechanism in `core` plus a thin row per component. A component's docs page gains the matching sections in the same commit as the export.

A `Context` render prop is called in the part's body, so it must return JSX, or the read is untracked and freezes at mount.
