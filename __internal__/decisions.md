# Decisions — the ledger

**Status:** written at P9, 2026-08-09, last of the document pass. Written **last on purpose**: a
ledger written up front records intentions, and this one records decisions
(`brief-plan` §4 sequencing rationale).

**What this document is.** Every decision the document pass made, **one entry each**, with the
alternatives that were rejected and *why not*, what the decision blocks or unblocks, the phase and
gate it was settled at, and the document section that owns its reasoning. It is a **record**, not an
argument: no entry re-derives its evidence, and every one cites a section instead.

**What it is not.** The reasoning — that lives in the ten documents beside this one. Nor the rules:
those are `CLAUDE.md`. **A rule never appears here and a rationale never appears there** (§0).

**How to use it.** Three questions it answers that nothing else does. *Was this already decided?* —
§3, by phase. *Why was the obvious alternative not taken?* — the **Rejected** line of the entry.
*Which open question closed where?* — §2. And two it answers for the implementation pass: *what did
the document pass leave open, and what unblocks it?* — §6; *what is the build order?* — §5.

**The ledger disagrees with itself in places, and that is the point.** Five decisions were reversed
during the pass and two were reversed twice; §4 lists them with the reversal visible. `legal.md` §3.3
sets the rule this follows: *a record that quietly agrees with itself is worth nothing later.*

**Vocabulary, once.** A **machine** is a `@zag-js/*` state machine — framework-agnostic behavior and
ARIA; its **anatomy** is its named parts, each of which becomes one **part component**
(`Dialog.Trigger`). A **recipe** is a Panda style definition with **variants**; a **slot recipe** is
the multi-part version, one style block per named **slot**. **`staticCss`** is the Panda config key
that pre-generates CSS for values no source file literally writes. **Presence** is enter/exit
lifecycle. **Silent unstyling** is this project's central hazard: a Panda class whose CSS was never
generated renders nothing and raises no error.

---

## 0. The division of labour — this file, `CLAUDE.md`, and the eleven `__internal__` documents

Three surfaces, three questions, and **nothing is written in two of them**:

| | `CLAUDE.md` | `decisions.md` (this file) | The other ten `__internal__` documents |
|---|---|---|---|
| Answers | **What must I do, and where is the rule written down?** | **What was decided, what was rejected, and when?** | **Why is it right?** |
| Contains | Enforced rules, one line each, and a pointer per rule | Decision entries — decision, rejected alternatives + *why not*, effect, gate, and a citation — **one file each under [`decisions/`](decisions/)**, indexed by §3's table | The evidence, the measurements, the argument, the code |
| Register | The enforced-rule index by tier, and the one-line-per-document index | Q1–Q8 (§2), the reversals (§4), the build order (§5), what is unsettled (§6), the reconciliation log (§7) | Each document's own registers — the axe allowances, the coverage allow-list, the assumption gates, the route map, the parity matrix |
| Never contains | A rationale. If an entry needs a paragraph to justify it, the paragraph belongs in `__internal__/` and the entry is a pointer to it | A rule, or an argument. It cites; it does not re-argue | A decision without its reasoning — the reasoning **is** the document |

**The seam between this file and `CLAUDE.md`** is that a rule and its decision are different objects.
*"Tests assert computed styles, never class names"* is a rule and lives in `CLAUDE.md`, pointing at
`definition-of-done.md` rule 2.3. *"We chose computed-style assertions over class-name assertions
because hope-ui's own suite asserted class names and that is compatible with a completely unstyled
element"* is a decision and lives here, pointing at `prior-art.md` §4.4. Neither file contains the
other's sentence.

**The seam between this file and the ten** is that a decision entry is a **pointer with its
alternatives attached**. The owning document holds the argument and is authoritative; this file holds
the shape of the choice — including the roads not taken, which is the part a document tends to drop
once it has settled. When they disagree, **the owning document wins and this ledger is the thing that
gets fixed**, exactly as `docs-plan.md`'s specs defer to their sources.

This mirrors two boundaries already drawn and is the third: `testing.md` (*how does the check work*)
↔ `definition-of-done.md` (*when must it pass*), and `docs-site.md` (*what exists, on what stack*) ↔
`docs-plan.md` (*what does the page say*).

**Document precedence, stated once for the whole set.** A later phase's document beats an earlier
one on any point they touch; that is what the *"what P\_ changes"* tables exist to record, and §7 is
where the earlier document was brought into line. Within a phase, the measurement beats the
prediction. The approved `brief-plan` is the oldest document in the set and loses to all of them.

### 0.1 Citing the two plans

`plan.md` is **`__internal__/plan.md`**, P3's architecture, §0–§13. The approved brief plan is
**`brief-plan`**, and it is the only thing that owns `§4.1 doc N`, `§5 step N`, `§8 assumption N`,
`§9 QN`, `§2.11` and `§7 concern N`. The convention is stated for authors in `CLAUDE.md`; the sites
it was applied to are §7.

### 0.2 Changing a decision after this pass

Nothing here is frozen. The implementation pass will falsify some of it — that is what steps 2 to 5
exist for, and §6 lists exactly which entries are waiting on a measurement.

