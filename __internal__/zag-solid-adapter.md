# The Zag adapter — `@chakra-ui-solid/zag-solid`, milestone one

**Status:** written at P4, 2026-08-09. Settles the plan's open question **Q6** (carry-overs copied vs
re-derived), answered separately for the third-party fork and for the hope-ui-owned code. Every
figure below was measured on this machine against `__reference-impl__/zag` (at `main`, `421844f`,
`@zag-js/solid@1.43.0`), `__reference-impl__/zag-v2` (at `v2`, `f7f9abf`, `2.0.0-next.1`), and
`../hope-ui` at `ef91b69`.

**What this document is.** The specification for milestone one — the package that binds Zag.js's
framework-agnostic state machines to SolidJS 2.0. It is the first thing built because it depends on
nothing else in the repo (`plan.md` §5.1, §5.2), and it can be proved correct with **no component
involved** (§6).

**What it is not.** The evidence base — that is `prior-art.md`, cited by section rather than
restated. Where the plan and `prior-art.md` §10 disagree, **§10 wins and the plan is not the
source**; §10 of this document lists every row P4 had to change so P5 is re-planned before it is
written.

**Settled earlier and not reopened here.** Brand `chakra-ui-solid` / scope `@chakra-ui-solid`
(`legal.md` §3.3.3). The **port rule** — no accessibility behavior beyond what Zag ships, nothing
invented that Chakra UI v3 does not have, SolidJS idioms excepted (`prior-art.md` §8.2). Zag target
**1.43.0**. Solid pinned at **2.0.0-beta.32**. The a11y kernel is struck to `createRegisteredId`
alone.

**Terms glossed on first use, for a reader who does not know this repo.** *Machine* — a Zag state
machine: pure TypeScript, no framework, describing one component's behavior. *Adapter* — the ~600
lines that bind one machine to one framework's reactivity; this document specifies ours. *Anatomy* —
a machine's named parts (`Root`, `Trigger`, `Content`, …). *`connect()`* — the machine function that
turns current state into a prop bag per part. *Strict-read phase* — a phase Solid 2.0 labels and
reports untracked reads inside (`[STRICT_READ_UNTRACKED]`); Solid 1.x has none.

---

## 0. What milestone one is, and what "done" means

`@chakra-ui-solid/zag-solid` is a **fork** of `@zag-js/solid`, not a dependency: the published
adapter targets Solid 1.x and nothing upstream is built for Solid 2.0 (`legal.md` §1.3). It ships
seven source files and seven test files, depends on `@zag-js/core` / `@zag-js/types` /
`@zag-js/utils` and on Solid, and on **nothing in this repository**.

That last property is the entire reason it goes first. It can land, be tested, and be published
before a single styling decision is settled — and every later milestone (the styling seam, the slot
recipe, Dialog, volume) rests on it.

**Done means all four, together:**

1. The seven source files ported and the seven test files green (§6).
2. The four upstream test files ported to our bench and green (§6.1).
3. `mount()` **silent** across every one of them — no `[STRICT_READ_UNTRACKED]`, no
   `[REACTIVE_WRITE_IN_OWNED_SCOPE]` (§6.5).
4. The attribution landed **in the same commit as the code** — seven `@license` headers, two
   `NOTICE.md` tables (§7). Not a follow-up.

Two things happen alongside it and are part of the milestone, not adjacent to it: the **§0
compliance audit of the Zag machine set** (§5), which is a prerequisite rather than an assumption to
carry, and the **two upstream filings** (§8).

---

## 1. Q6 — copied or re-derived, answered twice

The plan's Q6 reads: *"Do the hope-ui carry-overs get copied from `e9c2f81` verbatim, or re-derived?
**Assumed:** copied, with a provenance note and no sync obligation — they fork on copy."*

**The question as posed contains two errors, and both matter for the fork specifically.**

- **`e9c2f81` is the wrong ref for the fork.** The fork does not exist there. It lands at `e235acf`
  on `spike/zag-solid`, which branched from `8dc53e9` on the *post*-Tailwind line — the Panda era and
  the adapter never coexisted in one tree (`prior-art.md` §0.2). **There is no single ref to copy
  from** (`prior-art.md` §10.3), and the flat `create-*.ts` layout at `main` is not the nested layout
  at `e9c2f81` (`prior-art.md` §0.3).
- **"A provenance note and no sync obligation" is the *hope-ui-ownership* answer**, and the fork is
  not hope-ui-owned in the sense that answer assumes. It is a **third-party MIT derivative** of
  `chakra-ui/zag` (`legal.md` §1.3). `legal.md` §1.6's *"carry-overs are ours"* does not reach it.

So Q6 gets two answers.

### 1.1 The fork — **copied, from `ef91b69`, all fourteen files**

**Decision: copy the seven source files and the seven test files from hope-ui at `ef91b69`,
unchanged except for the four deltas §4.3 names, and re-attribute them as a third-party derivative.**

| | |
|---|---|
| **Ref** | `ef91b69` — `packages/primitives/src/zag-solid/` (7 `.ts`) and `packages/primitives/src/zag-solid/__tests__/` (7 test files) |
| **Not** `e9c2f81` | The fork does not exist at that ref |
| **Not** upstream `1.43.0` | That is the re-derive alternative, rejected in §1.3 |
| **Attribution** | **Not** a provenance note. Seven `@license` headers naming `chakra-ui/zag` → `packages/frameworks/solid/src/<file>.ts`, © 2021 Chakra UI, MIT, **plus** a row in the root `NOTICE.md` and in the package's (§7) |
| **Sync obligation, hope-ui direction** | **None.** Fork on copy, exactly as `legal.md` §1.6 states — record the source commit, do not record a promise |
| **Sync obligation, upstream direction** | **Yes, and standing.** `legal.md` §5 puts a per-release check on `@zag-js/solid`: diff upstream's `packages/frameworks/solid/src/` file set and contents against the fork, and check whether the peer range admits `solid-js@2` yet — the day it does, the fork is a deletion candidate |

That last row is the substantive difference between the fork and every other carry-over in the repo,
and the reason Q6 could not be answered once for all of them. Everything else we take from hope-ui is
ours and dead-ends on copy. The fork is a live tracking relationship with a third party, and it is
**meant to be retired** (`legal.md` §1.3).

Six per-file design notes come with it — `__internal__/primitives/zag-solid/{bindable, machine,
merge-props, normalize-props, refs, track}.md` at `ef91b69`. They record *why* each divergence
exists, including the deviation table §4 draws on. Copy them (hope-ui-owned, provenance note); they
are the difference between a fork someone can maintain and one they can only re-derive.

### 1.2 The hope-ui-owned code milestone one needs — **copied, per item, per ref**

