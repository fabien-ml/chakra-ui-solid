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
| Contains | Enforced rules, one line each, and a pointer per rule | Decision entries: decision, rejected alternatives + *why not*, effect, gate, and a citation | The evidence, the measurements, the argument, the code |
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
| **Q2** | How consumers get CSS for recipe variants their source never writes | **P3 gate, 2026-08-09** | Per-recipe `staticCss: ["*"]` through `theme.extend` in `@chakra-ui-solid/preset`, plus an atomic `staticCss.css` block and ten `colorPalette` values. Two-rung fallback ladder; confirmed or refuted at step 4 | `plan.md` §1 · **D-23** |
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

Ninety-four entries, D-01 … D-94, grouped by the phase that settled them. Reversals are marked
**⟲** and collected in §4.

### 3.1 P1 — identity, law, and the reference policy

**D-01 · The project is `chakra-ui-solid`, under the owned `@chakra-ui-solid` npm scope** ⟲
— **Decision.** Mark-derived name and scope, lowercase and hyphenated, with the disclaimer near the
top of the root README and in every published package's README.
— **Rejected.** *`@solid-chakra`* — the lower-confusion form on both grounds the analysis names, and
**the analysis concluded for it**; overridden by the author's preference and by a precedent that
matches this construction exactly rather than approximately. *`@chakra-ui/*`, `@chakra/*`* — the mark
itself, out unconditionally. *`@solid-chakra-ui`, `@chakra-solid`* — free but between the two on
every axis, and newly claiming a mark-derived name is a more affirmative use than holding one
registered defensively. *A fully distinct brand* — §4.2's five candidates, none registered; kept as
rung three of the exit ladder.
— **Effect.** Unblocks every `package.json`, every import path, the repo description and the docs
site. Costs: the disclaimer becomes load-bearing rather than courteous, and no Chakra visual identity
may ever be used.
— **Settled.** P1 gate, 2026-08-08 · **Q1**.
— **Reasoning.** `legal.md` §3.3.1 (the case for), §3.3.2 (the case against, left standing), §3.3.3
(the decision and its four obligations).

**D-02 · Private repository, personal account, no GitHub organization**
— **Decision.** `<account>/chakra-ui-solid`, private through milestone 5. Both the `chakra-ui-solid`
and `solid-chakra` GitHub organizations are unclaimed and deliberately not claimed.
— **Rejected.** *Claim the org defensively* — the exposure that would justify it does not exist while
the repo is private, and an org is easy to create later. *Public from the first commit* — it converts
the trademark question from dormant to live before there is anything to point at.
— **Effect.** Sets branch protection and CI secrets; being on a personal account is itself an honesty
signal, since an official port would live in `chakra-ui/`. Does **not** make the README disclaimer
optional — D-01 requires it regardless.
— **Settled.** P1 gate, 2026-08-08 · **Q8**.
— **Reasoning.** `legal.md` §3.5, §3.3.3.

**D-03 · The maintainer message is deferred to first public release, not skipped**
— **Decision.** Ask the Chakra maintainers before the first public release — first `npm publish`, or
a public repo or docs site, whichever comes first.
— **Rejected.** *Ask now* — it asks the Chakra team to weigh in on an empty private repository that
may never go live. *Never ask* — absence of objection is not permission, and the question only gets
more expensive.
— **Effect.** Keeps the rename cost at "documents and a private repo" until after the conversation.
Open item `legal.md` §6 item 1, with a defined trigger rather than a date.
— **Settled.** P1 gate, 2026-08-08.
— **Reasoning.** `legal.md` §3.7, §3.3.3.

**D-04 · No custom domain — Cloudflare's default subdomain**
— **Decision.** The docs deploy to `chakra-ui-solid.pages.dev`; name the Pages project accordingly.
— **Rejected.** *Buy `chakra-ui-solid.dev` / `.com`* — a custom domain is a swap, not a migration, and
a `*.pages.dev` URL is itself a mild unofficial-project signal working in the right direction.
— **Effect.** The Pages project name is first-come, which is why it is step one of the Cloudflare
setup rather than a later detail.
— **Settled.** P1 gate, 2026-08-08; the setup step landed at P8.
— **Reasoning.** `legal.md` §3.6; `docs-site.md` §1.6.

**D-05 · Zag targets `1.43.0`; the `zag` checkout is re-cloned at `main` with `v2` kept alongside**
— **Decision.** Target the v1 line at `1.43.0` — the version Chakra `3.36.1` reaches through
`@ark-ui/react@5.37.2` — and keep the `v2` checkout as a secondary reference.
— **Rejected.** *Target `2.0.0-next.1`* — a different major from what Chakra pins, and a `next`
prerelease whose surface is not frozen. *Drop the `v2` checkout* — keeping it is what let P4 measure
that all 8 adapter source files and all 4 test files are **byte-identical** across the major.
— **Effect.** Unblocks the parity matrix and the adapter baseline. Makes a future v1→v2 move
adapter-**free** rather than merely adapter-local: what moves is the machine catalog, the anatomy
surfaces and the `data-*` vocabulary, none of which is in this package.
— **Settled.** P1 gate, 2026-08-08 · **Q5**.
— **Reasoning.** `legal.md` §0.1; `zag-solid-adapter.md` §2.3, §2.4.

**D-06 · The parity delta is stated prominently, in fixed words**
— **Decision.** *"as close to Chakra v3 parity as is achievable without runtime CSS-in-JS"* —
verbatim, in the README, `CLAUDE.md` and the docs home. Cite a row of the delta table; never re-argue
it.
— **Rejected.** *State it quietly, in a "differences" appendix* — mis-set expectations are the main
support cost, and the delta is the thesis rather than a caveat.
— **Effect.** Fixes the wording for the README, the docs home, the migration page and every
"why doesn't `createSystem` exist" reply.
— **Settled.** P1 gate (wording), P8 (placement) · **Q3**.
— **Reasoning.** `plan.md` §0, §0.4; `legal.md` §3.4; `docs-plan.md` §5.4.

**D-07 · The reference-use policy, and where the line falls**
— **Decision.** Reading a reference for **reasoning, public API shape, or an ARIA pattern owes
nothing**. Reproducing its **expression** — a function's structure and sequence, a data table, its
comments — makes the file a derivative and triggers the full attribution mechanism. **Ark is `what`,
never `how`**; `@chakra-ui/react`'s `styled-system/` is API shape only.
— **Rejected.** *Treat any reference read as a derivative* — it would make reading the thing we are
porting an obligation, which is neither the law nor workable. *Treat nothing as a derivative* — the
fork is the paradigm counter-example.
— **Effect.** Makes the tier a judgement with a mechanical **consequence**: once declared, every
obligation is checked in both directions. The judgement itself has no script and is labelled
unenforced.
— **Settled.** P1 gate, 2026-08-08.
— **Reasoning.** `legal.md` §1.4, §2.1; `definition-of-done.md` §7.1, §7.2.

**D-08 · `@chakra-ui/panda-preset`: depend, do not vendor**
— **Decision.** Consume the official preset as a published npm dependency and add only **keys** on
top of it. Read its key list off the imported object rather than hard-coding names.
— **Rejected.** *Vendor the preset* — it forks the package whose lockstep with Chakra is the entire
"look and feel for free" premise, and a Chakra release that adds a recipe would then need a manual
port rather than a version bump. *Hand-author tokens, as hope-ui did* — that is precisely what
hope-ui's Panda era proved does **not** de-risk this project.
— **Effect.** One measured exception, taken knowingly: the `container` recipe **body** (D-72), which
is expression tier and carries the preset package's first `NOTICE.md`.
— **Settled.** P1 gate; re-checked at P3 and again at P6.
— **Reasoning.** `legal.md` §1.5, §6 item 3; `plan.md` §3.3.

**D-09 · The attribution mechanism**
— **Decision.** An `@license` JSDoc header per derivative file naming the **upstream file**, a row in
the root `NOTICE.md` **and** in the owning package's, `LICENSE` + `NOTICE.md` in every published
package's `files`, and `comments.legal` pinned so the headers survive to `dist/`. All of it in the
**same commit as the code**.
— **Rejected.** *A single root `NOTICE.md`* — the package file is the one that travels in the npm
tarball and the only one a consumer who never visits the repo sees. *Attribution as a follow-up
commit* — both failure modes are silent and green.
— **Effect.** The whole mechanism is scripted at P7 (D-85); the only judgement left is the tier.
— **Settled.** P1 gate.
— **Reasoning.** `legal.md` §2.2–§2.6.

**D-10 · Upstream release tracking is a standing policy, not a habit**
— **Decision.** Chakra minor → preset lockstep + coverage check; Zag minor → anatomy diff + the §0
audit; Panda minor → generated-artifact diff; any upstream major → the legal re-check and a re-stamped
license table. Renovate fires them, **grouped by upstream, never auto-merged, one upstream per PR**.
— **Rejected.** *Floating version ranges* — they turn a reviewable upstream change into an
unreproducible local one. *One PR for all upstreams* — a Chakra bump and a Zag bump together means the
coverage check and the anatomy diff fail at once and neither is diagnosable.
— **Effect.** Two of the six are obligations rather than hygiene: the anatomy diff keeps
`brief-plan` §8 assumption 2 *closed* rather than answered once, and the preset check exists because
under §0 a removed variant unstyles silently rather than erroring.
— **Settled.** P1 gate; jobs written at P7.
— **Reasoning.** `legal.md` §5; `testing.md` §11; `definition-of-done.md` §9.

### 3.2 P2 — the evidence base, and the rule that reset the a11y scope

**D-11 · The port rule** ⟲
— **Decision.** **No accessibility behavior beyond what Zag ships, and nothing invented that Chakra
UI v3 does not have — SolidJS idioms excepted.** The target is 1:1 with Chakra v3, and Chakra v3 is
Ark over Zag with zero added behavior in either layer.
— **Rejected.** *Hold hope-ui's accessibility bar* — it would make us **more accessible than the
library we are porting**, which is a divergence even pointing the pleasant way, and it is what the
`brief-plan` assumed when it reversed four kernel primitives from *drop* to *copy, mandatory*.
*Case-by-case exceptions* — the exception mechanism is what makes a scope rule unfalsifiable; removing
it is the decision.
— **Effect.** The widest-blast-radius decision of the pass. It struck three of four kernel
primitives, deleted a planned roadmap column, removed the repo's only Apache-2.0 obligation, reset
the DoD's axe shape, and turned two local fixes into upstream filings.
— **Settled.** P2 gate, 2026-08-08.
— **Reasoning.** `prior-art.md` §8.2, §10.1.

**D-12 · `createHideOutside` is dropped** ⟲⟲
— **Decision.** Not carried. Inherit the gap; close it upstream instead (D-54).
— **Rejected.** *Copy it, as the `brief-plan` marks it — "copy, mandatory"* — measured against the
port target, `inert` appears **zero times** in both `chakra-ui/packages/react/src/` and
`ark-ui/packages/react/src/`, so an open Chakra v3 modal leaves the background keyboard-reachable
exactly as ours will.
— **Effect.** Removes ~128 code lines and, with them, the repo's only planned Apache-2.0 obligation.
Sets the inherited axe allowance the DoD must record as expected (D-60).
— **Settled.** P2 gate. **Reversed twice**: drop → copy, mandatory (`brief-plan` §2.11) → drop.
— **Reasoning.** `prior-art.md` §8.2, §9.2, §10.1 row A.