**When a decision changes, it gets a new entry marked as a reversal — it does not get edited.** The
old entry stays, with the reversal visible, and §4 gains a row. `legal.md` §3.3's rule is the reason:
*a record that quietly agrees with itself is worth nothing later.* Four decisions in this pass were
reversed twice, and every one of those reversals is only legible because the first version was left
standing.

**What a change costs, so it is priced before it is made.** The ledger entry is the cheap part. The
expensive part is the same rule the document pass ran on: **a decision that changes re-plans the work
that depends on it, before that work continues.** The entry's *Effect* line is where you find out how
far that reaches, and its *Reasoning* line names the one document that has to be corrected.

---

## 1. The entry shape, fixed once

Every entry in §3 has exactly these five lines. A missing line means the decision is malformed, not
that the line was unnecessary.

> **D-00 · The decision, as a claim**
> — **Decision.** What was decided, in one sentence.
> — **Rejected.** Each alternative that was on the table, with *why not* in one clause. `—` only if
> there genuinely was no alternative, which is rare enough to be suspicious.
> — **Effect.** What it unblocks, what it blocks, what it costs.
> — **Settled.** The phase, its gate, the date; the open question it closes, if any.
> — **Reasoning.** The document section that owns the argument. Never the argument itself.

---

## 2. Q1–Q8 — the gate that settled each, and where the answer lives

`brief-plan` §4 maps every open question to a gate so that none is answered in the abstract. All
eight are closed.

| Q | Question | Settled at | Answer | Lives in |
|---|---|---|---|---|
| **Q1** | Brand and npm scope | **P1 gate, 2026-08-08** | `chakra-ui-solid`, under the owned `@chakra-ui-solid` scope. Mark-derived, deliberately, with `@solid-chakra` held as a pre-paid exit | `legal.md` §3.3.3 · **D-01** |
| **Q2** | How consumers get CSS for recipe variants their source never writes | **P3 gate, 2026-08-09** | Per-recipe `staticCss: ["*"]` through `theme.extend` in `@chakra-ui-solid/panda-preset`, plus an atomic `staticCss.css` block and ten `colorPalette` values. Two-rung fallback ladder; confirmed or refuted at step 4 | `plan.md` §1 · **D-23** |
| **Q3** | How loudly the parity delta is stated to end users | **P1 gate** (recorded), **P8** (placed) | Prominent — the fixed sentence in the README, `CLAUDE.md` and the docs home; the delta table with its **Cause** column on the migration page; the extraction guide as the loudest page on the site | `legal.md` §3.4; `plan.md` §0.4; `docs-plan.md` §1, §5 · **D-06** |
| **Q4** | Style-props API: Chakra-shape or Panda-shape | **P3 gate** | Panda-shape, with Chakra names aliased only where all three conditions of the aliasing rule hold — at most 95 names, the list itself a step-3 deliverable | `plan.md` §2 · **D-26** |
| **Q5** | Re-clone `zag` at `main` (1.43.0), keeping `v2` as a second worktree | **P1 gate** | Yes. Target **1.43.0**; `v2` kept as a secondary checkout, which is what let P4 prove the adapter byte-identical across the major | `legal.md` §0.1; `zag-solid-adapter.md` §2.3 · **D-05** |
| **Q6** | hope-ui carry-overs copied verbatim or re-derived | **P4 gate** | **Copied — and the question needed two answers.** The fork: copied from `ef91b69`, all fourteen files, attributed as a *third-party* MIT derivative with a standing upstream sync obligation. The hope-ui-owned items: copied per item, per ref, with a provenance note and no sync obligation in either direction | `zag-solid-adapter.md` §1 · **D-46**, **D-47** |
| **Q7** | Dialog or Accordion as the worked blueprint component | **P5 gate** | **Dialog** — the only candidate crossing every unevidenced seam at once. Accordion's one residual, the repeated part, was assigned to P6 and settled there | `component-blueprint.md` §0 · **D-57** |
| **Q8** | Private or public repo at first commit | **P1 gate, 2026-08-08** — recorded at **P9**, per `brief-plan` §4 | **Private**, on a personal GitHub account, **no GitHub organization** for either owned name. What it affects: branch protection, CI secrets, and whether the README disclaimer is load-bearing on day one — it is, independently of this, so it is already written | `legal.md` §3.5, §6 · **D-02** |

**Q8 is recorded, not decided, and the distinction matters.** P1 settled it on the evidence in
`legal.md` §3.3.3 and §3.5; P9's job at this gate was to make sure the answer is findable from the
question rather than only from the section that happens to contain it. The same sweep produced the
other seven rows.

---

## 3. The ledger

**One file per entry, under [`decisions/`](decisions/).** 163 decisions, D-01 … D-163, in fifteen
files grouped by the phase that settled them. Reversals are marked **⟲** and collected in §4.

**The anchors did not move when the bodies did.** `` `decisions.md` §3.13 `` still names the S3
entry, and **an entry's file is named for its anchor** — `§3.13` is `decisions/3.13-…`, zero-padded
so the directory sorts in ledger order. The table below maps every one, and `INDEX.md` carries each
entry's line range and size.

