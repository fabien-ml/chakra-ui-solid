# The reference checkouts

`__reference__/` is gitignored. `pnpm references` fills it: it clones each missing source, moves
each one to the tip of its branch, and applies its sparse checkout. `scripts/sync-references.sh` is
the only list of the sources. Run it after cloning the repo and when claiming an issue.

| Folder | Source, branch | Read for |
|---|---|---|
| `chakra-ui/` | `chakra-ui/chakra-ui`, `main` | what a component does and exposes: `packages/react/src/components/<name>`, its docs page in `apps/www`, its examples in `apps/compositions`. Chakra v4's design notes are on the `v4` branch: `git -C __reference__/chakra-ui show origin/v4:design-notes/<file>` |
| `chakra-ui-v4-poc/` | `Adebesin-Cell/chakra-ui`, `feat/v4-static-factory` | the only code of Chakra v4's styling engine on Panda 2 (closed PR chakra-ui#10957) |
| `ark/` | `chakra-ui/ark`, `v6` | the headless parts we build on: `packages/solid`, and `packages/react` for what Chakra's React parts receive |
| `zag/` | `chakra-ui/zag`, `v2` | the Solid 2 adapter in `packages/frameworks/solid`, and the machines Ark runs |

A reference says what a component must do. It never says how to write it in Solid: React's shape
answers questions Solid does not ask, so the Solid code is designed from the need, not transposed.

A missing path is the sparse checkout working. Read a pruned file with
`git -C __reference__/<folder> show HEAD:<path>`.