**D-13 · `createFocusRestore` is dropped** ⟲⟲
— **Decision.** Not carried.
— **Rejected.** *Copy it* — Ark's `use-dialog.ts` contains the string `focus` zero times and adds no
focus handling, so a **non-modal** Chakra dialog does not restore focus on Escape either. Same
behavior as the port target.
— **Effect.** Removes ~26 code lines.
— **Settled.** P2 gate. **Reversed twice**, same shape as D-12.
— **Reasoning.** `prior-art.md` §8.2, §10.1 row B.

**D-14 · `createPresence` is replaced by a build over the `@zag-js/presence` machine** ⟲⟲
— **Decision.** Presence comes from a **Zag machine consumed through our own adapter**, like `dialog`
or `listbox`, with ~30 lines of render strategy of ours on top. hope-ui's kernel is not carried and
Ark is not a dependency.
— **Rejected.** *Copy hope-ui's `createPresence`* — its premise was that Zag's animation-**name**-based
presence breaks recipes animating with CSS **transitions**; measured across all 56 slot recipes,
**9 use `animationName` and not one uses `transitionProperty` inside an `_open`/`_closed` block**, so
the objection resolves the other way. *Depend on Ark's presence* — Ark is a read reference and never a
dependency.
— **Effect.** Closes `brief-plan` §8 assumption 11 the other way. Puts presence in
`@chakra-ui-solid/system` and gives that package a `zag-solid` dependency (D-40).
— **Settled.** P2 gate. **Reversed twice**: drop → copy → replace-with-a-build.
— **Reasoning.** `prior-art.md` §8.2, §8.3; `plan.md` §6; `component-blueprint.md` §7.

**D-15 · `createRegisteredId` is kept — available, not a pattern**
— **Decision.** Keep the 12 lines of `onSettled` deferral around Solid 2.0's
`[REACTIVE_WRITE_IN_OWNED_SCOPE]`. Build nothing on it.
— **Rejected.** *Drop it* — it is a Solid 2.0 mechanism, not accessibility, and the port rule does not
reach it. *Make it the id strategy* — it has **no call site in a 1:1 port**: Zag derives ids from a
scope and Ark never registers upward.
— **Effect.** The retained kernel is **12 lines**, and they are a write-deferral mechanism rather than
accessibility. The behavior kernel is Zag's, entirely.
— **Settled.** P2 gate.
— **Reasoning.** `prior-art.md` §8.2; `component-blueprint.md` §8.

**D-16 · Retained primitives: none, and the roadmap column is deleted**
— **Decision.** Everything else in hope-ui's `primitives/internal/*` is dropped, with **no
exceptions**. `roadmap.md` carries no per-component retained-primitive column.
— **Rejected.** *"Drop by default, adopt by exception," with a per-component column to record each
exception* — the port rule removed the mechanism, so there is no exception to record and the column
would be a permanently empty schema.
— **Effect.** Deletes a planned roadmap column before it is built. Also drops the three Apache-2.0
derivatives (`create-dismissable`, `create-press`, `scroll-into-view`) that the exception mechanism
could have pulled in.
— **Settled.** P2 gate; applied at P5 and P6.
— **Reasoning.** `prior-art.md` §10.1 row D; `component-blueprint.md` §8; `roadmap.md` §3.

**D-17 · The two override getters are not taken here — the fix belongs upstream** ⟲
— **Decision.** The `aria-labelledby` override on listbox content is **not** taken: Chakra ships the
same dangling IDREF, and taking it would be an improvement over the port target.
— **Rejected.** *Take both overrides, ~3 lines each* — an accessibility improvement over the thing we
are porting. *Take neither, permanently* — P5 measured that the **`aria-controls`** half is a
different case: six Ark components carry a presence-gated override and Chakra inherits it, so porting
it is parity rather than improvement (D-59).
— **Effect.** Half of this decision was reversed one phase later, which is why it is recorded as one
entry with both halves visible.
— **Settled.** P2 gate; the `aria-controls` half reversed at the P5 gate.
— **Reasoning.** `prior-art.md` §5.2, §10.1 row E; `component-blueprint.md` §1.2, §13 row 1.

**D-18 · The methodology rule — measure the dependency, do not reason about its source**
— **Decision.** A finding that says *"impossible"* or *"unfixable"* gets a probe before it reaches a
verdict; a test whose premise is a defect gets run in isolation before it is believed; and **a story
is a deliverable, not a checkbox — open it**.
— **Rejected.** *Treat the spike's verdicts as findings* — two of the three that drove its first
verdict were wrong, and both errors ran the same direction.
— **Effect.** It is why `definition-of-done.md` §0 requires every rule to name a script, why an
allowance that stops being needed **fails**, and why `test:storybook` is a CI job rather than a habit.
— **Settled.** P2 gate.
— **Reasoning.** `prior-art.md` §8.1.

**D-19 · Line counts are quoted in one convention, and it is named at the point of use**
— **Decision.** State **raw** or **code** every time a volume figure is quoted, and never compare
across the two.
— **Rejected.** *Raw everywhere* — both repos mandate dense *why*-comments, so a raw count rewards
whichever side is worse documented; the spike's own headline table was recounted for exactly this and
one row was found materially wrong.
— **Effect.** Fixes the `~154 kernel lines`, `249 vs 143`, `833 raw vs ~614 code` and `594` figures so
later documents can quote them without re-deriving.
— **Settled.** P2 gate.
— **Reasoning.** `prior-art.md` §0.4, §10.2 row 7, §10.4.

**D-20 · The preset carries 18 recipes and 56 slot recipes**
— **Decision.** 18 + 56 throughout, measured off the registry objects.
— **Rejected.** *19 + 57* — the `brief-plan`'s figure counted `.ts` files, including each directory's
`index.ts`.
— **Effect.** The parity matrix, the `staticCss` bound (142 variant keys / 488 values) and the
coverage check are all built from these two numbers.
— **Settled.** P2 gate.
— **Reasoning.** `prior-art.md` §4.2, §10.2 row 2.

**D-21 · The `inert` evidence is restated at 1.43.0, and the correction is corrected** ⟲⟲
— **Decision.** At 1.43.0 `inertOthers` and `suppressOthers` **do** exist in
`@zag-js/aria-hidden`'s source; the gap is real anyway, by three independent mechanisms — the entry
exports only `ariaHidden`, which calls `hideOthers` unconditionally; `dialog.machine.ts:201` has no
prop or option to redirect it; and the published `exports` map makes `suppressOthers` unreachable even
by deep import.
— **Rejected.** *Quote "the string `inert` appears zero times"* — that was measured against the
**compiled 1.42.0 entry** and is false of the source. Two measurements of different artifacts, neither
of which said which.
— **Effect.** The conclusion survives intact, and the *route* to fixing it changes: `suppressOthers`
already does the feature-detected dispatch, so the filing is "point `ariaHidden` at it" (D-54).
— **Settled.** P2 gate. **Reversed twice**: the ledger's `C2` said the export exists → the spike's
correction said zero → P2 says both measured different artifacts and the ledger was right about the
source.
— **Reasoning.** `prior-art.md` §7, §10.2 row 5.

**D-22 · The DoD records inherited axe allowances as expected** ⟲
— **Decision.** axe runs on every mounting test; **inherited allowances are enumerated, expected, and
each cites an upstream issue**; an allowance that stops being needed is a failure.
— **Rejected.** *axe on every mounting test with zero allowances* — not achievable and it should not
be: a faithful port carries the port target's defects by construction, and a correct port would read
as a regression.
— **Effect.** Sets the shape of `definition-of-done.md` §5. The **count** moved again at P5 (D-60).
— **Settled.** P2 gate.
— **Reasoning.** `prior-art.md` §10.1 row F; `component-blueprint.md` §9.3.

### 3.3 P3 — architecture

**D-23 · Q2 — the preset declares `staticCss` per recipe, through `theme.extend`**
— **Decision.** `@chakra-ui-solid/preset` adds one `staticCss: ["*"]` key to each of the 74 recipes it
inherits and re-emits none of them, plus an atomic `staticCss.css` block (the `display` row and ten
`colorPalette` values). `jsx` tracking hints are added as an optimization and **nothing depends on
them**.
— **Rejected.** *Config-level `staticCss: { recipes: "*" }`* — a consumer's own top-level block
competes with ours and the merge semantics of two competing blocks are undocumented and unverifiable
here; a key inside a recipe body merges like any other recipe property. *Make every internal variant
selection statically literal at the call site* — impossible for a consumer-driven variant, and it
means hand-writing 488 literals while doing nothing for the case that matters most, a consumer
wrapper forwarding props. *Option A, our `dist` in their `include`* — the identical static-extraction
limit. *Rely on `jsx` hints alone* — a hint is a component **name**, so it breaks under aliasing,
namespaced part components and consumer wrappers, and it breaks **silently**.
— **Effect.** Closes Q2 and shapes the preset package. Costs a linear 488 variant values in the
default sheet — linear, not combinatorial, because the preset declares **zero** `compoundVariants`.
— **Settled.** P3 gate, 2026-08-09 · **Q2**.
— **Reasoning.** `plan.md` §1.1–§1.6.

**D-24 · The problem is one step wider than the question assumed**
— **Decision.** Treat **every** recipe variant in this library as internally emitted from Panda's
point of view.
— **Rejected.** *Assume only dynamic variant arguments fail to extract* — measured, no recipe in the
preset declares a `jsx` hint and our consumers never import the generated recipe module, so no
consumer-written recipe variant extracts at all, static ones included.
— **Effect.** Widens the problem and leaves the answer unchanged, which is the useful shape.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §1.1.

**D-25 · The fallback ladder has two rungs** ⟲
— **Decision.** If recipe-level `staticCss` does not survive the merge: rung 1, a config-level
`staticCss` block in the preset; rung 2, ship the declarations as a config fragment the consumer
spreads — which §3.4 ships anyway, so the rung is already built. **There is no third rung.**
— **Rejected.** *A prebuilt stylesheet as the floor* — removed with D-30: it cannot carry consumer
style props or consumer theming, and it creates a second, half-functional support tier that every
later knob has to be documented into twice.
— **Effect.** Rung 2 is the realistic worst case, so Q2 is a question about where one declaration
lives rather than a project risk. If both rungs fail, that is a defect in Panda, not a fallback
situation.
— **Settled.** P3 gate; the third rung removed in the same phase, by `a8b4995`. **⟲** The stale
"three-rung" wording survived in `plan.md` §12 row 3 through P6 and P7, both of which flagged it
rather than fixing it in a second place; corrected at P9 (§7).
— **Reasoning.** `plan.md` §1.5, §4.4.

