# Progress

**Read this first in a fresh session.** Then [concepts/index.md](concepts/index.md) for what has
been validated, and [notes/verified-facts.md](notes/verified-facts.md) before researching anything.

This file holds the **present state only**. Past sessions are in `git log`, which is a more accurate
history than one maintained by hand.

## Where we are

Phase: **the comprehension walk has not started.** 73 of 110 components are ported and green; none of
them has been walked. No concept is validated yet — [concepts/index.md](concepts/index.md) is empty
until L0 fills it.

The workflow itself landed on 2026-08-20: the loop, six new skills, `useArrowFunction` as a lint
rule, the branch-per-feature convention, and these three files. `CLAUDE.md` is the whole of it.

**New component ports are frozen** (`CLAUDE.md`, *The one rule*). The roadmap's checkboxes are the
port status and nothing else; they say nothing about what is understood.

## Next action

**L0 — derive the comprehension backlog.** Read the tree layer by layer and produce
[concepts/index.md](concepts/index.md): the numbered concept list, ordered so nothing is learned
twice, each row naming the files in *this repo* that rest on it.

*Facts are the agent's job* — L0 is delegated reading, and its output is what makes the rest
schedulable. It is a doc-only pass, so it commits straight to `develop`.

### The layer order, and the reading surface

The unit is **the mechanism, not the component**. 78 component folders rest on far fewer distinct
mechanisms, and walking them alphabetically would teach the same five things fifteen times.

| # | Layer | Where | src LOC |
|---|---|---|---|
| L1 | The styling seam, and why the hard constraint exists | `packages/panda-preset/src`, `packages/styled-system/panda.config.ts` | 2 762 |
| L2 | The Zag adapter — the fork, and what it withholds | `core/src/zag` (900), `core/src/machine-store` (62) | 962 |
| L3 | The spine — how a component is built at all | `core/src/factory` (294), `render-styled` (346), `recipe` (699), `system` (254), `render` (72), `render-strategy` (50) | 1 715 |
| L4 | Support modules | `core/src/presence` (123), `utils` (329), `environment` (74), `locale` (59), `internal` (106) | 691 |
| L5 | The four component families | `packages/chakra-ui-solid/src/components`, 78 folders | 18 741 |
| L6 | The test apparatus | `packages/internal-test-utils/src`, `vitest.config.ts`, `vitest-hydration-bridge.ts`, `scripts/check-*.mjs` | ~1 400 |
| L7 | The docs site | `apps/docs/src` — 630 files, 72 `.mdx` pages | — |

L5 does not get read linearly. It splits by [roadmap.md](roadmap.md)'s own four headings — styled
primitives and layout (25) · atomic-recipe (21) · multi-part, no machine (15) · machine components
(45) — and each family is understood through **one worked example plus a spot-check**.

### What a pass produces

| Output | Goes to |
|---|---|
| A concept whose QCM passed | a `validated` row + date in [concepts/index.md](concepts/index.md) |
| A measurement that cost time | a row in [notes/verified-facts.md](notes/verified-facts.md) |
| A finding — dead code, a defect, something contradicting a decision | the only implementation work the freeze allows; `feat/<name>`, red before green |
| A corpus note the measurement settles | corrected in the same commit, **including every other row it answers** (`CLAUDE.md`, the propagation rule) |

**Compatibility is not a cost here.** Nothing is published and there are no users, so a breaking
change to a shipped component costs the edit and the test run. Never argue a design on
future-compat grounds, and never offer a deprecation path.
