# CLAUDE.md

**The operative index: the enforced rules, and a pointer to where each is argued.** Rules and pointers
only. **If an entry here needs a paragraph to justify it, the paragraph belongs in `__internal__/` and
the entry is a pointer to it.**

**Three surfaces, and nothing is written in two of them.** This file: *what must I do, and where is the
rule written down?* `__internal__/decisions.md`: *what was decided, what was rejected, and when?* The
other ten `__internal__` documents: *why is it right?* The full split is `decisions.md` §0.

**When two documents disagree, the later phase wins**; within a phase, a measurement beats a
prediction; and the approved `brief-plan` loses to all of them. — `decisions.md` §7.

---

## 0. The governing constraint: no CSS at runtime, no CSS in the package

One rule at two boundaries. **Everything else in this repo is justified from it, and nothing may
weaken it** — a change that needs it relaxed is a change to `__internal__/plan.md` §0 first, at a
review gate.

**Nothing writes a stylesheet at runtime.** No Emotion, styled-components, goober or stitches — not
as a dependency, not anywhere in the dependency closure. And none of our own code calls
`createElement("style")` or `insertRule`, touches `adoptedStyleSheets`, or maintains a sheet. Those
are two separate checks and **neither may be merged into the other** — `plan.md` §0;
`zag-solid-adapter.md` §5.1; `testing.md` §5.

| | Scope | Judged by | Script |
|---|---|---|---|
| **The rule proper** | Our source **and the whole dependency closure** | What a dependency **is** — a manifest check | `check:no-cij-manifest` — **live**, in the `constraint` job |
| **Hygiene on ourselves** | `packages/*/src/**` and `apps/docs/src/**` only | What our code **does** — a grep | `check:no-runtime-sheet` — **live**, in the `constraint` job |

**Allowed, and routinely needed:** the DOM `style` attribute (Zag's `normalizeProps` — the function
turning a state machine's framework-agnostic prop bag into Solid props — emits `style` objects for
floating positioning, slider thumbs, progress fills); inline CSS custom properties; Panda's `css` /
`cva` / `sva` / `cx`, which only compute strings. — `plan.md` §0.3.

**We publish no `.css` file, ever.** No package's `exports`, `files` or `style` field points at one.
Panda in the consumer's build is a hard prerequisite, enforced by a non-optional `peerDependency` on
`@pandacss/dev` rather than by a sentence in the README. — `plan.md` §4.4.

**The hazard both create — read this before touching anything styling-related.** A Panda class whose
CSS was never generated renders nothing and raises no error: no warning, no console message, no
failing test. An unstyled component and a green suite look identical. Two standing consequences:

- **A style value must be statically extractable, declared in `staticCss`** (the config key that
  pre-generates rules for values no source file literally writes), **or routed through a CSS custom
  property** — `style={{ "--w": w }}` with `w="var(--w)"`. There is no fourth option. — `plan.md` §3.5.
- **Tests assert computed styles, never class names.** `classList.contains("p_4")` passes on a
  completely unstyled element. — `plan.md` §0.2.

`chakra-ui-solid` is **not a 1:1 port**, and the phrasing is fixed: *"as close to Chakra v3 parity as
is achievable without runtime CSS-in-JS."* The parity delta is `plan.md` §0.4 — cite a row, never
re-argue it.

## The port rule

**No accessibility behavior beyond what Zag ships. Nothing invented that Chakra UI v3 does not have.
SolidJS idioms excepted** — those are what the port *is*. — `prior-art.md` §8.2.

- **Adding a fix Chakra does not have is a divergence**, even pointing the pleasant way.
  — `component-blueprint.md` §8.
- **Removing behavior Chakra has is the same divergence.** — `zag-solid-adapter.md` §5.3.
- **An inherited defect is fixed upstream, not locally** — that is the only route that also reaches the
  library we are porting. — `zag-solid-adapter.md` §8.

**A faithful port carries inherited axe allowances, and a correct port must not read as a regression.**
Every mounting test runs axe; allowances are enumerated per component and per rule in
`definition-of-done.md` §5, each citing an upstream issue; **an allowance that stops being needed
fails the test**. — `component-blueprint.md` §9.

## Reference use, and the expression tier

**Reading a reference for reasoning, public API shape, or an ARIA pattern owes nothing. Reproducing its
expression makes the file a derivative.** The test is a reading, not a predicate: *could someone diff
my file against theirs and see the same structure and sequence?* — `legal.md` §1.4, §2.1.

- **Ark is `what`, never `how`** — parts, props, prop names, machine wiring, edge cases. Never its
  composition style, never `asChild`. **Ark is not a dependency and never will be.**
