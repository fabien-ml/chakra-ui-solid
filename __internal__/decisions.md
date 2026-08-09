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
— **Decision.** 86 fork cases, 51 upstream cases in a one-time parallel run, 23 contract cases,
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

### 3.12 S2 — `@chakra-ui-solid/zag-solid`, milestone one

Six entries. Nothing here touches §3.11's re-planned order: step 2 depends on nothing in-repo and
nothing in-repo yet depends on it.

**D-102 · A fourth delta, and it is against Solid rather than Zag — `renderToStringAsync` is gone at
`2.0.0-beta.32`** ⟲
— **Decision.** `machine.ssr.test.tsx`'s two cases move from `renderToStringAsync` to
`renderToStream`. `@solidjs/web@2.0.0-beta.32`'s server build exports `renderToString` (sync) and
`renderToStream` (awaitable); the fork was written at hope-ui's then-pinned **`2.0.0-beta.19`**,
where `renderToStringAsync` existed. Both assertions pass unchanged after the swap, so the semantics
are the same.
— **Rejected.** *`renderToString`* — synchronous, so it does not resolve resources, and both cases
`await` the render. *Pin an older `@solidjs/web`* — the catalog exists to keep one Solid version
across the repo, and beta.19 is thirteen betas behind the one `solid-contract` characterizes.
— **Effect.** `zag-solid-adapter.md` §4.3 lists **three** deltas, all against Zag `1.43.0`. There is
a second axis nothing in the document pass named: the fork is pinned to a *Solid* beta as well as to
a Zag minor, and only the Zag axis had a delta list. Every future carry-over from `ef91b69` owes the
same two-axis check — the components at step 5 most of all, since they carry far more Solid surface
than seven adapter files do.
— **Settled.** S2 gate, 2026-08-09; measured against the installed server build, not read from a
changelog. **⟲** Extends `zag-solid-adapter.md` §4.3, which is otherwise unchanged.
— **Reasoning.** `zag-solid-adapter.md` §4.3, §6.2.