**D-26 · Q4 — Panda-shape style props, with a bounded alias list**
— **Decision.** The style-prop vocabulary is whatever the generated `isCssProperty` says. A Chakra
shorthand is aliased into `utilities.extend` only if it is one of Chakra's 95, is **absent** after
`@pandacss/preset-base` + the Chakra preset, and is expressible as a Panda utility without colliding.
Anything failing the third test is a parity delta, not an alias.
— **Rejected.** *Chakra-shape — reproduce Chakra's 241-entry utility table* — it is a **data table
reproduced from an Emotion runtime**, so expression tier, on a file we would then maintain against
every Chakra release; it would **override** the seven utilities the Chakra preset defines, forking the
package we depend on; most of the 95 are already Panda's; and every added utility widens the prop
surface the factory and the types must agree on.
— **Effect.** The list itself is a **step-3 deliverable**, bounded at ≤95 and expected to be small.
The rule is what P3 fixes.
— **Settled.** P3 gate · **Q4**.
— **Reasoning.** `plan.md` §2.1, §2.2, §2.4.

**D-27 · `renderStyled` is copied and extended, not rewritten** ⟲
— **Decision.** Copy hope-ui's 104-line factory and extend it at the `recipeClass` seam. Its
mechanism — the static key list with lazy value reads, the `css`-key exclusion, the precedence order,
the pure-computation SSR property — stands unchanged. **Four** prop-surface additions: the `css` array
form, `unstyled`, Chakra's five `html*` renames, and `styleSource`.
— **Rejected.** *Write a factory from scratch* — the four hard-won details each cost something to
learn and are visible in the source. *Three additions* — P5 measured the fourth: a machine part feeds
the factory a **merged** bag containing the machine's own DOM attributes, and `editable`'s
`size: 1` would be folded into `css({ size: 1 })` and never reach the element, with the class-name
assertion passing.
— **Effect.** `styleSource` is enforced by a two-node AST match, because the coverage check cannot see
this failure — the class it emits does exist.
— **Settled.** P3 gate (three); **extended at the P5 gate** (four).
— **Reasoning.** `prior-art.md` §2.5; `plan.md` §2.3; `component-blueprint.md` §4.1, §4.1.1.

**D-28 · `eject: true` stays, and `@pandacss/preset-base` is declared by the preset** ⟲
— **Decision.** `@chakra-ui-solid/preset` self-declares `presets: ["@pandacss/preset-base",
chakraPreset]`, so `presets: [chakraSolidPreset]` is sufficient in **both** our config and the
consumer's.
— **Rejected.** *Copy hope-ui's `panda.config.ts` verbatim* — `eject: true` was safe there only
because hope-ui's own preset chain declared the base; `@chakra-ui/panda-preset` declares no `presets`
array and reaches for `utilities: { extend: … }` and `conditions: { extend: … }`, so a verbatim copy
drops the style-prop utilities and the base conditions and every recipe then references conditions
that do not exist. *Fix it in the config, as P2 proposed* — that fixes **our** config only, and a
consumer who omits the line gets an unstyled library with no error. *Drop `eject`* — it readmits
Panda's default theme, which is what `eject` exists to remove; two token palettes then disagree on
`colors.gray.*` and nothing errors.
— **Effect.** The fix's **location** was reversed one phase after its content was settled.
— **Settled.** P3 gate; the defect found at P2.
— **Reasoning.** `prior-art.md` §2.2, §10.2 row 1; `plan.md` §3.2.

**D-29 · Distribution: Panda as an external package, consumption option B**
— **Decision.** `@chakra-ui-solid/components` ships `dist/panda.buildinfo.json` from `panda ship`, and
the consumer adds that one file to their `include`. Option A stays a **documented escape hatch**.
— **Rejected.** *Option A as the default — our `dist` in the consumer's `include`* — it would require
every consumer's Panda to parse the JSX-preserved source we ship for Solid-toolchain reasons, which
is a coupling this project does not need; it is a recursive glob behind pnpm's symlinks rather than
one stable path; and it re-parses every component on every consumer build. *Ship nothing and require
Option A* — A is genuinely better for buildinfo skew and for vendoring, so it is kept, not removed.
— **Effect.** B's one failure mode is **stale buildinfo**, mitigated mechanically by
`check:buildinfo-fresh`. Neither option answers Q2 — both hit the same static limit, which is why
D-23 is orthogonal.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §4.1.

**D-30 · We publish zero CSS; Panda is a hard prerequisite** ⟲
— **Decision.** **No `.css` file is published from any package, ever.** `@pandacss/dev` is a
**non-optional** `peerDependency` on `preset`, `styled-system` and `components` — the warning is the
point — plus a README first line and a CI check that no published `package.json` exposes a `.css`
file in `exports`, `files` or `style`.
— **Rejected.** *A secondary prebuilt-stylesheet path for consumers who do not run Panda* — it cannot
carry consumer style props, which is the capability the library is best known for; it cannot carry
consumer theming beyond CSS custom properties; and it creates a second support tier that every later
knob must be documented into twice. The cost is stated plainly: a consumer who will not run Panda is
not a consumer of this library.
— **Effect.** Removes rung three of D-25's ladder. `cssgen` keeps its internal role producing the dev
stylesheet the browser tests and the coverage check assert against; that output is never published.
— **Settled.** P3 gate. **⟲** Reverses the `brief-plan`'s secondary prebuilt-CSS path.
— **Reasoning.** `plan.md` §4.4.

**D-31 · `@chakra-ui-solid/styled-system` is published and marked external** ⟲
— **Decision.** Published, not workspace-private, and **external** in our build so the library and the
consumer app share one instance of the `css` runtime.
— **Rejected.** *hope-ui's model — keep it private and inline its runtime into the components bundle*
— inlining cannot give the single-instance guarantee, and it is what forced hope-ui to inline
styled-system's **types** as well, dragging in `@pandacss/types` → `pkg-types` → `typescript`, which
`rolldown-plugin-dts` throws on. Publishing removes the cause.
— **Effect.** Downgrades `hash: false` from required to kept **inside** our build — and D-34 promotes
it across the consumer boundary. A CI check asserts externality, because duplicating the runtime is
silent.
— **Settled.** P3 gate. **⟲** Reverses hope-ui's shipped model.
— **Reasoning.** `prior-art.md` §2.6; `plan.md` §4.3.

**D-32 · The exports map — `./is-valid-prop` in, `./styles.css` out** ⟲
— **Decision.** `./css`, `./tokens`, `./patterns`, `./recipes`, `./is-valid-prop`, `./types`,
`./package.json`. The rule sharpens to: **no export resolves to `jsx/index`, and none resolves to a
`.css` file** — while `./is-valid-prop` must exist and resolves *inside* `jsx/`.
— **Rejected.** *"Expose nothing from `jsx/`"* — too coarse: the generated, config-aware
`isCssProperty` lives there and the entire style-prop vocabulary rests on it. *Ship `./styles.css`* —
D-30.
— **Effect.** Makes the CI check two assertions rather than one.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §4.2; `prior-art.md` §2.6.

**D-33 · `jsxFramework: "solid"` is set, and `./jsx` is never exported** ⟲
— **Decision.** Generate the Solid JSX artifacts; never export them; hand-write our own factory.
— **Rejected.** *Leave `jsxFramework` unset so Panda emits no broken artifacts* — it would break
consumer style-prop extraction outright: with it set, Panda's default `jsxStyleProps: "all"` extracts
every style prop from **any capitalized JSX component** the consumer writes, with no factory and no
registration; unset, `<Box p={4}>` in consumer source extracts nothing. It would also cost the
config-aware `is-valid-prop`. *Export the generated factory* — it is broken against Solid 2.0 in three
ways at once: `splitProps` is gone, `solid-js/web` does not exist, and `mergeProps` survives only as an
`@solidjs/web` alias with presence-not-value semantics.
— **Effect.** The rule is *"never export"*, not *"never generate"*.
— **Settled.** P3 gate; the correction originates at P2. **⟲** Reverses the `brief-plan`'s own
earlier draft, which it records and retracts.
— **Reasoning.** `prior-art.md` §2.3; `plan.md` §3.1, §4.2.

**D-34 · `@chakra-ui-solid/preset` exports a preset *and* a config function**
— **Decision.** One subpath, `.`, with two exports: `chakraSolidPreset` (default) and
`chakraConfig(options?)` (named) — a function returning a `defineConfig`-shaped fragment carrying every
knob that must match ours, with the preset already in `presets`.
— **Rejected.** *Config-only, as the `brief-plan` has it* — `hash` and `prefix` must agree across the
library/consumer boundary or **nothing is styled**, silently and at total scale; a fragment makes that
unconstructable, a documented sentence does not. *A second `./config` subpath* — the consumer who needs
the preset and the consumer who needs the fragment are the same consumer, and a second subpath only
adds a way to import half of what they need. *An object rather than a function* — `chakraConfig()`
called with no arguments keeps the responsive opt-in a change of argument rather than of call shape.
— **Effect.** Two CI checks follow, and the step-4 consumer proves the failure by deliberately
breaking it once.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §3.3, §3.4.

**D-35 · Responsive recipe variants are off by default, with a three-grain opt-in**
— **Decision.** `chakraConfig({ responsive })` — omitted, `{ button: ["size"] }`, `["button"]`, or
`true` — expanding into the `staticCss` form Panda already understands. Emitted as a **top-level**
block, because it is the consumer's config rather than ours.
— **Rejected.** *Responsive on by default* — it multiplies 488 variant values by 6 conditions, roughly
2,900 rules, for a library whose default sheet already carries 488. *Leave it as a raw `staticCss`
line the consumer hand-writes* — it is the knob most likely to be got wrong, and getting it wrong is a
silent unstyling.
— **Effect.** **Types cannot follow the flag** — `size={{ base: "sm", md: "lg" }}` type-checks whether
or not the rules were generated — so forgetting the opt-in is a silent unstyling and the coverage
check is what catches it. A row in the parity delta table.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §1.4, §3.8.

**D-36 · The dynamic-value contract — three routes, in preference order**
— **Decision.** Route 1, a literal or token value; route 2, a value from a known finite set declared
in `staticCss`; route 3, a CSS custom property through inline `style` consumed by a static class.
**There is no fourth option.**
— **Rejected.** *Support runtime values, as Chakra does* — it requires serializing styles at render
time, which is §0. *Leave route 3 to convention* — using it accidentally as route 1 fails silently, so
it needs a lint rule.
— **Effect.** D-23 automates route 2 for **recipe variants**; route 2 stays manual only for atomic
values a component's own logic picks. This is the loudest page in the docs, not a footnote in theming.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §3.5; `docs-plan.md` §1.

**D-37 · Four override paths, and no runtime system object**
— **Decision.** CSS custom properties → style props / `css` prop → `theme.extend.slotRecipes.<key>` in
the consumer's config → a different preset. A component reaches its recipe by **static import** from
the generated `styled-system/recipes`, resolved once on the Root and read from context by part
components.
— **Rejected.** *Reproduce `useRecipe`/`useSlotRecipe`* — both resolve through `useChakraContext()`, a
runtime system object, and there is none here. The variant **API** is Chakra's; only the resolution
differs, and that is a delta-table row.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §3.6, §3.7.

