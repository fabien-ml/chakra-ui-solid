# Legal — licensing, attribution, trademark, and brand

**Status:** written at P1, **revised at the P2 gate on 2026-08-09**. Everything version-specific below
was verified against a local checkout or the npm registry on **2026-08-08**; each claim carries what
it was verified against.

**What P2 changed, and nothing else:** the port rule (*no a11y beyond Zag; nothing Chakra does not
have*) removes this repo's only Apache-2.0 obligation before it arrives. §0's summary table, §1.2 and
§6 are revised; the analysis is retained rather than deleted, because it is what a reopening would
cost. Every other section stands as written at P1.

**What this document is.** The operating policy for this repository: what we owe each upstream, how
we discharge it mechanically, what we may and may not say about Chakra UI, and how the brand was
settled at P1's gate. It is written to be enforced by scripts and reviews, not admired.

**What it is not.** Legal advice. It is an engineer's reading of licenses that are short, standard,
and unambiguous, plus the conservative option wherever the reading is not certain. Where a call is
judgement rather than text, it says so.

---

## 0. Summary — what this repo owes, to whom

| Upstream | Verified at | License | How we consume it | What we owe |
|---|---|---|---|---|
| `@chakra-ui/panda-preset` | `3.36.1` (npm; checkout `f6747f9`) | MIT | npm dependency, as published | Nothing beyond `NOTICE.md` credit. **Do not vendor** (§1.5) |
| `@chakra-ui/react` | `3.36.1` (checkout `f6747f9`) | MIT | **read reference** — API shape, prop names, anatomy | Nothing, while reading stays reasoning-level (§1.4) |
| `@zag-js/*` machines | `1.43.0` (npm; checkout `421844f`) | MIT | npm dependencies, never bundled | Nothing beyond `NOTICE.md` credit |
| `@zag-js/solid` | `1.43.0` | MIT | **forked** into `@chakra-ui-solid/zag-solid` | `@license` header per file + `NOTICE.md` rows (§1.3) |
| `@ark-ui/react` / `@ark-ui/solid` | `5.38.1` (checkout `8e0b749`) | MIT | **read-only reference**, not a dependency | Nothing, by policy (§1.4) |
| `@pandacss/*` | `1.12.0` (npm) | MIT | build + runtime dependency, as published | Nothing beyond `NOTICE.md` credit |
| hope-ui carry-overs | `e9c2f81`, `spike/zag-solid` (`ef91b69`) | MIT, same author | copied into this repo | Provenance note, not a legal duty (§1.6) |
| ~~`createHideOutside` (via hope-ui)~~ | ~~hope-ui `main` (`1dc059f`)~~ | ~~Apache-2.0~~ | **not copied — struck at the P2 gate** | **Nothing.** The port rule drops it before it lands (§1.2) |
| "Chakra UI" name and logo | — | **not licensed** | the project name is mark-derived by choice; logo never used | Disclaimer, prominently and in every package (§3.3.3, §3.4) + ask the maintainers at first public release (§3.7) |

**Revised at the P2 gate, 2026-08-09.** The row above was live when this document was written at P1.
The P2 review set the **port rule** — *no accessibility behavior beyond what Zag ships; nothing
invented that Chakra UI v3 does not have, SolidJS idioms excepted* — and `createHideOutside` is
struck by it, because `inert` appears zero times in both `@chakra-ui/react` and `@ark-ui/react`.
**The repo's only Apache-2.0 obligation is therefore avoided, not discharged.** §1.2 keeps the full
analysis, because it becomes live again the instant anyone proposes an exception.

**The two findings worth reading even if you skip the rest:**

1. The plan's §2.7 says *"Chakra, Ark, Zag are all MIT. No Apache-2.0 obligations enter through
   them."* That is true as written, and at P1 it was **incomplete as a conclusion** — Apache-2.0
   entered through hope-ui's `createHideOutside`, which §2.11 of the plan marks *copy, mandatory*.
   **P2 closed that route** (§1.2), so the plan's sentence is now correct in substance as well as in
   letter: every license in this repo is MIT. The reasoning still matters, because the route was real
   and only a scope decision closed it.
2. **Decided: the project is `chakra-ui-solid`, under the owned `@chakra-ui-solid` scope** — a
   **private** repo on a personal account, no GitHub organization, no custom domain, and the
   maintainer message **deferred to first public release** rather than skipped (§3.3.3, §3.7). The
   mark-derived route, taken deliberately on a verified precedent. What makes it affordable: the
   other owned scope, `@solid-chakra`, is a pre-paid exit — a rename is a scope swap, not an
   acquisition (§3.3.2). The disclaimer is load-bearing rather than courteous.

### 0.1 The reference checkouts these claims were verified against

Read-only, gitignored, never committed. Shallow single-branch clones — re-clone rather than pull to
move one.

| Path | Remote | Branch | Commit | What it pins |
|---|---|---|---|---|
| `__reference-impl__/chakra-ui` | `chakra-ui/chakra-ui` | `main` | `f6747f9c4ef6cbf117bfd55761304369cf404120` | `@chakra-ui/react` **3.36.1**, `@chakra-ui/panda-preset` **3.36.1**, pins `@ark-ui/react` **5.37.2** |
| `__reference-impl__/zag` | `chakra-ui/zag` | `main` | `421844f6c76da124abb6b0b0772425055e6c0825` | `@zag-js/*` **1.43.0** — the port target |
| `__reference-impl__/zag-v2` | `chakra-ui/zag` | `v2` | `f7f9abfd3f751f667ccd1a8339166f03e9b76c5a` | `@zag-js/*` **2.0.0-next.1** — kept for the future v2 migration only |
| `__reference-impl__/ark-ui` | `chakra-ui/ark` | `main` @ tag `@ark-ui/react@5.38.1` | `8e0b749306b108996189f58ba5dca1e6b71947ca` | `@ark-ui/react` / `@ark-ui/solid` **5.38.1**, pins `@zag-js/*` **1.43.0** |

The Ark checkout is `5.38.1`, one patch ahead of the `5.37.2` that Chakra `3.36.1` pins. That is the
*better* baseline for our purposes, not a drift to correct: `5.38.1` pins `@zag-js/* 1.43.0`, which
is exactly the Zag line being ported, so the reference reads against the same machine versions the
implementation will run.

---

## 1. License compatibility

### 1.1 The whole dependency graph is MIT

Verified from the checkouts and the registry, not from a badge:

| Package | `license` field | Copyright line |
|---|---|---|
| `@pandacss/dev`, `@pandacss/types` `1.12.0` | MIT | Copyright (c) 2023 Segun Adebayo |
| `@chakra-ui/panda-preset` `3.36.1` | MIT | Copyright (c) 2019 Chakra Systems Inc. |
| `@chakra-ui/react` `3.36.1` | MIT | Copyright (c) 2019 Chakra Systems Inc. |
| `@zag-js/core`, `@zag-js/solid` `1.43.0` | MIT | Copyright (c) 2021 Chakra UI |
| `@ark-ui/react`, `@ark-ui/solid` `5.38.1` | MIT | Copyright (c) 2024 Chakra Systems Inc. |

MIT-into-MIT is the trivial case: no copyleft, no patent clause, no notice file requirement beyond
the copyright-and-permission notice travelling with copies of the code. A project that only
*depends* on these — resolving them as bare specifiers in its published output, never inlining them
— discharges the obligation automatically, because the consumer installs each package with its own
`LICENSE` in the tarball.

So the compatibility question has exactly one interesting form here: **which upstream code do we
actually copy?** Three answers, in increasing order of obligation.

### 1.2 The one Apache-2.0 route — real, analysed, and closed at P2

> **Status: AVOIDED, not discharged.** Revised 2026-08-09. `createHideOutside` is **not copied**, so
> no Apache-2.0 material enters this repo and none of the mechanism below is triggered. Nothing here
> is deleted: the analysis is correct, and it is what makes the cost of reopening the question
> visible. **Read the closing paragraph first, then the analysis if you need it.**