**D-103 · Upstream's 51 needed four porting rules, not two — and one of them exposed a real semantic
difference that is not a defect**
— **Decision.** §6.1 names two rules: `renderHook` → `mount()`, and `await Promise.resolve()` →
`flush()`. Measured, the second is wrong as a *replacement*: it is `await Promise.resolve()` **and
then** `flush()`, because the two drain different queues — `send` defers into a microtask (upstream's
design) and Solid 2.0 additionally defers the state write. Rule three: a synchronous signal write
inside a `createRoot` callback throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` in 2.0, so two `merge-props`
cases had their writes hoisted out of the owned scope. Rule four is the finding below.
— **Rejected.** *Treat the microtask drain as redundant once `flush()` is there* — measured: exactly
2 of `machine.test.ts`'s 35 cases fail that way, the two calling `result.send` directly rather than
through the helper. *Silence the owned-scope throw* — it is the diagnostic `mount()` exists for.
— **Effect.** **51/51 green** (9 merge-props + 35 machine + 7 nested-states); the consolidation into
the fork's 38-case `machine.browser.test.tsx` lost nothing. The one case needing more than a
mechanical rewrite is *"reactive props with Solid signals"*, which fires three raw same-tick
`INCREMENT`s and expects the context writes to **compound**. Under Solid 1.x they do — a signal write
is visible to the next read immediately. Under 2.0 the write defers, all three read `0`, and the
count lands on `1`. **Not behavior the fork lost:** React's adapter has the same shape, its `get()`
returning a captured `value` a same-tick `setValue` does not change either. The compounding is an
artefact of Solid 1.x, not a Zag contract — which is why the fork's own version sends the three
through `await send(...)`, one tick each, and asserts the same three outcomes. **What this costs
P5:** an action that writes context and an action that reads it cannot share a tick unless the
bindable's `sync` flag is set; a component relying on that would be relying on Solid 1.x.
— **Settled.** S2 gate, 2026-08-09, by running it. The parallel-run files were deleted after, per
§6.2.
— **Reasoning.** `zag-solid-adapter.md` §6.1, §6.2; P4-C.

**D-104 · D3 shipped with no test, so the fork suite is 87 — 86 carried plus one**
— **Decision.** Add one case to `bindable.test.ts`: *"treats `value: null` as controlled-with-null,
not as uncontrolled"*. The fork suite is **87**; the gate's **86 carried cases are green** and the
87th is named rather than folded into the count.
— **Rejected.** *Ship D3 on the 86* — `definition-of-done.md` §2 rule 2.11 names *"`bindable.test.ts`'s
controlled cases"* as its enforcer, and none of the 14 carried cases touches the `null` boundary, so
a revert to `!=` would have gone green. *Leave it as a finding for the review* — the rule already
exists and the gap is one case; carrying a known-untested semantic change is the failure
`definition-of-done.md` §0 exists to prevent.
— **Effect.** Rule 2.11 gains a live unit-level enforcer at milestone one instead of at the first
component with a nullable value prop. Verified as a real tripwire: reverting the predicate to `!=`
fails exactly this case and nothing else.
— **Settled.** S2 gate, 2026-08-09.
— **Reasoning.** `zag-solid-adapter.md` §4.3 D3; `definition-of-done.md` §2 rule 2.11.

**D-105 · P4-A holds, and question 1 was confirmed against tarballs rather than the installed tree**
— **Decision.** §5.5 makes step 2 where the P4 audit stops being provisional. Question 2 (the
manifest check) runs against the installed closure and is green. **Question 1 cannot**: its four
adjudicated hits live in `@zag-js/{splitter,number-input,auto-resize}`, and milestone one installs
only `@zag-js/{core,types,utils}`. Confirmed instead by `npm pack`-ing the three published `1.43.0`
tarballs and grepping their `dist` — all four hits present, none new.
— **Rejected.** *Defer question 1 to milestone 5* — it would leave the P4 result provisional through
three more steps for want of one `npm pack`. *Install the machine packages early to complete the
closure* — a machine closure four steps before any component needs one, and D-55 moved the bundle
measurement to milestone 5 precisely to avoid measuring against a tree assembled for a check.
— **Effect.** **P4-A holds.** Published `@zag-js/solid@1.43.0` matches the `421844f` checkout at all
three sites the deltas rest on — no `aria-*` rule in `normalizeProps` (A1 is live), the
`status !== Started` guard in `onCleanup` (D1), and `!== void 0` in `bindable` (D3) — and installed
`@zag-js/core@1.43.0` carries the `ownedBy` union branch (D2). `legal.md` §5's per-minor re-run
inherits the tarball route until milestone 5.
— **Settled.** S2 gate, 2026-08-09.
— **Reasoning.** `zag-solid-adapter.md` §5.3, §5.5, §9.3.

**D-106 · Where the carried-over design notes live, and the one §1.2 item not carried**
— **Decision.** The fork's six per-file notes land at **`__internal__/zag-solid/`** (hope-ui keeps
them under `__internal__/primitives/`, and this repo has no `primitives` package); the harness's three
at **`__internal__/internal-test-utils/`**. Each gets an HTML-comment provenance header saying that
every `__internal__/…` path, `CLAUDE.md` reference and `@hope-ui/*` specifier *inside* it is
hope-ui's at that commit, not this repo's. **`__internal__/solid-2.0-notes.md` is not carried.**
— **Rejected.** *Rewrite the notes' cross-references to this repo* — most point at hope-ui spike
findings with no equivalent here, and a rewritten note stops being the record of why the divergence
exists. *Carry `solid-2.0-notes.md` and prune it, as §1.2's row says* — its 246 lines are mostly
`createFocusTrap` / `createDismissable` / `createPresence` / `withDefaults`, none of which exists
here, and its one live citation (`bindable.test.ts`) is better served by `solid-contract.test.ts`,
which pins the same `createSignal(fn)` semantics as a **running test** rather than as prose. A
deferral, not a deletion: §1.2's row stands and step 3 is the first step with primitives to describe.
— **Effect.** Four in-code references were re-pointed rather than left dangling — `bindable.ts` and
`bindable.test.ts` (hope-ui's `CLAUDE.md` / `solid-2.0-notes.md` → the contract test and the design
note), `index.ts` and `normalize-props.ts` (the notes' new path). With D1–D3 those are the **only**
edits to the fork's source; a diff against `ef91b69` shows nothing else, formatting included.
— **Settled.** S2 gate, 2026-08-09.
— **Reasoning.** `zag-solid-adapter.md` §1.1, §1.2.

**D-107 · An `.ssr-entry.tsx` sits one character outside `check:test-projects`' scan set**
— **Decision.** Leave it. `hydrate-fixture.ssr-entry.tsx` is a real source module — it exports the
`Tree` the browser test hydrates and the `renderFixture()` the bridge invokes — so the check is right
not to demand that it resolve to a Vitest project. D-97's rule is a `.ssr.` **dot-segment**, and
`.ssr-entry.` is `.ssr-`, so the miss is by the letter of the rule rather than by luck.
— **Rejected.** *Rename it to something with no `ssr` in it* — the name is what tells a reader which
project's build renders it, and the bridge's registry is keyed by that convention. *Widen the scan
set to `.ssr`* — it would then demand that a legitimate source file be a test.
— **Effect.** Recorded because the margin is one character: renaming it `hydrate-fixture.ssr.entry.tsx`
makes `check:test-projects` fail it, correctly, and a reader who does that will not otherwise know
why. Every component gains one of these from milestone 5, so the convention is about to be repeated
40+ times.
— **Settled.** S2 gate, 2026-08-09; verified by enumerating the scan set — 13 files, each resolving
to exactly one project.
— **Reasoning.** `testing.md` §1.5, §1.7; D-97.

**D-108 · A1 is not a 1.x bug — Solid 1.x's DOM layer stringified the boolean for free, and 2.0
stopped** ⟲
— **Decision.** A1's *code* premise stands: `@zag-js/solid@1.43.0`'s `normalizeProps` has no
`aria-*` rule. Its *impact* premise does not. Measured on the published packages: `solid-js@1.9.14`'s
`setAttribute` is `value == null ? remove : setAttribute(name, value)`, so a boolean `aria-expanded`
is coerced to `"false"` by the DOM and comes out correct. `@solidjs/web@2.0.0-beta.32` added
`value === false ? remove : setAttribute(name, value === true ? "" : value)`, which drops the
attribute for `false` and writes `""` for `true`. **A1 is a Solid-2.0 defect that upstream's code
does not yet guard against — not a bug 1.x users are living with.**
— **Rejected.** *Take `zag-solid-adapter.md` §4.1's and §8.1's wording at face value* — it says
*"Upstream `@zag-js/solid@1.43.0` has the identical bug"*, which is true of the source and false of
the behavior, and would have put a wrong reproduction in a public issue. `prior-art.md` §8.1's rule
is the one that caught it: measure the dependency, do not reason about its source. *Drop the filing
now that 1.x is unaffected* — `zag-solid-adapter.md` §2.3 measured `@zag-js/solid@2.0.0-next.1` as
**byte-identical** to `1.43.0`, with a peer range of `solid-js: ">=1.1.3"` that admits 2.x; so a
consumer moving to Solid 2.0 gets malformed ARIA with no peer warning and no change on Zag's side.
— **Effect.** The filing is reframed rather than withdrawn — *"this breaks when you move to Solid
2.0, here is the four-line guard that is correct on both majors"* — and it gains a reproduction
that actually reproduces. The fork's own fix and its two regression cases are unchanged; what moves
is only the claim about who is affected today. `zag-solid-adapter.md` §8.1 carries the correction
inline, because that section is the filing's specification and a wrong premise there would ship.
— **Settled.** S2 gate, 2026-08-09; measured against `solid-js@1.9.14` and `@solidjs/web@2.0.0-beta.32`,
then confirmed end to end by a throwaway browser probe with and without the fix.
— **Reasoning.** `zag-solid-adapter.md` §4.1, §8.1, §2.3; `prior-art.md` §8.1.

**D-109 · A1 is not filed at milestone one — the gate line is carried open, not ticked** ⟲
— **Decision.** The author's call at the S2 gate: **do not post**. The filing is written and kept at
`__internal__/upstream/a1-boolean-aria.md`, reproduction and fix included. `zag-solid-adapter.md`
§6.5's seventh gate line — *"A1 filed upstream"* — is therefore **the one line of seven that is not
green**, and it is recorded as open rather than quietly dropped or marked done.
— **Rejected.** *File it anyway* — not the agent's call to make; publishing to a third party's
public tracker is the author's. *Delete the draft and drop A1 from the gate* — D-108 shows the bug
is real and reaches every Zag framework the day Solid 2.0 ships, and §8.2's second filing has the
same shape; withdrawing the obligation because the draft is inconvenient is the failure
`definition-of-done.md` §0 names. *Mark the gate line satisfied because the draft exists* — that is
literally the file-existence check `prior-art.md` §8.1 forbids.
— **Effect.** Two things move. **P7 cannot cite an open issue number per inherited axe allowance**
(`definition-of-done.md` §5), which was D-54's stated reason for filing at milestone one rather than
at milestone 5 — so either the register carries the draft's path instead of an issue URL, or the
filings happen before step 5. And **§8.2's `ariaHidden` → `suppressOthers` filing is unaffected but
unstarted**; it was never in this step's deliverable list and is now the older of the two debts.
Neither blocks step 3, which touches no Zag machine.
— **Settled.** S2 gate, 2026-08-09, by the author. **⟲** Reverses D-54's *"both at milestone one"*
timing for A1; D-54's substance — that both are worth filing — is untouched.
— **Reasoning.** `zag-solid-adapter.md` §8.1, §8.2; D-54; D-108.

**D-110 · No upstream contact, and an axe allowance is justified by the port rule rather than by an
issue number** ⟲
— **Decision.** The author's standing position, set at the S2 gate: **this is an independent port
and there is nobody to notify.** No issue is filed, no PR opened, no maintainer contacted, and it is
not proposed again unless the author asks. Mechanically: `testing.md` §4.2's property 2 — *"every
entry carries an upstream issue number"* — becomes *"every entry names where the gap is argued, in
our documents"*, and the register's field is `inherited:` rather than `issue:`. `definition-of-done.md`
§5's *"Upstream issue"* column becomes *"Where it is argued"*.
— **Rejected.** *Keep the issue-number requirement and file the two issues* — the author declined,
twice, and the requirement is unsatisfiable without them: `allowances.test.ts` asserts the field
structurally, so step 5's Dialog would fail on the register's own rule rather than on anything about
Dialog. *Drop the justification field entirely* — then the register becomes a place to hide a real
defect behind the word "expected", which is the one thing it exists to prevent. *Wait and decide at
step 5* — it is a one-field spec change with a settled reason; carrying it as an open question is
how it gets rediscovered under pressure.
— **Effect.** The field now proves the *right* thing. An `aria-hidden-focus` allowance is not "we
are waiting on a third party" — it is **the port rule, working**: `@zag-js/aria-hidden` has no
`inert` route, Chakra v3 has the identical gap, and closing it here would make us more accessible
than the library we are porting, which D-12 already settled as a divergence. **We use Zag; what Zag
does not have, we do not have, exactly as Chakra does not.** Nothing else moves: the three predicted
rows, their scopes, and the two-directional assertion that fails an allowance which stops being
needed are all unchanged. A1's own allowances stay **retired** — the fork fixes that one, so axe
never raises it.
— **Settled.** S2 gate, 2026-08-09, by the author. **⟲** Reverses `testing.md` §4.2 property 2, and
retires D-54's second filing (`ariaHidden` → `suppressOthers`) along with the first (D-109).
— **Reasoning.** `testing.md` §4.2; `definition-of-done.md` §5; `prior-art.md` §8.2; D-12.

### 3.13 S3 — the styling seam

**Every entry here is a measurement.** Panda was installed in no checkout when the document pass
ran, so §3.3's six P3 assumptions, §3.6's P6-F and two shapes `plan.md` §2.3 left open were all
predictions. This section is what running `panda codegen` said. Three of the predictions were
right, three were wrong, and two of the wrong ones change a document rather than a config line.

**D-111 · Panda's own preflight already carries Chakra's `[hidden]` rule, so our preset adds
nothing** ⟲
— **Decision.** No `globalCss` delta. `preflight: true` emits
`[hidden]:where(:not([hidden='until-found'])) { display: none !important }` in `@layer reset`,
byte-identical to the rule at `@chakra-ui/react`'s `preflight.ts:140`.
— **Rejected.** *Add the `globalCss` line anyway, for safety* — it would be a second copy of a rule
Panda already emits, in a layer we do not control the order of, and the first Panda release that
changed the selector would leave us silently shipping both.
— **Effect.** Closes **P3-E**, refuted in our favour: the `hidden`-vs-`display` tax
(`prior-art.md` §5.1) does not apply to this library at all, by inheritance rather than by our own
work. `component-blueprint.md` §6.3 was written to survive either answer and needs no change;
`check:preflight-hidden` asserts the **outcome**, so it goes on holding whichever side supplies the
rule.
— **Settled.** S3 gate, 2026-08-09, by `pnpm cssgen` + `check:preflight-hidden`.
— **Reasoning.** `plan.md` §3.7; `prior-art.md` §5.1; `testing.md` §8.

**D-112 · The alias list is 17 names, and every one is an extra shorthand on a utility Panda
already owns**
— **Decision.** `bgImg`, `bgPos`, `blendMode`, `borderBottomEndRadius`, `borderBottomStartRadius`,
`borderTopStartRadius`, `borderTopEndRadius`, `borderEndStyle`, `borderStartStyle`, `gapX`, `gapY`,
`listStyleImg`, `listStylePos`, `overscroll`, `overscrollX`, `overscrollY`, `textDecor` — declared
through `utilities.extend` on the property that already carries them. **None failed the third
condition of the aliasing rule**, so there is no new §0.4 delta row.
— **Rejected.** *Declare each alias as its own utility with its own `values`* — that would define
resolution behavior Panda does not have (Chakra's `backgroundImage` also resolves `gradients`,
a token category `@chakra-ui/panda-preset` does not define), turning an alias into a fork.
— **Effect.** Closes **P3-D**. It also surfaced a merge hazard the rule did not anticipate:
**`utilities.extend` replaces a property's `shorthand` rather than joining it**, so writing
`shorthand: ["bgImg"]` deletes Panda's own `bgImage`. The table therefore reads the existing
shorthands off the imported base preset and appends — and `check:alias-coverage` catches a
regression because six of the names it would delete are themselves among Chakra's 95.
— **Settled.** S3 gate, by `check:alias-coverage` failing with exactly this list and then passing.
— **Reasoning.** `plan.md` §2.2; `testing.md` §8.

**D-113 · `_dark` is `.dark &`, and the colour-mode class is mandatory rather than a preference** ⟲
— **Decision.** The documented consumer contract is `class="light"` **or** `class="dark"` on
`<html>`, and there is no third state.
— **Rejected.** *Document it as an opt-in for consumers who want dark mode* — measured, that is
false: `@chakra-ui/panda-preset` gives its semantic colours **no base value**. All ~100 of them are
declared only inside `.light { … }` and `.dark { … }`, so a page carrying neither class resolves
every semantic colour to an undefined custom property and computes `transparent`, with no error
anywhere. *Add a base value in our preset* — that is a token table, which `legal.md` §1.5 forbids,
and it would diverge from Chakra, which requires the same class through its `next-themes` snippet.
— **Effect.** **P3-F is closed, and it is bigger than the selector.** `plan.md` §7.1's *"a class or
attribute on the root element and a documented consumer snippet"* is right about the mechanism and
too soft about the consequence: the snippet is not optional. The docs page owes the failure mode,
not just the instruction. `check:dark-selector` asserts both halves — the selector, and that the
probe colour is defined in both blocks — and the browser suite toggles the class and reads both
computed values.
— **Settled.** S3 gate, 2026-08-09, by `check:dark-selector` plus `box.browser.test.tsx`; the
review directed the correction into `plan.md` §7.1 at this gate rather than at step 8.
— **Reasoning.** `plan.md` §7.1; `testing.md` §8.

**D-114 · An unresolvable token reference emits the raw token name as a CSS value — neither an
error nor a dropped declaration** ⟲
— **Decision.** Record the measured third answer. Built against the upstream preset alone, the
Switch recipe emits **`cursor: switch`** — a literal that is not a valid `cursor` keyword, which the
browser discards at parse time. Panda exits 0 and warns about nothing. With our one-key
`theme.extend.tokens.cursor.switch` delta it emits `cursor: var(--cursor-switch)` with
`--cursor-switch: pointer` defined.
— **Rejected.** *Leave the assumption phrased as "drop or error"* — it is neither, and the
difference is not cosmetic: a dropped declaration leaves the property unset, while an invalid
literal is discarded at a different stage and is visible in the emitted sheet. A check written
against "the declaration is absent" would have failed on a correct build.
— **Effect.** Closes **P6-F**, and confirms the delta earns its place. The larger finding
`definition-of-done.md` §8.3 warned about — that the preset does not build for anyone — does not
occur. `check:preset-token-resolution` runs both builds and also fails if upstream ever fixes the
spelling, because a delta that fixes nothing is a fork nobody can justify later.
— **Settled.** S3 gate, by `check:preset-token-resolution`.
— **Reasoning.** `roadmap.md` §1.3c; `testing.md` §8; `definition-of-done.md` §8.3.

**D-115 · `size` is not a style prop in this vocabulary, which empties the worked failure
`styleSource` was argued from** ⟲
— **Decision.** Keep `styleSource` in P5's plan on its **structural** justification only, and
record that its live example does not reproduce here. Measured:
`isCssProperty("size") === false`. Panda's base preset has no `size` utility and
`@chakra-ui/panda-preset` adds `boxSize` rather than `size`, so a bare `size` on a styled element is
an ordinary DOM attribute.
— **Rejected.** *Drop `styleSource`* — the rule is total and the class of collision is real; what
changed is the size of the class, not its existence. *Alias `size` so the example holds* — inventing
a collision to justify a guard against collisions.
— **Effect.** `component-blueprint.md` §4.1.1's worked failure — `editable`'s `getInputProps()`
emitting a top-level `size: 1` being folded into `css({ size: 1 })` — **cannot happen as written**,
and its supporting sentence (*"`size` is a style prop here by construction: addition 3 adopts
Chakra's five `html*` renames precisely because … are style props"*) is circular: the renames do not
make a name a style prop, `isCssProperty` does. `check:style-prop-collisions`'s pinned set is
therefore **empty**, not `{ size }` — and an empty pinned set is a stronger check, because any
member appearing later is a new collision. **P5-D is now the whole question rather than a
confirmation of a known case**, and B4's `editable` test loses its premise.
— **Settled.** S3 gate, 2026-08-09, by `style-props.test.ts`; **the review confirmed keeping
`styleSource`** on the structural argument alone, the reason being that adding it after the census
first turns up a collision means revisiting every part component written before that batch. **⟲**
Reverses `component-blueprint.md` §4.1.1's worked failure and `testing.md` §6.4's pinned set.
— **Reasoning.** `component-blueprint.md` §4.1.1; `testing.md` §6.2, §6.4; `plan.md` §2.3.

**D-116 · We rename five `html*` props; Chakra types five and renames four** ⟲
— **Decision.** All five — `htmlSize`, `htmlWidth`, `htmlHeight`, `htmlTranslate`, `htmlContent` —
reach the element renamed, which is what `plan.md` §2.3 item 3 instructs (*"adopt the five renames
verbatim"*).
— **Rejected.** *Rename four, matching Chakra's runtime* — measured,
`styled-system/use-resolved-props.ts:5` carries a four-name set while `factory.types.ts:35-52`
types five, so `htmlContent` is typed and silently dropped upstream. Carrying that faithfully means
shipping a prop that does nothing, which is `plan.md` §0.2 in prop form. *Drop `htmlContent` from
the type as well, so passing it is a type error* — that is the resolution `plan.md` §0.4 applied to
`Portal`'s `disabled`, and it is the honest alternative; it costs the only route to a `content`
attribute on a styled element, which Chakra also lacks.
— **Effect.** **A one-line divergence in the pleasant direction, and it is flagged rather than
absorbed** — `component-blueprint.md` §8's rule is that adding a fix Chakra does not have is a
divergence. It is one entry in `HTML_PROP_RENAMES`, so reversing it at the gate is a one-line edit
either way.
— **Settled.** S3 gate, 2026-08-09. Put to the reviewer because the port rule and the plan's own
instruction point in opposite directions; **the review kept the fix**, so all five rename.
— **Reasoning.** `plan.md` §2.3; `component-blueprint.md` §4.1, §8.

**D-117 · P5-B is two claims, and the two documents each had one of them** ⟲
— **Decision.** `splitVariantProps`'s **existence** closes at step 3; its **behaviour** is gated at
the first `Button`, step 6a. `definition-of-done.md` §8.2 and §3.1 step 6a were both right, about
different halves, and neither is wrong.
— **Rejected.** *Move the whole assumption to 6a* — the existence question is answered by reading
the generated artifact and there is no reason to carry it three steps. *Close it entirely at step 3*
— the gate §8.2 states is behavioural (*"non-variant props reach the element, `size` does not leak
as an attribute"*), and no component renders a recipe yet.
— **Effect.** Measured at step 3 from `styled-system/recipes/button.d.ts`: every generated recipe
exposes `splitVariantProps`, `variantKeys`, `variantMap`, `raw` and `getVariantProps`, and a slot
recipe additionally returns `Record<Slot, string>`. That also makes **P5-A** and **P7-A** readable
now, though both keep their step-4 gates, which are about a *consumer's* codegen rather than the
artifact's shape. `definition-of-done.md` §8.2's P5-B row gains the split.
— **Settled.** S3 gate, by `recipe.test.ts`. This is the contradiction the step-3 prompt asked to
resolve.
— **Reasoning.** `component-blueprint.md` §4.3; `definition-of-done.md` §8.2, §3.1.

**D-118 · The harness edge that appears at milestone 3 is to `styled-system`, not `system`** ⟲
— **Decision.** `@chakra-ui-solid/internal-test-utils` gains a dependency on
`@chakra-ui-solid/styled-system`, and none on `@chakra-ui-solid/system`.
— **Rejected.** *Add the `system` edge as `plan.md` §5.2 and D-48 predicted* — nothing in the
harness imports `renderStyled` or any other thing `system` owns. A dependency with no call site is
a claim the graph does not make, and it is exactly the shape D-48 was written to avoid one step
earlier.
— **Effect.** The prediction was right about the **milestone** and wrong about the **package**. What
the harness actually needed when it first met something styled is a way to read declarations back
out of the generated stylesheet — `declarationsForClass`, for the `ssr` project, which has no DOM
and therefore no `getComputedStyle`. It is exported from a **subpath**,
`@chakra-ui-solid/internal-test-utils/stylesheet`, rather than the barrel: it imports `node:fs`, and
the barrel is imported by the `browser` project, where a `node:fs` import is externalized and throws
at module load, taking every test in the file with it.
— **Settled.** S3 gate. **⟲** Corrects `plan.md` §5.2 and D-48's naming of the edge.
— **Reasoning.** `plan.md` §5.2; `testing.md` §1.8, §2.

**D-119 · `system → zag-solid` does not exist yet; it arrives with presence**
— **Decision.** `@chakra-ui-solid/system` declares no dependency on `@chakra-ui-solid/zag-solid` at
step 3. The edge lands when the presence render strategy does, at step 5.
— **Rejected.** *Declare it now because `plan.md` §5.2 lists it* — the edge exists **because
presence is a machine** (D-40), and presence is not built at this step. `check:externals` would then
have nothing to check for it, and a reader would find a dependency no file imports.
— **Effect.** The graph at step 3 is `preset → nothing`, `styled-system → preset`,
`system → styled-system`, `components → system + styled-system`, `internal-test-utils →
styled-system`. `plan.md` §5.2's table stays correct as the *finished* graph.
— **Settled.** S3 gate.
— **Reasoning.** `plan.md` §5.2, §6; D-40.

**D-120 · `preset` and `styled-system` resolve through their `exports` map, not through
`tsconfig.base.json#paths`**
— **Decision.** Neither package gets a `paths` entry or a Vitest alias, and
`check:resolution-sync` is correct with them absent.
— **Rejected.** *Add a `paths` entry for each anyway, for symmetry* — neither has a `src` to point
at. `styled-system` **is** Panda's output, and its `exports` already point at the generated
directory that `codegen` rewrites in place, so there is no stale `dist` to guard against;
`@chakra-ui-solid/preset` is read by Panda's own config bundler under Node, which does not consult
tsconfig paths, so a `paths` entry would be a fiction that made the check pass while Panda read
something else.
— **Effect.** The invariant `plan.md` §9 protects — *never resolve to a sibling's stale `dist`* —
is met for `preset` by Turbo ordering instead: `codegen` declares `dependsOn: ["^build"]`, so the
shape Panda reads is the shape a consumer gets. `check:resolution-sync` reports **five**
resolutions across two files: `zag-solid`, `system`, `components`, `internal-test-utils`, and
`internal-test-utils/stylesheet`.
— **Settled.** S3 gate, by `check:resolution-sync`.
— **Reasoning.** `plan.md` §9; `testing.md` §8.

**D-121 · `@chakra-ui-solid/preset` ships plain `.js` under `import`, not `.jsx` under `"solid"`**
— **Decision.** `createTsdownConfig` gains one option, `loadedBy: "solid" | "node"`, and the preset
is the first `"node"` package.
— **Rejected.** *Ship it under the repo-wide `"solid"`-only condition* — Panda's config loader
resolves under Node's `import` condition, so a package offering only `"solid"` is **unresolvable**
and `panda codegen` fails outright. *Ship both conditions* — the `"solid"` one would point at a file
no Solid compiler ever needs to see.
— **Effect.** `plan.md` §8's rule keeps its scope, which was always its rationale: the `"solid"`
condition exists so a consumer's own compiler produces per-environment output for **JSX**, and a
Panda preset contains none. The option is named after *who loads the output* rather than after a
file extension, so the next `"node"` package is a one-word decision.
— **Settled.** S3 gate.
— **Reasoning.** `plan.md` §8, §3.3.

**D-122 · Every published package carries a `NOTICE.md` from its first commit, with an empty table**
— **Decision.** `preset`, `styled-system`, `system` and `components` each ship a `NOTICE.md` whose
derived-file table is empty by fact.
— **Rejected.** *Add the file when the package gains its first derivative* — `check:package-files`
has required `LICENSE` **and** `NOTICE.md` in every published package's `files` since step 1, and
the file must exist on disk. A package created without one fails on the branch.
— **Effect.** Resolves a wording collision rather than a rule collision:
`definition-of-done.md` §6 and `legal.md` §2.6 say the preset *"gains its first `NOTICE.md`"* with
the `container` recipe body at step 6a — which is true of its first derivative **row**, not of the
file. `attribution.config.ts`'s own header comment said that delta *"arrives with the preset at step
3"*, which contradicts both; corrected in this commit to name step 6a.
— **Settled.** S3 gate, by `check:package-files`.
— **Reasoning.** `legal.md` §2.6; `definition-of-done.md` §6; `testing.md` §9.

**D-123 · The two shapes `plan.md` §2.3 left open are both full parity, and the `css` array form was
already half-built**
— **Decision.** Record all three measurements and change nothing.
— **Rejected.** `—` (there was no alternative; these were confirmations, not decisions).
— **Effect.** The responsive **array** form works — `color={["red", "green"]}` compiles to
`c_red sm:c_green`, base plus breakpoints in order, exactly Chakra's semantics. **Curly token
references** work — `bg="{colors.red.500}"` emits `background: var(--colors-red-500)`, the same
value the bare `red.500` form produces. And Panda's generated `JsxStyleProps` **already declares**
`css?: SystemStyleObject | SystemStyleObject[]`, so `plan.md` §2.3 item 1 was a runtime change only:
a component that spreads `JsxStyleProps` inherits the array form and must **not** redeclare `css`,
because Panda's type is the stricter of the two (it disallows `undefined` members where Chakra's
allows them).
— **Settled.** S3 gate, by probe and by `box.ssr.test.tsx` / `box.browser.test.tsx`.
— **Reasoning.** `plan.md` §2.3.

**D-124 · `brief-plan` §8 assumption 3 is closed — Panda `1.12.0` pairs with
`@chakra-ui/panda-preset@3.36.1`**
— **Decision.** Close it. `panda codegen` exits 0 on the first run, emits all five artifact groups,
and generates 74 recipe modules including the misspelled `swittch`.
— **Rejected.** `—`.
— **Effect.** Both are the current `latest` on npm, and the preset declares only
`@pandacss/types@^1.4.2`, which `1.12.0` satisfies. Nothing in the closure needed a resolution
override. The pairing joins `legal.md` §5's lockstep table as a standing re-check on either
upstream's next minor rather than a closed question, because the preset pins a **range** and a
Panda minor is where that range would break.
— **Settled.** S3 gate, by the first `panda codegen`.
— **Reasoning.** `plan.md` §11.1; `definition-of-done.md` §8.1.

**D-125 · The `cssgen` Turbo task did not depend on the source Panda scans, so the dev stylesheet
the whole style-assertion apparatus rests on could be a cache hit against stale contents**
— **Decision.** `turbo.json`'s `cssgen` task declares
`$TURBO_ROOT$/packages/{system,components}/src/**` alongside `$TURBO_DEFAULT$`, and carries a
comment naming the coupling: the globs must stay in step with
`packages/styled-system/panda.config.ts#include`.
— **Rejected.** *Leave it and re-run with `--force` where it matters* — nobody types `--force` when
the suite is green, which is precisely the state this produces. *Add the globs to
`globalDependencies`* — that invalidates every task on any source edit and hides which task
actually depends on what. *Write a check asserting the two lists agree* — that is a new check, and
step 3's scope is closed; `check:css-coverage` at step 4 catches the drift by its effect instead.
— **Effect.** Measured while writing the new `renderStyled` browser tests. `packages/styled-system`
runs Panda over `../{system,components}/src`, but Turbo's default input set is the task's **own**
package, so a style prop added in `packages/system/src` was a cache hit: `pnpm cssgen` printed
`FULL TURBO`, `styles.css` stayed byte-identical, `.px_1` had no rule, and the element rendered
unstyled. **Both directions are silent** — a new value renders naked, and a *deleted* one keeps its
rule and its passing test. That is `plan.md` §0.2's hazard arriving through the build cache rather
than through the extractor, and it was reachable by every browser and `ssr` style assertion in the
repo, step 3's included. The gate cannot be green and honest without it, which is why this is a
change rather than only a finding.
— **Settled.** Step 3 follow-up, 2026-08-09, by `pnpm cssgen` reporting a cache miss after touching
a file under `packages/system/src` and a cache hit before.
— **Reasoning.** `plan.md` §0.2, §4.1; `testing.md` §3.

**D-126 · `EnvironmentProvider.getRootNode()` throws `ReferenceError: document is not defined` on
the server — inherited, recorded, not fixed**
— **Decision.** Leave it. The `ssr` tests assert the provider *renders* on the server and say in a
comment that nothing calls `getRootNode()` there; they do not assert the throw, because pinning a
defect as a contract is how it becomes intentional.
— **Rejected.** *Guard it with `typeof document === "undefined"`* — measured, Ark's own Solid
provider is
`runIfFn(props.value) ?? spanRef()?.getRootNode() ?? document`
(`__reference-impl__/ark-ui/packages/solid/src/providers/environment/environment-provider.tsx`),
bare `document` and all, so a guard is a fix Chakra does not have and the port rule calls that a
divergence. *Assert the throw* — see above.
— **Effect.** Any code that asks the environment where to look up elements during a server render
crashes the render. Nothing does today — a machine does not start on the server — so the exposure is
a future component that reaches for `getRootNode()` outside an effect, and the failure is loud
rather than silent when it arrives. **One measured delta from Ark worth the reviewer's eye while
this is open:** ours branches on `props.value !== undefined` and therefore returns whatever a
`value` function returns, including `null`; Ark's `??` chain falls through to the probe and then to
`document`. Both are typed non-null, so it only differs for a consumer whose getter can legitimately
yield `null` — `() => iframe.contentDocument` is the realistic one.
— **Settled.** Step 3 follow-up, 2026-08-09, by a throwaway `ssr` probe rendering the provider and
calling `getRootNode()` in a child.
— **Reasoning.** `plan.md` §7.2; `component-blueprint.md` §8; `prior-art.md` §8.2.

**D-127 · The styling factory's file is named after its export: `render-styled/render-styled.tsx`**
— **Decision.** `packages/system/src/style-props/style-props.tsx` →
`packages/system/src/render-styled/render-styled.tsx`, directory included. `html-props.ts` moves
with it under its own name.
— **Rejected.** *`factory/factory.tsx`* — Chakra's word for the concept, and the one this repo's
prose uses, but it names neither the export nor anything a reader greps for. *Keep the `style-props/`
directory and rename only the file* — that leaves a directory named after one of the factory's
inputs, and every sibling here (`render/`, `recipe/`, `locale/`, `environment/`) is named after what
it exports. *Rename `html-props.ts` too* — its name already describes every export it has.
— **Effect.** `render/render.tsx` exports `renderElement` and `render-styled/render-styled.tsx`
exports `renderStyled`, which is the relationship between them. The hope-ui provenance note is
unchanged and still points at `packages/components/src/system/style-props.tsx` at `e9c2f81` — a
renamed file is still derived from it. The existing `__tests__/style-props.test.ts` **keeps its
name**, because its subject is the style-prop vocabulary rather than the factory, so **D-115's and
D-116's citations of `style-props.test.ts` still resolve**, now under
`packages/system/src/render-styled/__tests__/`.
— **Settled.** Step 3 follow-up, 2026-08-09.
— **Reasoning.** `plan.md` §5.3 row 1; `component-blueprint.md` §4.

---

### 3.14 S3b — the visual surfaces

**Step 3b was split in two at the review**, and the split is the first entry here. **D-128–D-133 are
the Storybook half; D-134 onward are the docs app's**, written when `apps/docs` was built and every
page was opened.

**D-128 · Step 3b ships as two commits — Storybook now, the docs app next — and `definition-of-done.md`
§3.1's step-3b row is one gate spread over both**
— **Decision.** The Storybook half — `.storybook/`, Box's stories, `test:storybook`, the `stories`
CI job — is a phase commit on its own. The docs app, its four Vite knobs, its own
`panda.config.ts`, the route map, Box's component page, `check:docs-consumer-config`,
`check:docs-inventory`, and the two open questions the step carries (where `check:css-coverage`
against the docs sheet lands, and P8-C's two claims) move to the next session unchanged.
— **Rejected.** *Hold the Storybook work uncommitted until the docs app lands* — the two builds
share no file and no dependency, and `test:storybook` is a gate the repo does not have today. Held
back, the `stories` CI job stays a stub for another session while the stories it would open already
exist, which is exactly the state `definition-of-done.md` §0 is about. *Call the Storybook half a
step of its own* — it is not; the step's proof is *"both run, both render `Box`, and they are
different things"*, and that proof is not complete until the docs app renders one too.
— **Effect.** `definition-of-done.md` §3.1 step 3b is **partially discharged**: Storybook runs, and
after D-133 that is all it was ever going to contribute — the step's gate lines are **all** the docs
app's. `check:docs-inventory`, `check:docs-consumer-config`, `check:docs-examples`,
`check:no-runtime-sheet` over `apps/docs/src` and `check:css-coverage` against the docs app's sheet
are untouched, and **P8-B and P8-C stay open at their §8.3b dates**. Rule 2.15's *"live from step
3b"* for `check:docs-inventory` means the docs commit, not this one.
— **Settled.** S3b review, 2026-08-09, by the reviewer's direction.
— **Reasoning.** `definition-of-done.md` §3.1 step 3b, rule 2.15; `docs-site.md` §1.1.

**D-129 · `test:storybook` is a Playwright script over the built Storybook, not
`@storybook/test-runner` — and the runner was measured, not assumed** ⟲
**— SUPERSEDED by D-133 later the same day: there is no `test:storybook` at all.** Kept because the
measurement in it is the reason D-133 costs less than it looks like it should, and because a
retraction is a finding rather than an edit (`CLAUDE.md` § Method).
— **Decision.** `scripts/test-storybook.mjs` builds Storybook, serves `storybook-static` from a
plain Node file server, and drives every story with the `playwright` the `browser` Vitest project
already installs. Three assertions per story, unchanged from `testing.md` §7.3.
— **Rejected.** *`@storybook/test-runner@0.24.4`, which `testing.md` §7.3 names.* It was installed
and run against this Storybook, and it works: 8 of 8 stories passed its smoke test under Solid 2.0.
It costs **735 lockfile entries**, a second test framework (jest 30) in a repo whose testing
doctrine is three Vitest projects, two native `postinstall` approvals (`@swc/core`,
`unrs-resolver`) added to `pnpm-workspace.yaml#allowBuilds`, and a `jest-haste-map` crawl that walks
`__reference-impl__/` and reports module-name collisions between the two Zag checkouts — directories
`CLAUDE.md` declares read-only and never a dependency. **And its default smoke test is one of the
three assertions, not three:** per-story console errors and the empty-render check would be
hand-written hooks on top of it either way, which is the same code this script contains, plus jest.
— **Effect.** `testing.md` §13 calls this shape *"the same three assertions with more code"* and
frames it as the fallback for a runner that cannot drive a Solid 2.0 build. **The runner can; we
take the shape anyway, for cost.** Measured either way, so the §13 sentence needs its *reason*
corrected rather than its conclusion: the fallback is the default because of what the runner drags
in, not because of what it cannot do. **⟲** Reverses `testing.md` §7.3's parenthetical *"(the
Storybook test runner, Playwright-backed)"*.
— **Settled.** S3b, 2026-08-09, by installing the runner, running it, measuring the closure delta,
and removing it.
— **Reasoning.** `testing.md` §7.3, §13; `definition-of-done.md` §8.3 P7-B.

**D-130 · Storybook's loaders make `HTMLElement.prototype.focus` an accessor, and no Vitest project
here does — measured, and the reason the warm-up is configuration rather than superstition**
**— P7-B's status is D-133's: retired unclosed.** The measurement below stands and is why §7.2's
warm-up is a fact; the assumption it would have closed no longer has anything depending on it.
— **Decision.** Record the measurement. A canary built at S3b opened every story in a real browser
and observed per-story console errors — proved by a throwaway probe of three deliberate failures (a
`console.error`, a throw during render, a `null` render), each of which it reported and named.
— **Rejected.** *Take it on "the suite is green"* — a canary with nothing to catch and a canary that
catches nothing look identical, which is the failure the canary existed for.
— **Effect.** The same read, in the two places, measured rather than argued:

| | `HTMLElement.prototype.focus` is | reading it off the prototype |
|---|---|---|
| Storybook 10.5.7 (built, Chromium) | an **accessor** | **throws `TypeError: Illegal invocation`** |
| the `browser` Vitest project (same Chromium, same Playwright) | a **data property** | returns a function |

That is `prior-art.md` §5.3's mechanism, observed here rather than carried, and it is what justifies
the warm-up existing at 3b instead of at the first machine: the accessor is installed today, and the
only reason nothing crashes is that nothing calls `trackFocusVisible` yet except the warm-up itself.
It is also the concrete answer to *"what does Storybook see that no Vitest project can"* — with a
second, structural half: `unit` compiles `hydratable: false` but has no DOM, `browser` has a DOM but
compiles `hydratable: true`, and **Storybook is the only place in the repo that renders a
`hydratable: false` compile into a document.**
— **Settled.** S3b, 2026-08-09, by a probe story and a probe browser test, both deleted after
measurement.
— **Reasoning.** `testing.md` §7.2, §7.3, §7.4; `prior-art.md` §5.3; `component-blueprint.md` §1.3.

**D-131 · `testing.md` §7.4's restrictive-content-model crash did not reproduce at
`babel-preset-solid@2.0.0-beta.32` — a finding, and still B5's to settle**
— **Decision.** Record the non-reproduction; change nothing. The claim keeps its place in
`testing.md` §7.4 and `component-blueprint.md` §10.4, and B5 remains where it is decided.
— **Rejected.** *Delete the claim* — four shapes at one compiler version is not a refutation of a
hazard whose stated victims (`select`, `combobox`, `listbox`) do not exist yet, and deleting a
hazard note is the one move that cannot be undone by evidence. *Assert it as still true* — it was
measured false for every shape available today, and repeating a prediction after measuring against
it is what `prior-art.md` §8.1 exists to stop.
— **Effect.** Measured two ways. **Rendered:** a probe story with a hidden-`<select>` shape — a
static `<option>` plus a dynamic sibling — built and opened cleanly in Storybook, whose compile is
the `hydratable: false` one the claim is about. **Compiled:** `babel-preset-solid@2.0.0-beta.32` at
`generate: "dom", hydratable: false` was run over four shapes (static→dynamic, dynamic→static,
static→dynamic→static, and the `<table>` variant); none produced a walk that dereferences a `null`.
The non-hydratable output omits the markers entirely and appends with `_$insert(parent, …, null)`,
so there is no marker for a restrictive parser to reparent — which is the mechanism §7.4 names.
**One thing the probe cannot settle:** `vite-plugin-solid@3.0.0-next.23`'s default backend is the
native (oxc) compiler, not Babel, so the compile a consumer's Storybook performs is not the one the
claim was written against at all. **The canary does not lose its justification** — D-130's accessor
is a measured, present-tense reason for it — but §7.4's *"this is where the canary earns its place"*
is a prediction with no evidence behind it today, and B5 is where it acquires some.
— **Settled.** S3b, 2026-08-09, by a probe story and a direct `@babel/core` + `babel-preset-solid`
transform, both deleted after measurement.
— **Reasoning.** `testing.md` §7.4; `component-blueprint.md` §10.4; `roadmap.md` §9.2 B5.

**D-132 · A Storybook control cannot drive a style prop, so stories are prebuilt variants — the
playground constraint, arriving three steps early**
— **Decision.** Box's stories declare no `argTypes` and wire no style prop to an arg. Every style
prop in a story is a literal; the one varying value goes through a CSS custom property on inline
`style`.
— **Rejected.** *Expose `p`, `bg` and friends as controls, the way a Storybook normally would* —
Panda reads style-prop values out of the **source text** at build time, so `<Box p={args.padding}>`
computes a class whose rule was never generated: the control moves and nothing changes, with no
error. `check:style-contract` rule 1 rejects it, which is the loud half of the same contract.
— **Effect.** `docs-site.md` §4.4 reasons this out for the docs playground; it applies verbatim to
Storybook and it applies **now**, to a surface built five steps earlier than the playground.
Recorded because it is a standing constraint on every story file this repo will ever have — 113
components' worth — rather than a property of Box's. The generalisation is the same one §4.4
reaches: a control may offer a **finite, pre-generated set** (a recipe variant, an enumerated
machine prop) or a **CSS custom property**, and nothing else.
— **Settled.** S3b, 2026-08-09, by `check:style-contract` rule 1 over `box.stories.tsx`.
— **Reasoning.** `docs-site.md` §4.4; `plan.md` §3.5, §0.2; `testing.md` §6.1.

**D-133 · Storybook is a local playground and nothing more. There is no story gate, no `stories` CI
job, and no rule that a story must exist — the validation surface is the docs app** ⟲⟲
— **Decision.** `pnpm storybook` is the entire surface. `.storybook/` is two files — the framework
wiring and the `preview.ts` that carries §7.2's warm-up and the dev stylesheet — with **no addons**.
`test:storybook`, `scripts/test-storybook.mjs`, `scripts/lib/storybook-canary.mjs` and its unit test
are deleted; the `stories` CI job is **deleted rather than stubbed**; the Turbo `test:storybook`
ordering row is gone; `@storybook/addon-a11y` leaves the catalog and the devDependencies.
— **Rejected.** *Keep the canary as a CI job* — the reviewer's position is that a story proves
nothing a consumer cares about, and it is the right position: a story renders a component in a
harness we control, with our aliases, our compile and our stylesheet. **A docs example renders it
the way a consumer gets it** — installed by package name, resolved through `exports` → `dist` under
the `"solid"` condition, styled by a Panda run the docs app performs itself (`docs-site.md` §1.1).
Two surfaces asserting the easier one is not twice the confidence. *Keep rule 2.6 in
`definition-of-done.md` §7 as a labelled unenforced convention* — §0 offers *deleted* or *labelled*,
and labelling it would leave an obligation on the author that the reviewer has explicitly declined.
It is **deleted**, and the sentence it came from moves rather than dies.
— **Effect.** `prior-art.md` §8.1's fourth rule — *a story is a deliverable; open it* — **keeps its
force and changes its subject.** ZagListbox's crash is caught by `check:docs-examples`
(`docs-site.md` §4.1), which is stricter than the canary was: an example typechecks, imports only
real subpaths, **mounts** with no console error and a non-empty root, **and runs axe**. Four
consequences, each stated where it is paid rather than left to be discovered:

1. **`definition-of-done.md` rule 2.6 is deleted**, and rule 2.15 (*a component is not done until
   its docs page is done*) is what now carries the obligation. `testing.md` §12 is **seven** jobs.
2. **A broken story can reach `main`** — one that throws, logs an error or renders nothing. Accepted:
   nothing else reads a story, so the cost is one debugging session for whoever opens the playground
   next.
3. **Deleting the warm-up has no failing test.** It breaks every story that uses a machine and
   reaches nothing else; the docs app has no such loader.
4. **B5 loses its stated instrument.** `definition-of-done.md` §3.2's B5 row asserted a story
   rendering in the Storybook build; combined with D-131 (the hazard did not reproduce, and the
   default compiler backend is no longer Babel) B5 now owes a **verdict** — reproduced and fixed, or
   retired with its evidence — rather than a passing job.

**P7-B is retired unclosed** (D-130): measured, holds, and no longer has a dependant.
— **Settled.** S3b review, 2026-08-09, by the reviewer, twice — first *"I don't need that
test:storybook thing"*, then *"the final validation is the components working on the docs website, a
real app usage, not Storybook"*, which is what moved rule 2.6 from *labelled* to *deleted*.
— **⟲⟲** Reverses **D-84** (*a dev harness **and a required CI job*** → a dev harness), **D-129**
(which chose between two runners; there is now no runner), and `definition-of-done.md` §10 row 7.
The §10 table is left unedited — it is the record of what P7 carried, not a live queue.
— **Reasoning.** `testing.md` §7, §12, §13; `definition-of-done.md` §0, §2 rule 2.6, §3.1 step 3b,
§3.2 B5, §7.6, §8.3; `docs-site.md` §1.1, §4.1; `prior-art.md` §8.1.

**D-134 · We ship a colour-mode primitive. The port rule does not carry, because there is nothing to
port to** ⟲
— **Decision.** Reverse **D-38**. `@chakra-ui-solid/system` gains a colour-mode primitive at step
3c: a blocking pre-paint `<head>` script, a module-level signal, `.light`/`.dark` on the root and
`color-scheme` beside it as an inline style attribute. **Still no provider** — the source of truth
is the DOM class plus storage, so a module-level signal beats a `<ThemeProvider>` that would exist
only to re-publish what the document already says, which is a Solid idiom and the port rule's own
stated exception. The docs app's own module, written at this step, is the shape 3c extracts.
— **Rejected.** *Hold D-38 and ship a documented snippet* — D-38's reasoning was *Chakra ships no
provider, so neither do we*, and what Chakra ships is a **CLI composition over `next-themes`**.
`next-themes` has no SolidJS equivalent, so porting that faithfully means shipping a wrapper around
nothing and leaving every consumer to rediscover the same 80 lines — three of which decide whether
their page has colours at all. *Carry `../hope-ui/apps/docs/src/lib/color-mode.ts`* — it is
temporary glue written under different constraints, and it is wrong here in four measurable ways
(below), which is what made it a specification in negative rather than a template.
— **Effect.** A divergence **in the pleasant direction, flagged rather than absorbed** — D-116's
precedent, and the rule is `component-blueprint.md` §8's: adding a fix Chakra does not have is a
divergence even pointing the pleasant way. It owes, and has, in this commit: a `plan.md` §0.4 delta
row (`React→Solid`), an amendment to `plan.md` §7.1, a `roadmap.md` §4.5 row, and the folder
arithmetic that moves with it — **115 → 116 folders, 113 → 114 shipping, 2 → 3 relocations**, in
§4.5's table, its closing sum, and `docs-site.md` §2.4's count trap.

**The four ways hope-ui's module is wrong *here*, which are the specification in negative:**

| # | hope-ui's module | Why it does not transfer |
|---|---|---|
| 1 | Toggles **only `.dark`** | hope's preset gives its colours a base value, so "no class" is a valid light state there. Ours does not (**D-113**), so "no class" is a **colourless page** |
| 2 | Seeds to `"light"` and applies the stored preference **after mount** | A deliberate flash it can afford. Ours would flash from *no colours*, not from the wrong ones |
| 3 | No `color-scheme` on the root | Native controls and scrollbars stay light in dark mode |
| 4 | No cross-tab sync | Two open tabs disagree after one toggles |

**Re-measured at S3b rather than argued**, in a real browser on a prerendered page, swapping the
root class and reading `getComputedStyle(document.body).backgroundColor`: `.light` →
`rgb(255,255,255)`, `.dark` → `rgb(9,9,11)`, **no class → `rgba(0,0,0,0)`**. That third value is
requirement 1's whole justification.

**Deferred with the reason, not silently:** `forcedTheme`, arbitrary theme lists beyond
light/dark/system, a CSP `nonce`, and a `themes` array. `disableTransitionOnChange` is 3c's and
takes the **Panda route** — a `globalCss` rule in `@chakra-ui-solid/preset`, generated into the
consumer's stylesheet at build time, with the runtime only setting an attribute on `<html>` — with
one unverified thing to probe there: whether `!important` clears Panda's cascade layers as expected.
— **Settled.** S3b, 2026-08-09, by the reviewer's direction, and confirmed by the browser
measurement above. **⟲** Reverses **D-38**.
— **Reasoning.** `plan.md` §7.1, §0.4; `roadmap.md` §4.5; `component-blueprint.md` §8;
`docs-plan.md` §7.2; **D-113**, **D-116**.

**D-135 · The docs app's colour-mode module is app code with a library shape, and one thing about it
should change on the way out**
— **Decision.** `apps/docs/src/lib/color-mode.ts` — 4 exports, ~60 lines with comments. The
pre-paint script is a **string constant** interpolating the same storage key the module writes, so
the two cannot drift; the signal is seeded from the **document** on the client and from a constant
on the server; every write path is behind `isServer`; a module-scope `storage` listener does
cross-tab sync.
— **Rejected.** *Seed the signal to `"light"` and correct it in an effect* — hope-ui's shape, and
requirement 2 is exactly that it is wrong here. Reading the class back off the document costs one
DOM read at module evaluation and makes the signal agree with the paint on the **first** client
render, so no attribute driven by it is ever momentarily wrong after hydration. *Put the toggle's
icon behind the signal* — the icon is chosen by the **cascade** (`_light`/`_dark` on two rendered
SVGs), so it is right on the first paint too; only the button's accessible name reads the signal,
and an attribute is not a paint.
— **Effect.** **What 3c should change on the way out**, stated now while the reasons are fresh:
(1) the module-scope `storage` listener has no removal path, which is correct for a singleton in an
app and wrong for a library primitive a consumer may want to own — 3c gives it an explicit
`watchColorMode()` returning a disposer, or moves the listener behind first use; (2) the storage
key is a literal here and must become an option in the library, because two apps on one origin
would otherwise share a preference; (3) the pre-paint script is exported as a **string** and the
app renders it — 3c should keep exactly that shape rather than growing a component, because a
component cannot be rendered before its own framework boots, which is the one thing this script has
to do. The SSR write-never property is what 3c's `ssr` test asserts, the way B8 will for
`createToaster`.
— **Settled.** S3b, 2026-08-09, by writing it and rendering it.
— **Reasoning.** `plan.md` §7.1; **D-134**; `prior-art.md` §8.1.

**D-136 · The `guides/` tier is deleted and its one page moves to `/docs/styling/static-extraction`**
— **Decision.** `/guides/static-extraction` → `/docs/styling/static-extraction`. The route changes;
`docs-plan.md` §1's spec is unchanged in content.
— **Rejected.** *Keep the tier for one page* — the nav is exactly four items and none of them is
Guides (`docs-site.md` §2.1), so the tier's only page would have been reachable by URL alone. **An
unreachable page is a worse outcome for the loudest page on the site than a relocated one**, and it
is the page a reader arrives at from a broken build. *Put it under `get-started/`* — a reader hits
the failure it fixes while writing components, not while installing.
— **Effect.** Five sites moved in this commit: `docs-site.md` §2.1's row and §2.3's entry,
`docs-plan.md` §0's table and §1's heading, and `testing.md` §6.5. The inbound links the reviewer
named — the docs home, the install page's troubleshooting, `/docs/styling/overview`'s first link —
are written against the new route from the start, because none of those pages existed before this
commit.
— **Settled.** S3b, 2026-08-09, by the reviewer's direction.
— **Reasoning.** `docs-site.md` §2.1, §2.3; `docs-plan.md` §1.

**D-137 · `frameworks/storybook` is deleted as a page; its measured hazard becomes a section on
`frameworks/vite`, at step 5**
— **Decision.** No `/docs/get-started/frameworks/storybook`. The three framework pages are **vite,
solid-start, tanstack-start**. The `@zag-js/focus-visible` warm-up and the version pin move to a
section on the `vite` page, landing with the first machine component.
— **Rejected.** *Drop the hazard with the nav item* — it is real, **measured** (**D-130**), and
reaches any consumer who runs a Zag machine in Storybook, which is most of them. Letting a measured
consumer hazard fall out of the docs because a nav item did is the failure this project keeps
naming. *Keep the page* — Storybook is a local playground here and contributes no gate (**D-133**),
so a top-level framework page for it would be the only nav item on the site pointing at something
we do not treat as a deliverable, and a reader would reasonably infer we test against it.
— **Effect.** `docs-plan.md` §4.2 loses a row and gains the section, with the measurement in place
of the carried claim: at Storybook 10.5.7 `HTMLElement.prototype.focus` **is** an accessor and
reading it off the prototype throws, while the `browser` Vitest project on the same Chromium sees a
plain data property. **Step 5, not now**: the crash needs a machine, and there is none until Dialog.
`docs-site.md` §2.2 gains the row saying where it went.
— **Settled.** S3b, 2026-08-09.
— **Reasoning.** `docs-plan.md` §4.2; `docs-site.md` §2.2; `testing.md` §7.2; **D-130**, **D-133**.

**D-138 · The AI tier and the five `/llms*.txt` routes are deferred to before first public release,
and the cost is stated where it is deferred**
— **Decision.** The five generated routes leave `docs-site.md` §2.1, `check:llms-fresh` is not
written, §4.6 and `docs-plan.md` §4.4 are marked deferred with the trigger, and §2.2's `ai/*` row
becomes *we ship none of the three, for now*.
— **Rejected.** *Ship them now* — the audience does not exist until the site is public, and a
generated file nobody can fetch is a maintenance obligation with no reader, kept current through
eight batches of churn. *Drop them* — §4.6's argument is not weakened by being postponed, and
deleting it would lose it.
— **Effect.** **The cost is written at §4.6 rather than allowed to evaporate**, in the terms the
argument was made in: the index's three lead sentences are the highest-leverage prose on the site,
because an assistant that has not read them writes `<Box w={width}>` and the user gets silence —
the same failure `/docs/styling/static-extraction` exists for, arriving through a channel that page
cannot reach. **For as long as this is deferred that channel is uncovered, nothing else in the docs
closes it, and no check reports it missing.** It returns alongside `legal.md` §3.7's launch
trigger, which fires at the same moment and for the same reason: both are about the site having
readers.
— **Settled.** S3b, 2026-08-09, by the reviewer's direction.
— **Reasoning.** `docs-site.md` §2.2, §4.6; `docs-plan.md` §4.4; `legal.md` §3.7.

**D-139 · `check:css-coverage` against the docs app's sheet lands at step 4, and the reason is the
buildinfo rather than scheduling**
— **Decision.** Step 4. `definition-of-done.md` §3.1 step 3b's gate line for it is removed, step 4's
row gains it, and `docs-site.md` §6.1 and `testing.md` §12 say the same thing. The two documents
that disagreed now do not.
— **Rejected.** *Write it here* — the check does not exist at all yet (it is `testing.md` §3, and it
arrives with the step-4 throwaway consumer), so "write it early" means writing two checks at once.
*Leave both documents standing and let step 4 sort it out* — that is the state the question was
asked about.
— **Effect.** A second reason, which is the load-bearing one and is not a scheduling argument: the
docs app's Panda run reaches values *our* components name through the **buildinfo**, and
`@chakra-ui-solid/components` emits none until it has a recipe to declare — step 4. A coverage check
with no buildinfo to read has nothing to be wrong about. Both halves of the wiring are in place
now: `apps/docs/panda.config.ts` names the buildinfo path, and `apps/docs/turbo.json`'s `cssgen`
`inputs` declare the cross-package coupling (D-125's fix, carried rather than rediscovered), so the
check is the only piece still missing. **P8-D's date moves from step 8 to step 4** with it.
— **Settled.** S3b, 2026-08-09.
— **Reasoning.** `docs-site.md` §6.1; `definition-of-done.md` §3.1, §8.3b; `testing.md` §3, §12;
**D-125**.

**D-140 · The component tier is 111 pages, not 113 — a relocated row owes no component page**
— **Decision.** `check:docs-inventory` expects a `/docs/components/<name>` page for every
`roadmap.md` §4 row whose `Status` begins with `ships` **and** whose directory exists under
`packages/components/src`. A `relocated` row owes none.
— **Rejected.** *Derive "has this batch landed" from a hand-maintained list of landed batches* — a
list needs editing at every step, and the step where somebody forgets is the step the check stops
meaning anything. The source tree is the same fact, mechanically. *Give the relocations component
pages anyway, to make the count 113* — `environment` and `locale` are re-export directories whose
mechanism is a context, documented on `/docs/get-started/environments/*`; `color-mode` (D-134) is
documented on `/docs/styling/dark-mode`. A component page for each would be three pages describing
something other than a component.
— **Effect.** The arithmetic, once: **116 folders → 114 shipping rows → 111 component pages**.
`docs-site.md` §2.4's count trap is corrected, and the correction **strengthens** it — the two
numbers were never comparable, and now they are not even equal, so nothing invites the arithmetic.
`roadmap.md` §4.5's closing sum carries the same three-step derivation so the check and the register
cannot drift apart.
— **Settled.** S3b, 2026-08-09, by writing `check:docs-inventory` and having to name the set it
checks. It reports `111 that will` today, against 1 landed.
— **Reasoning.** `docs-site.md` §2.4, §6.1; `roadmap.md` §4.5; `definition-of-done.md` rule 2.15.

**D-141 · The top bar renders only the tiers that have a page**
— **Decision.** The nav is declared as the settled four — Get Started · Components · Styling ·
Theming — in one module (`apps/docs/src/lib/site-map.ts`), and a tier renders once it has at least
one content file. Today two render.
— **Rejected.** *Render all four from the start* — Styling and Theming have no page until step 4,
so two of the four would 404. *Render them disabled* — a greyed-out nav item is a promise with worse
ergonomics than an absence, and `roadmap.md` §9.2's rule is about promises. *Declare only the two
that exist* — then the settled IA lives nowhere in the code and the third tier arrives as a
judgement call rather than as an entry appearing.
— **Effect.** The site is readable as a site at every gate, which is what
`definition-of-done.md` rule 2.15 asks for, without any gate rendering a link to nothing. The same
module is what the sidebar and `check:docs-inventory`'s tier assertion read, so there is one
declaration rather than three.
— **Settled.** S3b, 2026-08-09.
— **Reasoning.** `docs-site.md` §2.1; `definition-of-done.md` rule 2.15; `roadmap.md` §9.2.

**D-142 · P8-C is three assumptions with three different first-existence dates, and the first is
closed**
— **Decision.** Split. **P8-C1** — the generator reads our own part props from the TypeScript
compiler API — **closed at S3b** with a correct two-row table for `Box`. **P8-C2** — the recipe's
variant map — step 4, sharing P7-A's fate and its gate. **P8-C3** — a machine's `Props` type — step
5, with Dialog.
— **Rejected.** *Close it here on Box alone* — Box has no recipe and no machine, so two thirds of
the claim would be closed by a component that cannot exercise them. *Re-date the whole thing to step
5* — the own-part-props half is measurable now, and carrying a measurable assumption two steps is
what D-117 was written about.
— **Effect.** D-117's shape again, and the same resolution: `definition-of-done.md` §3.1's step-3b
row and `docs-site.md` §7.2's *"step 8, first component page"* were each right about a different
third. **The measurement that closed C1 turned up a defect on the way** — see D-144. The register
goes from 38 rows to 40, and from 6 closed to 8 (P8-B closed too: the docs build ran, six routes
prerendered with prose in the HTML, and an MDX page's three examples mount in the `browser`
project).
— **Settled.** S3b, 2026-08-09, by running the generator over `packages/components/src`.
— **Reasoning.** `docs-site.md` §4.2, §7.2; `definition-of-done.md` §8.3b, §3.1; **D-117**.

**D-143 · A `render` target narrower than the part's own element type needs a cast, and that is the
measured price of `as` staying loose**
— **Decision.** Record it and document it; change nothing in the library. Box's page states it
beside the `render` example, and `docs-plan.md` §8.8 makes it a template sentence for the layout
surface.
— **Rejected.** *Make `RenderProp` generic over the target element* — that is precisely the
deep-conditional polymorphic typing `prior-art.md` §2.5 rejected for wrecking editor completions,
and re-adopting it here would trade an occasional cast for a permanent cost on every part of every
component. *Drop `ref` from the props the factory forwards* — it would fix the type error by
removing a feature, which is the port rule's other direction.
— **Effect.** Measured while writing Box's `render` example. `BoxProps`' element type is
`JSX.HTMLAttributes<HTMLElement>`, Solid's `Ref<T>` is invariant, and
`Ref<HTMLElement>` is therefore not assignable to `Ref<HTMLAnchorElement>` — so
`render={(props) => <a {...props} href="…" />}` is a type error **on `ref` alone**, and
`<Dynamic component="a" {...props}>` fails identically. Three forms work: a host element whose
interface *is* `HTMLElement` (`section`, `article`, `span`, `mark`), a component accepting
`JSX.HTMLAttributes<HTMLElement>`, or a cast. **The example ships the cast rather than an evasion**,
because an example that hides a required cast teaches the wrong thing. It is narrow: a part typed
against its own element — `Dialog.Trigger` against `HTMLButtonElement` — needs none.
— **Settled.** S3b, 2026-08-09, by `tsc --noEmit` over `apps/docs`, twice.
— **Reasoning.** `plan.md` §0.4; `prior-art.md` §2.5; `component-blueprint.md` §3.5;
`docs-plan.md` §8.8.

**D-144 · `ts.getJSDocCommentsAndTags` returns an empty list without parent pointers, so a
type-reading generator emits a table with every description blank and exits 0**
— **Decision.** `scripts/generate-props-tables.mjs` reads JSDoc from `ts.getLeadingCommentRanges`
over the source text rather than from the JSDoc API.
— **Rejected.** *Set `setParentNodes` and keep the API call* — `ts.createProgram` has no such
option; it belongs to `ts.createSourceFile`, and reaching for it would mean parsing every file twice
or hand-rolling a program. *Ship the blank descriptions and fill them in later* — a generated table
whose every description is empty looks like source that has no JSDoc, which is the reading a
reviewer would take.
— **Effect.** A defect rather than a gap, and it is this repo's characteristic shape in a new place:
the API **does not throw** when parent pointers are unset, it returns `[]`. The first run emitted
both of Box's props with `"description": ""` and exited 0. Nothing downstream would have failed —
the page would have rendered a table with two rows and two blank cells, and it reads as a component
whose props are undocumented. Recorded because the next reader of that generator will reach for the
same API for the same reason.
— **Settled.** S3b, 2026-08-09, by running the generator and reading its output.
— **Reasoning.** `docs-site.md` §4.2; `prior-art.md` §8.1.

**D-145 · The prerender emits no `404.html`, so `docs-site.md` §7.1 assertion 4 has a known failure
before it is written**
— **Decision.** Record it against **P8-A**; fix it at step 8, where the assertion lives.
— **Rejected.** *Fix it now* — the prerender's route list, the Cloudflare `_redirects` mapping and
the smoke test are one piece of work and they belong to P8-A, which is step 8's. *Leave it
unrecorded because the assertion is not written yet* — an assumption whose gate is already known to
fail is worth more written down than discovered by the gate.
— **Effect.** Measured: `pnpm build:docs` prerenders **6 routes** and `dist/client` contains one
`index.html` per route and no `404.html`. Serving `dist/client` alone, an unknown path falls through
to the host's 404 rather than to our not-found page — which is the difference between a reader
seeing the site's own *"this is built one batch at a time"* message and seeing a bare error.
`docs-site.md` §7.1's assertions 1–3 already hold today: every route has an `index.html`, every one
carries its rendered `<h1>` and real paragraphs (**not** an SPA shell), and `dist/client` serves
standalone with no request outside itself.
— **Settled.** S3b, 2026-08-09, by building and serving `dist/client` from a plain static file
server.
— **Reasoning.** `docs-site.md` §1.5, §7.1; `definition-of-done.md` §8.3b.

**D-146 · Panda scans `.mdx` and `check:style-contract` does not, so a style prop written in an MDX
page is unchecked**
— **Decision.** Record the gap and state the convention it implies: **styling lives in `.tsx`;
`.mdx` carries prose, fenced code and `<Example>`/`<PropsTable>`.** No check is written here.
— **Rejected.** *Add `.mdx` to `check:style-contract`'s scan set* — it parses with oxc, which cannot
parse MDX, so this means an MDX-aware parser in a lint rule, which is a `testing.md` §6 artefact
change and outside this step's scope. *Drop `.mdx` from `panda.config.ts#include`* — then a style
prop in a content page would render unstyled instead of merely being unchecked, which is worse in
exactly the direction §0.2 is about.
— **Effect.** The exposure is bounded and asymmetric. `listOurSourceFiles` scans
`.ts/.tsx/.js/.jsx/.mts/.mjs` under `packages/*/src` and `apps/docs/src`, so `.mdx` is outside both
`check:style-contract` rule 1 **and** `check:no-runtime-sheet` — while `apps/docs/panda.config.ts`
deliberately includes `.mdx` so a style prop written there does generate CSS. So the failure mode is
a *dynamic* value in an MDX page: no rule generated, nothing unstyled that a check would notice.
Every example on the site is a `.tsx` file under `src/examples/` precisely because that is the
scanned half, and `check:docs-examples` asserts each one is rendered by a page — which is what keeps
the convention from being a note nobody applies.
— **Settled.** S3b, 2026-08-09, by reading `scripts/lib/no-runtime-sheet.mjs`'s extension list
against `apps/docs/panda.config.ts#include`.
— **Reasoning.** `testing.md` §5.2, §6.1; `plan.md` §0.2; `docs-site.md` §4.1.