**Inside an entry file, an unqualified `§N` is still this document's section** — `§5` is the build
order, `§7` the reconciliation log — and a `§3.N` is a sibling entry, linked at the two places one
is cited. **A D-number is found by grepping `__internal__/decisions/`**, not this file; the
**Decisions** column narrows that to one file first.

| § | The phase, and the file it lives in | Decisions | What it settled |
|---|---|---|---|
| **3.1** | [P1 — identity, law, and the reference policy](decisions/3.01-p1-identity-law-reference-policy.md) | D-01 … D-10 | The name and scope (Q1), the private repo (Q8), Zag at `1.43.0` (Q5), the reference-use policy, and attribution as a mechanism rather than a habit |
| **3.2** | [P2 — the evidence base, and the rule that reset the a11y scope](decisions/3.02-p2-evidence-base.md) | D-11 … D-22 | The port rule, hope-ui's four primitives re-measured — three dropped, one rebuilt over `@zag-js/presence` — and the methodology rule that produced the reversals |
| **3.3** | [P3 — architecture](decisions/3.03-p3-architecture.md) | D-23 … D-45 | Q2 and Q4: `staticCss` per recipe through `theme.extend`, Panda-shape style props, zero published CSS, and the package graph everything after it assumes |
| **3.4** | [P4 — the adapter, milestone one](decisions/3.04-p4-adapter-milestone-one.md) | D-46 … D-56 | Q6: the fork copied whole from `ef91b69` as a third-party MIT derivative, its harness with it, against a seven-line gate |
| **3.5** | [P5 — the blueprint](decisions/3.05-p5-blueprint.md) | D-57 … D-66 | Q7: Dialog as the worked component, four part shapes, the slot recipe resolved once on the Root, and the axe baseline the port rule fixes |
| **3.6** | [P6 — the parity matrix](decisions/3.06-p6-parity-matrix.md) | D-67 … D-78 | 115 Chakra components measured, three excluded, presence split into two families, and the floating probe inserted before volume |
| **3.7** | [P7 — the quality bar](decisions/3.07-p7-quality-bar.md) | D-79 … D-86 | Four definition-of-done tiers, computed-style assertions over class names, the axe allowance register, and the rule that a rule names a script or is labelled unenforced |
| **3.8** | [P8 — the docs site](decisions/3.08-p8-docs-site.md) | D-87 … D-93 | TanStack Start prerendered to Cloudflare Pages, the docs app as a standing instance of the consumer gate, and a page owed by every shipping component |
| **3.9** | [P9 — the ledger and the index](decisions/3.09-p9-ledger-and-index.md) | D-94 | One name per plan, and the three-surface division of labour §0 states |
| **3.10** | [S1 — repo bootstrap](decisions/3.10-s1-repo-bootstrap.md) | D-95 … D-97 | Step 1 closed: the three Vitest projects distinguishable, and the `solid-contract` carry-over measured at 20 cases rather than the predicted 15 |
| **3.11** | [S1 review — the author has no way to see the work](decisions/3.11-s1-review.md) | D-98 … D-101 | The review that inserted step 3b, split step 6 three ways, and made a component's docs page part of the component rather than a later sweep |
| **3.12** | [S2 — `@chakra-ui-solid/zag-solid`, milestone one](decisions/3.12-s2-zag-solid.md) | D-102 … D-110 | Step 2 closed: the fork at 87 tests, four deltas on two axes, and A1 re-diagnosed as a Solid 2.0 bug rather than a 1.x one |
| **3.13** | [S3 — the styling seam](decisions/3.13-s3-styling-seam.md) | D-111 … D-127 | Step 3 closed, every entry a measurement: 17 aliases not 95, `_dark` as `.dark &`, and an unresolvable token that emits its own name and fails silently |
| **3.14** | [S3b — the visual surfaces](decisions/3.14-s3b-visual-surfaces.md) | D-128 … D-161 | Step 3b closed: Storybook demoted to a local playground, the docs site reworked against the open reference, and Chakra's docs prose found to be plain MIT |
| **3.15** | [The context budget — the documents as a working surface](decisions/3.15-context-budget.md) | D-162 … D-163 | Not a build-order step: the anchor index, and this shard |

---

## 4. The reversals, in one place

A decision that changed during the pass is more useful than one that did not, because it is where the
pass learned something. Five reversed once, four reversed twice.

| # | Reversed **twice** | drop → | → copy | → final |
|---|---|---|---|---|
| **D-12** | `createHideOutside` | the brief's own first instinct | *copy, mandatory* — Zag has no `inert` and axe raises a **serious** violation | **DROP.** Chakra has the same gap; closing it would make us more accessible than the port target |
| **D-13** | `createFocusRestore` | first instinct | *copy* — a non-modal dialog never restores focus | **DROP.** A non-modal Chakra dialog does not either |
| **D-14** | `createPresence` | first instinct | *copy* — Zag's presence is animation-**name** based and would break transition recipes | **REPLACE with a build** over the `@zag-js/presence` machine. Measured: 9 of 56 slot recipes use `animationName`, **zero** use `transitionProperty` in an `_open`/`_closed` block |
| **D-21** | The `inert` evidence | the ledger said `inertOthers` **exists** | the spike's correction said the string appears **zero** times | **Both measured different artifacts.** True of the compiled 1.42.0 entry, false of the 1.43.0 source. The gap is real by three other mechanisms |