`createHideOutside` was on the plan's **copy, mandatory** list (§2.11) — reversed from "drop" because
Zag ships no `inert` handling, so every open modal raises axe `aria-hidden-focus` at *serious*
severity, and the definition of done was to run axe on every mounting test with zero allowances.

That file is **an attributed Apache-2.0 derivative in hope-ui** and would have stayed one here.
`packages/primitives/src/internal/create-hide-outside.ts` at hope-ui `main` (`1dc059f`) opens with an
`@license` block naming `@react-aria/overlays` → `src/ariaHideOutside.ts`, *Copyright 2020 Adobe. All
rights reserved.*, the Apache-2.0 grant, and the §4(b) line *"This file has been modified from the
original."*

Two details that decide how we treat it:

- **The obligation does not depend on which revision we copy.** The version on
  `spike/zag-solid` (`ef91b69`, 255 lines) has no header, because the reclassification happened
  later — but hope-ui's own `__internal__/reference-implementations.md` §1 records that
  `ariaHideOutside` was *already* its source at that point (the TreeWalker accept/skip/reject
  strategy and the `MutationObserver` rationale), and that the later additions — `observerStack`'s
  disconnect/restart sequence, `keepVisible`, `isAlwaysVisibleNode` — were ported function-for-
  function. Copy either revision, carry the header.
- **Apache-2.0 is one-way compatible with MIT.** We may ship an Apache-2.0-derived file inside an
  MIT-licensed project; we may not relicense that file. The MIT grant in `LICENSE` covers this
  repo's own code, and `NOTICE.md` says so in its opening paragraph.

**What would have to land with that file, in the same commit** — the trigger checklist, kept live for
the reopening case:

1. The `@license` header, copied shape-for-shape from hope-ui's, including the §4(b) modification
   line. Apache-2.0 §4(b) requires it; MIT does not, which is why the two header shapes differ.
2. `licenses/LICENSE-APACHE-2.0.txt` at the repo root, plus a copy inside the owning package.
3. `LICENSE-APACHE-2.0.txt` and `NOTICE.md` added to that package's `package.json#files`.
4. A row in the root `NOTICE.md` **and** in the package's `NOTICE.md`.

Deliberately **not** done at P1: the Apache-2.0 text is not in the repo. Adding it before any
Apache-2.0 material exists would misstate what the repo contains. That call was provisional at P1 and
is **now permanent** — see below.

#### Why the route is closed — P2, 2026-08-09

The P2 gate set the **port rule**: no accessibility behavior beyond what Zag ships, and nothing
invented that Chakra UI v3 does not have, SolidJS idioms excepted. Chakra v3 is Ark over Zag, and
neither layer adds anything to the machines — so any gap in Zag is a gap Chakra has, and closing it
here would make this library *more accessible than the thing it ports*. Measured, not reasoned:

```bash
grep -rn '\binert\b' __reference-impl__/chakra-ui/packages/react/src/   # nothing
grep -rn '\binert\b' __reference-impl__/ark-ui/packages/react/src/      # nothing
ls __reference-impl__/chakra-ui/packages/react/src/components/dialog/   # dialog.tsx  index.ts  namespace.ts
```

`createHideOutside` is the repo's **only** planned Apache-2.0 carry-over, and the same rule removes
the *"drop by default, adopt by exception"* mechanism that could have pulled in three more Adobe
derivatives from hope-ui's kernel — `create-dismissable.ts`, `create-press.ts`, `scroll-into-view.ts`.
With no exceptions, none is copied. Full evidence and the per-primitive verdicts:
`prior-art.md` §8.2 and §9.2.

**Consequences, all of them subtractive:**

- `licenses/LICENSE-APACHE-2.0.txt` is **not needed**, permanently rather than pending.
- `NOTICE.md`'s pre-declared **Adobe React Spectrum** section keeps its *not yet applicable* marker,
  but its stated trigger — *"a planned carry-over will trigger it"* — is stale and must be reworded
  to "no carry-over triggers it; retained against a future exception." **`NOTICE.md` is not updated
  by this revision** (see §6 item 5).
- The whole dependency and carry-over graph is MIT again — the state §1.1 describes with no exception.
- The only attribution this repo still owes is the **seven `@license` headers on the `zag-solid`
  fork** (MIT, §1.3), plus provenance notes on the hope-ui carry-overs (§1.6).

**What reopens it.** Any decision to close a Zag a11y gap in our own layer. That is a scope decision
before it is a legal one, so it belongs at a review gate — and the checklist above is what it costs.

**The two files this section used to flag are moot, and one is worth recording anyway.**
`createPresence` (~249 raw / 143 code) and `createFocusRestore` (~26 code) were on the same copy list
and are **also struck by the port rule** — presence is rebuilt on the `@zag-js/presence` machine
through our own adapter, and Chakra does not restore focus for a non-modal dialog either. Had they
been copied they would have owed nothing regardless: both carry **no** upstream header in hope-ui and
neither appears in hope-ui's `NOTICE.md`, so they are its own work, and `createPresence`'s mid-body
mention of Base UI is a design comparison at the reasoning tier. Verified, so the question does not
get reopened on a hunch.

### 1.3 The `@zag-js/solid` fork is a direct MIT derivative

`@chakra-ui-solid/zag-solid` is not a dependency, it is a fork — the published adapter targets Solid 1.x and
nothing upstream is built for Solid 2.0. Upstream is eight files (~594 lines) under
`packages/frameworks/solid/src/`; the fork on hope-ui's `spike/zag-solid` (`ef91b69`) is seven —
`machine`, `bindable`, `merge-props`, `normalize-props`, `refs`, `track`, `index` — plus seven test
files. `use-sync-external-store.ts` was dropped.

MIT's condition is that *"the above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software."* A fork is the paradigm case.

**The spike does not currently discharge this.** Its provenance is a prose paragraph in one file
(`index.ts`: *"started as a vendored fork of `@zag-js/solid@1.42.0` … MIT"*) — honest, useful, and
not the MIT notice. It is also not tagged `@license`, which means the build strips it (§2.3). When
the fork is carried over, every forked file gets a real `@license` header naming
`chakra-ui/zag`, `packages/frameworks/solid/src/<file>.ts`, the Chakra UI copyright, and MIT.

Two nuances, recorded so the next reader does not relitigate them:

- **The fork has diverged a long way from upstream** — `mergeProps` is now a `$PROXY`-based lazy
  proxy rather than an eager key-set enumeration, `useSyncExternalStore` is gone, `flush` is Solid
  2.0's real `flush` rather than upstream's no-op, seed reads are named, and `bindable`'s signal is
  boxed. Parts of it may no longer be a derivative in any meaningful sense. **Attribute all seven
  anyway.** The cost is a header; the cost of being wrong is shipping an unattributed derivative of
  the project we are porting. Re-deriving the line file by file is not worth anyone's afternoon.
- **The version baseline moves.** The fork was built against the `1.42.0` line; the target is
  `1.43.0`. The `@license` header names the upstream *file*, so it does not need a version — but
  the `NOTICE.md` row should record the baseline the fork was taken from, because that is the
  number a future re-sync diffs against.

Upstream will ship a Solid 2.0 adapter once Solid 2.0 stabilises, at which point the fork is meant
to be retired. Nothing about the attribution changes in the meantime.

### 1.4 Reading a reference owes nothing — and the line is drawn at *expression*

Carried unchanged from hope-ui's policy (`__internal__/reference-implementations.md` and its
`CLAUDE.md § Third-party attribution`), because it is the same author, the same license posture, and
a rule that has already survived contact with a real audit.