**D-147 · The docs site shipped at S3b is not the near-1:1 copy of chakra-ui.com the documents
specify, and the cause is that the reference was never opened** ⟲
— **Decision.** Record the failure and rework the site against
`__reference-impl__/chakra-ui/apps/www` in a dedicated session. The app, the four Vite knobs, the
Panda consumer config, the three checks, the colour-mode module and the build are **kept**; the
**IA, the navigation, the theme and every page's content are reworked**.
— **Rejected.** *Patch Box's page and move on* — the same cause produced the navigation, the
landing page and the tier structure, so fixing one page leaves three instances of it standing.
*Treat the delta as a deliberate divergence* — it was not decided, it was not measured, and no
document asks for it.
— **Effect.** Four failures, and the fourth is the cause of the other three:

1. **The navigation is wrong.** chakra-ui.com scopes the left sidebar to the **current top-level
   section**; `apps/docs/src/components/docs-sidebar.tsx` renders every tier at once, so
   *Components* appears under *Get Started*. The top bar is right and the sidebar contradicts it.
2. **Box's page is not the template applied.** Their page is preview-first with `links` in
   frontmatter and **six** examples (Shorthand, Pseudo Props, Border, As Prop, Shadow, Composition
   — their pages run 7–14); ours buries the preview under two paragraphs, inlines the links as body
   text, and ships **two**. Every missing example works here unchanged; nothing about `plan.md` §0
   blocks one of them.