**D-38 · Color mode: we ship nothing** ⟲
— **Decision.** No provider, no hook, no toggle. What we own is the **contract**: the preset's
semantic tokens are written against Panda's `_dark` condition, so color mode is a class or attribute
on the root element plus a documented consumer snippet.
— **Rejected.** *Ship a color-mode provider, as the `brief-plan`'s package description implies* —
measured, `colorMode` and `ColorMode` appear **zero times** in `@chakra-ui/react`'s source; Chakra v3
ships color mode as a **CLI snippet** over `next-themes`, installed into the consumer's app. Under the
port rule, so do we.
— **Settled.** P3 gate. **⟲** Reverses `brief-plan` §2.5's package description.
— **Reasoning.** `plan.md` §7.1.

**D-39 · Direction, locale and environment: two contexts, no catalog**
— **Decision.** A locale context providing `locale` and `dir`, and an environment context providing
`getRootNode`. `isRTL` comes from `@zag-js/i18n-utils`. RTL correctness rides on the preset's logical
properties; we thread `dir` into every machine and set it on root elements.
— **Rejected.** *Rebuild hope-ui's i18n package — catalog, resolver, message formatting* — Chakra has
none of those; it re-exports Ark's two providers and adds nothing, and Ark's is ~20 lines. Copying
hope-ui's would also pull in Apache-2.0 derivatives of `@react-aria/i18n`.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §7.2, §7.3; `prior-art.md` §9.

**D-40 · Presence lives in `@chakra-ui-solid/system`, which therefore depends on `zag-solid`**
— **Decision.** The render strategy — `lazyMount`, `unmountOnExit`, `skipAnimationOnMount`, `hideMode`,
the `data-state` + `hidden` prop getter, and the gate that renders `null` — lives in `system`.
— **Rejected.** *Put it in `components`, beside the first component that needs it* — at least six
components set `unmountOnExit`/`lazyMount` by default, so it cannot live in any one of them. *Put it
in `zag-solid`* — it is a render strategy, not an adapter concern.
— **Effect.** Adds a `system → zag-solid` edge the `brief-plan`'s graph does not have. The graph stays
strictly downward.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §5.2, §5.3, §6.

**D-41 · Workstream B carries all 18 atomic recipes**
— **Decision.** The non-machine surface is not only layout and typography — **all 18 atomic recipes
belong to it**, and five of them are composed into later slot recipes.
— **Rejected.** *Treat Workstream B as a mop-up after the interesting work* — it is the largest single
step in the project and a hard prerequisite for three later batches.
— **Effect.** Its **position** is unchanged (after the factory, before machine-component volume); its
**weight** is not.
— **Settled.** P3 gate; sized at P6 to 45 components.
— **Reasoning.** `plan.md` §10; `roadmap.md` §9.1.

**D-42 · The parity delta table gains a Cause column**
— **Decision.** Separate `CSS-in-JS` deltas, which follow from §0 and are permanent, from
`React→Solid` deltas, which would exist in any Solid port.
— **Rejected.** *One undifferentiated list* — it makes every framework consequence look like a cost of
the no-runtime-CSS rule, which is both unfair to the rule and misleading to a reader deciding whether
to adopt.
— **Settled.** P3 gate; a `React→Solid` row added at P9 for `Portal`'s `disabled` (§7).
— **Reasoning.** `plan.md` §0.4.

**D-43 · Build mechanics: tsdown, JSX-preserved output, ESM only**
— **Decision.** tsdown with `transform.jsx: "preserve"`, shipping `.jsx` + `.d.ts` under the
**`"solid"` export condition** with no `"import"`/`"default"` fallback; `styled-system`,
`@pandacss/*`, `pkg-types` and `typescript` in `deps.neverBundle`; `comments.legal` pinned; ESM-only;
no changeset while at `0.0.0`.
— **Rejected.** *`tsup` / `esbuild-plugin-solid` / `unplugin-solid`* — all bundle
`babel-preset-solid@1.x`, which compiles a JSX `ref` into an import of `use`, a name `@solidjs/web`
2.0 renamed; any `ref=` in shipped output then breaks at load. *An `"import"` fallback* — it hands a
consumer's toolchain the wrong build silently.
— **Effect.** `comments.legal` is load-bearing for attribution, not cosmetic: an untagged provenance
paragraph is stripped by the build.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §8; `prior-art.md` §2.6.

**D-44 · Dev-time resolution is one unit, and codegen is ordered**
— **Decision.** `tsconfig.base.json#paths`, a shared `vitest-aliases.ts` and the docs app's Vite alias
are **one unit** with a check script; `codegen` precedes everything that reads the generated
artifacts, `cssgen` follows it, and a `postinstall` runs `codegen` so a fresh clone type-checks.
— **Rejected.** *Let each config own its own aliases* — drift between the three is silent and produces
a build that resolves to a stale `dist` and passes.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §9.

**D-45 · Solid pinned at `2.0.0-beta.32` through a workspace catalog**
— **Decision.** Lockstep across `solid-js` / `@solidjs/signals` / `@solidjs/web` /
`babel-preset-solid`, plus `overrides: { babel-preset-solid: "catalog:" }`. Node 24 / pnpm 11.10.0 via
corepack and `devEngines`.
— **Rejected.** *Track `latest`* — `latest` is the 1.x line, and `beta` is a **1.x prerelease**; the
2.0 line is on `next`. *Pin each package independently* — the four drift, and the override exists
because that drift is a live bug.
— **Settled.** P3 gate.
— **Reasoning.** `plan.md` §8; `brief-plan` §3.4.

### 3.4 P4 — the adapter, milestone one

**D-46 · Q6, first answer — the fork is copied from `ef91b69`, all fourteen files**
— **Decision.** Copy the seven source and seven test files from hope-ui's spike tip, unchanged except
for three named deltas, plus the six per-file design notes.
— **Rejected.** *Re-derive from upstream `1.43.0`* — the four defects were measured against running
components, so re-deriving means re-building both probe components; two of the five divergences are
**discoveries with a measured cost**, not migrations (the `$PROXY` `mergeProps` fixed a 40× constant;
`bindable`'s boxing dodges Solid 2.0's `createSignal(fn)` memo overload, which fails silently); the 86
test cases are the evidence and do not re-derive either. *Copy, then re-base onto 1.43.0's source* —
the re-base has nothing to bite on: the adapter is byte-identical across the major and the three real
changes are one line each. *A git submodule or git dependency on hope-ui* — the Panda-era and spike
code is reachable only by ref, never as a published package. *Copy from `e9c2f81`* — the fork does not
exist at that ref.
— **Effect.** Milestone one is unblocked, and its cost is one honest trade: a larger diff against
upstream on the day upstream ships its own Solid 2.0 adapter.
— **Settled.** P4 gate, 2026-08-09 · **Q6**, first half.
— **Reasoning.** `zag-solid-adapter.md` §1.1, §1.3.

**D-47 · Q6, second answer — the fork is a third-party MIT derivative, not a hope-ui carry-over** ⟲
— **Decision.** Seven `@license` headers naming `chakra-ui/zag` → `packages/frameworks/solid/src/…`,
plus a row in the root `NOTICE.md` and in the package's, with the **`1.42.0` baseline** recorded
because that is the number a re-sync diffs against. No sync obligation toward hope-ui; a **standing**
one toward upstream.
— **Rejected.** *A provenance note, as Q6's assumed answer says* — that is the hope-ui-ownership
answer, and the fork is not hope-ui-owned in the sense it assumes. *Attribute only the files that are
still recognisably derivative* — re-deriving the line file by file is not worth an afternoon, and the
cost of being wrong is shipping an unattributed derivative **of the project we are porting**.
— **Effect.** The one carry-over in the repo that is a live tracking relationship with a third party,
and it is **meant to be retired**.
— **Settled.** P4 gate · **Q6**, second half.
— **Reasoning.** `zag-solid-adapter.md` §1.1, §7; `legal.md` §1.3.

**D-48 · The test harness comes over in milestone one, not later** ⟲
— **Decision.** `internal-test-utils` (`mount`, the axe helper, the hydrate fixture), the three-project
Vitest split, `vitest-aliases.ts`, the hydration bridge and the `solid-contract` files all land with
the adapter.
— **Rejected.** *Treat the testing stack as a bootstrap detail separable from the adapter* — the
fork's seven test files import `mount` and `expectNoA11yViolations`, so there is no ordering in which
they run before the harness exists.
— **Effect.** Also dates the `internal-test-utils → system` edge at **milestone 3**, not milestone
one: at milestone one the harness touches no styling and that edge must not exist.
— **Settled.** P4 gate; the graph correction applied at P9 (§7).
— **Reasoning.** `zag-solid-adapter.md` §1.2, §10 row 11; `testing.md` §1.8.

**D-49 · Two exports the fork does not carry**
— **Decision.** Drop `useSyncExternalStore` and `Key`.
— **Rejected.** *Keep them for surface parity with upstream* — `useSyncExternalStore` exists for 1:1
API parity with React's hook, nothing in Zag consumes it, and Solid 2.0 has no equivalent to bind it
to; `Key` is a Solid **rendering** primitive upstream passes through for convenience, and re-exporting
it would put a third-party package in our dependency set for a symbol a consumer can import directly.
— **Effect.** The only two places our published surface is narrower than upstream's, recorded so a
future re-sync knows they were choices.
— **Settled.** P4 gate.
— **Reasoning.** `zag-solid-adapter.md` §2.2, §3.3.

**D-50 · The B5 `untrack`-around-`useMachine` idiom is deleted, not documented** ⟲
— **Decision.** A Root calls `useMachine(machine, props)` **bare**. A `[STRICT_READ_UNTRACKED]` at that
call site is a real defect in the component or in the machine's `watch`, not a missing wrapper.
— **Rejected.** *Document the wrapper, as the `brief-plan` instructs* — the fix moved **down** into the
fork's `seedFromProps` helper, and both root components at the spike tip have zero `untrack`. A
blueprint teaching the wrapper would stamp a redundant `untrack` into 100+ components, each
suppressing a diagnostic the fork already handles — and each suppressing a **real** one the day a
component genuinely reads a prop untracked.
— **Settled.** P4 gate; applied at P5. **⟲** Reverses `brief-plan` §3.5 row B5 and its doc-4
instruction.
— **Reasoning.** `zag-solid-adapter.md` §4.2; `component-blueprint.md` §2.1, §2.2.

**D-51 · A3's prescribed fix is superseded by a `$PROXY` lazy proxy** ⟲
— **Decision.** `mergeProps` reads **nothing** at construction; only its structural `has`/`ownKeys`
traps are untracked, and the per-key `get` is untouched.
— **Rejected.** *"`untrack` the construction pass only"* — there is no construction pass. The eager
enumeration it described also cost a measured 40× constant: 8,004 `getItemProps` calls per keystroke
at 200 rows.
— **Effect.** The one divergence that **may not retire** when upstream ships its adapter — which is
why `index.ts` exports `mergeProps` from its own module rather than re-exporting.
— **Settled.** P4 gate. **⟲** Reverses `brief-plan` §3.5 row A3.
— **Reasoning.** `zag-solid-adapter.md` §3.4, §4.1; `prior-art.md` §6.