| Tier | What it covers | What it owes |
|---|---|---|
| **Reasoning** | Why a component behaves as it does; an ARIA pattern; an edge-case checklist; which events matter | Nothing |
| **API shape** | Public prop names, part names, option vocabulary, type surface | Nothing. Prose credit if it is worth the reader's time |
| **Expression** | A function's structure and sequence, a data table, its comments, an algorithm reproduced step for step | `@license` header + root `NOTICE.md` row + package `NOTICE.md` row |

Two project-specific edges of that line:

- **Ark UI is `what`, never `how`.** Parts, props, machine wiring, edge cases, and a checklist of
  Solid-1.x-isms marking every site that needs a 2.0 equivalent — all reasoning tier. Never its
  composition style, and never `asChild`; polymorphism here is a `render` prop. Ark is not a
  dependency of any published package, so its `NOTICE.md` section is expected to stay tableless.
- **`@chakra-ui/react`'s `src/styled-system/` is API shape only, never implementation.** Those 46
  files plus their `generated/` directory are an Emotion serializer. Reading `css.ts` to learn what
  `SystemStyleObject` accepts is correct and owes nothing; porting its resolution pipeline would
  violate the no-runtime-CSS-in-JS rule long before it raised a licensing question. The licensing
  rule and the architecture rule
  happen to point the same way here, which is convenient but not a coincidence — the architecture
  rule is why we never get close enough to the expression tier to owe anything.

### 1.5 `@chakra-ui/panda-preset`: depend, do not vendor

The plan does not state this explicitly, and it should. Two readings of §2.1's
*"`@chakra-ui-solid/panda-preset` stays a separate public, config-only package"* are possible: our
preset **composes** the official one as a dependency, or it **vendors** its contents.

**Recommendation: depend.** Reasons, in order of weight:

1. **It is the entire "for free" premise.** The preset's 18 recipes, 56 slot recipes, 17 token
   groups, `utilities.ts`, `breakpoints.ts`, `semantic-tokens/`, `global-css.ts`, `text-styles.ts`,
   `layer-styles.ts`, `animation-styles.ts`, and `keyframes.ts` are the value being borrowed.
   Vendoring them means owning their maintenance; depending means a version bump.
2. **It keeps upstream tracking mechanical.** A Chakra release becomes a dependency bump plus the
   §5 lockstep check, not a re-vendor and a three-way diff.
3. **It is the cleanest trademark posture.** Consuming the official MIT package that encodes
   Chakra's design is materially different from copying Chakra's design tokens into our own package
   and calling them ours. The former is exactly what the license invites.
4. **It removes an attribution surface.** Vendoring would put the entire preset into the expression
   tier; depending keeps it at the credit tier.

The cost is a `@chakra-ui/*` package in the consumer's dependency tree, which is a *feature* for
honesty and a mild wart for anyone who assumed a clean-room port. Say so in the docs.

`@chakra-ui/panda-preset@3.36.1` publishes only `dist` and depends only on `@pandacss/types@^1.4.2`
— it is config-only and pulls nothing else in, so the tree cost is one package.

**Not settled here.** Whether our preset package *also* needs to add `staticCss` declarations for
internally-emitted recipe variants is open question 2 in the plan, and it is an architecture
question, not a legal one. If the answer turns out to require re-emitting parts of the preset's
recipe definitions rather than extending them, this section needs revisiting — flagged for P3.

### 1.6 hope-ui carry-overs are ours, and still get a provenance note

Same author, same MIT license, so no third-party obligation arises and no `NOTICE.md` row is
strictly required. They get a provenance note anyway — a header comment naming the hope-ui path and
commit — for two reasons that have nothing to do with law: the lineage stays legible, and the next
reader can find the commit where the design was argued. hope-ui's `renderStyled` and the
`renderElement` it wraps are the plan's named examples; the same applies to `withDefaults`,
`composeEventHandlers`, `createKeyboardHandler`, `runIfFunction`, `createPresence`,
`createFocusRestore`, `createRegisteredId`, the `panda.config.ts` knobs, and the three-project test
split.

**Carried files fork on copy.** There is no sync obligation in either direction, and no expectation
that a fix here flows back. Record the source commit; do not record a promise.

### 1.7 The look-and-feel question

Reproducing Chakra UI's *visual design* — its color ramps, spacing scale, and component appearance —
is worth one paragraph because it is the thing a reader will worry about and the thing that turns
out to be least interesting.

Visual design as such is not what a software license governs, and in any case we are not
reproducing it: we are consuming the official, MIT-licensed package that encodes it. The design
tokens arrive as a dependency, applied by a build step, exactly as their author published them for
that purpose. The residual risk is not copyright but **confusion** — a library that looks like
Chakra UI and is *named* like Chakra UI invites the assumption that it is Chakra UI. That risk is
addressed by the brand, not by the license, which is §3 and §4.

---

## 2. The attribution mechanism

### 2.1 What triggers it

The expression tier of §1.4, and only that tier. If you are unsure, the question to answer is not
*"did I look at it?"* but *"could a reader diff my file against theirs and see the same structure
and sequence?"*.

### 2.2 The `@license` JSDoc header

Every derived file opens with one. Two shapes, because the two licenses ask for different things.

**MIT upstream** (Zag, Chakra, Panda, Base UI):

```ts
/**
 * @license
 * Portions of this file are derived from Zag.js (`@zag-js/solid`,
 * `packages/frameworks/solid/src/merge-props.ts`).
 * Copyright (c) 2021 Chakra UI
 * https://github.com/chakra-ui/zag
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */
```

**Apache-2.0 upstream** (Adobe React Spectrum): copy the shape from hope-ui's
`packages/i18n/src/direction.ts` verbatim — the full grant paragraph, the AS-IS paragraph, the
pointer to `LICENSE-APACHE-2.0.txt`, and the §4(b) *"This file has been modified from the original."*
line. That last line is a **requirement** under Apache-2.0 §4(b), not a courtesy; under MIT it is
included above because it is honest and costs nothing.

Name the **upstream file**, not just the project. A reader auditing the claim needs to be able to
open the thing you derived from.

### 2.3 Why `@license` is load-bearing, not decoration

This project ships **JSX-preserved source** under the `"solid"` export condition, so the consumer's
`vite-plugin-solid` can compile it per environment. That is a Solid-toolchain decision with a
licensing consequence:

**Rolldown strips every unmarked block comment.** An attribution header written as a plain `/** … */`
vanishes from `dist/`, and the published package becomes an unattributed derivative — silently, with
a green build. The `@license` tag is what marks a comment as legal and survives.

Two things therefore have to be true together, and a CI check should assert both:

- Every derived file's header is tagged `@license`.
- `comments.legal` is pinned `true` in the shared tsdown config, with a comment saying why. hope-ui
  pins it in `tsdown.config.base.ts` for exactly this reason; carry the comment across, not just the
  setting.

Dropping either one ships the same defect, and neither failure is visible in review.

### 2.4 Root `NOTICE.md` and per-package `NOTICE.md`

Both, always. The root file is the audit surface; the per-package file is the one that actually
travels in the npm tarball, and it is the only one a consumer who never visits the repository will
ever see.

A package's `NOTICE.md` lists only its own derived files. The root lists all of them, grouped by
upstream project, with the project's license text quoted once per project.

### 2.5 License files in `package.json#files`

Publishing is where attribution is easiest to lose, because the default `files` field ships `dist`
and nothing else. Every published package needs:

```jsonc
"files": ["dist", "LICENSE", "NOTICE.md"]
```

plus `"LICENSE-APACHE-2.0.txt"` for any package that gains its first Apache-2.0 derivative. A CI
check should assert that every file referenced by an `@license` header's *"distributed with this
package as …"* clause is actually in that package's `files` array — that sentence is a promise to
the consumer, and it is currently the easiest one in the repo to break.

### 2.6 Checklist for a new derivative file