`zag-solid` depends on nothing in-repo, but its **tests** do, and they are half the deliverable. The
fork's test files import `mount` and `expectNoA11yViolations` from `@hope-ui/internal-test-utils`
(verified in `machine.browser.test.tsx`'s first line). **The fork's tests and hope-ui's test harness
are not separable** — copying the fork means copying the harness in the same milestone.

| Item | Take it from | Verdict | Attribution |
|---|---|---|---|
| `internal-test-utils` — `mount/mount.ts` (the reactivity-diagnostic gate), `axe/`, `hydrate-fixture/` | **`main`** | copy | **Ours** — provenance note |
| Three-project Vitest split — `vitest.config.ts`, `vitest-aliases.ts`, `vitest-hydration-bridge.ts`, `vitest.setup.jest-dom-optout.ts` | **`main`** | copy, then extend | **Ours** |
| `solid-contract.{test.ts, ssr.test.tsx, browser.test.tsx}` — `packages/primitives/src/__tests__/` | **`main`** | copy, then extend (§6.3) | **Ours** |
| `tsdown.config.base.ts` incl. `deps.neverBundle` and the pinned `comments.legal` | `e9c2f81` **or** `main` | copy, **comment included** — `legal.md` §2.3 makes the setting load-bearing for the seven headers, and the comment is what stops someone unpinning it | **Ours** |
| `__internal__/solid-2.0-notes.md` | **`main` (246 lines)**, *not* `e9c2f81` (`docs/`, 151) | copy, then prune | **Ours** |
| The six `zag-solid` per-file design notes | **`ef91b69`** | copy | **Ours** |

**Attribution posture, unchanged from `legal.md` §1.6:** same author, same MIT license, so no
third-party obligation and **no `NOTICE.md` row**. A provenance note in the header anyway — hope-ui
path plus commit — so the lineage stays legible and the next reader can find the commit where the
design was argued. Fork on copy, both directions.

Everything else hope-ui-owned (`renderStyled`, `renderElement`, `withDefaults`,
`composeEventHandlers`, `createKeyboardHandler`, `runIfFunction`, `createRegisteredId`, the Box/Flex
ports, `panda.config.ts`) belongs to milestone 2/3 and is assigned per-ref by `prior-art.md` §9's
*"Take it from"* column. Q6's answer for them is the same as §1.2's — copied, per item, per ref, with
a provenance note — and nothing in P4 changes it.

### 1.3 The rejected alternative for the fork — re-derive from upstream `1.43.0`

**Rejected.** Take the 8 files / 594 lines at `@zag-js/solid@1.43.0` and redo the Solid 2.0 migration
ourselves. Four reasons, in order of weight:

1. **The four defects were measured against running components, not read out of source.**
   Re-deriving means re-finding them, and `prior-art.md` §8.1's methodology rule says a finding needs
   a probe before it reaches a verdict — which means re-building the two probe components
   (`ZagDialog`, `ZagListbox`). That is the spike again, for a result already in hand.
2. **Two of the five divergences are discoveries with a measured cost, not migrations.** The `$PROXY`
   `mergeProps` fixed a 40× constant — 8 004 `getItemProps` calls per keystroke at 200 rows
   (`prior-art.md` §3.4). `bindable`'s boxing dodges Solid 2.0's `createSignal(fn)` **memo overload**,
   which invokes a function-valued state instead of storing it, and fails *silently*. A re-derivation
   reproduces the migration and misses both.
3. **The 86 test cases across seven files are the evidence**, and they do not re-derive either. The
   gate for a re-derivation would be the fork's own suite, so the fork is the cheaper path to the
   same bar.
4. **The port is the risky part and it is already done.** `prior-art.md` §8.1's rule points the same
   way: the fork is measured, a fresh port is reasoned.

**What re-deriving would buy, honestly stated:** a smaller diff against upstream on the day upstream
ships its own Solid 2.0 adapter. That is real (§3.5), but it is bought by keeping the fork a
*minimal-diff copy* — a constraint the spike **explicitly lifted** at `ef91b69`, with its reasons
recorded in `index.ts`. Reinstating it means giving back the `$PROXY` fix and the boxing.

**A middle option, also rejected: copy the fork, then re-base it onto `1.43.0`'s source.** The
re-base has nothing to bite on. §2.3 shows the adapter source is byte-identical between the v1 and v2
branches, and §4.3 shows the *three* 1.43.0 changes affecting the adapter are each one line — they
are applied as three named edits (§4.3), not as a re-base.

**And rejected for the hope-ui-owned items: re-derive the test harness.** They are ours, MIT, same
author — there is no legal reason. More to the point, `mount()`'s diagnostic gate **is** this
milestone's gate (§6.5). Re-deriving the gate is re-deriving the thing that proves the port.

**Also rejected: a git submodule or git dependency on hope-ui instead of a copy.** hope-ui's `main`
is the Tailwind era; the Panda-era and spike code is reachable only by ref, never as a published
package. And `legal.md` §1.6's fork-on-copy is the intended posture, not a fallback.

---

## 2. The upstream file set, exactly

### 2.1 Eight files, 594 lines, at `@zag-js/solid@1.43.0`

```bash
wc -l __reference-impl__/zag/packages/frameworks/solid/src/*.ts
```

| File | Lines | What it is |
|---|---:|---|
| `machine.ts` | 320 | `useMachine` — the whole adapter. Scope, reactive state cell, reactive props, per-state effects, teardown |
| `normalize-props.ts` | 82 | Machine prop bag → Solid props. Event renames, `style` hyphenation, `children`→`textContent` |
| `bindable.ts` | 67 | The reactive cell behind every context value and behind the machine's own state. Controlled/uncontrolled per read |
| `merge-props.ts` | 59 | Zag's own prop merge — composes `style`, `class`, `className`, `data-ownedby` and `on*`; last-wins for everything else |
| `track.ts` | 30 | `createTrack(deps, effect)` — the primitive behind a machine's `watch` |
| `use-sync-external-store.ts` | 20 | 1:1 API parity with React's hook. Nothing in Zag consumes it |
| `refs.ts` | 11 | A plain, non-reactive key/value box for machine refs |
| `index.ts` | 5 | The public barrel |
| **Total** | **594** | |

`prior-art.md` §10.4 confirms both figures as exact — **8 files, 594 lines**, not approximations.

### 2.2 The fork is **7 + 7** — one file dropped, and why

```bash
git -C ../hope-ui ls-tree -r --name-only ef91b69 -- packages/primitives/src/zag-solid
```

| Source (7) | Raw | | Tests (7) | Raw | Project |
|---|---:|---|---|---:|---|
| `machine.ts` | 371 | | `machine.browser.test.tsx` | 1197 | browser |
| `merge-props.ts` | 145 | | `bindable.test.ts` | 214 | unit |
| `bindable.ts` | 120 | | `merge-props.test.ts` | 207 | unit |
| `normalize-props.ts` | 107 | | `normalize-props.test.ts` | 133 | unit |
| `index.ts` | 39 | | `track.test.ts` | 112 | unit |
| `track.ts` | 36 | | `machine.ssr.test.tsx` | 55 | ssr |
| `refs.ts` | 15 | | `refs.test.ts` | 43 | unit |
| **Total** | **833** | | **Total** | **1961** | |

`use-sync-external-store.ts` is **dropped**. It existed for 1:1 API parity with the React adapter and
nothing in Zag consumes it — no machine, and neither probe component. Solid 2.0 has no equivalent
hook to bind it to, so it would be 20 lines of dead surface with a maintenance cost and no consumer.

Figures are **raw** (`wc -l`); do not compare them against the 594 above, which is also raw but
against a codebase with a different comment density — `prior-art.md` §0.4 is explicit that mixing
conventions moves an argument by up to 40%. `prior-art.md` §6.1 has the code-line trajectory
(573 → 601 → ~614) if a volume comparison is actually needed.

### 2.3 v1 and v2 share the adapter **byte for byte** — a stronger claim than the plan's

`brief-plan` §3.3 says *"the adapter file set is **identical** across majors."* Measured, it is more than the
file set:

```bash
diff -rq __reference-impl__/zag/packages/frameworks/solid/src \
         __reference-impl__/zag-v2/packages/frameworks/solid/src     # no output
diff -rq __reference-impl__/zag/packages/frameworks/solid/tests \
         __reference-impl__/zag-v2/packages/frameworks/solid/tests    # no output
```

**All 8 source files and all 4 test files are byte-identical** between `@zag-js/solid@1.43.0`
(`main`, `421844f`) and `@zag-js/solid@2.0.0-next.1` (`v2`, `f7f9abf`). The `package.json` files
differ in exactly two fields — `version`, and `lint` (`eslint src` → `oxlint src`). The declared
dependency set, peer range and export surface are the same.

### 2.4 What that means for a future v2 move — the move is adapter-*free*, not merely adapter-local

The plan's phrasing — *"a future v2 move is adapter-local"* — understates it. If the adapter source
is identical across the major, then a v1→v2 move **changes nothing in this package at all**. What
moves is:

| Moves on a v1→v2 bump | Does not move |
|---|---|
| The `@zag-js/*` machine versions in the workspace catalog | `machine.ts`, `bindable.ts`, `merge-props.ts`, `normalize-props.ts`, `refs.ts`, `track.ts`, `index.ts` |
| Machine **anatomy** and `connect()` surfaces — a major is where parts get renamed | The public API (§3.1) |
| The `data-*` vocabulary the preset's slot recipes select on | The seven `@license` headers — they name the upstream *file*, not a version (`legal.md` §1.3) |
| `@zag-js/core`'s `mergeProps` behavior, which the fork delegates to (§4.3 delta 2) | The test plan's shape |

So the v2 exposure is **P6's parity matrix and P5's part components**, not this package. Two caveats
that keep it honest: the two branches are compared at one moment each, so a later v2 commit can
diverge; and `2.0.0-next.1` is a `next` prerelease, so the surface is not frozen. `legal.md` §5's
`@zag-js/solid` row already carries the standing file-set diff that would catch it.

---

## 3. The public API, and parity with the react/vue/svelte/preact/vanilla siblings

### 3.1 The surface

Four things, and the fork changes none of them:

| Export | Signature | Consumed by |
|---|---|---|
| `useMachine<T>(machine, props?)` | `(Machine<T>, Partial<props> \| Accessor<Partial<props>>) => Service<T>` | Every component's `Root` |
| `normalizeProps` | `createNormalizer<PropTypes>` — machine prop bag → Solid props | Every part component, once per `connect()` call |
| `mergeProps(...sources)` | 1–4 sources, each a value or an accessor | Every part component, to fold consumer props over machine props |
| `PropTypes` | `JSX.IntrinsicElements & { element, style }` | The type parameter `connect()` is instantiated at |

`MaybeAccessor<T>` ships alongside `mergeProps` as its parameter type. `createBindable`,
`createRefs` and `createTrack` are **internal** — upstream exports them from their own modules but
does not re-export them from `index.ts`, and neither do we. They reach a machine through the service
object `useMachine` constructs, which is why a machine never imports them.

### 3.2 Parity with the siblings

Measured across `__reference-impl__/zag/packages/frameworks/`:

| | files | src lines | `useMachine` | `normalizeProps` | `mergeProps` | `PropTypes` | extra |
|---|---:|---:|---|---|---|---|---|
| **react** | 9 | 532 | ✅ | ✅ | re-export from `@zag-js/core` | ✅ | `Portal`, `useSyncExternalStore` (React's) |
| **preact** | 8 | 517 | ✅ | ✅ | re-export from `@zag-js/core` | ✅ | `Portal`, `useSyncExternalStore` |
| **vue** | 7 | 498 | ✅ | ✅ | re-export from `@zag-js/core` | ✅ | `useSyncExternalStore` |
| **svelte** | 10 | 599 | ✅ | ✅ | own | ✅ | `portal`, `reflect`, `useSyncExternalStore` |
| **vanilla** | 8 | 688 | `VanillaMachine` class | ✅ | own | — | `spreadProps` |
| **solid (upstream)** | 8 | 594 | ✅ | ✅ | **own** | ✅ | `Key`, `useSyncExternalStore` |
| **ours** | **7** | 833 raw | ✅ | ✅ | **own** | ✅ | — |

**We are at parity on all four, and the four are what a component consumes.** Solid is one of only
three adapters carrying its **own** `mergeProps` rather than re-exporting `@zag-js/core`'s — the
Solid one has to be lazy, because a component's props are getters and reading them eagerly at merge
time both loses reactivity and trips the strict-read phase. That is why `merge-props.ts` is where the
fork diverges most.

### 3.3 Two exports the fork does not carry

| Dropped | Why | Cost |
|---|---|---|
| `useSyncExternalStore` | §2.2 — no consumer, no Solid 2.0 equivalent to bind it to | None measured. It is the one API a downstream user could theoretically import; nothing in Zag or in either probe component does |
| `Key` (re-exported from `@solid-primitives/keyed`) | Not our export to make. It is a Solid *rendering* primitive that upstream passes through for convenience; no Zag machine needs keyed rendering, and re-exporting it would put a third-party package in our dependency set for a symbol a consumer can import directly | None. Drops `@solid-primitives/keyed` from the dependency graph |

Both are recorded here rather than in a changelog because they are the **only** two places our
published surface is narrower than upstream's, and a future re-sync needs to know they were choices.

### 3.4 Five divergences *behind* the unchanged surface

`prior-art.md` §6.1 lists them; here is what each one is, so the re-sync cost in §3.5 is legible.

| # | File | Divergence | Why it exists |
|---|---|---|---|
| 1 | `merge-props.ts` | **`mergeProps` is a `$PROXY` lazy proxy**, not an eager `Object.getOwnPropertyDescriptors` enumeration with a getter per key. Nothing is read at construction; the key set is not frozen | Fixes A3 *and* a measured 40× constant — 8 004 `getItemProps` calls per keystroke at 200 rows (`prior-art.md` §3.4). Its structural traps (`has` / `ownKeys`) are deliberately untracked, so a `key in props` query does not subscribe its reader to `api()` |
| 2 | `machine.ts` | **Seed reads are named** — construction callbacks (`context()`, `refs()`, `initialState({prop})`) run through a `seedFromProps` helper | Absorbs B5. A consumer writes a bare `useMachine(...)` in a render body. Deliberately **not** applied to `machine.watch?.()`, which only registers `track` effects — a machine reading props directly there has a real bug and should keep the diagnostic |
| 3 | `bindable.ts` | **The signal is boxed** — `{ value: T }` plus an unwrapping `equals` | Solid 2.0's `createSignal(fn)` is the **memo overload**: a function-valued state would be invoked instead of stored, silently |
| 4 | `machine.ts` | **`flush` is Solid 2.0's real `flush`**, not upstream's no-op — `flush(() => state.set(target))` on a state change | 1.x propagated writes synchronously; 2.0's client build defers them, so two events queued back-to-back would both transition from the *pre*-transition state. This is what the React adapter spells `flushSync` |
| 5 | `index.ts` | **`useSyncExternalStore` gone** (§2.2, §3.3) | No consumer |

Plus the mechanical Solid 2.0 migrations, which are not divergences in the same sense — `onMount` →
`onSettled`, `mergeProps` → `merge` (presence-based, not value-based), the split
`createEffect(compute, effect)` pair, and `import type { JSX }` from `@solidjs/web` rather than
`solid-js`.

### 3.5 What that costs a future re-sync

The fork is meant to be retired the day upstream ships a Solid 2.0 adapter (`legal.md` §1.3;
`prior-art.md` §3.2 records that upstream has committed to it). The retirement is not free, and the
five divergences are the bill:

| Divergence | On retirement |
|---|---|
| 1 — `$PROXY` `mergeProps` | **The one that may not retire.** If upstream's Solid 2.0 adapter keeps the eager enumeration, swapping back reinstates the 40× constant. Measure before swapping; keeping our `mergeProps` while taking upstream's `machine.ts` is a supported outcome, and it is why `index.ts` exports `mergeProps` from its own module rather than re-exporting |
| 2 — `seedFromProps` | Retires cleanly **if** upstream's version is strict-read-clean. If not, this is the same fix under a different name and the component layer gets `untrack` back (§4.2) |
| 3 — boxed signal | Retires. Any correct Solid 2.0 adapter must solve `createSignal(fn)` somehow |
| 4 — real `flush` | Retires. Same |
| 5 — dropped `useSyncExternalStore` | Retires by addition, at zero cost |

**The mechanical part of the re-sync is cheap and already specified:** `legal.md` §5's
`@zag-js/solid` row is a file-set-and-contents diff plus a peer-range check. **The expensive part is
that our 86 test cases have to keep passing against upstream's implementation** — which is the right
shape, because that is exactly the check that says whether the swap is safe.

---

## 4. The four defects, at their current state

Three of the four have moved since the plan recorded them. **The plan's §3.5 table is not the
source**; `prior-art.md` §6 is.

### 4.1 The four, as they stand

| # | Defect | State at `ef91b69` | Filed upstream? |
|---|---|---|---|
| **A1** | Every boolean `aria-*` the machine emits is malformed. Zag emits real booleans — correct for React, whose DOM layer stringifies. `@solidjs/web` does `value === false ? removeAttribute : setAttribute(name, value === true ? "" : value)`, so an open modal ships `aria-modal=""` (axe `aria-valid-attr-value`) and a **collapsed trigger ships no `aria-expanded` at all** | **Stands, unchanged.** Fixed in `normalize-props.ts` by stringifying boolean `aria-*` in both directions. **Upstream `@zag-js/solid@1.43.0` has the identical bug** — verified in the checkout: its `normalizeProps` has a `readOnly === false` rule and no `aria-*` rule | **No — unfiled.** §8.1 |
| **A2** | Every controlled state change emits `[STRICT_READ_UNTRACKED]`: a machine's `watch` tracks a prop, then re-reads it in the effect callback | **Stands, unchanged** — `track.ts`. Fixed by running the callback as `untrack(effect)`: a `track` callback is a side effect, not a subscription, and `deps` is its whole reactive input by construction | Not applicable — Solid 1.x has no strict-read phase, so it is not a bug there |
| **A3** | Every merged part emits `[STRICT_READ_UNTRACKED]`. Building the getter set called each source once to enumerate keys — a reactive read from a render body, false-positive by construction | **SUPERSEDED.** `mergeProps` is now a `$PROXY` lazy proxy that **reads nothing at construction**, so there is no construction pass to untrack. `merge-props.ts:65,77` untracks only the structural `has` / `ownKeys` traps | Not applicable |
| **B5** | `useMachine(...)` in a Root emitted 13 diagnostics — the adapter seeded bindables by reading its props memo from the render body | **RETIRED.** `seedFromProps` (`machine.ts:35-51`) absorbs it. Both `zag-listbox-root.tsx` and `zag-dialog-root.tsx` at the tip have **zero `untrack`** | Not applicable |

```bash
git -C ../hope-ui grep -o untrack ef91b69 -- packages/components/src/zag-dialog \
  packages/components/src/zag-listbox | wc -l          # 0
```

### 4.2 What P5 must **not** inherit — B5's idiom no longer exists

Stated explicitly because P5 inherits this section and the plan tells it the opposite.

**`brief-plan` §3.5's B5 row** prescribes *"`untrack` around the `useMachine` call, in the component."*
**`brief-plan` §4.1's document-4 contents** instruct the blueprint to document *"the
`untrack`-around-`useMachine` seed idiom."*

**Both would teach an idiom that no longer exists.** The fix moved *down* into the fork at `ef91b69`
and the component layer is clean. A blueprint teaching the wrapper would stamp a redundant `untrack`
into 100+ components, and each one would suppress a diagnostic the fork already handles — which means
each one would also suppress a *real* diagnostic the day a component genuinely reads a prop untracked
in its render body.

**What P5 documents instead, in one line:** a Root calls `useMachine(machine, props)` bare, and if
that emits `[STRICT_READ_UNTRACKED]`, the bug is in the component or in the machine's `watch`, not in
the call. `seedFromProps`'s own JSDoc records the boundary: it deliberately does **not** cover
`machine.watch?.()`, because that only *registers* `track` effects whose deps are collected in their
own tracking scope — *"a machine that reads props directly there has a real bug, and should keep
getting the diagnostic."*

Likewise **A3's prescribed fix is not the fix that shipped.** `brief-plan` §3.5 says *"`untrack` the
construction pass only; per-key getters stay fully reactive."* There is no construction pass. Any
later document describing A3 describes a lazy proxy whose *structural* traps are untracked and whose
per-key `get` is untouched.

### 4.3 The predicted rows, re-checked — and three real deltas against `1.43.0`

`brief-plan` §3.5's lower half is *predicted* rather than measured. Checked against the fork:

| `brief-plan` §3.5 predicted | State |
|---|---|
| `machine.ts` — `mergeProps` from `solid-js` → `merge` | **Done.** `merge`, presence-based |
| `machine.ts` — `onMount` → `onSettled` | **Done** |
| `machine.ts` — `send`'s `queueMicrotask` needs a `flush()` characterization test | **Half done.** The microtask is kept deliberately (an action that sends is not re-entrant with the transition that triggered it), and `flush(() => state.set(target))` is divergence 4. **The characterization test the plan asks for does not exist** — §6.3 adds it |
| `bindable.ts` — `createSignal(initial as T)` where `T` may be a function | **Done** — boxed, divergence 3 |
| `bindable.ts` — single-arg `createEffect` → split `createEffect(deps, fn)` | **Done** |
| `use-sync-external-store.ts` — `onMount` → `onSettled` | **Moot** — file dropped |
| `normalize-props.ts` — `import type { JSX }` from `@solidjs/web` | **Done** |

**And the finding this re-check produced: the fork does *not* apply unchanged to `1.43.0`.** `brief-plan` §8
assumption 10 calls that *"likely, not certain"*; measured, it is **false in three named places**.
The fork was built against `1.42.0`, and `@zag-js/solid@1.43.0`'s changelog carries exactly three
adapter-affecting changes. All three are small, all three are ours to apply, and one of them the fork
**predicted and armed a tripwire for**.

| # | 1.43.0 change | Fork's state | Delta to apply |
|---|---|---|---|
| **D1** | `42d8a92` (#3228) — *"Skip machine exit actions when a component is disposed before the machine starts."* Upstream `machine.ts`'s `onCleanup` opens `if (status !== MachineStatus.Started) return` | The fork's `onCleanup` has **no guard**: it sets `Stopped`, drains effect cleanups, and calls `action(machine.exit)` unconditionally | **One line.** Add the guard as upstream's first `onCleanup` statement. A component disposed before `onSettled` runs currently fires root exit actions that never had a matching entry |
| **D2** | `53944e0` — *"Compose `data-ownedby` values when merging props, match owners as tokens in DOM queries."* `@zag-js/core@1.43.0`'s `mergeProps` **unions** `data-ownedby` (`packages/core/src/merge-props.ts:73` → `ownedBy(…)`), and `@zag-js/dom-query`'s `getByOwnerId` selects `[data-ownedby~="…"]` — a token match | The fork already routes `data-ownedby` through its composing branch, which delegates to `@zag-js/core`. At the pinned `1.42.0` core had no union branch, so it yielded last-wins — **and the fork pinned its test to that**, with a comment saying the bump is what should turn it red | **One test assertion.** `merge-props.test.ts`'s *"routes `data-ownedby` through the composing branch, where the last source still wins"* becomes upstream's *"combines `data-ownedby` tokens"* — union, not last-wins. The source needs no change; the delegation was written for exactly this. **This is the fork's own tripwire firing on the version move, exactly as designed** |
| **D3** | `75ee543` (#3232) — *"fix: controlled mode predicate in solidjs."* Upstream `bindable.ts:11` is `props().value !== undefined` — **strict** | The fork is `currentParams().value != undefined` — **loose**, so `value: null` means *uncontrolled*. Its JSDoc argues for it: *"Zag's rule is `value != undefined`"* | **One line, and a decision — see below.** Align to `!==` |

**D3 is the one that needs a ruling, and the port rule gives it.** The fork's premise — that
`value != undefined` is Zag's rule — is contradicted by every sibling adapter at 1.43.0:

```bash
grep -n "controlled" __reference-impl__/zag/packages/frameworks/*/src/bindable*.ts
```

`react`, `preact`, `vue`, `svelte`, `vanilla` and `solid` **all six** use `!== undefined`. So under
`!=`, `<Select value={null}>` is *uncontrolled* here and *controlled-with-null* in Chakra — the
machine would fall back to internal state and ignore an explicit null. That is a behavior difference
on every machine with a nullable value prop (`select`, `combobox`, `listbox`'s `highlightedValue`,
`color-picker`, `date-picker`, …), and it is **not a SolidJS idiom**, so the port rule
(`prior-art.md` §8.2) does not exempt it. **Verdict: align to `!== undefined` and delete the JSDoc
claim.** Upstream's `1.43.0` fix went that way for the same reason.

**Consequence for `brief-plan` §8 assumption 10:** it does not survive as written. §9 records it as
**closed-and-refuted**, with the three deltas above as the finding rather than a residual risk.

---

## 5. The §0 compliance audit of the Zag machine set

`brief-plan` §8 assumption 8 — *"whether any Zag 1.43.0 machine injects a stylesheet at runtime"* — is
**a prerequisite, not an assumption to carry**, and `plan.md` §11.1 assigns it to **step 2, this
milestone**, because that is when `@zag-js/*` first enters the tree. It was run at P4, against the
checkout.

**Result: §0 passes.** The assumption's *phrasing* does not survive the run, and §5.1 is why.

### 5.1 The rule the audit is auditing against, stated first

**Settled at the P4 gate, 2026-08-09:** §0 bans **runtime CSS-in-JS engines** — Emotion,
styled-components, goober, stitches, or anything of ours that serializes component styles into a
stylesheet at render time. **It is not a ban on any code anywhere ever touching a stylesheet at
runtime.**

That distinction decides this audit's result, so it goes above the greps rather than below them. §0
exists because a runtime styling *engine* makes build-time extraction impossible and takes the
distribution model with it (`plan.md` §0, §0.2). A behavior library writing one static rule during a
drag gesture does not do that and never could.

**Consequence for the two halves of the audit:**

| | Scope | Instrument |
|---|---|---|
| **The rule proper** | Our own source, and the whole dependency closure | A **manifest** check — no CSS-in-JS engine in any `package.json` or lockfile entry (§5.2, question 2) |
| **A supporting hygiene check** | **Our own source only** | The source grep below. It is how we keep *ourselves* honest; it is **not** a compliance test we hold dependencies to |

The source grep is still run over the machine set once, here, because *knowing* what our
dependencies do at runtime is worth an afternoon even when it is not a rule violation — it is how
§5.3's two real findings became documented behavior instead of a surprise during a drag.

**Where the wording was, and where it is now.** `plan.md` §0 opened *"No library or code in this repo
may generate stylesheets at runtime"* before naming the engines — a sentence that admits the stricter
reading, and this audit is what surfaced it. **`plan.md` §0 was corrected at this gate** to the
two-scope form: engines banned across the closure, runtime sheet-writing banned in *our* source, and
the note that applying the second scope to dependencies is the mistake. Nothing else in `plan.md`
moved — §0.3 already permits inline `style`, and §0.1's Panda argument is about `css()` not
injecting, which is unaffected. **P9 carries the same form into `CLAUDE.md`**, which is where the
rule is enforced rather than argued.

### 5.2 What the audit runs

Two questions, and §5.1 says which one is the rule.

**Question 1 — does anything build a stylesheet at runtime?** Over
`packages/{machines,utilities,core,types,store}`, excluding tests:

```bash
grep -rn 'insertRule\|adoptedStyleSheets\|createElement("style")\|createElement('"'"'style'"'"')\|new CSSStyleSheet\|styleSheets\|cssRules\|innerHTML' \
  __reference-impl__/zag/packages/{machines,utilities,core,types,store} --include='*.ts' | grep -v '\.test\.'
grep -rn 'head\.appendChild\|head\.append\|<style' \
  __reference-impl__/zag/packages/{machines,utilities,core} --include='*.ts' | grep -v '\.test\.'
```

`innerHTML` and `styleSheets` are in the list deliberately as **over-catching** terms — they produce
false positives that have to be adjudicated once and recorded (§5.3), which is cheaper than a narrow
grep that misses a novel injection route.

**Question 2 — is anything in the dependency closure a CSS-in-JS engine?** **This is the §0 check.**
Not a source grep; a manifest check, and the one `brief-plan` §6 already specifies for CI: no `@emotion/*`,
`styled-components`, `goober` or `stitches` in any `package.json` or lockfile entry. The `@zag-js/*`
closure at 1.43.0 is `@zag-js/*` plus `@floating-ui/dom` plus `@internationalized/*`.

**Scope note.** The audit covers the machine set as a whole, not just the machines we ship first,
because what it finds changes P6's parity matrix, not just P5's Dialog.

### 5.3 The result — run at P4

**§0: PASS.** No CSS-in-JS engine anywhere in the closure. 51 machines, 22 utilities, zero styling
engines. Nothing here blocks the milestone or costs a component.

The source grep returned four hits, adjudicated once here so nobody re-flags them:

| Site | What it is |
|---|---|
| `packages/machines/splitter/src/splitter.dom.ts:67-79` — `setupGlobalCursor` creates a `<style>` in `document.head` holding `* { cursor: <x> !important; }` during a drag; `removeGlobalCursor` removes it on drag end. Called from `splitter.machine.ts:705` | **Real stylesheet, not a §0 violation.** One static rule, no component styles in it, injected for the duration of a gesture. Zag's own types call it *"the injected splitter cursor stylesheet"* (`splitter.types.ts:127`) and give it a `nonce` prop for CSP. It is irreducible to an inline `style` on purpose — the point is to beat every descendant's own cursor, which only a `*` selector can do |
| `packages/machines/splitter/src/utils/registry.ts:249-264` — `SplitterRegistry#setGlobalCursor`, same mechanism, **exported from the package entry** (`index.ts:31`) so it is reachable rather than internal | Same verdict. Same machine, second site |
| `packages/machines/number-input/src/number-input.dom.ts:100` — `el.innerHTML = '<svg …>'`, the scrubber cursor | Not a stylesheet at all. A DOM element with inline `style` attributes, which `plan.md` §0.3 permits explicitly |
| `packages/utilities/auto-resize/src/autoresize-input.ts:26` — `ghost.innerHTML = input.value` on a hidden measuring element with `style.cssText` | Not a stylesheet. Inline `style`, measurement only |

**Clean, and worth recording because it is the one everybody assumes is dirty:** `@zag-js/remove-scroll`
— the scroll lock behind every modal — writes **inline styles only** (`setStyle` / `setStyleProperty`
on `documentElement` and `body`), no sheet. So does `@zag-js/popper`, `@zag-js/focus-trap` and
`@zag-js/dismissable`. Dialog, the blueprint component, touches no stylesheet on any path.

**So Splitter ships, unchanged, with Chakra's behavior intact.** Recorded because the alternative —
excluding it — would have **removed** behavior Chakra has, which the port rule treats as a divergence
in exactly the way adding behavior is (`prior-art.md` §8.2). Neither the parity matrix nor the §0.4
delta table gains a row for it.

### 5.4 What a failure would mean

Nothing failed, so this is the contingency, written once so it does not have to be re-reasoned under
pressure.

**A question-2 failure — a CSS-in-JS engine in the closure — is a stop.** It would mean a Zag machine
had taken a styling dependency, which breaks build-time extraction and the whole distribution model
with it (`plan.md` §0.2). There is no local mitigation: the response is to not ship that machine's
component, and to file upstream. The manifest check is cheap enough to run on every install, which is
why it is a gate line (§6.5) rather than a periodic review.

**A question-1 hit is a finding, not a failure**, and gets adjudicated on one question: *does this
serialize component styles at render time, or is it a fixed rule serving a behavior?* The four above
are all the second kind. A hit of the first kind has never been seen in Zag and would be
extraordinary — it would mean the behavior library had grown a styling layer.

**The one real risk is silence.** `prior-art.md` §8.1's rule applies: a check verified by nobody
running it is verified in name only. Hence §5.5.

### 5.5 When it runs

At **step 2**, not before. Question 2 needs the *installed* closure; question 1 has been run against
the reference checkout, which is `main` at `421844f` — one commit-set from the published `1.43.0`,
so the P4 result is **provisional on the published tarballs** and step 2 confirms it. §6.5 folds
both into the milestone gate as a script.

Thereafter it re-runs **on every Zag minor**, folded into `legal.md` §5's `@zag-js/*` row alongside
the anatomy diff — so a *new* injection site in a future release surfaces as a diff against these
four rather than blending in.

---

## 6. The test plan — proving the adapter correct with no component involved

The point of this section: **milestone one's correctness is provable without a single component
existing.** A machine, a mount, and a diagnostic gate are the whole apparatus.

### 6.1 The four upstream test files, by name

```bash
ls __reference-impl__/zag/packages/frameworks/solid/tests/
```

| File | Lines | Cases | Covers |
|---|---:|---:|---|
| `machine.test.ts` | 1371 | **35** | `describe("basic")` — initial state, entry actions, context, `send`, tags, reenter, action order, computed, `watch`, guards (basic + composition), controlled context, effects. `describe("useMachine - transition actions")` — event data, multiple sends before a state change, exit→transition→enter order. `describe("edge cases")` — reactive props from Solid signals, `matches()`, same-state transitions, cleanup on unmount, event previous/current. `describe("uniform coverage")` — root lifecycle, internal transitions, guard fallback, post-cleanup sends, balanced effect setup/cleanup, deterministic multi-action order, rapid same-tick sends |
| `nested-states.test.ts` | 371 | **7** | Nested transitions and actions, per-nested-state effects, ancestor `matches` with parent fallback, deep sibling exit/enter order, relative nested targets, `#id` cross-level targets, a 3-level smoke |
| `merge-props.test.ts` | 195 | **9** | One argument; handler chaining; class combination; **`data-ownedby` token union**; style merge; function sources; last-value-wins on event listeners; survival through Solid's own `mergeProps`; function source merged with an override object |
| `render.ts` | 14 | — | Helper. `renderHook(() => useMachine(machine, props))` plus `send` and `advanceTime` |

**51 upstream cases.** They are the reference bar: passing them is what makes the claim *"a port, not
a rewrite"* checkable rather than asserted.

**One porting change, and it is not cosmetic.** Upstream's `render.ts` uses
`@solidjs/testing-library`'s `renderHook`; ours uses hope-ui's `mount()`. `useMachine` starts the
machine in `onSettled` and tears it down in `onCleanup`, so it needs a real mounted owner — and
`mount()` additionally **fails the test** on any reactivity diagnostic, which is the cheapest
possible check that the port did not smuggle an untracked read into a render body. Upstream's
`await Promise.resolve()` after `renderHook` becomes a `flush()`.

`machine.test.ts` and `nested-states.test.ts` between them **already are** the toy machine item 5 of
the brief asks for — a machine exercising context, computed, effects, refs and nested states, with no
component anywhere. That is why this milestone needs no components: the upstream suite is the fixture.

### 6.2 The seven fork test files — and the overlap nobody should double-count

```bash
git -C ../hope-ui ls-tree -r --name-only ef91b69 -- packages/primitives/src/zag-solid/__tests__
```

| File | Cases | Project | Covers |
|---|---:|---|---|
| `machine.browser.test.tsx` | **38** | browser | **This file is the port of upstream's `machine.test.ts` + `nested-states.test.ts`**, re-expressed on `mount()`. Its header says so. 31 `useMachine` cases + 7 nested-state cases |
| `bindable.test.ts` | 14 | unit | `defaultValue` seeding, `value` precedence, refusal to write while controlled, following a controlled value, `onChange` on real changes only, custom `isEqual`, updater resolution, **function values stored not invoked** (divergence 3), `sync` writes, `invoke`, hashing, debug label, `.ref`, `.cleanup` |
| `merge-props.test.ts` | 12 | unit | Upstream's 9 plus three **laziness** cases the `$PROXY` rewrite made assertable: a key appearing later is picked up; each accessor source resolves once per change however many keys are read (the 40× regression test); a structural query does not subscribe its reader |
| `normalize-props.test.ts` | 9 | unit | React→Solid prop renames; pass-through; **boolean `aria-*` stringified in both directions** (A1's regression test); non-`aria` booleans left alone; `readOnly={false}` dropped; style hyphenation; non-string/number style values dropped; non-object `style` left alone; string `children` → `textContent` |
| `track.test.ts` | 7 | unit | No fire on first run; once per change; quiet on an equal rewrite; deep comparison; one fire for simultaneous deps; a plain non-accessor dep never changes; stops on scope disposal. **A2's regression surface** |
| `refs.test.ts` | 4 | unit | Seeded reads, write-through, arbitrary values incl. functions and `null`, per-instance storage |
| `machine.ssr.test.tsx` | 2 | ssr | `renderToStringAsync` renders the initial state **without starting the machine**; context read through a bindable serializes |

**86 cases.** Do **not** add 86 + 51 and call it 137 — `machine.browser.test.tsx` *is* the port of two
of the four upstream files. The honest arithmetic:

| Set | Cases | Relationship |
|---|---:|---|
| Fork's `machine.browser.test.tsx` | 38 | ⊇ upstream `machine.test.ts` (35) + `nested-states.test.ts` (7), re-expressed and consolidated |
| Fork's `merge-props.test.ts` | 12 | ⊇ upstream `merge-props.test.ts` (9), **minus one assertion that flips at 1.43.0** (§4.3 D2) |
| Fork's other five files | 36 | New — upstream has no `bindable`, `normalize-props`, `track`, `refs` or SSR test for Solid |
| **Milestone-one total** | **86** | Of which **~47 carry an upstream ancestor** |

**Porting work this implies:** re-run upstream's 51 against the fork *as upstream wrote them* once,
as an acceptance check, before consolidating. The consolidated file is the one that ships; the
one-time parallel run is what proves the consolidation lost nothing. Where the two disagree, §4.3 D2
is the known case and any other disagreement is a finding.

### 6.3 `solid-contract` characterization tests

These pin **SolidJS's** behavior, not ours. They exist because the adapter's design rests on specific
2.0 semantics, and when 2.0 beta moves, the contract test is what says so instead of thirty adapter
tests failing with no common cause. `brief-plan` §2.8 calls them *"needed from day one"* — day one is
this milestone.

Copy from hope-ui `main`, `packages/primitives/src/__tests__/`:

**Corrected at step 2, from D-96's measurement:** the copied counts below are **10 unit + 3 ssr +
7 browser = 20**, and 23 with the three `flush()` cases. The 9/3/6 this table used to carry was
never true of any hope-ui ref.

| File | Cases | Already pins |
|---|---:|---|
| `solid-contract.test.ts` | 10 | **`merge` resolves a key by presence, not by value** (both directions) — the semantic every `merge` call site in `machine.ts` depends on. **`createSignal(fn)` is the memo overload** — divergence 3's premise, pinned both ways (invokes a function argument; stores it once boxed). `useContext` throwing without a Provider. Sibling effect ordering, incl. **reverse-order cleanup on owner disposal** |
| `solid-contract.ssr.test.tsx` | 3 | Host element through `Dynamic` with a hydration key; `createUniqueId` consuming a hydration child id exactly as the hydrating client does; the `<Show>` `when`-gate not burning a key |
| `solid-contract.browser.test.tsx` | 7 | `applyRef` flattening and skipping falsy entries — **and returning a default without throwing**, the half that catches a *narrowing*; `sharedConfig.hydrating` marking the hydration pass and only it; a signal write from one document listener not unhooking the next mid-dispatch |

**One test to add, and the plan already asked for it.** `brief-plan` §3.5 predicted that `send`'s
`queueMicrotask` *"interacts with 2.0 microtask batching; needs a `flush()` characterization test."*
It does not exist — `flush` is *used* throughout hope-ui's contract tests but never *characterized*.
Add to `solid-contract.test.ts`:

- A plain signal write is invisible to a plain read until the next `flush()` (the premise of
  divergence 4).
- `flush(fn)` drains `fn`'s writes before returning.
- A write queued inside `queueMicrotask` lands after the current synchronous `flush`, so two events
  sent back-to-back each observe the previous transition — the exact ordering `send` relies on.

Without it, divergence 4 is an unexplained line, and the day 2.0's batching changes we would be
debugging Dialog instead of reading one red contract test.

### 6.4 What is deliberately **not** tested at this milestone

Recorded so a later reader does not mistake absence for oversight:

- **axe / accessibility.** `expectNoA11yViolations` ships with the harness and the fork's browser
  test does render an accessible tree, but the a11y numbers that matter are per-component and belong
  to P7. A faithful Dialog port carries **inherited axe allowances**, and the DoD has to record them
  as *expected* — that is P7's shape, not this gate's.
  **Corrected at P9: the number is three, open-state only — not six.** `prior-art.md` §7's six is
  ZagDialog's measurement against hope-ui's stack; the three closed-state `aria-valid-attr-value`
  allowances do not transfer to a Chakra-faithful port, on three independent grounds
  (`component-blueprint.md` §9.2), and the register that ships is `definition-of-done.md` §5.
  This bullet's *instruction* was right and stands; only its number moved.
- **Bundle size.** §9.2.
- **Any component.** By construction. The first component is milestone 5.
- **Hydration round-trips beyond the two SSR cases.** The `hydrate-fixture` harness comes over with
  `internal-test-utils` (§1.2) and is exercised at milestone 3, when there is markup worth hydrating.

### 6.5 The gate

Milestone one is done when **all** of these are true, as one CI job:

```
✅  86 fork cases green across the three Vitest projects (unit / ssr / browser)
✅  51 upstream cases green in a one-time parallel run (§6.2), with D2's assertion updated
✅  23 solid-contract cases green, including the three new flush() cases (§6.3)
✅  mount() SILENT — zero [STRICT_READ_UNTRACKED], zero [REACTIVE_WRITE_IN_OWNED_SCOPE]
✅  §5's audit script green against the INSTALLED closure (manifest check = the §0 rule)
✅  7 @license headers present; root + package NOTICE.md rows present (§7)
⬜  A1 filed upstream (§8.1)          OPEN — see below. Not ticked, and not going to be.
```

**Six of the seven were green at `046d0d2`. The seventh is open and stays open**, and it is written
as `⬜` because D-109's whole point was that it is *"recorded as open rather than quietly dropped or
marked done"* — a `✅` beside it was this document marking satisfied the one line the ledger says is
not. **D-110** then settled the standing position: this is an independent port, **no issue is filed,
no PR opened, no maintainer contacted, and it is not proposed again unless the author asks.** The
draft stays at `__internal__/upstream/a1-boolean-aria.md`, unposted, because the analysis is worth
keeping even when the filing is not happening. Nothing downstream waits on it: the axe register
justifies an allowance by the port rule, not by an issue number (`testing.md` §4.2 property 2).

**`mount()` silent is the load-bearing one**, and it is not a style check. Every one of A2, A3 and B5
was *discovered* by that gate and would be invisible without it: Solid 1.x has no strict-read phase,
so upstream's own suite cannot see any of them. It throws on `dispose()` with a summary of every
diagnostic recorded while the tree was mounted, so a passing suite is a real claim.

The three green-check rows below `mount()` are the ones most likely to be quietly skipped, which is
why they are in the gate rather than in prose. `prior-art.md` §8.1's fourth rule applies directly:
*"a story is a deliverable, not a checkbox — open it."* A DoD item verified only by a file-existence
check is verified in name only.

---

## 7. The attribution checklist — lands in the same commit as the code

**Seven `@license` headers, none of which exists today.** Verified:

```bash
for f in bindable index machine merge-props normalize-props refs track; do
  git -C ../hope-ui show ef91b69:packages/primitives/src/zag-solid/$f.ts | head -20 | grep -c '@license'
done                                                                     # 0 ×7
```

The fork's provenance today is a prose paragraph in `index.ts` — honest, useful, **not the MIT
notice**, and **not tagged `@license`, so the build strips it** (`legal.md` §1.3, §2.3). Rolldown
removes every unmarked block comment, which means the published package would become an unattributed
derivative silently, with a green build.

### 7.1 The seven headers

One per source file, in `@chakra-ui-solid/zag-solid/src/`. The shape is `legal.md` §2.2's MIT form,
with the upstream **file** named — a reader auditing the claim has to be able to open the thing we
derived from:

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

| Our file | Names upstream |
|---|---|
| `machine.ts` | `packages/frameworks/solid/src/machine.ts` |
| `bindable.ts` | `packages/frameworks/solid/src/bindable.ts` |
| `merge-props.ts` | `packages/frameworks/solid/src/merge-props.ts` |
| `normalize-props.ts` | `packages/frameworks/solid/src/normalize-props.ts` |
| `refs.ts` | `packages/frameworks/solid/src/refs.ts` |
| `track.ts` | `packages/frameworks/solid/src/track.ts` |
| `index.ts` | `packages/frameworks/solid/src/index.ts` |

**All seven, including the ones that have diverged furthest.** `legal.md` §1.3 settles this: parts of
`merge-props.ts` and `bindable.ts` may no longer be derivatives in any meaningful sense, and
re-deriving the line file by file is not worth anyone's afternoon. The cost of a header is a header;
the cost of being wrong is shipping an unattributed derivative **of the project we are porting**.

The version does **not** go in the header — it names the file, not a release. It goes in `NOTICE.md`.

### 7.2 The `NOTICE.md` rows — and the number that matters

Two files, per `legal.md` §2.4. The root is the audit surface; the package's is the one that travels
in the npm tarball and the only one a consumer who never visits the repo will see.

**Root `NOTICE.md` → the existing `## Zag.js` section.** Its table is `_(none yet)_` today and the
prose above it already anticipates these seven rows. Replace with:

| File | Derived from |
| ---- | ------------ |
| `packages/zag-solid/src/machine.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/machine.ts` |
| `packages/zag-solid/src/bindable.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/bindable.ts` |
| `packages/zag-solid/src/merge-props.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/merge-props.ts` |
| `packages/zag-solid/src/normalize-props.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/normalize-props.ts` |
| `packages/zag-solid/src/refs.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/refs.ts` |
| `packages/zag-solid/src/track.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/track.ts` |
| `packages/zag-solid/src/index.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/index.ts` |

Plus a **baseline sentence** in that section, and it is the load-bearing part:

> The fork was taken from **`@zag-js/solid@1.42.0`** and is maintained against **`1.43.0`**. `1.42.0`
> is the baseline a re-sync diffs against.

**Why the baseline and not just the current target:** `legal.md` §1.3 — *"the `NOTICE.md` row should
record the baseline the fork was taken from, because that is the number a future re-sync diffs
against."* A reader who only knows `1.43.0` would diff the wrong direction and mistake §4.3's three
deltas for our changes rather than upstream's.

**`packages/zag-solid/NOTICE.md`** — created by this commit, listing only its own seven files, with
the same baseline sentence and the MIT text quoted once.

### 7.3 The checklist, in commit order

Following `legal.md` §2.6, with the milestone-one specifics filled in:

- [ ] **1.** Confirm the expression tier. Settled — a fork is `legal.md` §1.4's paradigm case, and
      §1.3 says attribute all seven regardless of how far each has diverged.
- [ ] **2.** Seven `@license` headers, MIT shape, each naming its upstream file (§7.1).
- [ ] **3.** Root `NOTICE.md` — seven rows into the existing `## Zag.js` table, plus the `1.42.0`
      baseline sentence (§7.2).
- [ ] **4.** `packages/zag-solid/NOTICE.md` — created, seven rows, same baseline, MIT text.
- [ ] **5.** Not applicable — upstream is MIT, so no `licenses/LICENSE-APACHE-2.0.txt` and no §4(b)
      line is *required* (it is included anyway because it is honest and costs nothing).
      `legal.md` §1.2 records that the port rule removed the repo's only Apache-2.0 route; nothing
      here reopens it.
- [ ] **6.** `LICENSE` **untouched.** The MIT grant covers our own code and must not be made to look
      as if it reaches the derived portions.
- [ ] **7.** `packages/zag-solid/package.json` → `"files": ["dist", "LICENSE", "NOTICE.md"]`
      (`legal.md` §2.5), and `LICENSE` copied into the package.
- [ ] **8.** `comments.legal` pinned `true` in `tsdown.config.base.ts`, **with hope-ui's comment
      carried across**, not just the setting (`legal.md` §2.3). Without it the headers vanish from
      `dist/` and neither failure is visible in review.
- [ ] **9.** Provenance notes (not `@license`) on the hope-ui-owned items §1.2 brings in — path plus
      commit, no `NOTICE.md` row.

**Same commit as the code.** Not a follow-up, for the reason `legal.md` §2.3 gives: both failure
modes here are silent and green.

---

## 8. The two upstream filings

Both are Zag issues, both reach every framework, and one of them reaches Chakra. Neither is optional
politeness — §8.1 is a live bug we are shipping a private fix for, and §8.2 is the **only** route to
closing a gap we have decided not to close ourselves.

### 8.1 A1 — boolean `aria-*` in `@zag-js/solid`

> **Corrected at the S2 gate, 2026-08-09 — the premise below was measured wrong, and the filing
> changes shape.** *"A live bug for every Solid Zag consumer on the 1.x line"* is **false**. The
> *code* claim holds — `packages/frameworks/solid/src/normalize-props.ts` has a `readOnly === false`
> rule and **no `aria-*` rule** at `1.43.0` — but the defect is created by **Solid's DOM layer, and
> only from 2.0**. Measured on the published packages:
>
> | | `setAttribute(node, name, value)` | `aria-expanded={false}` | `aria-modal={true}` |
> |---|---|---|---|
> | **`solid-js@1.9.14`** | `value == null ? remove : setAttribute(name, value)` | `"false"` ✅ | `"true"` ✅ |
> | **`@solidjs/web@2.0.0-beta.32`** | `value == null \|\| value === false ? remove : setAttribute(name, value === true ? "" : value)` | *absent* ❌ | `""` ❌ |
>
> On 1.x the DOM coerces the boolean to a string on the way in, so the missing rule never surfaces.
> 2.0 added the `=== false` / `=== true` special-casing and the coercion is gone. Confirmed end to
> end by a throwaway browser probe against `2.0.0-beta.32`, both with and without the fork's fix.
>
> **The filing is still worth making, and the reason is `§2.3`:** `@zag-js/solid@2.0.0-next.1` is
> **byte-identical** to `1.43.0`, and its peer range is `solid-js: ">=1.1.3"`, which admits 2.x. So
> any consumer who moves to Solid 2.0 gets malformed ARIA with no peer warning and no code change on
> Zag's side. It is a latent bug on `main` and a live one on the `v2` prerelease line the moment
> Solid 2.0 ships. Everything below stands except the two sentences this note replaces — including
> the fix, which is correct on **both** major lines.
> — `decisions.md` D-108.

**What the filing says:**

- Zag emits ARIA state as **real booleans** (`aria-expanded: false`, `aria-modal: true`). That is
  correct for React, whose DOM layer stringifies `aria-*`.
- Solid's does not. `setAttribute` is `value == null || value === false ? removeAttribute(name) :
  setAttribute(name, value === true ? "" : value)`, and the SSR serializer agrees.
- **Two distinct failures.** `true` ships as `aria-modal=""` — not a valid value for an enumerated
  ARIA attribute; axe raises `aria-valid-attr-value`. `false` ships as **no attribute at all**,
  silently losing the state: a collapsed trigger has no `aria-expanded`, so a screen reader announces
  it as a plain button.
- **Why it has never surfaced upstream:** nothing in `@zag-js/solid`'s own tests runs axe, and the
  attribute is present-but-empty rather than missing in the visible case.
- **The fix, ~4 lines** in `normalizeProps`, in the same shape as the existing `readOnly` rule:

  ```ts
  if (typeof value === "boolean" && key.startsWith("aria-")) {
    normalized[key] = String(value)
    continue
  }
  ```

- **Reproduction:** any machine with boolean ARIA state — `dialog` (`aria-modal`), `accordion` /
  `collapsible` (`aria-expanded`), `checkbox` (`aria-checked`). Render, inspect the attribute, run
  axe.
- **Regression test to offer with it:** the fork's `normalize-props.test.ts` case *"stringifies
  boolean `aria-*` values, in both directions"* plus *"leaves non-`aria-` booleans and non-boolean
  `aria-` values alone"* — both drop into upstream's bench with no Solid 2.0 dependency.

**It costs us nothing to report and it is filed at milestone one**, per `brief-plan` §5 step 2 — which also
means the fix is in the open before our fork is, rather than looking like a private divergence
discovered later.

### 8.2 `ariaHidden` → `suppressOthers` in `@zag-js/aria-hidden`

**This one is the only route to closing the `inert` gap, and it reaches Chakra** — which is precisely
why it belongs upstream and why our layer is the wrong place (`prior-art.md` §7, §8.2).

**The evidence, re-measured at 1.43.0** — and note that the plan's version of this claim is wrong in
a way that matters:

- **Do not quote** *"`@zag-js/aria-hidden` contains `inert` zero times."* That was measured against
  the **compiled 1.42.0 entry**, and `prior-art.md` §10.2 row 5 corrects it. In the **source** at
  1.43.0, `inertOthers` and `suppressOthers` both exist:

  ```bash
  grep -n 'inert' __reference-impl__/zag/packages/utilities/aria-hidden/src/aria-hidden.ts
  ```

  ```ts
  export const inertOthers  = (…) => walkTreeOutside(originalTarget, { …, controlAttribute: "inert", … })
  const supportsInert = () => typeof HTMLElement !== "undefined" && HTMLElement.prototype.hasOwnProperty("inert")
  export const suppressOthers = (…) => (supportsInert() ? inertOthers : hideOthers)(…)
  ```

- **The gap is real anyway, by three independent mechanisms.** `index.ts` exports one function,
  `ariaHidden`, which calls `hideOthers` **unconditionally**. `dialog.machine.ts:201` calls
  `ariaHidden(getElements, { defer: true })` with no prop, option or alternative to redirect it — as
  do `popover.machine.ts` and `drawer.machine.ts`. And the published `exports` map is
  `"." → dist/index` only, so `inertOthers` is **unreachable by a consumer even with a deep import**.
- **Consequence at 1.43.0:** background content behind an open modal gets `aria-hidden` and **stays
  in the tab order**. axe raises `aria-hidden-focus` (**serious**) on every open modal.

**What the filing says:** `suppressOthers` already exists in the package and already does the
feature-detected `inert`-or-`aria-hidden` dispatch. **Point `ariaHidden` at it.** That single change
closes the gap for React, Vue, Svelte, Solid, Preact and vanilla at once — **and for Chakra UI v3**,
which inherits it through Ark.

```bash
grep -rn '\binert\b' __reference-impl__/chakra-ui/packages/react/src/   # nothing
grep -rn '\binert\b' __reference-impl__/ark-ui/packages/react/src/      # nothing
```

Zero occurrences in either. Chakra's Dialog is three files of Ark re-export plus slot-recipe wiring
and adds no behavior, so an open **Chakra v3** modal has exactly this defect today.

**Why we are not fixing it locally, restated so the filing is not mistaken for hedging.** The port
rule (`prior-art.md` §8.2) struck `createHideOutside`: fixing it here would make us **more accessible
than the library we are porting**, which is a divergence even though it points the pleasant way. The
practical consequence is that **inherited `aria-hidden-focus` allowances are the baseline, not a
defect**, and P7's DoD has to say so explicitly or the first failure gets "fixed" by re-introducing
the kernel. **The count, corrected at P9: `aria-hidden-focus` on open-state assertions only —
three entries, not ZagDialog's six** (`component-blueprint.md` §9.2; the register is
`definition-of-done.md` §5).

**Filed at milestone one, alongside A1**, even though the component it affects does not exist until
milestone 5 — because the lead time on an upstream fix is the whole point, and because P7 needs to
cite an open issue number per inherited allowance.

---

## 9. Assumptions this milestone rests on, and their gates

### 9.1 `brief-plan` §8 assumptions

Assumptions **2** and **10** are this milestone's; **8** is §5's audit. `plan.md` §11.1 assigned 8
here explicitly and left 1/2/5/10 to P4/P6.

| # | Assumption | Status after P4 | Gate |
|---|---|---|---|
| **2** | *"Each machine's `anatomy` export at 1.43.0 — asserted authoritative, not enumerated per machine"* | **Open, and not this milestone's to close.** The adapter is anatomy-blind: `useMachine` binds `Machine<T>` generically and never names a part. Nothing in the 86 cases or the 51 upstream cases touches an anatomy export | **P6**, building the parity matrix from `ls __reference-impl__/zag/packages/machines` ∩ each machine's `anatomy`. Standing check thereafter: `legal.md` §5's `@zag-js/*` row diffs anatomy per minor |
| **8** | *"Whether any Zag 1.43.0 machine injects a stylesheet at runtime"* | **RUN AT P4 — and the question turned out to be the wrong one.** §0 bans CSS-in-JS **engines**, and there are none in the closure: **PASS**. Two machines do touch a stylesheet (`splitter`, twice) and neither is a violation (§5.3). Nothing is blocked and no component is lost | **Step 2**, re-run against the *installed* closure as a CI script. §6.5 makes it a gate line |
| **10** | *"The spike's adapter fork applies unchanged to Zag 1.43.0 — likely, not certain"* | **CLOSED, and REFUTED.** Three named deltas (§4.3 D1/D2/D3), all one line each, one of them the fork's own tripwire firing as designed. D3 is a semantic divergence the port rule resolves against the fork | **Step 2**, by applying the three deltas and re-running the suite. D2 is self-verifying: the test goes red on the bump and green on the fix |

Assumptions 1, 3, 4, 5, 6, 7, 9 and 11 belong elsewhere and P4 touches none of them: 1 and 5 → P6;
3, 4, 9 → P3's step-3/step-4 gates (`plan.md` §11.1); 6 → P8; 7 closed at P1; 11 closed at P2,
resolved the other way.

### 9.2 What `prior-art.md` §10.5 gets re-measured here, and what does not

§10.5 records the bundle figures as **not reproducible from git** — the `+13.4 KB gz` (Dialog) and
`+9.7 KB` (Listbox), and the 5.4×/4.8× and 3.4×/2.8× ratios, came from `esbuild --bundle --minify`
runs over an installed tree, and `@zag-js/*` is no longer installed in the hope-ui working tree.

| Figure | Re-measured at milestone one? |
|---|---|
| **Package counts** — dialog's closure 11, listbox's 8, of which 5 shared and 3 new (`listbox`, `collection`, `focus-visible`) | **Already reproduced** at 1.43.0 by P2, transitively. No re-measurement needed |
| **Byte counts** — `+13.4 KB gz`, `+9.7 KB`, the four ratios | **No — and not here.** Milestone one installs `@zag-js/core`, `@zag-js/types` and `@zag-js/utils` only. A machine closure does not enter the tree until milestone 5, so a bundle number measured now would be the adapter's own weight and not the figure §10.5 is about |
| **The adapter's own installed weight** | **Yes, and it is new.** Once `zag-solid` builds, `esbuild --bundle --minify` over its entry gives a number nobody has: the fixed cost every Zag component pays before any machine. Record it as the baseline the per-component deltas are measured *from* |

**Correction to the plan's step-2 framing:** `brief-plan` §5 step 2 is where the bundle axis was expected to
be re-checked. It cannot be, for the reason above. The re-measurement moves to **milestone 5**
(Dialog), where the first real machine closure lands and the `+13.4 KB` claim has something to
compare against. P7's DoD should carry the check, not P4's gate.

**Two figures to quote carefully, because the plan quotes them wrongly** (`prior-art.md` §10.2):

- **Not** *"4 of 8 packages already shared by the second component."* At 1.43.0 the listbox closure is
  8 packages, of which **5** are shared with dialog's 11 and **3** are new. Favourable direction.
- **Not** *"Dialog paid 12 `untrack` calls."* 12 is *occurrences of the word*, imports and comments
  included. **Call sites: 2 in the component, 2 in the fork** — and at `ef91b69` the component-layer
  count is **0** (§4.1). Quoting 12 overstates the seam ~3×.

### 9.3 New assumptions P4 introduces

| # | Assumption | Blocks if wrong | Verified at |
|---|---|---|---|
| **P4-A** | The reference checkout at `main`/`421844f` matches the **published** `@zag-js/solid@1.43.0` tarball, and `@zag-js/core@1.43.0` likewise | §4.3's three deltas, and §5's audit result | **Step 2**, first install. Cheap: `diff` the installed `dist` against a local build of the checkout |
| **P4-B** | Applying §4.3's D1/D2/D3 leaves the other 84 cases green | The milestone gate | **Step 2**, by running the suite. D3 is the one to watch — it changes controlled/uncontrolled semantics, and `bindable.test.ts`'s controlled cases are the surface |
| **P4-C** | Upstream's 51 cases port to `mount()` with no semantic change beyond `renderHook` → `mount` and `await Promise.resolve()` → `flush()` | §6.2's parallel acceptance run, and the *"a port, not a rewrite"* claim | **Step 2**. If a case needs a real change to pass, that change is a finding, not a porting detail |
| **P4-D** | `@zag-js/core` / `@zag-js/types` / `@zag-js/utils` at 1.43.0 resolve and type-check against `solid-js@2.0.0-beta.32` with no peer conflict — the adapter's only peer is `solid-js: ">=1.1.3"`, which admits 2.x by range but was never tested against it | Milestone one entirely | **Step 2**, first `pnpm install` + `typecheck` |

---

## 10. What P4 changes — re-plan P5 before P5 is written

Every row is a plan claim P4 had to change. `prior-art.md` §10 is the errata sheet these build on;
where a row restates one of §10's, it says so.

| # | Plan says | P4 decides | Touches |
|---|---|---|---|
| **1** | §3.5 row **B5**: *"`untrack` around the `useMachine` call, in the component"*; §4.1 doc 4: the blueprint documents *"the `untrack`-around-`useMachine` seed idiom"* | **The idiom does not exist.** `seedFromProps` absorbed it at `ef91b69`; both root components at the tip have zero `untrack`. P5 documents a **bare `useMachine(...)`**, and that a diagnostic there is a real bug rather than a wrapper's absence (§4.2). Restates `prior-art.md` §10.2 row 3 | **P5** — deletes a planned blueprint section and replaces it with one line |
| **2** | §3.5 row **A3**: *"`untrack` the construction pass only; per-key getters stay fully reactive"* | **Superseded.** `mergeProps` is a `$PROXY` lazy proxy with **no construction pass**; only the structural `has`/`ownKeys` traps are untracked. Restates `prior-art.md` §10.2 row 4 | **P5, P9** |
| **3** | §3.5 header: *"Eight files, ~594 lines"* | **Exact, not approximate: 8 files / 594 lines** upstream; the fork is **7 + 7** (§2.1, §2.2). Restates `prior-art.md` §10.4 | Any doc quoting the figure |
| **4** | §3.3: *"the adapter file set is **identical** across majors (v1 verified via the GitHub API)"* | **Stronger, and verified locally: byte-identical** — all 8 source files and all 4 test files, `main` vs `v2`. A v1→v2 move is adapter-**free**, not merely adapter-local; the exposure is P6's matrix and P5's parts (§2.3, §2.4) | **P6** |
| **5** | §8 assumption **10**: the fork *"applies unchanged to 1.43.0 — likely, not certain"* | **Refuted, with three named one-line deltas** (§4.3). D3 is a **semantic** divergence — the fork's loose `!= undefined` makes `value={null}` uncontrolled where all six upstream adapters and Chakra treat it as controlled. Aligned to `!==` under the port rule | **P5** (any part exposing a nullable value prop), **P7** |
| **6** | §8 assumption **8**: *"no machine has been audited for style-tag injection"* — carried as an assumption, and phrased as though a stylesheet were the thing banned | **Audited at P4: §0 PASSES**, and the assumption's phrasing is corrected at this gate. §0 bans runtime CSS-in-JS **engines**, not any runtime stylesheet — so the check that matters is a **manifest** check over the closure, and the source grep is hygiene for **our own** code (§5.1). `splitter` writes a gesture cursor rule at two sites; not a violation, and it ships (§5.3). **`plan.md` §0 was rewritten at this gate** to the two-scope form | **P7** (the CI check is a manifest check over the closure, plus a source grep over *our* files — not one grep over both), **P9** (`CLAUDE.md` carries the same two-scope form) |
| **7** | §2.11: *"`zag-solid/` fork + its 7 test files @ `spike/zag-solid` — **copy**"* — attribution unstated | **Copy, and it is a *third-party* MIT derivative, not a hope-ui carry-over.** Seven `@license` headers + two `NOTICE.md` tables, not a provenance note. Q6's "no sync obligation" holds toward hope-ui and **not** toward upstream (§1.1, §7) | **P7** (the attribution CI checks), **P9** |
| **8** | §5 step 2 / §1.4: the bundle axis re-checked at milestone one | **Cannot be.** Milestone one installs `@zag-js/{core,types,utils}` only; no machine closure enters until milestone 5. The `+13.4 KB` re-measurement moves to **milestone 5**; what milestone one *can* record is the adapter's own fixed weight, which is a new number (§9.2) | **P7** (the DoD carries the check) |
| **9** | §3.5: *"`send` uses `queueMicrotask` … needs a `flush()` characterization test"* | **The test does not exist.** `flush` is used throughout hope-ui's contract tests and never characterized. Three cases added to `solid-contract.test.ts` (§6.3) | **P7** |
| **10** | §4.1 doc 3: *"ported upstream tests + `solid-contract` tests + a toy machine"* reads as three separate builds | **Two of the three already exist and overlap.** The fork's `machine.browser.test.tsx` **is** the port of upstream's `machine.test.ts` + `nested-states.test.ts`, and upstream's suite **is** the toy machine. 86 + 51 is not 137 (§6.2) | **P7** |
| **11** | §2.11 / §4.1: the adapter's own scope is *"seven source + seven test files"* | **Plus a hard coupling nobody listed.** The fork's tests import `@hope-ui/internal-test-utils`, so the harness, the three-project split and `solid-contract` come over **in this milestone**, not later (§1.2) | **P7** (the testing doc's sequencing) |

**Rows P4 leaves alone, so silence is not read as oversight.** `prior-art.md` §10.1 rows A–F and
§10.2 rows 6, 7, 9, 11, 12 are P5/P6/P7 by construction — the a11y kernel's blast radius on the
blueprint (A–D), the override getters (E), the DoD's axe-allowance shape (F), and the counting and
attribution corrections. P4 acts on the two that reach it: **row F's baseline is the reason §8.2 is
filed rather than fixed locally** (§8.2), and **§10.2 rows 6/7/8's figures are restated correctly in
§9.2** so this document is not a third place they get quoted wrong.

---

## 11. What P4 could not act on

| Item | Why not | What it blocks |
|---|---|---|
| **Confirming the checkout matches the published tarballs** | The `zag` checkout is **shallow** (`git rev-list --count HEAD` → 1), so `1.42.0`→`1.43.0` cannot be diffed from git, and no `@zag-js/*` is installed anywhere here. §4.3's three deltas were derived from the 1.43.0 **changelog** plus the 1.43.0 **source**, cross-checked against the fork — which is stronger than a version diff for the question asked, but is not the same as reading the diff | Nothing. Assumption **P4-A**, closed at step 2's first install |
| **Running any of it** | No package exists, by P-pass rule. Every count above is `wc -l` / `grep -c` on source; no test has been executed | Nothing. The gate is §6.5 |
| ~~The §0 ruling on `splitter`~~ | **Closed at the P4 gate.** §0 bans runtime CSS-in-JS *engines*, not runtime stylesheets, so Splitter was never in scope. §5 rewritten against the clarified rule; §5.4 records what a real failure would look like | Nothing. Splitter ships |
| **`prior-art.md` §10.5's bundle bytes** | Not reproducible from git, and milestone one has no machine closure to measure (§9.2) | **P7**'s DoD, which carries the check to milestone 5 |
| **`prior-art.md` §10.1 rows A–F** | The a11y kernel's consequences land in the blueprint, the roadmap and the definition of done, none of which is P4's file. The one consequence that *is* P4's — that the `inert` gap has no local fix and therefore needs an upstream filing — is §8.2 | **P5, P6, P7** |

**Everything in `prior-art.md` §10 that reaches P4, P4 acted on:** rows 3 and 4 (§4.2), row 5 (§8.2),
rows 6, 7 and 8 (§9.2). Row 10 is P6's. Rows 1, 2, 9, 11 and 12 are P3's or cosmetic and are already
settled in `plan.md` §12.