3. **A section on Box's page that `docs-plan.md` §8.10 forbids.** *Style props take literals* states
   globally what §8.10 says is stated **once**, on `/docs/styling/static-extraction`; the
   per-component note belongs only to the eight CIJ-marked rows, and Box is not one.
4. **The reference was never opened.** Box's page was written from `docs-plan.md` §8's template
   alone — and that template's own frame is *"Chakra's component page structure, **copied
   exactly**"*. A spec that says *copy this* cannot be executed without reading the thing.
   `prior-art.md` §8.1's rule applies to a reference exactly as it applies to a dependency: **open
   it, do not reason about it.** `__reference-impl__/chakra-ui/apps/www` was in the checkout the
   whole time.

**What does not change, because it is the part §3.2 keeps:** structure, section order, the example
set, part names and nav shape are **API shape and structure** and owe nothing; each example's
explanatory sentence and each page's `description` are **expression** and stay ours
(`legal.md` §1.4; `docs-site.md` §3.2 rows 1–3, §3.3). Reworking to 1:1 means the *shape* converges
and the *sentences* do not — and §3.3's proxy is unchanged: **no `@license` header and no
`NOTICE.md` row anywhere under `apps/docs/src/**`**, or the writing-it-fresh rule failed.
— **Settled.** S3b review, 2026-08-09, by the reviewer, after opening the built site: *"you made
another website, not a chakra-ui docs using solidjs website"*. **⟲** Reverses the IA as applied at
D-136/D-141 to the extent that the rework changes it; D-136's relocation and D-138's deferral stand
on their own reasons and are re-decided against the reference rather than assumed.
— **Reasoning.** `docs-plan.md` §8, §8.10; `docs-site.md` §2.1, §3.2, §3.3; `prior-art.md` §8.1;
`legal.md` §1.4.