**Where the list of derivatives lives — named at P7, recorded here at P9.** One checked-in file,
**`attribution.config.ts` at the repo root**, with one entry per expression-tier derivative:
`{ file, upstreamProject, upstreamFile, license, package }`. Every attribution check reads it, so the
registry is the single place a new derivative is declared and the checklist below is the single place
it is discharged. **Eight entries today** — the seven `zag-solid` fork files and the `container`
recipe delta (`testing.md` §9; `definition-of-done.md` §6, §10 row 6). What it must **not** gain: the
one-word `theme.extend.tokens.cursor.switch` key, which is not expression.

1. Confirm it is really the expression tier (§1.4). Most files that name a reference mid-body are
   not, and should be left alone.
2. **Add the entry to `attribution.config.ts`.** Steps 3–5 are what that entry then requires, and the
   checks assert both directions — an entry with no header fails, and a header with no entry fails.
3. Add the `@license` header, correct shape for the upstream's license, naming the upstream file.
4. Add a row to the root `NOTICE.md`, under that upstream's section — creating the section if it is
   the first.
5. Add a row to the owning package's `NOTICE.md`, creating the file if it is the first.
6. If the upstream is Apache-2.0 and this is the package's first: copy
   `licenses/LICENSE-APACHE-2.0.txt` in and add it to `package.json#files`.
7. Never edit `LICENSE`. The MIT grant covers this project's own code; it does not reach the
   derived portions and must not be made to look as if it does.

**All of it in the same commit as the code** (`zag-solid-adapter.md` §7.3): both failure modes here
are silent and green.

---

## 3. Trademark

### 3.1 What the MIT grant does not give us

MIT is a copyright license. It grants rights in the *code* — use, copy, modify, merge, publish,
distribute, sublicense, sell. It says nothing about names or logos, and it grants no trademark
rights, expressly or by implication. Verified: `chakra-ui/chakra-ui`'s `LICENSE` contains the word
"trademark" zero times, and the repository ships no trademark or brand-usage policy. That is the
default position, not an oversight, and the default position is that the mark is reserved.

Three concrete consequences:

- **"Chakra UI" is not a name we may adopt**, in whole or as the dominant element of a compound.
- **The Chakra UI logo and wordmark are not ours to use.** The repository's `media/` directory
  (`logo-colored.svg`, `logomark-colored.svg`, and variants) is off-limits — for the docs site, the
  README, social cards, favicons, and slide decks alike. Do not recolor it, do not put a Solid
  swoosh through it, do not "combine the two logos" as a cute nod to the port. A combined mark is
  the single clearest way to imply endorsement.
- **`@chakra-ui/*` is not a scope we may publish under.** It is a real, owned npm organization —
  publishing there is impossible in practice, and requesting it would be inappropriate.

### 3.2 What we *may* say

Using someone's trademark to refer to *their* product is ordinary, expected, and how a port
describes itself. The safe form of it has three properties, all of which we can satisfy:

1. **Use the full mark, as a reference, never as our own name.** "a port of Chakra UI v3" is a
   sentence about Chakra UI. "Chakra Solid" is a product name. The first is fine; the second is not.
2. **Use plain text.** No Chakra logo, no Chakra typography, no Chakra brand colors used as *our*
   brand colors. (Chakra's palette arriving through the preset as our default *theme* is a different
   thing — that is the licensed code doing its job, not our brand identity.)
3. **Disclaim affiliation where a reader could plausibly assume it** — README, docs home, npm
   package description, GitHub repo description, and the docs-site footer.

Say what is true and let it be enough: this targets Chakra UI v3's component API and design system
on SolidJS, and it is not Chakra UI.

### 3.3 Package name and npm scope

> **Settled: `@chakra-ui-solid`.** §3.3.1 and §3.3.2 are the reasoning; **§3.3.3 is the decision and
> the obligations it carries.** Read §3.3.3 first if you only need the outcome. §3.3.2 argues for the
> *other* owned scope and the decision went against it — that disagreement is left standing on
> purpose, because a record that quietly agrees with itself is worth nothing later.

- `@chakra-ui/*` and `@chakra/*` are the mark itself and are out unconditionally.
- The scope is the brand, so that `@chakra-ui-solid/components`, `@chakra-ui-solid/styled-system`,
  and `@chakra-ui-solid/panda-preset` read as one product.
- **"Chakra UI" — the full mark — belongs in the `description` and `keywords`, never in a package
  `name`.** The scope carries "chakra" alone (§3.3.2); the full mark stays in prose, where it is a
  factual reference rather than an identifier.

### 3.3.1 `@chakra-ui-solid` is owned — what that does and does not settle

> **This is the scope that was chosen** (§3.3.3). One correction to what follows: the maintainer
> message recommended below is **deferred to first public release**, not sent now and not declined —
> see §3.3.3 and §3.7 for the trigger and the reasoning.

**Fact, verified 2026-08-08:** the npm organization `chakra-ui-solid` exists and has published
nothing (`registry.npmjs.org/-/org/chakra-ui-solid/package` → `{}`). It is the author's. The GitHub
organization of the same name is still unclaimed (404).

Owning it settles **availability**, which was never the objection. It does not touch **confusion**,
which was, and the two are independent:

- npm operates a published package-name dispute process, and GitHub an equivalent one for
  organization names. Trademark is among the things both weigh. In both, the realistic remedy is
  *rename or transfer* — not damages.
- So the exposure is not legal, it is **being asked to rename after people have installed it**. That
  is the same rename as renaming today, plus every import path, doc page, `staticCss` snippet, and
  blog post already in the wild. A known, bounded, and badly-timed cost.
- `chakra-ui-solid` is the **highest-confusion form available**: the full mark plus a framework
  suffix, which is exactly the pattern Chakra uses for its own ports (§3.5). A reader installing
  `@chakra-ui-solid/components` gets no signal that it is not official.

Two things weigh the other way and are not dismissed:

- Holding the scope is genuinely useful. It stops a real squatter, and it is the exact string
  someone looking for this project would type.
- The probability is low. Community ports live under mark-adjacent names for years without incident,
  and Chakra has shown no sign of policing them.

**The action that collapses the question: ask.** A one-line GitHub issue or Discord message to the
Chakra maintainers — *"I'm building a community SolidJS port; may I publish it under
`@chakra-ui-solid`?"* — returns a yes, in which case the whole of this subsection dissolves and the
answer link goes in `NOTICE.md`, or a no, which is worth knowing now rather than in eighteen months.
It costs nothing and it is the only move that converts a judgement call into a fact. Do this before
choosing, not after.

**Recommended in the absence of an answer: hold the scope, ship under a brand.** Publish exactly one
package under `@chakra-ui-solid` — a pointer whose README and `deprecated` field name the real
package. That keeps the defensive registration and most of the discoverability without putting the
mark in every import path. Import paths are the expensive thing to change; a pointer package is not.

This subsection is about `@chakra-ui-solid` specifically because it was the first one on the table.
**`@solid-chakra` is also owned**, and §3.3.2 finds it the lower-confusion of the two. The decision
went to `@chakra-ui-solid` anyway, for reasons recorded in §3.3.3 — where `@solid-chakra` becomes the
first rung of the exit ladder. Everything above about the trade and the dispute process applies to
both without change.

**If shipping under `@chakra-ui-solid` anyway**, it is a legitimate trade — discoverability now
against rename risk later — and not a blocker. Take it deliberately rather than by default, and take
it with the mitigations: the §3.4 disclaimer on the npm page as well as the README, no Chakra
branding anywhere (§3.1), and a brand name that the packages can be moved to later so the rename is
a scope change rather than an identity crisis.

### 3.3.2 `@solid-chakra` is also owned — the lower-confusion form, and not the one chosen

**Fact, verified 2026-08-08:** the npm organizations `chakra-ui-solid` **and** `solid-chakra` both
exist with zero packages published, and both are the author's. The GitHub organizations of both
names are unclaimed (404). Two live options, not one.

