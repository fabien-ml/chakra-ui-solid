# Progress

**Read this first in a fresh session.** Then [concepts/index.md](concepts/index.md) for what is
already validated, and [notes/verified-facts.md](notes/verified-facts.md) before researching
anything.

This file holds the **present state only**. Past sessions are in `git log`, which is a more accurate
history than one maintained by hand.

## Where we are

Phase: **porting.** 73 of 110 components are shipped and green; 37 rows are left, 33 of them machine
components. [roadmap.md](roadmap.md) is the work again, one row at a time.

**The comprehension freeze ended on 2026-08-27.** It ran from 2026-08-20 and validated one concept,
C1. What replaced it, in `CLAUDE.md`, *The one rule*:

| | |
|---|---|
| A concept a port turns on | taught **in that port**, before the plan reaches the decision that needs it, and stamped in [concepts/index.md](concepts/index.md) |
| A concept no port ever turns on | taught at **stabilization**, the last phase of [roadmap.md](roadmap.md) |
| The 73 already shipped | still a debt, still real. Paid at stabilization, minus whatever the ports pay on the way |

**The loop gained a first step the same day: `investigate`.** Reading the sources comes before
deciding what to teach, because teaching before investigating is teaching a guess. It produces two
lists — the decisions left to settle, and the concepts those decisions turn on — and the second is
read off the first. Ported from `limen-ui`; the detail is `CLAUDE.md`, *Investigation comes first*.

**L0 ran on 2026-08-20.** [concepts/index.md](concepts/index.md) is what it produced — **77
concepts** in ten sections, ordered so nothing depends on a concept numbered after it, 76 still
`not started`. It also produced [notes/l0-findings.md](notes/l0-findings.md) (30 items, none fixed)
and five rows in [notes/verified-facts.md](notes/verified-facts.md).

**L0's findings stay parked.** A port that reaches the code an item sits in is when it gets picked
up, and then it is that port's `feat/<name>`. Do not open one off the list, and do not re-propose
the list.

## Next action

**Start the `accordion` port, at `investigate`.** `roadmap.md` line 67 — `S:accordion · 5/6 · M`,
five anatomy parts against six recipe slots, machine-owned visibility. Its note claims the row waits
on nothing: family M's render strategy shipped with `collapsible`, and the `aria-controls` gate is
Accordion's own line rather than the machine's. **That note is a prediction** (`CLAUDE.md`, the port
rule) — `investigate` is what turns it into fact or corrects it.

The step order, and nothing skipped:

    investigate → explain → validate knowledge → plan → validate plan → implement → review

1. `investigate` — `__reference-impl__/chakra-ui/packages/react/src/accordion/`, every component
   importing it, the **installed** `node_modules/@zag-js/accordion`, and upstream's docs page. Out
   come the two lists, into the port's plan file, every claim carrying its path.
2. Each concept on the second list that is not already `validated` runs its own round — explain,
   then a QCM with the answer order randomized. Wrong or dismissed → re-explain lower and slower.
3. Then the plan, `grill-me`, and the phases.

Nothing is implemented before both validations pass. If the plan reaches a decision resting on a
concept nobody taught, that is the loop's own edge: stop, teach it, resume.

## What a port produces, besides the component

| Output | Goes to |
|---|---|
| A concept whose QCM passed | a `validated` row + date in [concepts/index.md](concepts/index.md), its own commit on the port's branch |
| A measurement that cost time | a row in [notes/verified-facts.md](notes/verified-facts.md) |
| A corpus note the measurement settles | corrected in the same commit as the code, **including every other row it answers** (`CLAUDE.md`, the propagation rule) |
| A defect found in an already-shipped component | its own `feat/<name>` if the port cannot carry it; otherwise a row under `roadmap.md` §*Stabilization* |

**Compatibility is not a cost here.** Nothing is published and there are no users, so a breaking
change to a shipped component costs the edit and the test run. Never argue a design on
future-compat grounds, and never offer a deprecation path.