**D-52 · Three named deltas against `1.43.0`, and the controlled-mode predicate is aligned** ⟲
— **Decision.** **D1** — add upstream's `status !== Started` guard to `onCleanup`. **D2** — update one
test assertion: `data-ownedby` now **unions** rather than last-wins, which is the fork's own tripwire
firing on the version move exactly as designed. **D3** — align `bindable`'s controlled predicate to
`!== undefined` and delete the JSDoc claim.
— **Rejected.** *Keep the fork's loose `!= undefined`* — its premise, that this is Zag's rule, is
contradicted by all six sibling adapters at 1.43.0; under `!=`, `value={null}` is *uncontrolled* here
and *controlled-with-null* in Chakra, on every machine with a nullable value prop. It is **not** a
SolidJS idiom, so the port rule does not exempt it.
— **Effect.** Refutes the assumption that the fork applies unchanged to 1.43.0 — closed with three
one-line findings rather than carried as a residual risk. Becomes a per-component DoD rule.
— **Settled.** P4 gate. **⟲** Reverses the fork's own documented position on D3.
— **Reasoning.** `zag-solid-adapter.md` §4.3.

**D-53 · §0 is two scopes, and the machine-set audit passes** ⟲
— **Decision.** §0 bans runtime CSS-in-JS **engines** across the whole closure — a **manifest** check,
because a dependency is judged by what it *is* — and bans runtime sheet-writing in **our own source** —
a **grep**, because our code is judged by what it *does*. **Result: PASS.** Splitter ships unchanged
with its gesture-cursor stylesheet.
— **Rejected.** *One grep over both* — it would have failed Splitter, whose `setupGlobalCursor` writes
one static `* { cursor: … !important }` rule for the duration of a drag; excluding the component would
have **removed** behavior Chakra has, which the port rule treats as a divergence exactly as adding
behavior is. *Only the manifest check* — nothing in a manifest stops our own code growing a
"just inject one keyframe" fix that installs clean and defeats extraction from the inside.
— **Effect.** `plan.md` §0 was rewritten at this gate to the two-scope form; `CLAUDE.md` carries the
same form; `testing.md` §5 is two scripts, with what merging them would have wrongly failed recorded
in both directions.
— **Settled.** P4 gate. **⟲** Corrects the phrasing `brief-plan` §8 assumption 8 carried.
— **Reasoning.** `zag-solid-adapter.md` §5; `testing.md` §5.

**D-54 · Two upstream filings, both at milestone one**
— **Decision.** File **A1** — boolean `aria-*` malformed in `@zag-js/solid`, a live bug for every Solid
Zag consumer on 1.x, with a ~4-line fix and two regression tests that drop into upstream's bench. File
**`ariaHidden` → `suppressOthers`** in `@zag-js/aria-hidden`, which closes the `inert` gap for six
frameworks **and for Chakra** at once.
— **Rejected.** *Fix the `inert` gap in our layer* — the port rule struck it, and upstream is the only
route that also reaches the library we are porting. *File later, when the affected component exists* —
the lead time on an upstream fix is the point, and P7 needs an open issue number to cite per inherited
allowance.
— **Settled.** P4 gate.
— **Reasoning.** `zag-solid-adapter.md` §8.

**D-55 · The bundle re-measurement moves to milestone 5** ⟲
— **Decision.** Milestone one records the **adapter's own fixed weight** — a number nobody has. The
`+13.4 KB gz` comparison happens at milestone 5.
— **Rejected.** *Re-check the bundle axis at step 2, as the `brief-plan` expects* — milestone one
installs `@zag-js/{core,types,utils}` only; no machine closure enters the tree until Dialog, so a
number measured then would be the adapter's weight and not the figure in question.
— **Settled.** P4 gate. **⟲** Reverses `brief-plan` §5 step 2's framing.
— **Reasoning.** `zag-solid-adapter.md` §9.2; `testing.md` §10.

**D-56 · The milestone-one gate is seven lines, and `mount()` silent is the load-bearing one**
— **Decision.** 86 fork cases, 51 upstream cases in a one-time parallel run, 18 contract cases,
`mount()` silent, the §0 audit green against the **installed** closure, seven headers + both
`NOTICE.md` tables, A1 filed.
— **Rejected.** *Count 86 + 51 as 137* — `machine.browser.test.tsx` **is** the port of two of the four
upstream files. *Treat the parallel run as redundant* — it is what proves the consolidation lost
nothing. *Verify by file existence* — a DoD item verified only that way is verified in name only.
— **Effect.** Every one of A2, A3 and B5 was **discovered** by the `mount()` gate and would be
invisible without it: Solid 1.x has no strict-read phase, so upstream's own suite cannot see them.
— **Settled.** P4 gate.
— **Reasoning.** `zag-solid-adapter.md` §6.5.

### 3.5 P5 — the blueprint

**D-57 · Q7 — Dialog is the worked component**
— **Decision.** Dialog.
— **Rejected.** *Accordion* — it would have missed Portal and therefore every cross-tree hydration
question; the focus trap, scroll lock and `aria-hidden` blanket, and therefore the entire a11y
baseline; presence with `lazyMount`/`unmountOnExit`; the `aria-controls` presence gate; and the
`hidden`-vs-`display` collision at full strength. Its one advantage — a **repeated part** — was
recorded and assigned to P6 rather than lost.
— **Effect.** Dialog crosses every seam this project had no evidence for, at once, which is the job of
the worked component.
— **Settled.** P5 gate · **Q7**.
— **Reasoning.** `component-blueprint.md` §0.

**D-58 · `Portal` is a standalone component, not a Dialog part**
— **Decision.** Ship `Portal` in its own folder, used *inside* `Dialog.Root`.
— **Rejected.** *Treat it as a Dialog part, as the P5 brief's part list does* — `dialog.anatomy.ts`
names seven parts and `portal` is not among them, and Chakra's `namespace.ts` exports fifteen names
with no `Portal`.
— **Settled.** P5 gate.
— **Reasoning.** `component-blueprint.md` §0.3, §11.12.

**D-59 · The `aria-controls` presence-gated override is ported** ⟲
— **Decision.** Port it. Six Ark components carry it, four with a dedicated test, and Chakra inherits
it — so under the port rule it is **parity, not an improvement**.
— **Rejected.** *"Not taken", as P2 concluded for both override getters* — half wrong, measured. The
`aria-labelledby` half stands: it genuinely is not overridden anywhere upstream.
— **Effect.** One of the three independent reasons the closed-state axe allowances do not transfer
(D-60).
— **Settled.** P5 gate. **⟲** Reverses `prior-art.md` §10.1 row E, in half.
— **Reasoning.** `component-blueprint.md` §1.2, §13 row 1.

**D-60 · The a11y baseline is `aria-hidden-focus` on open-state assertions only** ⟲
— **Decision.** Three register entries — `dialog`, `drawer`, `popover` — all `aria-hidden-focus`, all
open-state, each citing the same upstream filing. Closed-state assertions run clean.
— **Rejected.** *Carry ZagDialog's measured six forward as our baseline* — the three closed-state
`aria-valid-attr-value` allowances do not transfer, on three independent grounds, no one of which is
load-bearing: we port the `aria-controls` override (D-59), so a closed trigger emits no IDREF to
dangle; Chakra's Dialog defaults `lazyMount` and `unmountOnExit`, so closed **is** unmounted unless a
consumer opts out; and A1 is fixed in the fork, which closes the other route to that rule.
— **Effect.** **Predicted, not measured** — verified at step 5. If it turns out wrong the number goes
up and the register records it; what must not happen is the first failure being "fixed" by
re-introducing the kernel.
— **Settled.** P5 gate. **⟲** Revises `prior-art.md` §7's six; the stale wording survived in two
places until P9 (§7).
— **Reasoning.** `component-blueprint.md` §9.1–§9.3; `definition-of-done.md` §5.

**D-61 · Part components do not strip `id`** ⟲
— **Decision.** A consumer `id` reaches the element, last-wins; the Root's `ids` prop is the documented
override, and it is **proven** to work — attribute and lookup resolve through the same function, so
they cannot diverge.
— **Rejected.** *Strip `id`, as hope-ui's parts did* — Ark and Chakra both forward it, so stripping is
a divergence; and the claim that a consumer `id` is impossible was one of the two spike findings that
a five-line probe refuted.
— **Settled.** P5 gate. **⟲** Reverses hope-ui's practice.
— **Reasoning.** `component-blueprint.md` §3.4, §13 row 10.

**D-62 · The slot recipe is resolved once on the Root**
— **Decision.** One `sva` call per Root, exposing a per-slot class map through context; part components
read their slot from it.
— **Rejected.** *Resolve per part* — it invokes the recipe function once per part per render, and for a
repeated part once per item; the B2 gate asserts by spy that it is invoked once.
— **Effect.** The seam has **no precedent anywhere** — hope-ui's `recipeClass` hole was never filled —
which is why step 4 precedes Dialog.
— **Settled.** P5 gate.
— **Reasoning.** `component-blueprint.md` §4.2, §4.5.

**D-63 · `hideMode: "activity"` is not shipped**
— **Decision.** `"display-none"` only.
— **Rejected.** *Reproduce it* — it maps to React 19's `<Activity>`, which has no Solid equivalent.
— **Effect.** A `React→Solid` row in the delta table, not a gap to paper over.
— **Settled.** P5 gate.
— **Reasoning.** `prior-art.md` §8.3; `plan.md` §0.4, §6.

**D-64 · The `hidden`-vs-`display` rule is written to survive either answer to P3-E**
— **Decision.** Never strip Zag's `hidden` to work around a recipe's `display`, except as a delegation
whose new owner can be named. Presence gates the render instead.
— **Rejected.** *Make the strip the standing per-component rule, as the tax's original framing implies*
— Chakra pays neither half: its preflight makes `[hidden]` unbeatable with `!important`, and six
components unmount rather than hide. Both mechanisms are ours to **port**, not to invent.
— **Effect.** Pinned by a computed-style test in the failing configuration —
`unmountOnExit={false} lazyMount={false}` — because a class-name assertion cannot see it.
— **Settled.** P5 gate.
— **Reasoning.** `component-blueprint.md` §6; `prior-art.md` §5.1.

**D-65 · `composeEventHandlers` is for part shapes C and D only** ⟲
— **Decision.** Keep the carry-over; change its justification. A **machine** part never calls it,
because the adapter's `mergeProps` already chains `on*` across sources.
— **Rejected.** *"Needed the moment a part composes a consumer handler with a machine handler"* —
measured, that is precisely the case the adapter already handles.
— **Settled.** P5 gate. **⟲** Reverses the carry-over's stated reason, not its verdict.
— **Reasoning.** `component-blueprint.md` §3.4, §13 row 9.

**D-66 · Four part shapes now; the fifth is deferred to the first component that has one**
— **Decision.** Shapes A–D at P5. The **repeated part** shape is not invented against no worked
component.
— **Rejected.** *Invent it now* — inventing a pattern against no worked component is how a pattern gets
stamped wrong 100 times.
— **Effect.** Settled at P6 by Accordion, behind five gates, and **no other component with a repeated
part starts until all five hold** — nine batched components depend on it.
— **Settled.** P5 gate; discharged at P6.
— **Reasoning.** `component-blueprint.md` §0.2, §3.2, §14; `roadmap.md` §7.

### 3.6 P6 — the parity matrix