| Candidate | npm scope | Unscoped name | GitHub org |
|---|---|---|---|
| `chakra-ui-solid` | **ours** (0 pkgs) | — | free |
| `solid-chakra` | **ours** (0 pkgs) | tombstone — record from 2023-01-06, 0 versions, no maintainers | free |
| `solid-chakra-ui` | free | free | free |
| `chakra-solid` | free | free | free |

The unscoped `solid-chakra` name is a fully-unpublished record and is not worth chasing — npm does
not hand those back except through support, and the package graph needs six names under one scope
regardless. Ignore it.

**Between the two owned scopes, `@solid-chakra` is the safer instrument**, on two independent
grounds:

1. **It does not use the full mark.** "Chakra UI" is what Chakra Systems Inc. brands and publishes
   under; `@chakra-ui-solid` reproduces it whole and adds a suffix. `@solid-chakra` uses "chakra"
   alone, which is a common word doing weaker mark duty.
2. **It follows the right naming convention.** `@chakra-ui-solid` matches the pattern Chakra uses
   for its *own* ports (`chakra-ui/chakra-ui-vue`, `chakra-ui-vue-next`, §3.5) — the single most
   confusing thing about it. `@solid-chakra` matches the *Solid ecosystem's* convention instead
   (`solid-js`, `solid-start`, `solid-primitives`, `solid-icons`), which reads as "a community Solid
   package in the chakra space" rather than "the official Solid port". Framework-first word order
   does real work here.

What does **not** improve: "chakra" is still the distinctive element and "solid" is still a generic
qualifier, so a mark holder who objected to one would object to the other. §3.3.1's trade —
discoverability now against rename risk later — is unchanged in kind, only reduced in degree.

What `@chakra-ui-solid` keeps: it is the exact string someone searching for this project types. That
is a real discoverability edge and it is the whole of its advantage.

`@solid-chakra-ui` and `@chakra-solid` are free but not worth acquiring. Both sit between the two
owned scopes on every axis, and *newly claiming* a mark-derived name to ship under is a more
affirmative use of someone else's mark than holding one already registered defensively.

**Conclusion of the analysis:** on confusion alone, `@solid-chakra` is the better instrument.

**The decision went the other way** — see §3.3.3. This subsection is not rewritten to agree with it.
The analysis above is still what it is, and the two reasons that outweighed it are recorded there:
the author prefers the name, and the `chakra-ui-svelte` precedent is a *closer* match to
`chakra-ui-solid` than to anything else on the table. `@solid-chakra` becomes the defensive holding
and the pointer package instead — the roles this subsection assigned are simply swapped.

### 3.3.3 Decision: `chakra-ui-solid`, under `@chakra-ui-solid`

**Decided 2026-08-08.** The project is **chakra-ui-solid**, published under the owned
`@chakra-ui-solid` npm scope. Mark-derived, deliberately, with §3.3.1's trade understood.

**Why this and not `@solid-chakra`, which §3.3.2 argues is the lower-confusion form.** Three reasons,
and the third is what makes the first two affordable:

1. **The author prefers the name.** That is a legitimate and sufficient input to a branding decision;
   the analysis informs it, it does not overrule it.
2. **The precedent matches this shape exactly.** `chakra-ui-svelte` (below) is the *same*
   construction — full mark plus framework suffix — not an approximation of it. The evidence on the
   table supports `chakra-ui-solid` more directly than it supports the alternative.
3. **The exit is pre-paid.** `@solid-chakra` is also owned. Switching is a scope rename to a
   namespace already held, whose analysis is already written (§3.3.2). This is not a risk that needs
   mitigating later; it is a risk that already has its remedy sitting in the drawer.

**Naming, so it is consistent everywhere:** the display name is `chakra-ui-solid`, lowercase and
hyphenated, matching the scope and the same convention as hope-ui. Not "Chakra UI Solid", not
"ChakraUI-Solid". The one place capitalisation is natural — the start of a sentence — is the one
place to reword instead. Convenient side effect: the working directory and the plan's own working
title already say this, so nothing is renamed.

**Also decided 2026-08-08, and they change the risk picture more than the name does:**

- **Private repository on a personal GitHub account.** No GitHub organization, for either name. This
  answers the plan's open question 8 outright: private.
- **No custom domain.** The docs site runs on Cloudflare's default subdomain (§3.6).
  `chakra-ui-solid.dev` / `.com` are deliberately not being bought.
- **The Chakra maintainers are contacted at first public release, not now** (§3.7).

**This is a pet project that has not shipped, and that is the load-bearing fact.** Nothing is public,
nothing is published, and it may never be. The trademark question is **dormant** — it is a
first-public-release question, not a today question. Every namespace decision above is cheap for the
same reason: the only cost of not claiming a name is that someone else might, and that cost falls on
a project with no users.

**Why the maintainer message is deferred rather than skipped.** Messaging the Chakra team today means
asking them to weigh in on an empty private repository that may never go live — a poor use of their
attention and a commitment the project has not earned. The message is worth sending when there is
something real to point at. The plan is therefore: **build privately, ask before the first public
release.** That is a better posture than it might look, because it closes the exact window that made
the mark-derived name risky in the first place — the rename cost never rises above "documents and a
private repo" until *after* the conversation has happened. §3.7 fixes the trigger.

**Recorded precedent — checked, not assumed.** Independent, mark-derived Chakra ports already exist
unchallenged. Verified 2026-08-08:

| | |
|---|---|
| Package | `chakra-ui-svelte` on npm — **unscoped, full mark plus a framework suffix** |
| Repository | `github.com/elcharitas/chakra-ui-svelte` — a **personal** account, not the Chakra org (`github.com/chakra-ui/chakra-ui-svelte` is 404) |
| History | 21 versions, first published 2022-04-12, last 2023-03-28 |
| Today | npm package and repository both still live |

A third party published for roughly a year under the same construction as ours, and it is still
standing three years later. That is real evidence and it outranks this document's abstract risk
reasoning, in keeping with the methodology rule the plan carries over: measure rather than reason
about it.

What it does **not** establish, stated so the record is honest: absence of objection is not
permission, and a dormant hobby package is a smaller provocation than an actively maintained library
with a docs site. The precedent lowers the estimate; it does not zero it — which is what the deferred
ask and the pre-paid exit are for.

**The exit ladder, in order.** Recorded so that a rename is a decision already made rather than a
scramble:

| If | Then |
|---|---|
| Chakra is fine with it, or has no objection at first release | Ship as `@chakra-ui-solid` |
| Chakra would rather we did not use the full mark | **`@solid-chakra`** — already owned, already analysed (§3.3.2), a scope rename with no acquisition step |
| A fully non-mark-derived brand is ever wanted | §4.2's five candidates — none registered, so re-verify at the time |

**What choosing a mark-derived name commits us to.** With a distinct brand these would be courtesies.
They are now the only thing separating this project from an apparently-official port, so they are
requirements at publish time, and each is a review item rather than an aspiration:

1. **The disclaimer moves up and travels.** §3.4's wording goes near the **top** of the root README —
   not below the fold, which is where §3.4 originally placed it on the assumption of a distinct
   brand. It also goes in **every published package's README**, because that is what npm renders on
   the package page, and the package page is where a mistaken install begins. It goes in the docs
   footer and on the docs home.
2. **Point at the real thing.** The disclaimer names chakra-ui.com. Someone who landed here looking
   for official Chakra should leave in one click, and a project that helps them do that is visibly
   not trying to capture them.
3. **No Chakra visual identity, at all** (§3.1). This tightens rather than relaxes: a mark-derived
   name plus Chakra's logo or brand colours as *our* identity is the combination that turns an
   arguable name into an indefensible one. The preset supplying Chakra's palette as the default
   *theme* remains fine — that is the licensed code doing its job.
4. **`@solid-chakra` is held, not shipped.** Keep the scope. If it is ever used for anything before a
   rename, it is one pointer package, `deprecated`, README pointing at `@chakra-ui-solid/*`.

### 3.4 Repo description and README disclaimer

**GitHub repo description** (one line, under 120 characters so it does not truncate):

