# Progress

**Read this first in a fresh session.** Then [concepts/index.md](concepts/index.md) for what has
been validated, and [notes/verified-facts.md](notes/verified-facts.md) before researching anything.

This file holds the **present state only**. Past sessions are in `git log`, which is a more accurate
history than one maintained by hand.

## Where we are

Phase: **the comprehension walk has a backlog and no validated concept yet.** 73 of 110 components
are ported and green; none of them has been walked. L0 read the tree and produced the 77 rows of
[concepts/index.md](concepts/index.md); every one is still `not started`, because a row turns
`validated` only on a passed QCM.

The workflow itself landed on 2026-08-20: the loop, six new skills, `useArrowFunction` as a lint
rule, the branch-per-feature convention, and these three files. `CLAUDE.md` is the whole of it.

**New component ports are frozen** (`CLAUDE.md`, *The one rule*). The roadmap's checkboxes are the
port status and nothing else; they say nothing about what is understood.

**L0 ran on 2026-08-20.** [concepts/index.md](concepts/index.md) holds the backlog — **77 concepts**
in ten sections, ordered so nothing depends on a concept numbered after it. The pass also produced
[notes/l0-findings.md](notes/l0-findings.md) (30 items, none fixed) and five rows in
[notes/verified-facts.md](notes/verified-facts.md).

**L0's findings stay parked until the walk surfaces them** — decided 2026-08-20. A concept round
that reaches the code an item sits in is when it gets picked up, and then it is that round's
`feat/<name>`. Do not open one off the list, and do not re-propose the list.

## Next action

**Run C1 through the loop.** *Panda writes the CSS at build time; the runtime only recomputes the
name the rule was generated under* — `components/box/box.tsx`, `core/src/system/system.tsx`,
`styled-system/panda.config.ts`, `components/box/__tests__/factory-extraction.test.ts`.

One concept, one round: **explain → validate knowledge**. A diagram, a table, a snippet — never a
document. Then a QCM through `AskUserQuestion` with the answer order randomized. Wrong or dismissed
→ stop, re-explain lower and slower, re-ask. There is no round budget.

`Box` is the entry point because it is one line of authored code — `export const Box = chakra("div")`
— and its `__tests__/` folder is the only place in the repo where a mechanism and its complete
evidence sit together.

A passed QCM is a `validated` row + date in [concepts/index.md](concepts/index.md). Nothing else
changes; C1 through C13 are reading, not building.

### The layer order, and the reading surface

Kept because it is how the backlog is sectioned and how a re-read of any layer is scoped. The unit
is **the mechanism, not the component**: 78 component folders rest on 12 of the 77 rows.

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