- **`@chakra-ui/react`'s `styled-system/` is API shape only, never implementation.** It is an Emotion
  serializer; porting its resolution pipeline violates §0 long before it raises a licensing question.
  — `plan.md` §0.5.
- **`@chakra-ui/panda-preset`: depend, do not vendor.** Add keys on top of it; never re-emit a recipe
  body or a token table. One measured exception — the `container` recipe body — and it is expression
  tier and carries the obligations to prove it. — `legal.md` §1.5; `plan.md` §3.3.
- **hope-ui carry-overs are ours** — same author, MIT — and still get a provenance note: path plus
  commit, no `NOTICE.md` row. **Fork on copy, both directions.** — `legal.md` §1.6.

**When the tier is expression, all of this lands in the same commit as the code** — both failure modes
are silent and green:

1. An entry in **`attribution.config.ts`** at the repo root, the registry every check reads
   — **live**, with the fork's seven entries.
2. An `@license` header naming the **upstream file**.
3. A row in the root `NOTICE.md` **and** in the owning package's.
4. `LICENSE` and `NOTICE.md` in that package's `package.json#files`.
5. `comments.legal` still pinned in `tsdown.config.base.ts`, **with its comment** — unpinned, the
   headers vanish from `dist/` and the published package becomes an unattributed derivative of the
   project we are porting, with a green build.

— `legal.md` §2.6; `testing.md` §9; `zag-solid-adapter.md` §7.3.

## Method

- **Measure the dependency; do not reason about its source.** A finding that says *"impossible"* or
  *"unfixable"* gets a probe before it reaches a verdict. A test whose premise is a defect gets run in
  isolation before it is believed. — `prior-art.md` §8.1.
- **A story is a deliverable, not a checkbox — open it.** A definition-of-done item verified only by a
  file-existence check is verified in name only. — `prior-art.md` §8.1; `definition-of-done.md` §0.
- **State the counting convention every time a volume figure is quoted** — **raw** (`wc -l`) or **code**
  (comments and blanks excluded) — and never compare across the two. — `prior-art.md` §0.4.
- **A retraction is a finding.** Record the reversal; do not overwrite the thing that was wrong.
  `decisions.md` §4 is where they live.

## Citing the two plans

**`plan.md` always means `__internal__/plan.md`** — P3's architecture, §0–§13. **The approved brief
plan is always `` `brief-plan` ``** — it is the only thing that owns `§4.1 doc N`, `§5 step N`,
`§8 assumption N`, `§9 QN`, `§2.11` and `§7 concern N`. Both documents have a §1.5, §2.4, §3.5, §4.1,
§5, §7 and §8 with different content in every case, so an unqualified citation sends the reader to the
wrong document. Never write `plan.md` for the brief plan, and never write a bare *"the plan"* for
either. — `decisions.md` §0.1, §7.2.

## Git conventions

**Never add a `Co-Authored-By: Claude`, any `Co-authored-by`, or "Generated with Claude Code" trailer
to a commit message.** Commit messages carry the change rationale only. — `check:commit-trailers`.

**One phase, one commit, reviewed before it is made.** Write the phase's files, stop, wait for
review — never commit ahead of it. The commit message is written *at* the gate, out of what the
review actually settled, not drafted alongside the files. Unrelated housekeeping (tooling, config,
vendored skills) gets its own commit, so the phase commit still reads as the phase. This holds for
the implementation pass as much as the document pass.

**A review that changes a decision re-plans the affected later phases before work continues.** An
approved plan is not a licence to run ahead of it.

## Replies lead with the answer, in plain language

**The reader is an intermediate JS/TS/SolidJS dev who doesn't know this repo's internals, Zag.js, or
Panda CSS.**

- **Answer first.** No preamble, no restating the question, no recap of what was just read.
- **Show, don't narrate.** A short code block, diff, or schema beats a paragraph; past ~5 lines of
  prose, what's missing is the example.
- **Gloss each repo term on first use in a session** — `_hk`, presence, `inert`, machine, anatomy,
  part component, slot recipe, compound variant, `staticCss` — in one clause, inline. A bare term
  the reader must go look up breaks this.

## Code style

The global code-style rules apply unchanged. Two additions this repo needs:

- **Comments stay for the hazards this repo tracks** — SSR/hydration, Solid 2.0, and silent unstyling
  (a Panda class whose CSS was never generated renders nothing and raises no error). JSDoc on public
  API stays.