> An unofficial SolidJS 2.0 port of Chakra UI v3 — Zag.js behavior, Panda CSS styling, no runtime CSS-in-JS.

**README / docs-home disclaimer**, verbatim:

> chakra-ui-solid is not affiliated with, sponsored by, or endorsed by Chakra Systems Inc. or the
> Chakra UI maintainers. "Chakra UI" is their trademark, and it is used here only to describe what
> this library targets. If you are looking for the official Chakra UI, it is at chakra-ui.com.

**Place it near the top of the README, not below the fold**, and in every published package's
README. That is a change from what a distinct brand would have needed: under §3.3.3 the name itself
no longer signals "unofficial", so the disclaimer is doing that work alone and has to be where a
reader meets it. The pointer to chakra-ui.com is part of the wording, not an optional courtesy — it
is what turns a disclaimer into a redirect.

Repeat it in the docs-site footer and on the docs home.

### 3.5 The repository name

**Resolved: `chakra-ui-solid`**, matching the scope and the display name (§3.3.3) — and matching the
working directory and the plan's own working title, so nothing is renamed.

**The known risk this accepts, recorded rather than smoothed over.** Chakra ships its own official
ports under exactly this naming pattern: `chakra-ui/chakra-ui-vue` and `chakra-ui/chakra-ui-vue-next`
are both real repositories in the official organization (verified 2026-08-08). A third-party
repository called `chakra-ui-solid` is therefore not merely mark-adjacent — it lands precisely where
a reader expects to find *the official Solid port*. This is the strongest single argument against the
name, it is not answered by anything in §3.3.3, and it is accepted knowingly on the strength of the
`chakra-ui-svelte` precedent, the deferred ask (§3.7), and the pre-paid exit to `@solid-chakra`.

**No GitHub organization.** The repository is **private, on the author's personal account**, as
`<account>/chakra-ui-solid`. Both the `chakra-ui-solid` and `solid-chakra` organizations were
unclaimed on 2026-08-08 and are deliberately not being claimed — the exposure that would justify a
defensive claim does not exist while the repo is private, and an org is easy to create later if the
project goes public and warrants one.

Being on a personal account rather than an organization is itself a small honesty signal: an
official port would live in `chakra-ui/`, and this visibly does not.

**This settles the plan's open question 8: private.** What it affects is branch protection, CI
secrets, and whether the README disclaimer is load-bearing on day one. It is — §3.3.3 item 1 requires
it regardless, and writing it now costs nothing, which is why it is already in the README.

### 3.6 Docs-site naming

- **Domain: Cloudflare's default subdomain, no custom domain.** The docs deploy to
  `chakra-ui-solid.pages.dev`. Cloudflare derives that subdomain from the **project name**, so name
  the Pages project `chakra-ui-solid` — the one naming decision left that is first-come and worth
  making at setup rather than later. `chakra-ui-solid.dev` / `.com` are deliberately not being
  bought; a custom domain is a swap, not a migration, if that changes.
- **Page titles and nav: `chakra-ui-solid`.** "Chakra UI" appears in body copy where it is genuinely
  the subject — the "what is this" page, the "differences from Chakra" page, migration notes — and
  never in the site chrome beyond the project name itself. The name already carries the full mark;
  the chrome must not compound it.
- A `*.pages.dev` URL is itself a mild signal of an unofficial project. Not a reason to rely on it,
  but with this name it is working in the right direction, which is worth knowing before anyone
  buys a domain later.
- **No Chakra branding in the theme.** The docs site is styled with the preset, so it will look
  Chakra-ish by construction. That is the product working correctly. What must not appear is the
  logo, the wordmark, or a visual identity engineered to be mistaken for chakra-ui.com. With this
  name, that line matters more than it would with any other candidate.
- The plan's docs document (P8) already commits to flagging every place upstream prose or
  illustrations would be reproduced. That flag list is a **copyright** control; this section is the
  **trademark** one. Both apply to the same pages and neither substitutes for the other.

### 3.7 Talking to Chakra — the trigger, and the answer if they object

> **S — contradicted, and not resolved here. Marked at S4, 2026-08-10.** This section was written at
> P1 (2026-08-08). At the S2 gate (2026-08-09) **D-110** set a standing position in the author's own
> words: *"this is an independent port and there is nobody to notify. No issue is filed, no PR
> opened, **no maintainer contacted**, and it is not proposed again unless the author asks."* Under
> the later-phase-wins rule (`decisions.md` §7) D-110 governs and **nothing below fires**.
>
> The two are not obviously about the same thing — D-110's subject is **defect filings** upstream
> (§8.1's A1, §8.2's `suppressOthers`), and this section's is a **trademark courtesy about the
> name**, on a trigger that has not arrived. That is why this is marked rather than deleted:
> **deleting a section because a broader-sounding decision seems to cover it is how a considered
> position gets lost.** Whether D-110 reaches trademark as well as defects is the author's call, and
> it does not need making until the trigger below does.
>
> **Nothing here is a live instruction.** Nothing publishes at `0.0.0` and the repo is private, so
> the trigger is unreached either way.

**The message is deferred, not skipped** (§3.3.3). Sending it today means asking the Chakra team to
weigh in on an empty private repository that may never go live. It is worth sending when there is
something real to point at.

**The trigger: the first public release.** Concretely, whichever comes first of —

- the first `npm publish` under `@chakra-ui-solid/*`, or
- a public docs site or public repository presented as usable.

The npm publish is the irreversible one: before it, a rename costs documents and a private repo;
after it, it costs other people's import paths. Going public on GitHub without publishing is
recoverable but is still a public use of the name, so it belongs on the same side of the line.

**What to send:** a short note saying what the project is, that it is unofficial, that it consumes
`@chakra-ui/panda-preset` as published, and that the name is `chakra-ui-solid` — asking whether they
would rather it were not. Point at the repo and the docs. Not a permission request dressed as a
courtesy; a genuine question with a genuine willingness to act on the answer.

**If they object — to the name, the description, or the docs framing: do it, promptly, and without
argument.** The value of this project is the code, none of the value is in the name, and the
project's premise is that Chakra's work is worth building on. §3.3.3's exit ladder makes that a
scope rename to `@solid-chakra`, which is already owned — not a scramble.

**If they never reply**, ship. A good-faith attempt to ask is on the record, the disclaimer is in
place, and the precedent stands. Do not treat silence as permission in the document's language, but
do treat it as having done the reasonable thing.

---

## 4. Brand proposal — the P1 gate

> **Closed 2026-08-08. The answer is `chakra-ui-solid` under the owned `@chakra-ui-solid` scope** —
> §3.3.3. The mark-derived route was chosen over the five clean-brand candidates below.
>
> This section is **not** dead weight. §4.1's descriptor work is live and in use — it is where the
> repo description, the npm `description`, and the README's opening sentence come from. §4.2–§4.4
> are the **second rung of the exit ladder**: the first rung is `@solid-chakra`, which is already
> owned (§3.3.3). These five come into play only if a fully non-mark-derived brand is ever wanted.
> Do not delete this on a tidying pass.

### 4.1 The descriptor — arguing with the working assumption