**D-67 · Chakra ships 115 component directories** ⟲
— **Decision.** 115, measured by directory.
— **Rejected.** *118* — the entry count, which includes `index.ts`, `icons.tsx` and `theme.tsx`. The
same counting-convention class as 47→46 files.
— **Effect.** Changes no conclusion — the gap argument survives at 115 — but the matrix has 115 rows
and has to say why.
— **Settled.** P6 gate.
— **Reasoning.** `roadmap.md` §1.1, §13 row 2.

**D-68 · The 56 slot recipes are not the machine surface** ⟲
— **Decision.** 34 are driven by a same-named machine, 7 by a machine under another name, and **15
have no machine at all**. The companion claim — that all 18 atomic recipes are the non-machine surface
— is exactly true.
— **Rejected.** *"The 56 slot recipes are, correspondingly, the machine surface"* — false by 15.
— **Effect.** The per-component DoD rule has **three shapes** rather than one: where there is no
`connect()`, two of its rules are vacuous and the anatomy check tests the slot list alone.
— **Settled.** P6 gate. **⟲** Reverses half of `plan.md` §10's sentence; corrected there at P9 (§7).
— **Reasoning.** `roadmap.md` §2.1–§2.3, §13 row 3.

**D-69 · The exclusions are `for`, `show` and charts — and nothing else** ⟲
— **Decision.** `for` and `show` are Solid-native language constructs; charts is excluded on a
**dependency** ground, not a style one. `portal` ships, `client-only` ships, `presence` ships, and
`environment` is **relocated** to a context rather than excluded.
— **Rejected.** *Exclude `client-only`, `environment`, `for`, `show`, `portal` and `presence` as
React-idiom or Solid-native* — wrong by four, each measured individually.
— **Settled.** P6 gate. **⟲** Reverses `brief-plan` §4.1 doc 5's list; `plan.md` §0.4's note corrected
at P9 (§7).
— **Reasoning.** `roadmap.md` §5, §13 row 1.

**D-70 · `Portal`'s `disabled` is not shipped at all** ⟲
— **Decision.** Omit the prop. The component is ~6 lines: `container`, `children`, the `isServer`
guard, the environment-aware mount.
— **Rejected.** *Ship it non-reactive with a note* — a prop that silently ignores changes is the
silent-failure hazard in prop form; **omitting it makes passing it a type error**. *Ship it reactive* —
that needs a `children()`-resolved `<Show>`, which relocates the hydration key for the whole portalled
subtree, a real cost for a prop nobody toggles.
— **Effect.** A `React→Solid` row in the delta table. The two reasons the component still exists —
Solid's `Portal` **throws** server-side, and it mounts to `document.body` while the machine queries
`getRootNode()` — are its whole justification and neither is negotiable.
— **Settled.** P6 gate. **⟲** Reverses P5's §11.12, which shipped it non-reactive.
— **Reasoning.** `roadmap.md` §5.1, §13 row 1b.

**D-71 · `swittch` is a broken token reference, not a spelling oddity** ⟲
— **Decision.** Consume the slot-recipe key `swittch` **verbatim**, and add one delta —
`theme.extend.tokens.cursor.switch = { value: "pointer" }` — because the preset registers the cursor
token under the misspelling while its Switch recipe references `cursor: "switch"`, so the preset
silently loses `cursor: pointer` where Chakra's runtime theme does not.
— **Rejected.** *Alias the slot-recipe key to `switch`* — it registers the same `className: "switch"`
body under two keys and emits its CSS twice. *Rename it in our preset* — it forks the thing we depend
on. *Inherit the missing cursor* — it is a **preset defect rather than Chakra behavior**, so
inheriting it is a divergence.
— **Effect.** The upstream issue now has a concrete defect to report, which is the difference between
one that gets fixed and one that gets closed.
— **Settled.** P6 gate. **⟲** Reverses `plan.md` §1.3's *"invisible to consumers either way"*;
corrected there at P9 (§7).
— **Reasoning.** `roadmap.md` §1.3c, §13 row 7.

**D-72 · Two preset deltas, two attribution tiers**
— **Decision.** The `cursor.switch` token key owes **nothing** and must not enter the attribution
registry. The **`container` recipe body**, ported from `@chakra-ui/react`'s theme, is **expression
tier** — the first such file outside the fork — and brings the preset package its first `NOTICE.md`.
— **Rejected.** *Treat both the same* — a check demanding a header for a one-word token value would be
wrong; a project that skipped the header on a reproduced recipe body would be an unattributed
derivative. *Ship Container unstyled* — it is the one component of the six that **is** styled in
Chakra, so inheriting the gap would be a real regression rather than fidelity.
— **Effect.** The delta and the allow-list entry it retires land in **one commit**, and the allow-list
check fails if the entry outlives the delta.
— **Settled.** P6 gate.
— **Reasoning.** `roadmap.md` §1.3a, §2.5, §13 row 7b; `definition-of-done.md` §6; `testing.md` §9.

**D-73 · Six components ship with a recipe key that resolves to nothing**
— **Decision.** `clipboard`, `pagination`, `toggle`, `download-trigger`, `text` and `container` go on
the coverage allow-list, each with a reason and an expiry. Five of the six are unstyled **in Chakra
too**.
— **Rejected.** *Invent recipes for them* — that is styling Chakra does not have. *Fail the coverage
check* — it would be red permanently on a faithful port.
— **Effect.** `container` is the exception that expires (D-72).
— **Settled.** P6 gate.
— **Reasoning.** `roadmap.md` §2.5; `definition-of-done.md` §6.

**D-74 · Seven slot recipes duplicate a slot, and the coverage check must dedupe**
— **Decision.** Deduplicate before comparison; assert each duplicated slot emits exactly one class
token.
— **Rejected.** *Treat the duplicates as real slots* — the check would report seven permanent false
failures, and a check that is always red is a check nobody reads.
— **Settled.** P6 gate.
— **Reasoning.** `roadmap.md` §1.3b, §13 row 4; `testing.md` §3.3.

**D-75 · Step 5b is inserted: Popover, the floating probe, before volume**
— **Decision.** Build Popover immediately after Dialog and **before** B1, to measure the popper
`--z-index` seam — Zag writing `--layer-index`/`--z-index` imperatively into the same `style`
attribute Solid binds reactively, with a `MutationObserver` watching it.
— **Rejected.** *Price it from the prior art* — neither spike built a floating component, so nobody has
measured it. *Leave it to B1* — five B1 components are written against the floating pattern it
settles, and the recurring floor is known to **grow by category**.
— **Effect.** The gate produces a **number**, and then either a sentence in the blueprint or a rule —
which of the two is itself a judgement (§6).
— **Settled.** P6 gate.
— **Reasoning.** `roadmap.md` §8, §9.1.

**D-76 · `RootProvider`, `PropsProvider` and `Context` ship with each component** ⟲
— **Decision.** Per-component rows in each batch, never a later sweep. 41 / 47 / 43 components carry
them.
— **Rejected.** *Defer them behind a `./hooks` subpath* — measured wrong: Chakra exports `useDialog`
from the **component's own barrel**, and `./hooks` is 14 unrelated utility hooks, seven of which are
React re-render machinery and are excluded individually. *A later sweep* — 131 namespace edits after
the fact.
— **Settled.** P6 gate. **⟲** Reverses `component-blueprint.md` §11.13's deferral.
— **Reasoning.** `roadmap.md` §10, §13 row 5.

**D-77 · Presence has two families, and the render strategy must be source-agnostic** ⟲
— **Decision.** Family Z takes `present` from a `@zag-js/presence` instance; family M —
`collapsible` and `accordion` — takes it from the **collapsible machine's own `visible`**. The
refactor lands at **step 5**, not after B2.
— **Rejected.** *Assume presence always comes from a presence instance* — B2 would then be written
against the wrong shape and the refactor would land after nine components depend on it.
— **Settled.** P6 gate. **⟲** Reverses `component-blueprint.md` §7.2's single-source assumption.
— **Reasoning.** `roadmap.md` §6.2, §13 row 6.

**D-78 · The dependency graph's real width is measured per batch**
— **Decision.** 37 `@zag-js/*` machine packages on `components`, `@zag-js/presence` on `system`, four
Zag utility packages, and `@pandacss/dev` as the graph's first edge required **of the consumer**.
Closure growth is recorded **per batch**.
— **Rejected.** *A flat per-component bundle number* — the arithmetic error the prior art already
corrects twice; packages are shared across components in a way a per-component figure hides.
— **Settled.** P6 gate; `plan.md` §5.2 annotated at P9 (§7).
— **Reasoning.** `roadmap.md` §11, §13 row 9.

### 3.7 P7 — the quality bar

**D-79 · The gate rule: every rule names a script, or is labelled unenforced**
— **Decision.** Every rule in the definition of done names a script, a test or a CI job. A rule with no
enforcement is deleted, or moved to the *"conventions, unenforced"* section and labelled.
— **Rejected.** *Keep aspirational rules in the main tiers* — the project has already paid for this
once: stories were written, typechecked, linted and committed without ever being opened, and every one
crashed. *Delete the unenforceable ones* — deleting is not the same as pretending they were enforced;
five survive, each saying what a reader is trusted to do instead.
— **Settled.** P7 gate.
— **Reasoning.** `definition-of-done.md` §0, §7.

**D-80 · The definition of done has four tiers** ⟲
— **Decision.** Per **file**, per **component**, per **batch**, per **release**.
— **Rejected.** *Per file and per component only* — per **batch** is where a batch's proof stops being
prose and becomes a test, and per **release** is where the distribution and attribution checks live;
neither fits in the other two.
— **Settled.** P7 gate. **⟲** Extends `brief-plan` §4.1 doc 6; recorded at P9 (§7).
— **Reasoning.** `definition-of-done.md` §1–§4; `roadmap.md` §13 row 8.

**D-81 · Class-name assertions are banned; visual assertions read computed styles**
— **Decision.** In the `browser` and `ssr` projects, every visual assertion reads a computed style. One
carve-out, so the rule is not wrong: asserting a class is **absent** is fine.
— **Rejected.** *Assert class names, as the prior art's suite does* — `classList.contains("p_4")` passes
on a completely unstyled element. hope-ui's suite could not see that because it ran against a dev
stylesheet generated from a config it controlled; ours cannot afford the same blind spot.
— **Settled.** P7 gate.
— **Reasoning.** `prior-art.md` §4.4; `testing.md` §2; `definition-of-done.md` rule 2.3.

**D-82 · `check:css-coverage` — the only mechanical defense against silent unstyling**
— **Decision.** Diff the variant surface components can emit against the generated stylesheet, with the
seven duplicate slots deduplicated, an allow-list with reasons and expiries, and a **configuration
canary** that makes a `hash`/`prefix` mismatch exit `E_CONFIG_MISMATCH` rather than green or with a
4,000-row diff.
— **Rejected.** *Rely on tests* — a test asserting a class name cannot see it, and a computed-style
test only covers the variants a test happens to render. *Rely on types* — types come from our recipes
while the CSS comes from the consumer's config, so they cannot disagree in the direction that matters.
— **Effect.** Five things it does **not** catch are enumerated with the artefact that does, so the
check is not mistaken for total coverage.
— **Settled.** P7 gate.
— **Reasoning.** `testing.md` §3; `definition-of-done.md` rule 2.4, §6.