- **A comment reads for the same reader as a reply** (above), so a hazard comment has to land with no
  repo knowledge: `// keyed on _hk, so an inserted sibling shifts the trigger's key` → `// Solid
  matches server and client nodes by position (its "_hk" key), so inserting any sibling before this
  one breaks hydration.` Applies to comments you write or touch, never a repo-wide sweep.

---

## The enforced-rule index

Every rule in this repo has a tier, and every tier row names the artefact that enforces it.
**`definition-of-done.md` is the register — when each must pass and what a failure means;
`testing.md` defines each artefact exactly once — its input, algorithm, failure output and blind
spots.** Nothing below is a second copy of either.

| Tier | Applies to | Where | The shape of it |
|---|---|---|---|
| **Per file** | Every file under `packages/*/src/` | `definition-of-done.md` §1 | Types and lint, the style contract, §0 compliance, attribution in the same commit, test-project registration |
| **Per component** | Every shipping row of the parity matrix | `definition-of-done.md` §2 | Axe through the register, computed-style assertions, coverage, an SSR→hydrate fixture, stories, the bundle budget, a docs page |
| **Per batch** | Each probe step and each of B1–B8 | `definition-of-done.md` §3 | The shared lines, plus what that batch proves that the previous one did not — **restated as a test, because prose about what a batch proves is not a gate** |
| **Per release** | Every publish | `definition-of-done.md` §4 | The exports map, externality, the Panda peer, the attribution checks, the disclaimer, resolution sync, bundle figures, changesets |
| **Unenforced, and labelled** | — | `definition-of-done.md` §7 | Conventions with no script, each naming what a reader is trusted to do. **Deleting an unenforceable rule is not the same as pretending it was enforced** |
| **Named, not yet written** | The 25 `check:*` the documents name and `scripts/` does not have | `definition-of-done.md` §7b | The census, taken mechanically: **44 named, 19 live, 25 unwritten, 0 unnamed.** Most cannot be written yet because their subject does not exist; **two rows of §1 are real gaps and are named as such.** A named script is not a running one, and eleven documents written before anything was built are full of both |

**CI groups them into jobs** so a red build names a category before anyone opens a log —
`testing.md` §12. **Two live registers** carry per-change contents rather than rules: the axe
allowances (`definition-of-done.md` §5) and the coverage allow-list (§6). **One assumption register**
(§8) holds every open assumption with its runnable gate and the step it runs at — and an assumption
without a gate is a finding rather than a formatting problem.

## The documents — one line each, by the question it answers

Eleven documents in `__internal__/`, plus this file.

| Document | The question it answers |
|---|---|
| `__internal__/plan.md` | **How is this thing built?** §0's constraint through the styling layer, the distribution model, the package graph and build mechanics. Settles Q2 and Q4 |
| `__internal__/prior-art.md` | **What is already known, and what is only assumed?** hope-ui's two branches re-measured, the scorecard and its retractions, the standing taxes. Sets the port rule and the methodology rule |
| `__internal__/zag-solid-adapter.md` | **What is milestone one, and when is it done?** The fork's file set, defects, deltas, §0 compliance audit, test plan, attribution checklist and upstream filings. Settles Q6 |
| `__internal__/component-blueprint.md` | **What shape is a component?** Machine instantiation through part components, precedence, the `recipeClass` seam, presence, the a11y baseline and SSR — then Dialog worked fully through. Settles Q7 |
| `__internal__/roadmap.md` | **What gets built, and in what order?** The parity matrix, every exclusion reasoned individually, the presence families, the floating seam, and the build order with a gate per step and batch |
| `__internal__/testing.md` | **How does each check work?** Every enforcing artefact defined exactly once — input, algorithm, failure output, blind spots |
| `__internal__/definition-of-done.md` | **When must it pass, and what does a failure mean for the change in front of me?** The four tiers, the two live registers, the assumption gates, the CI ownership, the unenforced conventions |
| `__internal__/docs-site.md` | **What docs exist, on what stack, and how do we know it works?** The app, the route map, the machinery pages share, the copyright and trademark boundaries, the build gate |
| `__internal__/docs-plan.md` | **What does each page say, in what order, and which settled decision does it render?** The page specs, the tier specs, and the component template |
| `__internal__/legal.md` | **What do we owe, to whom, and what may we say about Chakra?** License compatibility, the attribution mechanism, trademark, the brand decision and its exit ladder, upstream tracking |
| `__internal__/decisions.md` | **What was decided, what was rejected, and when?** The entries with their rejected alternatives, Q1–Q8 and their gates, the reversals, the build order, what the document pass left open, and the reconciliation log |

**Reference checkouts** live in `__reference-impl__/` — read-only, gitignored, never committed, and
never a dependency.
