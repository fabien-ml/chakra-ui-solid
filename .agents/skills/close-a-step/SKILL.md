---
name: close-a-step
description: What closing a build step in chakra-ui-solid takes — the step's own gate, the ledger entry, the regenerated anchor index, and the commit written at the review. Use when a phase or step is finished and about to be reviewed or committed.
---

# Close a step

- Resolve every `§` below through `__internal__/INDEX.md` — line range and size per anchor.

## 1. The gate

- `decisions.md` §5 — the build order, with this step's gate cited.
- `definition-of-done.md` §0 — the gate rule; §3.0 what every batch shares.
- `definition-of-done.md` §3.1 — the probe phase; §3.2 the batches.
- `definition-of-done.md` §8 — the assumption register, for anything this step closes.
- `definition-of-done.md` §7 — row 7.6, on what the author opens before a phase closes.
- `roadmap.md` §9 — where the build order comes from; §9.3 the ordering constraints.

## 2. The ledger entry

- `decisions.md` §1 — the entry shape, fixed once.
- `decisions.md` §3 — the table, and which file under `__internal__/decisions/` it goes in.
- `decisions.md` §0.2 — changing a decision after the pass; §4 the reversals, in one place.
- `decisions.md` §0 — the division of labour: which surface a sentence belongs on.

## 3. Commit

- `definition-of-done.md` §1 — rules 1.10 to 1.13, the four whose subject is the commit.
- `pnpm docs:index`, `check:doc-index` — the index, regenerated in this commit.
- `check:skill-pointers`, `check:context-budget`, `check:commit-trailers` — before the gate.
- `pnpm cssgen`, then `check:declaration-support` — `testing.md` §8.4.
- `CLAUDE.md` — Git conventions: when a commit is made, and what it carries.