**D-83 · The axe allowance register is the only place an allowance is expressible**
— **Decision.** `expectNoA11yViolations({ component, scope })` reads the register; **no inline
allowance is expressible**; and the assertion runs in both directions, so an allowance that stops
being needed **fails**.
— **Rejected.** *An inline `allowIncomplete` per test* — it makes an allowance a local convenience
rather than a recorded, cited, expiring exception. *A global flag* — it hides the day an upstream fix
lands.
— **Settled.** P7 gate.
— **Reasoning.** `testing.md` §4; `definition-of-done.md` §5.

**D-84 · Storybook is a required CI job, not only a dev harness** ⟲
— **Decision.** `test:storybook` builds and drives every story, and it must be **Storybook** rather
than `composeStories` under Vitest.
— **Rejected.** *Treat it as a dev harness only* — the two failures it exists for are invisible to
every other compile: the loader-installed `focus` accessor that crashes every story, and the
restrictive-content-model compile crash that only `hydratable: false` produces. *Run stories under
Vitest* — neither failure reproduces there.
— **Settled.** P7 gate. **⟲** Extends `brief-plan` §2.10's scoping; `component-blueprint.md` §1.3
annotated at P9 (§7).
— **Reasoning.** `testing.md` §7.3, §7.4.

**D-85 · `attribution.config.ts` at the repo root is the registry**
— **Decision.** One checked-in file, `{ file, upstreamProject, upstreamFile, license, package }` per
expression-tier derivative. Every attribution check reads it. **Eight entries today.**
— **Rejected.** *Leave the list implicit in the headers* — then nothing can assert the other direction,
and a missing header is invisible. *A doc section* — it has to be machine-readable to be checked in
both directions.
— **Settled.** P7 gate; `legal.md` §2.6 annotated at P9 (§7).
— **Reasoning.** `testing.md` §9; `legal.md` §2.6.

**D-86 · The style contract is three lint rules plus a census**
— **Decision.** Rule 1, every style-prop value is route 1, 2 or 3; rule 2, any `renderStyled` call whose
`props` is a `mergeProps(...)` result also passes `styleSource`; rule 3, no class-name assertions. Plus
a `check:style-prop-collisions` census that asserts no key a machine emits collides with a style prop,
and that `dir` is outside the vocabulary.
— **Rejected.** *Biome plugins as the enforcement* — a GritQL mirror is an editor convenience; the
enforcement is an AST pass over the same tree the build reads. *Trust review* — every one of these
failures is silent and green.
— **Effect.** `dir` is the tripwire: 320 sites emit it, it is safe today only because it is not among
Chakra's 95 shorthands, and aliasing it would break the entire library silently.
— **Settled.** P7 gate.
— **Reasoning.** `testing.md` §6; `component-blueprint.md` §4.1.1.

### 3.8 P8 — the docs site

**D-87 · TanStack Start on the beta 2.x line, prerendered to static output on Cloudflare Pages**
— **Decision.** `@tanstack/solid-start@2.0.0-beta.30` + `@tanstack/solid-router@2.0.0-beta.29`, both
peering Solid 2.x, prerendering **every route to full-document static HTML** at build time.
— **Rejected.** *The `latest` line* — it peers the Solid 1.x line. *SPA mode* — it emits a
client-hydrated shell rather than static documents, which loses the content to a crawler and to
`llms.txt`'s premise. *Plan B, Vite SPA + `@solidjs/router`* — kept as a **documented exit with exit
criteria**, not a default; it loses SSR and prerender.
— **Settled.** P8 gate.
— **Reasoning.** `docs-site.md` §1.1, §1.5, §1.7.

**D-88 · The docs app is a standing instance of the step-4 consumer gate**
— **Decision.** The docs app consumes the library through the published shape — preset, `chakraConfig`,
buildinfo in `include` — rather than through an in-repo shortcut, and `check:css-coverage` runs against
**its** generated sheet.
— **Rejected.** *Wire it to workspace source for convenience* — then it proves nothing about the
distribution model, and the one long-lived consumer we control stops being evidence.
— **Effect.** A `docs` CI job, and a docs build failure is a **distribution** failure rather than a
documentation one. Its representativeness is an assumption with a gate (P8-D).
— **Settled.** P8 gate.
— **Reasoning.** `docs-site.md` §1.1, §6.1.

**D-89 · The playground ships prebuilt examples and pre-generated controls; free-form editing is
deferred**
— **Decision.** v1 ships examples whose code is real and whose controls switch between values already
present in the generated CSS.
— **Rejected.** *A live editor accepting arbitrary style props* — impossible without a build step,
which is §0 rather than a missing feature. *Panda in the browser* — nobody here has tried it, and
reasoning about a dependency instead of measuring it is what produced two wrong verdicts in the prior
art; deferred **with its options recorded and no verdict attached**.
— **Settled.** P8 gate.
— **Reasoning.** `docs-site.md` §4.4, §4.5.

**D-90 · The copyright boundary is a flag list with a mechanical proxy**
— **Decision.** Flag inline every place upstream prose, illustration, branding or example code would
otherwise be reproduced; mirror chakra-ui.com's **structure** only. No Chakra logo, wordmark, or visual
identity anywhere in the chrome; the theming pages are necessarily original.
— **Rejected.** *Copy upstream prose and attribute it* — structure is not expression, prose is; the
rule is the same one that governs code. *Rely on a reading alone* — two of the rows are a judgement, so
they get a mechanical proxy.
— **Settled.** P8 gate.
— **Reasoning.** `docs-site.md` §3.

**D-91 · `llms.txt` is generated from source, not from rendered HTML**
— **Decision.** Generate it from the source of record.
— **Rejected.** *Scrape the rendered site* — it inherits every rendering artifact and drifts silently
from the pages it claims to summarise.
— **Effect.** The dynamic-value contract's three sentences reach an assistant that would otherwise
write route-3-as-route-1 code for the user.
— **Settled.** P8 gate.
— **Reasoning.** `docs-site.md` §4.6.

**D-92 · `docs-plan.md` is a peer document, and the register goes to eleven** ⟲
— **Decision.** The page **specs** are their own document, split from the app and the IA by a stated
rule: `docs-site.md` answers *what exists, on what stack, and how do we know it works*; `docs-plan.md`
answers *what does this page say, in what order, and which settled decision does it render*. The route
map's `Spec` column is the one thing written in both.
— **Rejected.** *One docs document* — the specs are the part that gets argued with, and burying them
under the stack makes the argument expensive. *Treat `docs-plan.md` as a section of `docs-site.md`* —
it was opened between P6 and P7 and is a peer.
— **Effect.** The document register goes from **ten rows to eleven**; `CLAUDE.md`'s index is where the
eleven now live.
— **Settled.** P8 gate. **⟲** Extends `brief-plan` §4.1's ten-row register; applied at P9 (§7).
— **Reasoning.** `docs-site.md` §0, §8 row 6; `docs-plan.md` §0.

**D-93 · A shipping component owes a docs page**
— **Decision.** `check:docs-inventory`, in the docs job.
— **Rejected.** *Only the negative form — "a page for an unbuilt component is a promise"* — a built
component with no page is the same defect pointing the other way, and nothing was firing on it.
— **Settled.** P8 gate; the DoD rule added at P9 (§7).
— **Reasoning.** `docs-site.md` §6.1, §8 row 4.

### 3.9 P9 — the ledger and the index

**D-94 · One name per plan, and a three-way division of labour**
— **Decision.** `plan.md` always means `__internal__/plan.md`; the approved brief plan is
`` `brief-plan` `` (§0.1). And the three surfaces are separated: `CLAUDE.md` carries rules and
pointers, `decisions.md` carries decisions and their rejected alternatives, `__internal__/` carries the
reasoning.
— **Rejected.** *Keep the collision and rely on context* — `plan.md` has a §1.5, §2.4, §3.5, §4.1, §5,
§7 and §8, and so does the brief plan, with different content in every case; a reader following a
citation lands on something plausible and wrong. *A third convention* — P8 declined to invent one and
assigned the naming here. *Fold the ledger into `CLAUDE.md`* — rules and rationale in one file is the
thing the register exists to prevent.
— **Effect.** The convention is stated in `CLAUDE.md` and applied to every site that pointed at the
wrong file (§7).
— **Settled.** P9 gate, 2026-08-09.
— **Reasoning.** `docs-site.md` header; `CLAUDE.md` § Citing the two plans.

### 3.10 S1 — repo bootstrap

The document pass ends at §3.9. Everything from here is the implementation pass, numbered by the
build order of §5 rather than by phase.

**D-95 · The `solid-contract` files import no harness, so the split lands at step 1 and `mount()`
does not**
— **Decision.** All three copied `solid-contract` files import `solid-js`, `@solidjs/web` and
`vitest` and **nothing else** — no `mount`, no `expectNoA11yViolations`. So step 1 takes the
three-project split, `vitest-aliases.ts` and the contract files; `@chakra-ui-solid/internal-test-utils`
is created as their home, but its **harness** — `mount/`, `axe/`, `hydrate-fixture/` and
`vitest-hydration-bridge.ts` — lands at step 2 with the fork whose seven test files do import it.
— **Rejected.** *Bring the whole harness forward to step 1* — `mount()`'s value is the diagnostics it
throws on `dispose()`, and with nothing rendering there is nothing to diagnose; it would ship
unexercised, which is the file-existence-check failure `definition-of-done.md` §0 exists to prevent.
*Put the contract files outside `packages/`* — `check:test-projects` scans package `src` directories,
so a repo-root `tests/` directory would put day-one work in the check's blind spot on day one.
— **Effect.** Step 2 inherits a package rather than creating one. The `internal-test-utils → system`
edge stays absent, as `plan.md` §5.2 requires until milestone 3. One judgement call the documents do
not cover: the contract files live at
`packages/internal-test-utils/src/__tests__/`, not in the package that depends on the semantics
(hope-ui had them in `primitives`), because no such package exists yet and the private test-infra
package is where "how we test" already lives.
— **Settled.** S1 gate, 2026-08-09; the reading `testing.md` §1.8 and `definition-of-done.md` §3.1
left open.
— **Reasoning.** `zag-solid-adapter.md` §1.2, §6.3; `testing.md` §1.8.