| # | Reversed **once** | From | To |
|---|---|---|---|
| **D-01** | Brand | `legal.md` §3.3.2's analysis concludes **for `@solid-chakra`** | `@chakra-ui-solid`, against the analysis, on the author's preference and a precedent matching this construction exactly. §3.3.2 is **not rewritten to agree** |
| **D-25** | The fallback ladder | three rungs | **two** — the prebuilt-stylesheet floor removed by D-30 |
| **D-27** | `renderStyled` additions | three | **four** — `styleSource`, with a worked failure in the checkout |
| **D-28** | Where the base-preset fix lives | in `panda.config.ts` | **in `@chakra-ui-solid/panda-preset`**, so a consumer cannot omit it |
| **D-30** | The prebuilt-stylesheet path | a documented secondary path | **removed** — zero published CSS |
| **D-31** | `styled-system` | private + inlined (hope-ui's shipped model) | **published + external** |
| **D-33** | `jsxFramework` | unset | **`"solid"`**, with `./jsx` never exported |
| **D-38** | Color mode | a provider in `system` | **nothing** — Chakra has none in-library |
| **D-50** | The B5 seed idiom | `untrack` around `useMachine`, in the component | **deleted** — the fork absorbed it |
| **D-51** | A3's fix | untrack the construction pass | **no construction pass** — a `$PROXY` lazy proxy |
| **D-52** | The controlled predicate | `!= undefined`, the fork's own documented position | **`!== undefined`**, matching all six upstream adapters and Chakra |
| **D-55** | The bundle re-measurement | milestone one | **milestone 5** |
| **D-59** | The `aria-controls` override | not taken | **ported** — Ark has it and Chakra inherits it, so it is parity |
| **D-60** | The expected axe baseline | ZagDialog's six | **three, open-state only** |
| **D-61** | Consumer `id` on a part | stripped (hope-ui), and once believed impossible | **forwarded**, last-wins; the impossibility claim was refuted by a five-line probe |
| **D-65** | `composeEventHandlers` | needed wherever a part composes handlers | **shapes C and D only** — the adapter chains `on*` already |
| **D-68** | The slot-recipe surface | the machine surface | **false by 15** |
| **D-69** | The exclusions | six named components | **`for`, `show`, charts** |
| **D-70** | `Portal`'s `disabled` | shipped non-reactive | **not shipped** |
| **D-71** | `swittch` | a spelling oddity, invisible to consumers | **a broken token reference** that silently drops `cursor: pointer` |
| **D-76** | The provider surface | deferred behind `./hooks` | **per component, per batch** |
| **D-77** | Presence sources | one | **two families** |
| **D-80** | DoD tiers | two | **four** |
| **D-84** | Storybook | a dev harness | a dev harness **and a required CI job** |
| **D-96** | The `solid-contract` case count | 9 + 3 + 6, gated as "18 including the three `flush()` cases" | **10 + 3 + 7 copied, 23 with the three `flush()` cases** — measured, not predicted |
| **D-102** | The fork's deltas against its pins | three, all against Zag `1.43.0` | **four, on two axes** — `renderToStringAsync` is gone at `@solidjs/web@2.0.0-beta.32`, and only the Zag axis had a delta list |
| **D-84** *(again)* | Storybook's arrival | step 5, with the first component | **step 3b**, with `Box`. Its *status* is unchanged — a local playground and the compile-mode canary, never deployed |
| **D-93** | *A shipping component owes a docs page* | an inventory check in the docs job, first able to fire at step 8 | **A component is not done until its page is done** — the page ships in the same phase as the component, from the first one |
| **D-41** | Workstream B's shape | one step, sized at P6 to 45 components | **6a / 6b / 6c**, a gate each. Its *position* is unchanged; 6a alone is what blocks B3/B4/B8 |
| **The docs site's date** | — | step 8, after all 115 components | **The app at 3b, pages with their components, step 8 is the guide tier and the deploy.** D-88 is not reversed — the docs app as a standing consumer instance becomes true eight batches earlier |
| **D-84** *(a third time)* | Storybook's status | a dev harness **and a required CI job** (D-84), then a dev harness and a canary driven by a Playwright script (D-129) | **a local playground.** No gate, no CI job, no required story. The validation surface is `apps/docs` — a real app using the published packages (**D-133**) |
| **D-129** | What drives the stories | `@storybook/test-runner`, named in `testing.md` §7.3 | **nothing drives them.** D-129 chose a Playwright script over the runner on cost; D-133 removed the choice by removing the gate, hours later. The measurement survives, the artefact does not |

---

## 5. The final build order — one list, each step's gate cited

**Where it lives.** The order and what each step proves is `roadmap.md` §9; the gate each step must
pass is `definition-of-done.md` §3. **This table is the single entry point that names both**, so the
first implementation phase reads one list rather than re-reading two documents. Neither of those
sections is restated here.

**Amended at the S1 review** — [§3.11](decisions/3.11-s1-review.md), D-98…D-101. Two rows are new
(**3b**, and **6** split three
ways), and from 3b onward **every component phase also ships its components' docs pages** — not a
column here, because it is a per-component rule (`definition-of-done.md` rule 2.15, as amended).

| Step | What | Gate |
|---|---|---|
| **1** ✅ | Repo bootstrap — workspace, catalog, Biome, tsconfig, Turbo incl. `codegen`, CI skeleton, three Vitest projects, `solid-contract` | `definition-of-done.md` §3.1 step 1 — the projects are distinguishable, 23 contract cases green incl. the three new `flush()` ones |
| **2** | `@chakra-ui-solid/zag-solid` + the harness (D-48) | `zag-solid-adapter.md` §6.5's seven lines, verbatim; `definition-of-done.md` §3.1 step 2 |
| **3** | The styling seam — Panda config, preset, `renderStyled`, style props, **plus the locale and environment contexts** | `definition-of-done.md` §3.1 step 3 — `Box`'s computed styles in all three projects, a consumer override changing them, and five checks live |
| **3b** | **The two visual surfaces, both rendering `Box`** — Storybook (local playground and compile-mode canary, **never deployed**) and the **docs app shell** with its own consumer `panda.config.ts` (D-98). **Split in two at the S3b review** (**D-128**): Storybook landed first, the docs app follows | `definition-of-done.md` §3.1 step 3b — **as amended by D-133**: Storybook contributes no gate line, `test:storybook` does not exist, and the `docs` CI job carries the whole step. **P8-B** and **P8-C** close; **P7-B** is retired unclosed |
| **4** | One real slot recipe, in a throwaway consumer whose own source never names the variant | `plan.md` §1's gate; `definition-of-done.md` §3.1 step 4 — coverage green **there**, and flipping `hash` exits `E_CONFIG_MISMATCH` |
| **5** | **Dialog**, plus `Portal`, plus the render-strategy split so `present` can come from a machine as well as a presence | `definition-of-done.md` §3.1 step 5 — `component-blueprint.md` §11 compiles, axe clean closed / `aria-hidden-focus` open only, SSR→hydrate round-trip |
| **5b** | **Popover** — the floating probe (D-75) | `definition-of-done.md` §3.1 step 5b — `check:floating-zindex`, a recorded number, and either a sentence or a rule |
| **6a** | **18 atomic-recipe components** (`roadmap.md` §4.3's step-6 rows) — Badge, Button, Code, ColorSwatch, Container, DownloadTrigger, Heading, Icon, Kbd, Link, Mark, Checkmark, Radiomark, Separator, Skeleton, SkipNav, Spinner, Text | `definition-of-done.md` §3.1 step 6a — the atomic recipe layer at volume, `splitVariantProps` (**P5-B**), `container`'s expression-tier preset delta |
| **6b** | **22 styled primitives and layout** (`roadmap.md` §4.4's step-6 rows) — Flex, Stack, Grid, SimpleGrid, Center, Square, Circle, Wrap, AspectRatio, Float, Bleed, Group, Span, Sticky, … | `definition-of-done.md` §3.1 step 6b — the eight route-3 conversions of `roadmap.md` §3.1, held converted by `check:style-contract` rule 1 |
| **6c** | **4 utilities + `Presence` + the 7 surviving hooks** — `client-only`, `focus-trap`, `format`, `highlight` | `definition-of-done.md` §3.1 step 6c — the presence render strategy standalone, exercised against both families |
| **7+** | Machine components in batches **B1–B8** | `definition-of-done.md` §3.2, one row per batch, over §3.0's four shared lines |
| **8** | The docs' **remaining content and its deployment** — the guide tier, migration, theming, the playground, `llms*.txt`, prerender + Cloudflare (D-101) | `check:docs-links`, `check:prerender-complete`, `check:llms-fresh`; assumption **P8-A** (`definition-of-done.md` §8.3b) |

**Six ordering constraints that are not preferences** (`roadmap.md` §9.3, as amended): **6a** before
B3/B4/B8 — it is the three composed primitives that bind, not all 45 · **step 3b before any component
phase**, because a component with no page is not done · step 5 before B2 · step 5b before B1 · B2
before B5/B6/B7 · B3 before B4.

**The placement still adds up to 115** — step 3 = 3, step 5 = 2, step 5b = 1, **6a = 18, 6b = 22,
6c = 4 + `Presence`**, B1–B8 = 62, excluded = 2. Step 3b adds no component; it renders `Box`.

---

## 6. What the document pass did **not** settle

Everything below is blocked on the same fact — **no package exists** — grouped by the step that
unblocks it. Each row's gate is `definition-of-done.md` §8; this section is the ordering, not a second
register.

**Step 2 — first install, `@zag-js/*` in the tree**
- **P4-A** the checkout matches the published tarballs · **P4-B** D1/D2/D3 leave the other 84 cases
  green · **P4-C** upstream's 51 cases port to `mount()` with no semantic change · **P4-D**
  `@zag-js/{core,types,utils}@1.43.0` type-check against `solid-js@2.0.0-beta.32`.
- **`brief-plan` §8 assumption 8** stops being provisional: the manifest check runs against the
  *installed* closure.
- The adapter's own fixed bundle weight — a number nobody has (D-55).

**Step 3 — first `panda codegen`**
- **Assumption 3** Panda `1.12.0` ↔ `@chakra-ui/panda-preset@3.36.1`, untested anywhere visible.
- **P3-D** the alias list — the failing set *is* the list · **P3-E** whether Panda's preflight emits a
  `[hidden]` equivalent · **P3-F** the `_dark` selector · **P6-F** whether an unresolvable token
  reference drops the declaration or fails the build · **P5-B** `splitVariantProps` · **P7-B** the
  Storybook runner against Solid 2.0, at the first story.
- Two shapes to confirm rather than decide: whether Panda's `ConditionalValue` accepts Chakra's
  responsive **array** form, and whether curly token references resolve the same way. Both believed to
  be parity; neither changes a decision.

**Step 4 — the throwaway consumer**
- **Assumption 4 / P3-A** recipe-level `staticCss` reaching a consumer's codegen — the one that decides
  which rung of D-25's ladder we are on · **P3-B** the responsive grain · **P3-C** the `hash`/`prefix`
  canary · **P5-A** `recipe(variantProps) → Record<Slot, string>`, which the coverage check cannot be
  built without · **P7-A** the generated variant map · **P6-C** the unstyled-by-key set · **P6-D** the
  duplicate-slot dedupe.
- **Assumption 9**, tier 1 — the `data-*` vocabulary diff, *the single cheapest check with the largest
  downside if skipped*. Spot-checked at 6 of 56; the full diff is here.

**Step 5 — Dialog**
- **P5-C** the axe baseline, predicted and not measured · **P5-D** whether `styleSource` closes the
  collision class or only `editable`'s case · **Assumption 5** Ark `5.37.2` vs the `5.38.1` checkout,
  for the two reads that are Ark-implementation rather than Chakra-import.
- The first bundle comparison against `+13.4 KB gz`.

**Step 5b — Popover**
- **P6-A** the popper `--z-index` seam. P7 could name the check and its assertions, not its result.

**B2, B3, and per batch**
- **P6-B** whether `useCollapsible` is the only second presence source (B2) · the **fifth part shape**,
  behind five proofs, with nine components waiting on it (B2) · **P6-E** whether Field is re-derivable
  from its ARIA contract, and at what cost (B3) · **Assumption 9 tier 2**, which needs real machines
  driven through their states (per batch) · the library-wide bundle figure (B8).

**Step 8 — the docs site**
- **Assumption 6 / P8-A** prerender to Cloudflare · **P8-B** MDX under Solid 2.0 · **P8-C** the
  props-table generator with no running system object · **P8-D** whether the docs app's Panda run is
  representative.
- Two stated gaps rather than assumptions: **free-form playground editing**, deferred with its options
  recorded and no verdict (D-89), and **visual regression**, which has no baseline and no runner and is
  recorded as a gap rather than an oversight.

**Open with a trigger rather than a step**
- `legal.md` §6 item 1 — message the Chakra maintainers at first public release (D-03). Not an
  assumption and not gated by a build; the trigger is defined and the answer is either a fact or the
  first rung of the exit ladder.
- `legal.md` §6 item 8 — keep `@solid-chakra` held. Costs a renewal and nothing else.

**Three whose gate is a measurement plus a judgement**, listed here as well because they are the ones
most likely to be read as pass/fail: **P5-E** (the presence instance count — *acceptable* is a review
call against a budget nobody can set today), **P6-E** (whether the cost was comparable), **P6-A**
(whether the seam is *free* is the reading of a number). `definition-of-done.md` §8.4 owns them.

---

## 7. The reconciliation log — what P9 changed, and where

Every row below is a place an earlier document said something a later one corrected, and was left
unfixed on purpose so that the correction would land in **one** place. Each is fixed once, with a
pointer left wherever a reader would otherwise re-derive it.

### 7.1 Carried forward by name

| Source of the correction | Document · section fixed | What it said | What it now says |
|---|---|---|---|
| `definition-of-done.md` §10 row 1 | `zag-solid-adapter.md` **§6.4** | *"a faithful Dialog port scores six inherited axe allowances"* | Three, **open-state only**; the instruction stands, the number moved. Points at `component-blueprint.md` §9.2 and the register in `definition-of-done.md` §5 |
| same | `zag-solid-adapter.md` **§8.2** | *"ZagDialog's six axe allowances are the baseline"* | *Inherited `aria-hidden-focus` allowances are the baseline* — three entries, open-state only |
| same (not on the list; found at P9) | `prior-art.md` **§7** and **§10.1 row F** | the same six, in the document the other two cite | Six stands as **ZagDialog's measurement**; it is not our baseline. Both sites now point at `component-blueprint.md` §9.2 |
| `definition-of-done.md` §10 row 3 · `testing.md` §1.8 | `plan.md` **§5.2** | `internal-test-utils → system`, undated | Right about the direction, **the edge appears at milestone 3** — at milestone one the harness touches no styling and the edge must not exist. `testing.md` §1.8's blockquote now points here instead of carrying it |
| `definition-of-done.md` §10 row 4 | `CLAUDE.md` § document index; **D-80** | `brief-plan` §4.1 doc 6's *"per-file and per-component DoD"* | **Four tiers** — per file, per component, per batch, per release |
| `definition-of-done.md` §10 row 5 | `legal.md` **§6 items 6 and 7** | open, assigned to P7 | **Closed at P7, by name** — `check:license-headers`, `check:notice-rows`, `check:package-files`; and `check:readme-disclaimer` as a **publish-time** gate |
| `definition-of-done.md` §10 row 6 | `legal.md` **§2.6** | a per-file checklist with nowhere naming where the list of derivatives lives | **`attribution.config.ts` at the repo root**, eight entries, added as step 2 of the checklist; both directions checked |
| `definition-of-done.md` §10 row 7 | `component-blueprint.md` **§1.3** | Storybook is a dev harness and a canary | That **and a required CI job**, and it must be Storybook rather than `composeStories` |
| `definition-of-done.md` §10 row 8 · `roadmap.md` §13 row 1b | `plan.md` **§0.4** | no row for `Portal`'s `disabled` | A **`React→Solid`** row: not shipped at all; omitting it makes passing it a type error |
| same | `component-blueprint.md` **§11.12** | ships `disabled` non-reactive, as delta 3 | **The prop is removed from the worked example** — the interface, the branch and delta 3 all go; two deltas remain, and `disabled` is recorded below them as a prop Chakra has and we do not. Reasons stay with their owner, `roadmap.md` §5.1 |
| `definition-of-done.md` §10 row 9 · `roadmap.md` §13 row 10 | `plan.md` **§12 row 3** | *"a three-rung fallback ladder"* | **Two rungs**, with the phase that removed the third named |
| `roadmap.md` §13 row 1 | `plan.md` **§0.4** note | six components listed as per-component exclusions | **`for`, `show` and charts** — the list was wrong by four |
| `roadmap.md` §13 row 2 | `plan.md` **§10** and `prior-art.md` **§10.4** | *"118 component folders"*, and §10.4's *confirmed-so-nobody-re-checks-it* row saying the same | **115 directories**; 118 is the entry count. Changes no conclusion, and the matrix has 115 rows. §10.4 loses the row and says why it left |
| `roadmap.md` §13 row 3 | `plan.md` **§10** | *"the 56 slot recipes are, correspondingly, the machine surface"* | **False by 15** — 34 + 7 + 15. The atomic half is exactly true, and stays |
| `roadmap.md` §13 row 7 | `plan.md` **§1.3** | `swittch` is *"invisible to consumers either way"* | It is not: the `cursor` token key carries the same misspelling and Switch silently loses `cursor: pointer`. One `theme.extend` key; the slot-recipe key stays verbatim |
| `roadmap.md` §13 row 7b | `plan.md` **§3.3** | *"never a recipe body, never a token table … it holds"* | Holds for the `staticCss` and alias deltas; **two P6 deltas in two tiers** — the token key owes nothing, the `container` recipe body is expression |
| same | `legal.md` **§6 item 3** | open, assigned to P3 | **Closed at P3, re-checked at P6**, with the one measured exception named |
| `roadmap.md` §13 row 9 | `plan.md` **§5.2** | in-repo edges only, unlabelled | Labelled, plus the measured out-of-repo width and *per batch, never per component* |
| `component-blueprint.md` §13 row 2 | `plan.md` **§2.3** | `renderStyled` needs **three** additions | **Four** — `styleSource`, with the worked failure and the lint rule cited |
| `component-blueprint.md` §13 row 9 | `plan.md` **§5.3 row 6** | `composeEventHandlers` *"needed the moment a part composes a consumer handler with a machine handler"* | A machine part never calls it; **shapes C and D only**. The carry-over stands; the reason does not |
| `zag-solid-adapter.md` §10 row 2 | **D-51** | A3's prescribed fix | Superseded by the `$PROXY` lazy proxy — recorded in the ledger, since no surviving document restates the old fix |
| `zag-solid-adapter.md` §10 row 6 | **`CLAUDE.md` §0** | §0 as one sentence | The **two-scope form**: a dependency is judged by what it *is* (a manifest check over the closure), our own source by what it *does* (a grep) — with both script names |
| `zag-solid-adapter.md` §10 row 7 | **`CLAUDE.md`** § attribution; **D-47** | the fork's attribution unstated | A third-party MIT derivative: seven headers, two `NOTICE.md` tables, a registry entry each, in the same commit as the code |
| `plan.md` §12 row 2 | **D-28** | the base-preset fix's location | Recorded in the ledger — the fix moved into the preset, and both configs are one line |
| `plan.md` §12 row 5 | **D-34** | the preset is *"config-only"* | Recorded — it also exports `chakraConfig(options?)`, one subpath, no `./config` |
| `testing.md` §1.8 | `plan.md` **§5.2** | the graph correction, recorded for P9 | Applied; §1.8 keeps the reasoning and points at the fix |
| `docs-site.md` §8 row 1 | `testing.md` **§5.2** | scope is `packages/*/src/**` | **Plus `apps/docs/src/**`** — our source too, and the likeliest place a runtime stylesheet appears |
| `docs-site.md` §8 row 2 | `testing.md` **§12** | seven jobs, none of them the docs | **Eight** — a `docs` job after `codegen` + `cssgen`, with a deploy step |
| `docs-site.md` §8 row 3 | `definition-of-done.md` **§8.3b** | the register holds P3–P7 | **Plus P8-A…P8-D**, and the register's total is stated: 38 rows, 6 closed, 32 open, none without a gate |
| `docs-site.md` §8 row 4 | `definition-of-done.md` **rule 2.15** | nothing fires on a built component with no page | **A shipping component owes a docs page** — `check:docs-inventory` |
| `docs-site.md` §8 row 5 | `plan.md` **§4.4** | the README first line, one placement, owner P8 | **Three placements** — README first line, docs home, above the install snippet — and the file itself is written at step 8 |
| `docs-site.md` §8 row 6 | **`CLAUDE.md`** § document index | a **ten**-row document register | **Eleven** — `docs-plan.md` is a peer, not a section. The index also states the row-vs-file arithmetic, since `testing.md` and `definition-of-done.md` share one register row |
| `docs-site.md` §8 row 7 | **`CLAUDE.md`** § precedence; **§0** above | no stated precedence between the register's contents list and the later documents | **The later document wins**, stated once for the whole set |
| `legal.md` §6 item 2 | `legal.md` **§6** | open, assigned to P8 | **Closed at P8** — naming the Pages project is step one of the Cloudflare setup |

### 7.2 The citation convention, and the sites it was applied to

**The convention** (§0.1): `plan.md` = `__internal__/plan.md`; the approved brief plan =
`` `brief-plan` ``.

**Why it had to be named rather than left to context.** `plan.md` has a §1.5, §2.4, §3.5, §4.1, §5, §7
and §8 — and so does the brief plan, with **different content in every case**. A reader following
`plan.md §4.1 doc 5` opened the distribution model; `plan.md §8 assumption 9` opened build mechanics;
`plan.md §1.5` meant the fallback ladder in one paragraph of `component-blueprint.md` and the
`data-*` advantage in another, two sections apart.

**Applied to every citation that pointed at the wrong file** — the misleading set, not a repo-wide
sweep. By family: `§8 assumption N` (14 sites, six documents) · `§4.1 doc N` / `§4.1's contents list`
(7) · `§5 step N` (4) · `§7 concern N` (5) · `§2.8` (5) · `§2.10` (6) · `§2.11` (3) · `§3.5 row B5` /
`§3.5 predicted` (5) · `§2.4` (2) · and the singletons `§0`, `§0.1`, `§1`, `§1.5`, `§2.1`, `§3.1`,
`§3.2`, `§3.3`, `§3.4`, `§3.6`, `§6`, `§9 Q2`. **Untouched:** every `plan.md §N` that already resolved
correctly — `§0.2`, `§0.4`, `§1.3`, `§2.3`, `§4.4`, `§5.2`, `§12` and the rest — because a correct
citation is not an ambiguity.

`docs-site.md`'s header paragraph, which flagged the collision and assigned the naming here, now states
the convention rather than the problem.

### 7.3 Two rows found at P9 that were on nobody's list

| Document · section | What it said | Why it needed fixing | What it now says |
|---|---|---|---|
| `prior-art.md` **§7** and **§10.1 row F** | *"ZagDialog's six axe allowances are the baseline"* | These are the two sites `zag-solid-adapter.md` §6.4 and §8.2 **cite**. Correcting the citing documents and leaving the cited one stale would have made the correction unfindable from the direction a reader travels | Six stands as ZagDialog's measurement; ours is `aria-hidden-focus`, open-state only, with both sites pointing at `component-blueprint.md` §9.2 |
| `legal.md` **§1.5** | *"the preset's 19 recipes, 57 slot recipes"* | `prior-art.md` §4.2 measured **18 + 56** and says both figures *"should be corrected wherever they appear"*; `plan.md` §12 row 12 carries it as **18 + 56 throughout**. One surviving instance makes "throughout" false, and the numbers are the bound the whole `staticCss` design is sized against | **18 recipes, 56 slot recipes** |

**One row found and deliberately not fixed.** `legal.md` §1.2 contains *"the definition of done was to
run axe on every mounting test with zero allowances."* It is **past tense inside the retained
Apache-2.0 analysis** — the premise that made that route live, kept because §0 says the analysis
becomes live again the instant anyone proposes an exception. The document's own header already records
the route as closed at P2. Correcting a historical premise would damage the record it exists to
preserve.