**D-148 · Chakra's docs prose is MIT. `legal.md`'s "rewrite every sentence" was a policy on top of
the licence, and the policy is dropped** ⟲
— **Decision.** The docs site **copies Chakra's pages** — structure, section order, example set,
*and prose* — adapting what our API changes. The obligation is **one `NOTICE.md` row** covering
`apps/docs/src/content`, naming `chakra-ui/apps/www`, MIT, © 2019 Chakra Systems Inc.
`docs-site.md` §3.2's *rewritten* tier and §3.3's *no `@license` header and no `NOTICE.md` row
anywhere under `apps/docs/src/**`* proxy are **retired** for the content tier.
— **Rejected.** *Keep the rewrite policy* — it was written as though the licence required it, and
it does not. Measured: `__reference-impl__/chakra-ui/LICENSE` is a single MIT grant at the repo
root; there is no separate licence under `apps/www` and no `license` field on `apps/www/package.json`,
so the root `"license": "MIT"` covers the docs content exactly as it covers the code. MIT permits
copying and modification outright; its one condition is that the notice travels with substantial
portions. *Keep it as a style preference* — it produced a site that did not read as Chakra's docs
at all (**D-147**), which is the cost the policy was never priced against.
— **Effect.** The policy's two stated reasons are answered rather than dismissed: per-file
bookkeeping collapses to **one row** because the content tier is one derivative rather than 111
(`legal.md` §2.6's mechanism already supports a directory-scoped entry); and *"not reading as a
clone"* was the goal that produced the wrong site. **What does not move is trademark**, which is a
separate control and is unaffected by any licence: no Chakra logo, wordmark, favicon derivative,
social card or combined mark, page titles and chrome saying `chakra-ui-solid`, and the §3.4
disclaimer on the home page and in every footer (`legal.md` §3.6, and §3.6's own closing line —
the copyright control and the trademark control do not substitute for each other).
— **Settled.** S3b, 2026-08-09, by the reviewer, after the licence was re-read: *"legal.md is only
here to credit code source"*. Verified against the checkout rather than taken on the sentence.
— **⟲** Reverses `docs-site.md` §3.2 rows 1–3 and §3.3 for the content tier, and `legal.md` §1.4's
application to docs prose. `legal.md` §1.4 stands unchanged for **code**, which is what it was
written for.
— **Reasoning.** `legal.md` §1.4, §2.6, §3.6; `docs-site.md` §3.2, §3.3; **D-147**.

**D-149 · The enforcement census: 44 checks named, 19 live, 25 unwritten, 0 unnamed**
— **Decision.** Take the census mechanically and record it as `definition-of-done.md` **§7b**, with
a row in `CLAUDE.md`'s enforced-rule index. Correct the three stale *"planned, not yet written"*
claims in `CLAUDE.md` — `check:no-cij-manifest`, `check:no-runtime-sheet` and
`attribution.config.ts` have all been live since steps 1–2.
— **Rejected.** *Rewrite the twenty-five rules to say "not yet"* — twenty-three of them cannot be
written because their subject does not exist, and restating §3.1's schedule inside every rule would
be a second copy of it. *Leave it* — a named script reads as a running one, which is the failure
mode the whole repo is organised against, aimed at its own documents.
— **Effect.** **Two rows of `definition-of-done.md` §1 are real gaps**, both stated there as
enforced: rule 1.2 names `check:no-hand-written-data-attrs`, which does not exist and whose subject
does; rule 1.4 names `check:style-contract` rule 2, which the script's own header says is not
implemented. Both close at step 5. **The inverse count is the reassuring half — zero checks exist
that no document names**, so the drift is entirely in one direction: documents ahead of code, never
code ahead of documents. **This is the mechanical half of the reconciliation the reviewer asked
for.** The prose half — every document sentence that asserts behaviour nobody has run — is not
covered here and is its own pass.
— **Settled.** S3b, 2026-08-09, by
`grep -ohE 'check:[a-z0-9-]+' __internal__/*.md CLAUDE.md | sort -u` diffed against
`ls scripts/check-*.mjs`.
— **Reasoning.** `definition-of-done.md` §0, §1, §7, §7b; `CLAUDE.md`'s enforced-rule index.

**D-150 · The CI `docs` job was a stub asserting the docs app does not exist**
— **Decision.** Wire it: `pnpm build:docs`, then `check:docs-consumer-config`,
`check:docs-inventory`, `check:docs-examples`. The step-4 checks keep an explicit *not yet written*
line naming what each waits for.
— **Rejected.** *Leave it until step 8* — the job's body was
`echo "the docs app does not exist yet — it is built at step 8."`, which became false in this
commit. A job that echoes a false statement is a **green tick for work no machine performs**, which
is the exact thing `definition-of-done.md` §0 and **D-133** deleted the `stories` job for.
— **Effect.** Caught by the census (**D-149**) rather than by anything failing, which is the
point of taking one. `testing.md` §12's `docs` row and this job now say the same thing.
— **Settled.** S3b, 2026-08-09, by reading `.github/workflows/ci.yml` against what had just been
built.
— **Reasoning.** `testing.md` §12; `definition-of-done.md` §0, §7b; **D-133**.

---

**D-151 onward are S3b part 3**, the rework D-147 called for. The reference was open for all of
them, which is why several are corrections to numbers the documents asserted from memory.

**D-151 · The nav register is a declared tree in the app, and the sidebar is scoped to one section**
— **Decision.** `apps/docs/src/lib/docs-config.ts` holds chakra-ui.com's `docs.config.ts` shape —
section → group → page — applied to our page set, with their group titles and their order. It is
the only place the site's **order and grouping** live. `site-map.ts` joins it to the content glob:
**an entry with no `.mdx` file does not render**, so the whole settled IA is written down now
while the sidebar shows only what a reader can open. The sidebar renders **the current section's
groups only**.
— **Rejected.** *Keep deriving groups from a directory glob* — a directory is a storage decision
and a nav group is an editorial one, and the two only coincide where a group happens to nest
(`frameworks`, `style-props`). Deriving Layout/Typography/Forms from the filesystem would mean
111 directories. *Declare only the pages that exist today* — then the settled IA lives nowhere in
the code, and the next tier arrives as somebody's judgement call rather than as entries becoming
reachable. *Alphabetise the component tier*, which `docs-site.md` §2.1 originally instructed — 111
alphabetical entries is a list to scan; their twelve groups are a list to navigate.
— **Effect.** The failure D-147 names first is closed: the sidebar no longer renders every tier at
once, so *Components* no longer appears under *Get Started*. Three properties are kept apart on
purpose, and the register is not a fourth inventory (**D-153**). A content file with no register
entry renders under a visible **Ungrouped** heading rather than vanishing — an unreachable page is
the worse failure, and this one shows up on the page rather than only in a diff.

**One trap, hit and corrected at the review.** chakra-ui.com's header has **two rows**, and copying
that shape is copying it for the wrong reason: their first row is a **site-level** nav over five
content types (Docs · Showcase · Spotlight · Blog · Guides) and the second appears *inside* Docs to
pick a section. This site has one content type, so our four sections have no primary nav to be
secondary to — **they are the top bar, in one row**, which is what `docs-site.md` §2.1 has said
since it was written. Rendering them as a sub-bar reproduced their pixels and contradicted our own
document.
— **Settled.** S3b part 3, 2026-08-09, by writing it against `docs.config.ts` and
`app/docs/sidebar.tsx`; the header row count by the reviewer, on the built site.
— **Reasoning.** `docs-site.md` §2.1; `decisions.md` **D-140**, **D-141**, **D-147**.

**D-152 · Every `docs.config.ts` entry we will not have, taken entry by entry**
— **Decision.** Walk their register top to bottom and give every absence a `docs-site.md` §2.2 row
with one reason. Fourteen rows are new; the twelve that were already there stand unchanged.
**A rename gets a row too** — a reader looking for their page name needs to be told where it went,
which is the same service as being told why it is gone.
— **Rejected.** *Only list what a reader would miss* — that is a judgement made by the person who
already knows the answer. *Roll the React-framework guides into one row* — three named pages are
three searches a reader might run.
— **Effect.** The four shapes an absence takes here, which is the useful output rather than the
count: **no Solid equivalent to guide** (`next-app`, `next-pages`, `remix`); **the whole *Concepts*
group relocates** rather than disappearing (`composition` → `/docs/styling/styled-factory` and
per-component `### render`; `animation` → `/docs/styling/animation-styles` plus per-component
`### Presence`; `color-mode` → `/docs/styling/dark-mode`; `overview` → the top-bar item itself);
**one source folder, one page** (`close-button` and `icon-button` are documented on
`/docs/components/button`, because `check:docs-inventory` reads the folder); and **the page is a
runtime feature we exclude** (`components/theme` is the component form of runtime theming,
`plan.md` §0.4). `get-started/changelog` joins `contributing` on the private-repository trigger.
— **Settled.** S3b part 3, 2026-08-09, by reading all 450 lines of `docs.config.ts`.
— **Reasoning.** `docs-site.md` §2.2; `roadmap.md` §4, §5; `plan.md` §0.4; `legal.md` §3.5.

**D-153 · Three registers, one fact each — and `docs-site.md` §2.1 keeps its `Live` column**
— **Decision.** **Order and grouping** is `apps/docs/src/lib/docs-config.ts`. **Existence** is the
content tree, read by the glob. **Obligation** — which component owes a page at all — is
`roadmap.md` §4, read by `check:docs-inventory`. §2.1 keeps its rows and its `Live` column, and is
none of the three: it is the **schedule**, the step at which each page arrives.
— **Rejected.** *Replace `Live` with a shipped flag on the nav tree* — a flag in the register would
be a second claim about existence, which is exactly the duplication **D-140** was about, and it
would need editing at the step somebody forgets. *Delete §2.1's rows now that the tree exists* —
the tree says nothing about **when**, and a route map with no schedule cannot answer *is this page
late or is it step 4's?*
— **Effect.** The test that keeps this honest: nothing in the register asserts a page exists, and
nothing in the content tree asserts a page is owed. §2.1's component tier stays **one row** for
111 pages rather than becoming a per-page list, which is what would have made it a fourth
register.
— **Settled.** S3b part 3, 2026-08-09.
— **Reasoning.** `docs-site.md` §2.1, §2.4; `roadmap.md` §4.5; **D-140**, **D-141**.

**D-154 · D-136 and D-138 re-decided against the reference, and both stand**
— **Decision.** No change to either. Both were taken without opening `docs.config.ts`, and the
brief for this session required one look each.
— **Effect.** **D-136 is strengthened rather than merely confirmed.** Their `guides` is not a docs
tier at all: it is a **primary** nav item beside Showcase and Blog, over `content/guides/` —
long-form articles, a separate content type. Deleting a `guides/` tier from a four-item docs bar
was therefore not a deviation from their IA; keeping one would have been. `/docs/styling/static-extraction`
lands in Styling → **Concepts**, second, immediately after `overview`, which is where
`docs-plan.md` §7.1 already points the overview's first link. **D-138 is confirmed unchanged**:
`Get Started → AI for Agents` is a real three-page group upstream and `AI Skills` carries their
`status: "new"` marker, so the tier is live and growing there. Nothing about that touches the
reason for deferring ours — the audience for a directory page to generated files does not exist
until the files are fetchable — and the cost stays stated at `docs-site.md` §4.6.
— **Settled.** S3b part 3, 2026-08-09, by reading `docs.config.ts` lines 25–33 and 394–422.
— **Reasoning.** `docs-site.md` §2.3, §4.6; `docs-plan.md` §7.1; **D-136**, **D-138**.

**D-155 · `/docs/reference/chakra-config` was a fifth tier the inventory check rejects**
— **Decision.** `/docs/theming/chakra-config`, in Theming → Concepts.
— **Rejected.** *Keep the `reference/` tier* — `check:docs-inventory`'s `SETTLED_TIERS` is the four
the top bar renders, and a page under a fifth directory is a **red build**, not merely an odd
placement. §2.1 argued the tier as a layout choice without noticing that the check written in the
same session forbids it. *Put it under `get-started/`* — §2.1's own objection stands: it is an API
reference for a function, and filing it in a setup tier buries it.
— **Effect.** A document contradicting a check, found by trying to write the register the document
describes. Theming is a better home than the invented tier was: the page documents what a consumer
writes in `panda.config.ts`, which is what the whole Theming tier is about, and the two links §2.1
names — from the install page and the styling overview — are unaffected.
— **Settled.** S3b part 3, 2026-08-09, by reading `scripts/check-docs-inventory.mjs` against
`docs-site.md` §2.1.
— **Reasoning.** `docs-site.md` §2.1, §2.3; `docs-plan.md` §6; `plan.md` §0.4.

**D-156 · Box's example set is Chakra's, and the axe gate forces the palette**
— **Decision.** Ship their seven — `box-basic`, `box-with-shorthand`, `box-with-pseudo-props`,
`box-with-border`, `box-with-as-prop`, `box-with-shadow`, `box-property-card` — under their names,
in their order, with their sentences, plus the template-mandated `### render`
(`docs-plan.md` §8.8). Two of their choices are changed, each for a measured reason.
— **Rejected.** *Copy their colour values verbatim* — theirs are `tomato`/`white` and
`colorPalette="teal" variant="solid"`, and **every docs example runs axe** (`docs-site.md` §4.1
assertion d). Measured: white on `tomato` is 2.9:1 and white on `teal.solid` is 4.3:1, both under
4.5:1, so both fail `color-contrast` and the build goes red. The pairs become semantic token pairs
— `red.solid`/`red.contrast`, `teal.subtle`/`teal.fg` — which demonstrate the same thing the
example is about and are what the preset provides them for. *Drop the Composition example because
its dependencies have not shipped* — theirs composes Badge, HStack, Icon, Image and Text; ours is
Box the whole way down, which is the honest form of the example at this point in the build and
still shows a card being laid out. Their `<Image src="https://bit.ly/…">` is replaced by a
decorative surface: a network fetch inside a mounting test is a flake and an `img` with no reachable
source is an axe finding.
— **Effect.** **One delta a reader will hit, and it is not the colours.** Chakra renders each
example in a `Preview` / `Code` tab pair (`ExampleTabs`, over their own `Tabs`); we ship no Tabs
until B2, so `<Example>` stacks the preview above the source. Both panes come from **one file**
either way (`docs-plan.md` §8.2), so nothing about the fusion changes — only the affordance. It is
a chrome difference rather than an API one, so it belongs here rather than on the migration page.
Nothing in `plan.md` §0.4 blocked any of their seven examples.
— **Settled.** S3b part 3, 2026-08-09, by running the examples through the `browser` project and
reading axe's output.
— **Reasoning.** `docs-site.md` §4.1; `docs-plan.md` §8.2, §8.4, §8.8; `definition-of-done.md` §5.

**D-157 · Frontmatter, and the one link that cannot be a link while the repository is private**
— **Decision.** Pages carry real YAML frontmatter — `title`, `description`, `links` — parsed by
`remark-frontmatter` + `remark-mdx-frontmatter` into a module export the page header renders. **No
`# H1` in a body**, because the header renders the title. A `links` value that is a URL renders as
an anchor; **anything else renders as text.**
— **Rejected.** *Keep `export const description` and an `# H1`* — it works and it is not what the
reference does; more to the point, `links` has to be structured data or it goes back to being the
body prose D-147 found. *Omit `source` until the repository is public* — the path is useful on its
own, and a reader who wants to know where Box lives is told. *Link it anyway* — the repository is
private (`legal.md` §3.5), so every `source` link on the site would 404.
— **Effect.** Two MDX-only dev dependencies, and the day the repository is public the frontmatter
value becomes a URL with nothing else changing. The **`storybook` link stays absent** — Chakra's
frontmatter has one and `docs-plan.md` §8.1 is explicit that ours does not.
— **Settled.** S3b part 3, 2026-08-09.
— **Reasoning.** `docs-plan.md` §8.1; `legal.md` §3.5, §3.3.3.

**D-158 · Three page counts the documents asserted without opening the reference**
— **Decision.** Style props: **17**, not 18. Theming token pages: **11**, not 12 or 13.
— **Effect.** Measured, not reasoned: their nav declares **16** style-prop entries and their
`content/docs/styling/style-props/` holds **17** — `divide` has a page and no nav entry, so ours
takes the seventeen. Their Design Tokens group is **11** pages; `tokens` and `semantic-tokens` are
Concepts pages with prose to spec, which is why `docs-site.md` §2.1 said 12 and §4.3 said 13 and
neither matched. Both corrections land in `docs-site.md` §2.1 and §4.3, and the nav register
carries the corrected sets.
— **Settled.** S3b part 3, 2026-08-09, by `ls` over their content directory against
`docs.config.ts`.
— **Reasoning.** `docs-site.md` §2.1, §4.3.

**D-159 · Two theme surfaces are not reproducible through tokens, and the reason is a check we want**
— **Decision.** Reproduce their surfaces, radii, type scale and spacing through tokens; do **not**
reproduce the typeface or their `globalCss` block.
— **Effect.** chakra-ui.com overrides `fonts.heading` and `fonts.body` to Wix Madefor Text and
declares `--header-height` / `--content-height` in `globalCss` — both through `createSystem`, which
for us would mean keys in `apps/docs/panda.config.ts`. That config is `chakraConfig()` plus
`include`/`outdir` **and nothing else**, and `check:docs-consumer-config` fails on a third key
(`docs-site.md` §1.1). So the typeface stays the preset's own Inter stack — which is what a
consumer gets, and therefore the honest surface for a site whose job is to be evidence — and the
two custom properties move onto the `<body>` class, where they are an ordinary Panda rule in this
app's own sheet. **The forced difference is a check working, not a gap**: a docs site that
overrode the preset's fonts would be showing a reader a theme they cannot get by installing.
— **Settled.** S3b part 3, 2026-08-09, by reading `apps/www/app/theme.ts` against
`scripts/check-docs-consumer-config.mjs`.
— **Reasoning.** `docs-site.md` §1.1, §6.1; `plan.md` §3.4.

**D-160 · `check:style-contract` rule 1 flags a component prop named after a CSS property**
— **Decision.** Rename the prop, not the rule. `<PageHeader page={…}>` became
`<PageHeader doc={…}>`.
— **Rejected.** *Exempt capitalised JSX elements from rule 1* — the rule cannot know that
`<PageHeader>` does not forward its props to a styled element, and `roadmap.md` §4 has 111
components that do exactly that. Narrowing it to lowercase host elements would blind it to every
part component, which is the surface it exists for. *Allow-list the file* — an allow-list entry for
a name we chose is a rule bent around a typo.
— **Effect.** `page` is a real CSS property (paged media), so `isCssProperty("page")` is true and
`page={doc()}` is indistinguishable from a dynamic style prop by the only thing the rule can read.
The check was right and the name was careless. Recorded because the next component prop named
`filter`, `content`, `order` or `direction` will hit it, and the answer is the same each time:
**a component prop must not be named after a CSS property**, which is a good rule in a library
whose props *are* CSS properties.
— **Settled.** S3b part 3, 2026-08-09, by `check:style-contract` failing on the docs route.
— **Reasoning.** `testing.md` §6.1; `plan.md` §2.2; `definition-of-done.md` §1 rule 1.4.

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

**Amended at the S1 review** — §3.11, D-98…D-101. Two rows are new (**3b**, and **6** split three
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