**D-96 · The `solid-contract` carry-over is 20 cases, not 15 or 18 — with the three `flush()` cases,
23**
— **Decision.** Measured at hope-ui `main` (`1dc059f`): **10 unit + 3 ssr + 7 browser = 20** copied
cases. With `zag-solid-adapter.md` §6.3's three new `flush()` cases, **23**. The figures the
documents carry — `testing.md` §1.6 and `zag-solid-adapter.md` §6.3's *"9 unit + 3 ssr + 6 browser"*,
`definition-of-done.md` §3.1 step 1 and §5's *"18 contract cases"*, and `zag-solid-adapter.md` §6.5's
gate line — are all wrong, and wrong in the direction that would have let two real cases be dropped
without anyone noticing.
— **Rejected.** *Ship 18 by leaving two out* — the two undercounted cases are
`useContext` returning a default without throwing and `applyRef` flattening nested arrays; both are
the second half of a two-directional contract, which is the half that catches a *narrowing* rather
than a removal. *Silently correct the documents* — a count nobody re-derives is exactly the sort of
figure `prior-art.md` §0.4 requires stated rather than assumed.
— **Effect.** **The S1 gate corrected exactly one site: `zag-solid-adapter.md` §6.5's gate line, now
23**, because it is the milestone-one gate step 2 runs verbatim and a wrong number there is a wrong
gate. Four sites still carry the old figure and were left standing on purpose, each to be corrected
by the phase that next reads it: `testing.md` §1.6, `zag-solid-adapter.md` §6.3's table,
`definition-of-done.md` §3.1 step 1, and §5's build-order row. Note also that
`testing.md` §1.6 was internally inconsistent before any measurement: it gives *"9 + 3 + 6"*, adds
*"plus the three `flush()` cases"*, and then concludes *"Eighteen cases"* — 18 is the sum without the
three, so the sentence cannot be read both ways.
— **Settled.** S1 gate, 2026-08-09, by `grep -cE '^\s*it\('` at four refs; no ref of hope-ui has ever
had 9/3/6.
— **Reasoning.** `zag-solid-adapter.md` §6.3; `testing.md` §1.6; `prior-art.md` §8.1's *measure it*
rule.

**D-97 · `check:test-projects` scans more than the files with `test` in the name**
— **Decision.** The scan set is every file under a package's `src` whose basename contains `test`
**or** carries a `.browser.` / `.ssr.` dot-segment.
— **Rejected.** *`testing.md` §1.7's literal set* — *"every `**/*test*` file"* — because that section's
own worked example is `dialog.browser.tsx`, which contains no `test` and would therefore never be
scanned. The spec's scan set cannot see the file the spec names.
— **Effect.** A source file that adopts a `.ssr.`/`.browser.` infix for a non-test purpose fails the
check and must be renamed. No such file exists today. `testing.md` §1.7's sentence is left standing
for the review to settle.
— **Settled.** S1 gate, 2026-08-09; demonstrated failing on a copied `solid-contract.browser.tsx`
while all three projects stayed green.
— **Reasoning.** `testing.md` §1.7.

### 3.11 S1 review — the author has no way to see the work, and the order is what caused it

Four entries from one finding at the S1 gate, raised by the author and not by a document: **the build
order gives the person whose library this is nothing to look at or interact with until 115 components
exist.** Every surface the documents describe is a *machine* verification — computed styles, axe,
coverage, `mount()` diagnostics. None of them can answer *"is this what I wanted?"*, and that question
has exactly one competent judge.

The four entries below re-plan the order rather than adding a check, because no check can substitute
for it. `CLAUDE.md`'s rule applies: a review that changes a decision re-plans the affected later
phases before work continues.

**D-98 · The two visual surfaces land at a new step 3b, and they are not the same thing**
— **Decision.** Storybook and the docs app both stand up at **step 3b**, immediately after the
styling seam, both rendering `Box`. They are not interchangeable and neither replaces the other:
**Storybook is a local playground and the compile-mode canary — never deployed, never user-facing**
(`testing.md` §7.1, which already says exactly this and needs no change). **The docs site is the
near-1:1 equivalent of `chakra-ui.com` for this library**, it deploys, and it is what the author
reviews the work on.
— **Rejected.** *Storybook at step 5 and docs at step 8*, the order as approved — it produces no
rendered output for the author until after B8, which is the finding. *Fold both into step 3* — step 3
already carries five open assumptions (3, P3-D, P3-E, P3-F, P6-F) and the docs app drags in three more
(P8-A prerender, P8-B MDX under Solid 2.0, P8-C the props-table generator with no running system
object); mixing them makes a red gate ambiguous about which layer failed. *Docs site only, drop
Storybook* — it is the **only** surface that compiles `hydratable: false`, so dropping it makes the
restrictive-content-model crash class (`component-blueprint.md` §10.4) invisible to every check in the
repo until someone opens a Select page by hand.
— **Effect.** First rendered output moves from step 5 to **step 3b**. P7-B (the Storybook runner under
Solid 2.0) and P8-B/P8-C close five steps and eight batches earlier than planned, which is where their
risk belongs. Step 3's gate is unchanged and stays test-only.
— **Settled.** S1 review gate, 2026-08-09.
— **Reasoning.** `testing.md` §7.1, §7.4; `docs-site.md` §1.1, §7.2.

**D-99 · A component is not done until its docs page is done**
— **Decision.** `definition-of-done.md` rule 2.15 stops being an inventory check that first fires at
step 8 and becomes a **per-component completion criterion from the first component**: the page ships
**in the same phase as the component**, complete — anatomy, generated props tables, examples, the
`ids` section — not a stub backfilled later. The docs site is therefore built incrementally and is
readable as a site at every gate from 3b onward.
— **Rejected.** *All pages at step 8* — 113 pages written at once, from the code rather than from the
intent, and the first time anyone reads the library as a *reader* is after it is finished. *Pages per
batch, written after the batch lands* — better, and still backwards: a page written after the fact
documents what was built instead of checking it against what was wanted. *A separate per-batch gallery
artifact* — considered and dropped at the same gate; the docs page **is** the artifact, and a second
one would need keeping in sync with it.
— **Effect.** `check:docs-inventory`'s batch-awareness — *"a shipping row whose batch has landed"* —
finally does something; under the approved order it could never fire before every batch had landed.
`roadmap.md` §13 row 8's *"docs follow the batches"* becomes achievable rather than contradicted by
`decisions.md` §5. Cost is real and is accepted: every component phase now carries its page, and
`docs-plan.md` §8's template is load-bearing from the first component rather than from step 8.
— **Settled.** S1 review gate, 2026-08-09.
— **Reasoning.** `docs-site.md` §6.1; `docs-plan.md` §8; `roadmap.md` §13 row 8.

**D-100 · Step 6 splits into 6a / 6b / 6c**
— **Decision.** Workstream B's 45 components become three phases with a gate each:
**6a** — the 18 atomic-recipe components (`roadmap.md` §4.3's step-6 rows); **6b** — the 22 styled
primitives and layout (§4.4's step-6 rows, `box` already shipped at step 3); **6c** — the 4 utilities
(`client-only`, `focus-trap`, `format`, `highlight`) plus `Presence` plus the 7 surviving `./hooks`.
— **Rejected.** *Keep 45 as one phase* — the largest step in the project, more than B1–B5 combined,
and the one whose output is judged most by eye: spacing, typography and colour across Button, Badge,
Text, Heading, Stack, Flex and Grid. One review at the end of it is the longest blind stretch in the
order. *Split in two* — considered; the utilities and `Presence` share nothing with either recipe or
layout work and make a cleaner third gate than a tail on the second.
— **Effect.** The prerequisite tightens usefully: **6a alone** blocks B3/B4/B8, because `checkmark`,
`radiomark` and `colorSwatch` are the recipes composed into later slot recipes. 6b and 6c gain
scheduling freedom the single step 6 did not have. Each of the three carries its own docs pages under
D-99.
— **Settled.** S1 review gate, 2026-08-09.
— **Reasoning.** `roadmap.md` §4.3, §4.4, §4.5, §9.1, §9.3; `plan.md` §10.

**D-101 · Step 8 is the docs' remaining content and its deployment, not "the docs site"**
— **Decision.** With the app at 3b and the pages arriving with their components, step 8 is what is
left: the machinery and guide tier (`/guides/static-extraction`, migration, theming, `chakraConfig`),
the playground, `llms*.txt`, prerendering and the Cloudflare deploy — plus the checks that can only
run against a finished site (`check:docs-links`, `check:prerender-complete`, `check:llms-fresh`).
— **Rejected.** *Delete step 8 and fold everything into the component phases* — the guide tier is not
per-component and has no phase to attach to; and P8-A's prerender-to-Cloudflare assumption wants one
place to close.
— **Effect.** `docs-site.md` §6.1's `docs` CI job now starts at **3b**, not step 8, with
`check:docs-inventory`, `check:docs-consumer-config`, `check:no-runtime-sheet` over `apps/docs/src`
and `check:css-coverage` against the docs app's own sheet live from that point. The docs app becomes
the standing consumer instance from 3b rather than after B8 — `docs-site.md` §1.1's whole argument,
eight batches earlier.
— **Settled.** S1 review gate, 2026-08-09.
— **Reasoning.** `docs-site.md` §1.1, §6.1; `docs-plan.md` §3–§6.

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
| **D-28** | Where the base-preset fix lives | in `panda.config.ts` | **in `@chakra-ui-solid/preset`**, so a consumer cannot omit it |
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
| **D-84** *(again)* | Storybook's arrival | step 5, with the first component | **step 3b**, with `Box`. Its *status* is unchanged — a local playground and the compile-mode canary, never deployed |
| **D-93** | *A shipping component owes a docs page* | an inventory check in the docs job, first able to fire at step 8 | **A component is not done until its page is done** — the page ships in the same phase as the component, from the first one |
| **D-41** | Workstream B's shape | one step, sized at P6 to 45 components | **6a / 6b / 6c**, a gate each. Its *position* is unchanged; 6a alone is what blocks B3/B4/B8 |
| **The docs site's date** | — | step 8, after all 115 components | **The app at 3b, pages with their components, step 8 is the guide tier and the deploy.** D-88 is not reversed — the docs app as a standing consumer instance becomes true eight batches earlier |

---

## 5. The final build order — one list, each step's gate cited

**Where it lives.** The order and what each step proves is `roadmap.md` §9; the gate each step must
pass is `definition-of-done.md` §3. **This table is the single entry point that names both**, so the
first implementation phase reads one list rather than re-reading two documents. Neither of those
sections is restated here.

**Amended at the S1 review** — §3.11, D-98…D-101. Two rows are new (**3b**, and **6** split three
ways), and from 3b onward **every component phase also ships its components' docs pages** — not a
column here, because it is a per-component rule (`definition-of-done.md` rule 2.15, as amended).

| Step | What | Gate |
|---|---|---|
| **1** ✅ | Repo bootstrap — workspace, catalog, Biome, tsconfig, Turbo incl. `codegen`, CI skeleton, three Vitest projects, `solid-contract` | `definition-of-done.md` §3.1 step 1 — the projects are distinguishable, 18 contract cases green incl. the three new `flush()` ones |
| **2** | `@chakra-ui-solid/zag-solid` + the harness (D-48) | `zag-solid-adapter.md` §6.5's seven lines, verbatim; `definition-of-done.md` §3.1 step 2 |
| **3** | The styling seam — Panda config, preset, `renderStyled`, style props, **plus the locale and environment contexts** | `definition-of-done.md` §3.1 step 3 — `Box`'s computed styles in all three projects, a consumer override changing them, and five checks live |
| **3b** | **The two visual surfaces, both rendering `Box`** — Storybook (local playground and compile-mode canary, **never deployed**) and the **docs app shell** with its own consumer `panda.config.ts` (D-98) | `definition-of-done.md` §3.1 step 3b — both run; `test:storybook` and the `docs` CI job go live; **P7-B**, **P8-B** and **P8-C** close |
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