*(Live. This is where §3.4's wording comes from.)*

The assumed framing is *"a community SolidJS port of Chakra UI, without runtime CSS-in-JS"*. Three
of its four parts are right. One word should go, and one should be qualified.

**"community" — drop it.** It is the weakest word in the sentence and it works against the thing the
descriptor is for. It does no disclaiming: "community edition", "community port" and "community
plugin" all routinely describe things that *are* sanctioned by the upstream, so a reader can come
away more confused rather than less. It also over-claims — there is no community yet, there is one
author. **"unofficial" or "independent" does the job "community" only gestures at**, in the same
number of syllables. Use "unofficial" where the audience is a stranger deciding whether this is the
real thing, and "independent" where the register should be neutral.

**"port of Chakra UI" — keep, but never unqualified.** It is accurate and it is the fastest possible
explanation of what this is. The risk is that "port" implies 1:1, which the governing constraint
explicitly denies: this is *"as close to Chakra v3 parity as is achievable without runtime
CSS-in-JS"*. A bare "port of Chakra UI" writes a promise the library will not keep, and mis-set
expectations are the main support cost of a project like this. So the clause about runtime CSS-in-JS
is not a technical footnote appended to the descriptor — **it is the qualifier that makes the word
"port" honest**, and the two travel together everywhere: npm description, repo description, docs
home, README first paragraph.

**"without runtime CSS-in-JS" — keep, and consider making it positive.** As written it defines the
project by an absence, which reads as an apology. "Build-time CSS only" or "styles compiled at build
time, none at runtime" says the same thing as a capability. For the *repo description* the negative
form is better, because the audience there is people who already know Chakra is Emotion-based and
are scanning for exactly that difference. For the *docs home*, lead positive.

**"SolidJS" — keep, and add the major.** Nothing upstream is built for SolidJS 2.0; that is the
project's second-largest fact after the CSS constraint, and a Solid 1.x user who installs this and
finds `@solidjs/web` imports will not be pleased. Say "SolidJS 2.0".

**Recommended forms**, all under the length limits of the field they go in:

| Where | Text |
|---|---|
| GitHub description, npm `description` | An unofficial SolidJS 2.0 port of Chakra UI v3 — Zag.js behavior, Panda CSS styling, no runtime CSS-in-JS. |
| README first line | chakra-ui-solid is an independent SolidJS 2.0 component library that targets Chakra UI v3's component API and design system, with styles compiled at build time and no runtime CSS-in-JS. |
| One-liner in conversation | "Chakra v3's API and look, on Solid 2.0, with Panda instead of Emotion." |

### 4.2 The shortlist

*(Not chosen. These are the **second** rung of §3.3.3's exit ladder — the first is `@solid-chakra`,
already owned. None of the five is being registered, so **re-verify before relying on any of them**;
availability below is a 2026-08-08 snapshot, not a reservation.)*

Five names. All five were checked on **2026-08-08**; all five are clear on every axis checked.

npm scope availability was checked against `https://registry.npmjs.org/-/org/<scope>/package`, which
returns `{"error":"Scope not found"}` (404) for a scope that does not exist and a package map (200)
for one that does — including an empty map for a scope that is registered but has published nothing.
That distinction matters: `@kiln-ui`, `@ojas-ui`, `@bindu-ui` all return an *empty* map and are
therefore taken despite having no packages. GitHub availability is an HTTP 404 on
`github.com/<name>`; note that **410** means the name existed and was deleted, and may not be
reclaimable — `anvil-ui` is in that state and was dropped for it. Domains were checked via RDAP.

| Name | npm scope | Scope status | GitHub org | `.dev` / `.com` | Angle |
|---|---|---|---|---|---|
| **Yantra** | `@yantra-ui/*` | free | `yantra-ui` free | both free | Sanskrit: a geometric diagram, and literally *machine / instrument* |
| **Sinter** | `@sinter-ui/*` | free | `sinter-ui` free | both free | Metallurgy: fused solid by heat, below melting — the build-time thesis as the name |
| **Spoke** | `@spoke-ui/*` | free | `spoke-ui` free | both free | English, wheel-adjacent — "chakra" means wheel |
| **Nadi** | `@nadi-ui/*` | free | `nadi-ui` free | both free | Sanskrit: the channels energy flows through *between* chakras |
| **Mudra** | `@mudra-ui/*` | free | `mudra-ui` free | both free | Sanskrit: a gesture or seal — a UI library as a vocabulary of gestures |

Checked and **rejected**: `mandala-ui` (10 packages published under it), `prana-ui` (2 packages),
`bindu-ui` and `kiln-ui` and `ojas-ui` (scope registered, empty), `anvil-ui` (GitHub org name in the
410 tombstone state). `glaze-ui`, `spanda-ui`, `akasha-ui`, `kosha-ui`, `vayu-ui` and `solstice-ui`
are free but were not shortlisted — `glaze` collides with an existing zero-runtime CSS-in-JS library
of that name, and the rest are weaker on the same axes as the five above.

### 4.3 The case for and against each

**Yantra** — `@yantra-ui/components`, `yantra-ui.dev`

The strongest fit on meaning. A *yantra* is a geometric diagram used as an instrument, and in modern
Hindi the word plainly means "machine". This library is a set of state machines dressed in a
geometric design system, so the name is descriptive rather than decorative — the rare case where
the etymology paragraph in the README is actually interesting. Same linguistic family as Chakra,
which signals lineage to anyone who notices and costs nothing with anyone who does not. Against:
three syllables, and English speakers will hesitate over the first vowel (YUN-truh) before settling.

**Sinter** — `@sinter-ui/components`, `sinter-ui.dev`

The only candidate that names the thesis instead of the lineage. Sintering fuses powder into a solid
with heat *below* the melting point — everything is fused at build time and nothing melts at
runtime, which is the governing constraint stated as a metaphor. Unusual enough to be searchable,
short, unambiguously spelled, no cultural questions, and the furthest of the five from anything in
Chakra's trademark neighborhood. Against: it explains itself only to someone who already knows the
word, and it says nothing about Chakra — discoverability rests entirely on the description field.

**Spoke** — `@spoke-ui/components`, `spoke-ui.dev`

Plain English, one syllable, trivially spelled and said. "Chakra" means wheel; a spoke is part of
one — the lineage nod is available to anyone who looks it up and invisible to everyone else, which
is arguably the ideal ratio. Against: it is a common English word, so it is generic in a way the
other four are not, and it carries prior software associations (Mozilla's discontinued *Spoke* scene
editor, and an AI company at spoke.ai). Neither is a trademark conflict in this class of goods, but
both dilute the search results.

**Nadi** — `@nadi-ui/components`, `nadi-ui.dev`

The most on-the-nose of the Sanskrit options: *nadi* are the channels through which energy flows
between chakras, so the name literally means "the thing that connects to Chakra". Short, and the
metaphor is a genuinely good one for a binding layer. Against: obscure outside the yoga and
Ayurveda vocabulary, and "nadi" reads as a personal name to a lot of English speakers. Also the
closest of the five to *depending* on the Chakra association for its meaning — which is charming if
the reader gets it and empty if they do not.

**Mudra** — `@mudra-ui/components`, `mudra-ui.dev`

A *mudra* is a hand gesture or seal — a fixed vocabulary of forms, each with a settled meaning,
which is a fair description of a component library. Warmer and more human than the others, and it
puts interaction rather than machinery at the center. Against: the weakest technical fit of the
five, and "mudra" also names a currency and a widely-known Indian government lending scheme, so the
search results are noisy.

### 4.4 What is deliberately not proposed

- **Anything containing "chakra"** *as a clean-brand candidate* — the near-misses
  (`chakrajs`, `@chakra-x/*`, `@chakra-solid`, `@solid-chakra-ui`) are not worth acquiring. This
  bullet is about §4.2's table, which answers *"what is claimable as a clean brand"*. The two
  mark-derived scopes we already own were never in it, and **`@chakra-ui-solid` is what was
  chosen** (§3.3.3) — a deliberate departure from this section, not an exception to it.
- **A hope-ui sub-brand** (`@hope-ui/chakra-*`). hope-ui has repositioned to Tailwind and
  batteries-included; this project is the stack hope-ui left. Sharing a brand would confuse both
  products and would put the mark back in the package path.
- **A descriptive name** (`solid-chakra-port`, `panda-solid-ui`). Descriptive names are weak marks,
  age badly when the stack changes, and the two dependencies most likely to be named in one
  (`chakra`, `panda`) are other people's marks.

### 4.5 What the choice unblocked, and what is still outstanding

**Done at P1:**

1. ✅ Placeholders resolved throughout `README.md` and `NOTICE.md` — display name
   `chakra-ui-solid`, scope `@chakra-ui-solid/`. No repository rename needed; the working directory
   already matches.
2. ✅ The package graph has its real names: `@chakra-ui-solid/components`,
   `@chakra-ui-solid/styled-system`, `@chakra-ui-solid/panda-preset`, `@chakra-ui-solid/zag-solid`,
   `@chakra-ui-solid/primitives`, `@chakra-ui-solid/i18n`.
3. ✅ P2 onward can be written against real import paths.
4. ✅ **Decided, deliberately:** no GitHub organization, no custom domain, and the maintainer
   message deferred to first public release (§3.3.3, §3.7). Private repo on a personal account,
   Cloudflare's default subdomain.

**Outstanding — nothing blocks P2, and only one has a natural deadline:**

5. **Message the Chakra maintainers at first public release** (§3.7). The trigger is defined; the
   note is not owed before then.
6. **Name the Cloudflare Pages project `chakra-ui-solid`**, so the default subdomain is
   `chakra-ui-solid.pages.dev` (§3.6). First-come, worth doing at setup. Belongs to P8.
7. **Keep `@solid-chakra` held.** It is the first rung of the exit ladder and costs nothing to
   retain. §4.2's five are the second rung, unregistered — re-verify if ever needed.

---

## 5. Tracking upstream over time

Three upstreams move independently and each breaks something different. The policy is per-upstream
because a single "check for updates" habit produces a single kind of check, and these need three.

| Upstream | What a release can break here | The check |
|---|---|---|
| **`@chakra-ui/react`** minor | New components, renamed props, changed anatomy — the parity matrix goes stale | Diff `packages/react/src/components/` folder list against `roadmap.md`. Confirm `@chakra-ui/panda-preset` released the same version — they are **lockstep**, both `3.36.1` today, and a preset that lags is the signal to hold |
| **`@chakra-ui/panda-preset`** minor | Recipe variants added, removed, or renamed; token groups changed. Under the no-runtime-CSS rule a removed variant **silently unstyles** rather than erroring | Diff the preset's recipe and slot-recipe exports, then re-run the generated-CSS coverage check. This check is the whole defense; it is not optional on a preset bump |
| **`@zag-js/*`** minor | Machine `anatomy` changes (parts added/renamed), `data-*` attribute vocabulary drift, connect-API changes | Diff each consumed machine's `anatomy` export against our part components. Re-run the `data-*` diff against the preset's selectors — the assumption that the preset already speaks Zag's vocabulary is a *lineage argument*, and lineage arguments decay |
| **`@zag-js/solid`** any | Our fork drifts from upstream; upstream may gain Solid 2.0 support and make the fork retirable | Diff upstream's `packages/frameworks/solid/src/` file set and contents against the fork. Check whether the peer range admits `solid-js@2` yet — the day it does, the fork is a deletion candidate |
| **Panda** minor | Generated-artifact shape changes (`css`/`cva`/`sva` signatures, `is-valid-prop`, the `styled-system` exports map) | Regenerate and diff the generated artifacts. Re-assert the no-runtime-stylesheet property: no `insertRule`, no `adoptedStyleSheets`, no `createElement("style")` anywhere in the generated output. **Stay on Panda 1.x** while the preset declares `@pandacss/types@^1.4.2`; 2.x is a separate migration with its own gate |
| **Ark UI** any | Nothing — not a dependency | Read it when a component's edge cases are being worked out. No version to track |

**Cadence and mechanics:**

- **Renovate or Dependabot, grouped by upstream, never auto-merged.** Each of the checks above is a
  human reading a diff; an auto-merged minor defeats the entire table.
- **Pin exactly, in the workspace catalog.** `@chakra-ui/panda-preset`, the `@zag-js/*` set, and
  Panda are pinned to exact versions, not ranges — a floating range turns a *reviewable* upstream
  change into an unreproducible local one.
- **One upstream per PR.** A Chakra bump and a Zag bump in the same PR means the coverage check and
  the anatomy diff fail together and neither is diagnosable.
- **Legal re-check on any upstream's *major*.** A major is when a project changes its license, and
  the only way to notice is to look. Re-verify the `license` field and the `LICENSE` copyright line
  of every package in §1.1, and update the table with the new verification date.
- **Re-verify this document's §1.1 table at each release of ours**, and stamp it with the date. A
  license table with no date is a table nobody trusts.

---

## 6. Open items

| # | Item | Blocks | Where it settles |
|---|---|---|---|
**Closed at the P1 gate, 2026-08-08** — recorded so they are not reopened: brand and npm scope
(`chakra-ui-solid` / `@chakra-ui-solid`, §3.3.3) · repository name unchanged, no rename (§3.5) ·
private repo on a personal account, **no GitHub organization** (§3.5, which answers the plan's open
question 8) · **no custom domain** — Cloudflare default subdomain (§3.6) · **maintainer message
deferred to first public release**, on the `chakra-ui-svelte` precedent and a pre-paid exit to the
also-owned `@solid-chakra` (§3.3.3, §3.7).

| # | Item | Blocks | Where it settles |
|---|---|---|---|
| 1 | **Message the Chakra maintainers at first public release** (§3.7) | Nothing now; the trigger is defined | **Open.** First `npm publish`, or a public repo/docs site — whichever is first. `docs-site.md` §1.6 step 5 notes where the trigger fires; closing it stays this document's |
| 2 | ~~Name the Cloudflare Pages project `chakra-ui-solid` (§3.6)~~ | — | **Closed at P8** — `docs-site.md` §1.6 step 1 makes it step one of the Cloudflare setup, which is what puts the name in front of whoever creates the project |
| 3 | ~~Preset consumed as a dependency, not vendored (§1.5)~~ | — | **Closed at P3, and re-checked at P6.** `plan.md` §1.2 declares `staticCss` as a **key** on each inherited recipe through `theme.extend` and re-emits no recipe body, which is the condition this item set. **One measured exception, taken knowingly:** the `container` recipe body (`plan.md` §3.3; `roadmap.md` §1.3a) — expression tier under §1.4, with a header, a registry entry and the preset's first `NOTICE.md`. The `cursor.switch` token key is one word and owes nothing |
| 4 | ~~`createPresence` / `createFocusRestore` header re-check~~ | — | **Closed at P2** — both struck by the port rule, and verified header-free regardless (§1.2) |
| 5 | ~~`licenses/LICENSE-APACHE-2.0.txt` added to the repo~~ | — | **Closed at P2** — no Apache-2.0 material enters. Reopens only if a Zag a11y gap is closed in our own layer (§1.2) |
| 6 | ~~CI checks for the attribution mechanism (§2.3, §2.5)~~ | — | **Closed at P7, by name:** `check:license-headers` (header shape, **survival into `dist/`**, and `comments.legal` still pinned with its comment), `check:notice-rows` (both files, both directions) and `check:package-files` (`LICENSE` + `NOTICE.md` in `files`, and every file an `@license` header promises). All three read `attribution.config.ts` (§2.6). Defined in `testing.md` §9; required by `definition-of-done.md` rules 1.7 and 4.6–4.8 |
| 7 | ~~The disclaimer is in **every** published package's README, not just the root (§3.3.3 item 1)~~ | — | **Closed at P7:** `check:readme-disclaimer`, a **publish-time** gate — a `prepublishOnly` hook plus a release-workflow job — so a new package cannot ship without it (`testing.md` §9; `definition-of-done.md` rule 4.9). A habit would have failed exactly where this fails safe: a per-package README is written once and never looked at again |
| 8 | Keep `@solid-chakra` held — rung one of the exit ladder (§3.3.3); §4.2's five are rung two, unregistered | Nothing | Only if ever needed |
| 9 | ~~Reword `NOTICE.md`'s Adobe React Spectrum section~~ | — | **Closed at P2** — done in the same revision. The section is retained empty as a guard, its trigger sentence replaced with what would reopen it |
