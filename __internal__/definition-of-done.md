# The definition of done

**Status:** written at P7, 2026-08-09. The bar, in four tiers — per file, per component, per batch,
per release — with **the enforcing artefact named beside every rule**. Plus the two live registers,
the assumption gates, the scheduled checks' ownership, and the rules that have no script and say so.

**What this document is.** The *when* and the *what it means*. Every artefact named here is defined —
name, input, algorithm, failure output, blind spots — exactly once, in `testing.md`. Nothing is
explained twice; a row that needs to know how a check works links to its section rather than
paraphrasing it.

**What it is not.** The apparatus (`testing.md`), the evidence (`prior-art.md`), the architecture
(`plan.md`), the adapter spec (`zag-solid-adapter.md`), the component pattern
(`component-blueprint.md`), the inventory (`roadmap.md`) or the licensing mechanism (`legal.md`). All
seven are cited by section.

**Vocabulary** is `testing.md`'s, once, and not repeated.

---

## 0. The gate rule

> **Every rule in this document names a script, a test, or a CI job. A rule with no enforcement is
> either deleted, or moved to §7 — "conventions, unenforced" — and labelled as such.**

The reason is `prior-art.md` §8.1's fourth rule, which this project has already paid for once:
*a story is a deliverable, not a checkbox — open it.* ZagListbox's stories were written, typechecked,
linted and committed without ever being opened, and every one of them crashed. **A definition-of-done
item verified only by a file-existence check is verified in name only**, and an unenforced rule is
the same failure with better intentions.

§7 exists because deleting an unenforceable rule is not the same as pretending it was enforced. It is
short by design, and every entry says what a reader is trusted to do instead.

**Division of labour with `testing.md`**, stated in both files and nowhere elaborated twice: that
document answers *how does the check work*; this one answers *when must it pass, and what does a
failure mean for the change in front of me*. The only deliberate seam is the two live registers —
§5's axe allowances and §6's coverage allow-list — whose **shape** is defined there and whose
**contents** are here.

---

## 1. Per file

Applies to every file under `packages/*/src/`. Enforced by the `verify` and `constraint` jobs, which
run on every push.

| # | Rule | Enforced by |
|---|---|---|
| 1.1 | Type-checks under TS 6 strict with `noUncheckedIndexedAccess`, and passes Biome | `tsc --noEmit`; Biome (`verify`) |
| 1.2 | **No `data-*` string literal is written by hand** — we write none, and a speculative translation getter is invisible when it is unnecessary (`component-blueprint.md` §3.7) | `check:no-hand-written-data-attrs` |
| 1.3 | **Every style-prop value is route 1, 2 or 3** — a literal, a token, a `staticCss`-declared member, or a `var(--…)` string (`plan.md` §3.5) | `check:style-contract` rule 1 |
| 1.4 | **Any `renderStyled` call whose `props` is a `mergeProps(...)` result also passes `styleSource`** (`component-blueprint.md` §4.1.1) | `check:style-contract` rule 2 |
| 1.5 | **No runtime stylesheet.** No `insertRule`, `adoptedStyleSheets`, `new CSSStyleSheet`, `createElement("style")`, `document.head.append*` or `<style` in our own source (`CLAUDE.md`; `plan.md` §0) | `check:no-runtime-sheet` |
| 1.6 | **No new dependency introduces a CSS-in-JS engine** anywhere in the closure (`CLAUDE.md`; `plan.md` §0) | `check:no-cij-manifest` |
| 1.7 | **A derivative file carries its `@license` header, its `attribution.config.ts` entry, and both `NOTICE.md` rows — in the same commit as the code** (`legal.md` §2.3, §2.6; `zag-solid-adapter.md` §7.3) | `check:license-headers`; `check:notice-rows`; `check:package-files` |
| 1.8 | **A test file's name resolves to exactly one Vitest project.** A mis-suffixed test is a test that never runs and nothing says so | `check:test-projects` |
| 1.9 | `mount()` is silent in every test the file adds — no `[STRICT_READ_UNTRACKED]`, no `[REACTIVE_WRITE_IN_OWNED_SCOPE]`. **A diagnostic is a defect, not a missing wrapper** (`component-blueprint.md` §2.1, §2.2) | `mount()` itself, in all three projects (`testing.md` §1.4) |
| 1.10 | Commit message carries the rationale only — no `Co-Authored-By`, no *"Generated with"* trailer | `check:commit-trailers` |

---

## 2. Per component

Applies to every row of `roadmap.md` §4 that ships. Rules 2.1–2.6 and **2.15** apply to all of them;
2.7–2.12 apply to machine components; 2.13–2.14 to presence-gated ones.

| # | Rule | Enforced by |
|---|---|---|
| 2.1 | **Every mounting test runs axe**, through the register — no inline allowance is expressible (`component-blueprint.md` §9.3) | `expectNoA11yViolations({ component, scope })` (`testing.md` §4.1) |
| 2.2 | **Every allowance it needs is in §5**, per rule and per scope, with an upstream issue number; and **an allowance that stops being needed fails the test** | The register's two-directional assertion (`testing.md` §4.2); `allowances.test.ts` |
| 2.3 | **Every visual assertion reads a computed style. Class-name assertions are banned** in the `browser` and `ssr` projects — `classList.contains("p_4")` passes on a completely unstyled element (`prior-art.md` §4.4) | `check:style-contract` rule 3 |
| 2.4 | **Its recipe key is in the coverage check's consumed set, and the check is green** — or the component is on §6's allow-list with a reason and an expiry | `check:css-coverage`; `check:coverage-allowlist` |
| 2.5 | **An SSR→hydrate round-trip fixture exists and passes.** A green typecheck is not a substitute: `children()` is not key-neutral, so adding or removing one moves `_hk` for the subtree (`component-blueprint.md` §10.2) | The `ssr` + `browser` round-trip bridge (`testing.md` §1.5) |
| 2.6 | **At least one story per part shape it uses, and every story opens.** A story is a deliverable (`prior-art.md` §8.1) | `test:storybook` (`testing.md` §7.3) |
| 2.7 | **Every machine anatomy part has a part component, and every unique recipe slot has one** — the two lists are not the same set, and a missing part is an ARIA relationship the machine emits and nothing consumes (`component-blueprint.md` §3.1) | `check:anatomy-parts` |
| 2.8 | **A consumer `id` on a part reaches the element** (last-wins), and the Root's `ids` prop is the documented override. No part strips `id` — hope-ui did; Chakra does not (`component-blueprint.md` §3.4, §13 row 10) | A per-component browser test, required by 2.7's checklist |
| 2.9 | **No key the machine's `connect()` emits collides with a style prop**, and `dir` is asserted to be outside the style-prop vocabulary (`component-blueprint.md` §4.1.1) | `check:style-prop-collisions` (`testing.md` §6.4) |
| 2.10 | **`RootProvider`, `PropsProvider` and `Context` ship with the component, not as a later sweep** — 41 / 47 / 43 components carry them, and a sweep would mean 131 namespace edits after the fact (`roadmap.md` §10) | `check:anatomy-parts` extends to the namespace: the exports the row declares must exist |
| 2.11 | **A nullable `value` prop is treated as controlled.** `value={null}` is controlled in all six upstream adapters and in Chakra; the fork's original loose predicate made it uncontrolled (`zag-solid-adapter.md` §4.3 D3; `component-blueprint.md` §2.6) | `bindable.test.ts`'s controlled cases (unit) + one per-component test where the prop exists |
| 2.12 | **The bundle budget is updated in the same commit** if the component adds an external package | `check:bundle` (`testing.md` §10) |
| 2.13 | **One computed-style test per presence-gated part, in the failing configuration** — `unmountOnExit={false} lazyMount={false}`, asserting `display: none` on a part whose recipe slot sets an explicit `display` (`component-blueprint.md` §6.4) | The `browser` project; a class-name assertion cannot see this |
| 2.14 | **Presence is tested against both families.** Family Z is a `@zag-js/presence` instance; family M — `collapsible` and `accordion` — takes `present` from the **collapsible machine's own `visible`** (`roadmap.md` §6.2). The render strategy is source-agnostic and both sources are exercised | Unit tests of the render strategy over both sources; the per-component tests of 2.13 |
| 2.15 | **A shipping component owes a docs page.** The positive form of `roadmap.md` §9.2's *a page for an unbuilt component is a promise* — a built component with no page is the same defect pointing the other way, and the docs job is where it fires (`docs-site.md` §6.1, §8 row 4) | `check:docs-inventory` |

**Rule 2.4 has three shapes, because the 56 slot recipes are not the machine surface**
(`roadmap.md` §13 row 3, §2.1–2.3):

- **34 slot recipes** are driven by a same-named machine, and **7 more by a machine under another
  name** — `actionBar`→`popover`, `checkboxCard`→`checkbox`, `codeBlock`→`clipboard`,
  `drawer`→**`dialog`**, `progressCircle`→`progress`, `radioCard`→`radio-group`,
  `segmentGroup`→`radio-group`. For these, 2.7's two lists both apply.
- **15 slot recipes have no machine at all.** There is no `connect()` to merge, so 2.9 and 2.11 are
  vacuous and 2.7 checks the slot list alone.
- **18 atomic recipes** belong entirely to the non-machine surface, which is exactly true where the
  slot-recipe half was false by 15.

---

## 3. Per batch

`roadmap.md` §13 row 8 makes the DoD per-batch as well as per-file and per-component, because each
batch proves something the previous one did not — and prose about what a batch proves is not a gate.
**Each row below is that proof restated as a test.**

### 3.0 The gate every batch shares

Four lines, from `roadmap.md` §9.2:

1. **axe on every mounting test**, with §5's register — no batch may add an allowance without an
   upstream issue.
2. **Computed-style assertions, never class-name assertions** (`check:style-contract` rule 3).
3. **`check:css-coverage` green**, with §6's allow-list and the seven duplicate slot recipes
   deduplicated before comparison.
4. **`check:bundle`'s per-batch closure delta recorded** — new external packages, total closure,
   gzipped delta.

### 3.1 The probe phase

| Step | The proof, as a test | Enforced by |
|---|---|---|
| **1** Bootstrap | The three Vitest projects run and are distinguishable: an `ssr` test resolving the client build of either `solid-js` or `@solidjs/web` fails. **18 `solid-contract` cases green**, including the three new `flush()` cases | `test:*`; `check:test-projects`; `check:resolution-sync` |
| **2** `zag-solid` | `zag-solid-adapter.md` §6.5's seven lines, verbatim: 86 fork cases, 51 upstream cases in a one-time parallel run, 18 contract cases, `mount()` silent, the §0 audit green **against the installed closure**, 7 `@license` headers + both `NOTICE.md` tables, A1 filed. **86 + 51 is not 137** — `machine.browser.test.tsx` *is* the port of two upstream files (§6.2) | The milestone-one CI job; `check:no-cij-manifest`; `check:license-headers`; `check:notice-rows` |
| **3** Styling seam | `Box` renders correct **computed styles** in unit, SSR and browser, and a consumer `panda.config.ts` override changes them. Plus: `check:preflight-hidden`, `check:alias-coverage`, `check:dark-selector`, `check:preset-token-resolution`, and `check:style-contract` rule 1 live | `styling` job; `test:*` |
| **4** One slot recipe | The component styles correctly **in a throwaway consumer whose own source never names the variant**, wired per `plan.md` §4.1. `check:css-coverage` green *there*; then flipping `hash` makes it exit `E_CONFIG_MISMATCH` rather than green or noisy; `check:data-attr-vocab` runs for the first time | `check:css-coverage`; `check:hash-config`; `check:responsive-grain`; `check:data-attr-vocab` |
| **5** Dialog | `component-blueprint.md` §11 compiles; axe clean on closed-state assertions with `aria-hidden-focus` allowed on open only; SSR→hydrate round-trip; `Portal`'s `isServer` guard tested in the `ssr` project; **the render strategy split so `present` can come from a machine as well as a presence** (`roadmap.md` §6.2) — tested against both sources before Collapsible needs it | §2's full bar; §5's register |
| **5b** Popover | **The popper `--z-index` seam is measured**: a browser test asserting the computed `z-index`/`--z-index` on the floating element survives interleaved reactive re-renders and `raf` writes, with a recorded number. Either a sentence in the blueprint or a rule (`roadmap.md` §8.2) | `check:floating-zindex` — new at 5b, re-run at the first B5 component (**P6-A**) |
| **6** Workstream B | 45 components. The atomic recipe layer at volume; `splitVariantProps` exercised by the first `Button` (**P5-B**); **the eight CIJ route-3 conversions** of `roadmap.md` §3.1 land and rule 1 is what keeps them converted | `check:style-contract` rule 1; `check:css-coverage`; §2's bar |

### 3.2 The batches

| Batch | The proof, as a test | Beyond §3.0 |
|---|---|---|
| **B1** — reuse | **One machine, two public components, two slot recipes — twice.** A test mounts Dialog and Drawer, and Popover and ActionBar, and asserts *different computed styles for the same part under the same variant props*, from the same machine. And `check:bundle` asserts **zero new machine packages** for a five-component batch | The six `lazyMount`/`unmountOnExit` defaults, table-driven: closed ⇒ not in the DOM, for `action-bar`, `dialog`, `drawer`, `floating-panel`, `menu`, `tooltip` |
| **B2** — the repeated part | **`roadmap.md` §7.2's five proofs, each a test, and none of them optional**: (1) the per-item context is created once per item and read by every descendant, with no part reaching past it into Root state; (2) the item props bag round-trips through the Root's getters unmodified; (3) **the context is built without an untracked read** — it is created inside a repeat callback, which Solid 2.0 labels a strict-read phase, so a `mount()` diagnostic there is a genuine defect; (4) **N items allocate the same `_hk` on server and client**, by round-trip fixture with a non-trivial list; (5) **the slot class map is resolved once on the Root, not once per item** — every `ItemTrigger` carries the same class string and the recipe function is invoked once, by spy | Only when all five hold does `component-blueprint.md` §3.2 gain **shape E**. **Until then no other component with a repeated part starts** — nine batched components depend on it. Also family M (**P6-B**), by pinned `grep -rl 'isUnmounted'` fixture |
| **B3** — the field family | **A multi-part family with no machine** — the only one. Field's behavior is re-derived from the ARIA contract, and the mechanical proxy for *"never its expression"* is that `packages/components/src/field/**` has **no `@license` header and no `NOTICE.md` row**: if it needs one, the re-derivation failed (`legal.md` §1.4) | A Field ARIA conformance suite written from the spec; atomic recipes composed *into* a slot recipe, proven by computed style; `input-group`'s runtime `calc()` converted to route 3 and held there by rule 1 |
| **B4** — form controls | **Three public components on one machine** (`radio-group`) — `check:bundle` closure delta of one. **`editable`'s top-level `size` is the live case for `styleSource`**: a browser test asserts the `<input>` carries `size="1"` *and* that its computed width tracks its content, which is the exact failure rule 1.4 prevents and which a class-name assertion cannot see | `swittch` as a generated function name (it compiles, or it does not); `toggle`'s absent recipe on §6's allow-list; Field's context consumed from outside its own family |
| **B5** — collections | **The restrictive-content-model compile crash.** A story with a hidden native `<select>` carrying a static child and a dynamic sibling renders, in the Storybook build, with no console error. **This is where the canary earns its place** — `hydratable: false` is Storybook's compile and no Vitest project here uses it, so nothing else in this document can see the failure (`component-blueprint.md` §10.4) | `@zag-js/collection` and the `./collection` subpath; `aria-activedescendant`; `check:floating-zindex` re-run against a collection component (**P6-A**) |
| **B6** — display & data | **The 15 machine-less slot recipes at volume**, over the shape B3 proved: 2.7 checks a slot list with no anatomy beside it | Two more allow-list entries (`clipboard`, and `codeBlock`'s machine styled by a second recipe); one machine styled by two recipes again (`progress`) |
| **B7** — positioned & stateful | **Machine-emitted inline `style` at volume, and it must stay legal**: `check:no-runtime-sheet` green while nine components forward `style` objects from `normalizeProps` — the place a §0 false positive would surface if the two checks had been merged. **TreeView stresses shape E recursively** — a round-trip fixture with nested branches | Four of the seven duplicate-slot recipes exercise the dedupe assertion (**P6-D**); Splitter ships with its audited gesture-cursor stylesheet intact (`zag-solid-adapter.md` §5.3) |
| **B8** — the heaviest | **FloatingPanel positions itself without popper**, so 5b's measurement does **not** cover it and it owes its own positioning test. **Toast's `createToaster` store lives outside the component tree** — an `ssr` test asserts it touches no DOM on the server, and a `mount()`-silent test covers writes from outside an owner | 26-slot recipes at volume; `date-picker`'s duplicate `view`; **the first library-wide bundle figure** (`testing.md` §10) |

---

## 4. Per release

| # | Rule | Enforced by |
|---|---|---|
| 4.1 | No export resolves to `jsx/index`; `./is-valid-prop` exists and resolves inside `jsx/`; no published `package.json` exposes a `.css` file | `check:exports` |
| 4.2 | `@chakra-ui-solid/styled-system` is external in the built bundle, not inlined | `check:externals` |
| 4.3 | The published buildinfo matches a fresh `panda ship` | `check:buildinfo-fresh` |
| 4.4 | `@pandacss/dev` is a **non-optional** `peerDependency` on `preset`, `styled-system` and `components` | `check:peer-panda` |
| 4.5 | The published `styled-system` was generated with `hash: false` | `check:hash-config` |
| 4.6 | Every `@license` header survives to `dist/`, and `comments.legal` is still pinned with its comment | `check:license-headers` |
| 4.7 | Root and per-package `NOTICE.md` rows match the registry exactly, in both directions | `check:notice-rows` |
| 4.8 | Every published package's `files` carries `LICENSE` and `NOTICE.md`, and every file an `@license` header promises is in it | `check:package-files` |
| 4.9 | **The disclaimer is in every published package's README** — a publish-time gate, not a habit (`legal.md` §6 item 7) | `check:readme-disclaimer` |
| 4.10 | The three dev-time resolution files agree | `check:resolution-sync` |
| 4.11 | Bundle figures recorded against the budget; **per-batch closure growth, never a flat per-component number** | `check:bundle` |
| 4.12 | ESM-only; changesets — and **no changeset while at `0.0.0`** (`plan.md` §8) | The release workflow's changeset step |
| 4.13 | `legal.md` §1.1's license table re-verified and re-stamped with the date | The `publish` job's legal step (`legal.md` §5) |

---

## 5. The axe allowance register — as it stands today

**Shape:** `testing.md` §4.2. **Contents:** here, and here only.

Every entry is *expected*, not tolerated: a faithful port carries inherited allowances by
construction, and a correct port must not read as a regression (`component-blueprint.md` §9.3).
`plan.md`'s ancestor promised none at all — **not achievable, and it should not be**
(`prior-art.md` §10.1 row F).

| Component | Rule | Scope | Upstream issue | Cause | Status |
|---|---|---|---|---|---|
| `dialog` | `aria-hidden-focus` | **open-state assertions only** | The `ariaHidden` → `suppressOthers` filing (`zag-solid-adapter.md` §8.2) | `@zag-js/aria-hidden`'s entry exports one function, which calls `hideOthers` unconditionally; `dialog.machine.ts:201` cannot redirect it; the published `exports` map makes `suppressOthers` unreachable even by deep import. **Chakra v3 has the identical defect** — `inert` appears zero times in both `chakra-ui/packages/react/src/` and `ark-ui/packages/react/src/` | **Predicted, not measured** (**P5-C**). Verified at step 5 |
| `drawer` | `aria-hidden-focus` | open-state only | same filing | Runs on the **`dialog`** machine, not `@zag-js/drawer` (`roadmap.md` §2.2) | Predicted. Verified in B1 |
| `popover` | `aria-hidden-focus` | open **and** `modal` | same filing | `popover.machine.ts` reaches the same call site (`zag-solid-adapter.md` §8.2). **Whether it fires only under `modal: true` is measured at 5b** | Predicted, narrower than the other two. **If it never fires, the entry is deleted at 5b** — the register fails on an unused allowance, which is how that decision gets made rather than forgotten |

**That is the whole list.** Every other component starts at zero, and `prior-art.md` §7's other
finding is why that is credible rather than optimistic: **the cost does not generalise** — it belongs
to the modality stack, ZagListbox's full-anatomy assertions came back clean, and the listbox closure
pulls no `@zag-js/aria-hidden` at all.

**Retired, recorded so they are not re-added** (`component-blueprint.md` §9.2 revises
`prior-art.md` §7's measured six):

| Retired | Why it does not transfer |
|---|---|
| `aria-valid-attr-value` on closed-state assertions ×3 | Three independent reasons, no one of them load-bearing: we port Ark's presence-gated `aria-controls` override, so a closed trigger emits no IDREF to dangle; Chakra's Dialog defaults `lazyMount: true` and `unmountOnExit: true`, so closed *is* unmounted unless a consumer opts out; and A1 is fixed in the fork's `normalize-props.ts`, which stringifies boolean `aria-*` in both directions |

**Two failures this register must not absorb**, because both would look like a row that belongs here:

- **`aria-valid-attr-value` appearing on *open*-state calls** means a re-sync dropped the A1 fix. The
  repair is `normalize-props.ts`, not an entry.
- **A new open-modal component failing `aria-hidden-focus`** is a row citing the existing filing —
  **never** a reason to re-introduce `createHideOutside`. The kernel is struck by the port rule and
  the retained set is 12 lines that are not accessibility (`component-blueprint.md` §8).

---

## 6. The coverage allow-list — as it stands today

**Shape:** `testing.md` §3.4. **Contents:** here.

Six components whose recipe key resolves to nothing — five of them **in Chakra too**, which makes
them `plan.md` §0.2's silent unstyling shipped upstream on purpose, and a faithful port reproduces it
(`roadmap.md` §2.5).

| Component | Key | Reason | Expires when |
|---|---|---|---|
| `clipboard` | `clipboard` | Key exists in **neither** `@chakra-ui/panda-preset` nor `@chakra-ui/react`'s own theme. Chakra ships Clipboard unstyled | The key appears in the preset — re-derived on each Chakra minor (**P6-C**) |
| `pagination` | `pagination` | Same | Same |
| `toggle` | `toggle` | Same | Same |
| `download-trigger` | `downloadTrigger` | Same | Same |
| `text` | `text` | Same. Styled by `textStyles` + style props instead | Same |
| `container` | `container` | **The only one that is styled in Chakra and would be unstyled here** — the preset is exactly one recipe short of Chakra's runtime theme (`roadmap.md` §1.3a) | **The `container` recipe delta lands in `@chakra-ui-solid/preset` with the Container component at step 6.** That commit removes this entry, adds the registry entry, the `@license` header and both `NOTICE.md` rows — one change, not two. `check:coverage-allowlist` fails if the entry outlives the delta |

**Two preset deltas, two tiers, and only one of them is expression** (`roadmap.md` §13 row 7b):

- `theme.extend.tokens.cursor.switch = { value: "pointer" }` — one word, restoring the
  `cursor: pointer` the preset silently loses because its Switch recipe references a `cursor` token
  the preset registers as `swittch`. **Owes nothing**, and must not enter `attribution.config.ts`.
- The `container` recipe **body**, ported from `@chakra-ui/react`'s `theme/recipes/container.ts` —
  expression-tier under `legal.md` §1.4, the first such file outside the `zag-solid` fork, and the
  reason `@chakra-ui-solid/preset` gains its first `NOTICE.md`.

**And one upstream filing P7 owns**, now with a concrete defect rather than a spelling observation: a
broken token reference in `@chakra-ui/panda-preset`, which is the difference between an issue that
gets fixed and one that gets closed (`roadmap.md` §1.3c).

---

## 7. Conventions, unenforced — labelled, not hidden

Five rules that survive review and nothing else. Each says what is trusted, and what mechanical proxy
covers the part of it that could be covered.

| # | Convention | Why no script | What *is* enforced |
|---|---|---|---|
| 7.1 | **The expression-tier judgement** — *"could a reader diff my file against theirs and see the same structure and sequence?"* (`legal.md` §2.1) | It is a reading, not a predicate. Nothing can decide it from source | The **consequence**: once declared in `attribution.config.ts`, every obligation is checked in both directions (`check:license-headers`, `check:notice-rows`, `check:package-files`) |
| 7.2 | **Ark is `what`, never `how`**; Chakra's `styled-system/` is API shape only (`legal.md` §1.4; `plan.md` §0.5) | Same reason as 7.1 | For Field — the one component with no machine and no permission to copy — the proxy is real: **no header and no NOTICE row under `components/src/field/**`**, or the re-derivation failed (§3.2 B3) |
| 7.3 | **Never strip Zag's `hidden` to work around a recipe's `display`**, except as a delegation whose new owner you can name (`component-blueprint.md` §6.3) | A strip is a destructure, and distinguishing a delegation from a workaround needs the reason | **Rule 2.13** covers every presence-gated part with a computed-style test in the failing configuration — which is where the rule bites. Strips on non-presence parts are review-only |
| 7.4 | **Comments explain *why*, and read for a reader with no repo knowledge** (`CLAUDE.md`) | Unenforceable by construction | Biome catches nothing here. This is the one rule that is purely a review contract |
| 7.5 | **Read the machine's prop list; do not invent one** (`component-blueprint.md` §2.4) | Partially enforced: where a machine exports `Props`, the component's interface extending it is a type error away from wrong. Chakra-only props are outside that | `tsc`, for the machine half |

---

## 8. The assumption register

Every open assumption across P3–P6, plus the two P7 introduces **and the four P8 does** (§8.3b, added
at P9 — `docs-site.md` §8 row 3). **This is the one register: every open assumption in the repo has a
row here, a runnable gate, and the step it runs at.** §8.4 is the short, honest list of the ones whose
gate is a measurement plus a human judgement rather than a pass/fail.

**Counted at P9: 38 rows, and not one open assumption lacks a gate.** Eleven `brief-plan` originals
(§8.1) + six P3 + four P4 + five P5 (§8.2) + six P6 + two P7 (§8.3) + four P8 (§8.3b). **Six are
closed** — 1, 7, 10 and 11 outright; 2 and 8 closed with a standing re-check on every Zag minor. The
remaining **32 are open, and every one names a script and a step.** Three of those resolve to a
measurement plus a judgement rather than a threshold, and §8.4 lists them separately so nobody reads
them as pass/fail.

### 8.1 `brief-plan` §8's originals

| # | Status | Gate | Runs at |
|---|---|---|---|
| 1 | **Closed at P6** — 51 machines at `1.43.0` (`roadmap.md` §1.2) | — | — |
| 2 | **Closed at P6** — 49 anatomy exports, 406 parts, 2 headless by design | **Standing:** `check:anatomy-diff`, running `roadmap.md` §1.2's command | Every Zag minor |
| 3 | Panda `1.12.0` ↔ `@chakra-ui/panda-preset@3.36.1` — untested anywhere visible | `panda codegen` exits 0, with `check:preset-token-resolution` as its companion | **Step 3** |
| 4 | `staticCss` in a preset covers internally-emitted variants — atomic half demonstrated in production, recipe half open | `check:css-coverage` **inside the step-4 throwaway consumer** (= **P3-A**) | **Step 4** |
| 5 | Ark `5.37.2` (Chakra's pin) vs the `5.38.1` checkout. **Every machine mapping was measured from Chakra's own imports and is version-proof**; the `aria-controls` list and `useCollapsible` are Ark-implementation reads and are not | Re-read both against the installed `5.37.2` | **Step 5** and **B2** |
| 6 | TanStack prerender to Cloudflare | A deploy smoke test over the prerendered output — **P8's script to write** | P8 |
| 7 | **Closed at P1** — `@chakra-ui-solid` is owned | — | — |
| 8 | **PASS at P4**, and the question's phrasing was the wrong one | `check:no-cij-manifest` against the **installed** closure; `check:no-runtime-sheet` over our source | **Step 2**, then every Zag minor |
| **9** | **The `data-*` vocabulary diff** — spot-checked at 6 of 56 slot recipes, all matching. *The single cheapest check with the largest downside if skipped*: if it fails, every affected slot recipe needs a translation getter per part, a per-component tax nothing prices | **`check:data-attr-vocab`.** Tier 1 reads the emitting side from each machine's `.connect.ts`; tier 2 drives real machines through their states. The one known non-match is not one — `tabs`' `_active` is Panda's `:active` pseudo-class, not a Zag attribute | **Step 4** (tier 1), per batch (tier 2) |
| 10 | **Closed and refuted at P4** — three one-line deltas | Applied at step 2; D2 is self-verifying | — |
| 11 | **Closed at P2, the other way** — `@zag-js/presence` is the correct mechanism | — | — |

### 8.2 P3, P4 and P5

| # | Assumption | Gate | Runs at |
|---|---|---|---|
| **P3-A** | Recipe-level `staticCss` through `theme.extend` reaches the consumer's codegen | `check:css-coverage` in the throwaway consumer; a failure is `plan.md` §1.5 rung 1 or 2, **and the ladder has two rungs** | Step 4 |
| **P3-B** | `staticCss: ["*"]` enumerates base conditions only | `check:responsive-grain` — codegen at each of the three grains, counting `@media` rules | Step 4 |
| **P3-C** | A `hash`/`prefix` mismatch unstyles everything silently | `check:css-coverage`'s configuration canary — flipping `hash` must exit `E_CONFIG_MISMATCH`, not green and not a 4 000-row diff; `check:hash-config` on our side | Step 4 |
| **P3-D** | The Chakra↔Panda shorthand delta is a subset of 95 names | `check:alias-coverage` — the failing set *is* the alias list | Step 3 |
| **P3-E** | Panda's `preflight` emits no `[hidden] { display: none !important }` equivalent | `check:preflight-hidden`, which asserts the **outcome** and is therefore correct under either answer | Step 3 |
| **P3-F** | `@pandacss/preset-base`'s `_dark` selector matches the semantic tokens' assumption | `check:dark-selector` + a computed-colour assertion under that attribute | Step 3 |
| **P4-A** | The checkout at `main`/`421844f` matches the published `1.43.0` tarballs | `diff` the installed `dist` against a local build of the checkout | Step 2 |
| **P4-B** | Applying D1/D2/D3 leaves the other 84 cases green | Run the suite; `bindable.test.ts`'s controlled cases are D3's surface | Step 2 |
| **P4-C** | Upstream's 51 cases port to `mount()` with no semantic change | The one-time parallel acceptance run (`zag-solid-adapter.md` §6.2). **A case needing a real change is a finding, not a porting detail** | Step 2 |
| **P4-D** | `@zag-js/{core,types,utils}@1.43.0` resolve and type-check against `solid-js@2.0.0-beta.32` | First `pnpm install` + `typecheck` | Step 2 |
| **P5-A** | `recipe(variantProps) → Record<Slot, string>` | `check:css-coverage` cannot be built without it — the check **is** the gate. No fallback | Step 4 |
| **P5-B** | `recipe.splitVariantProps` exists | First `Button`: non-variant props reach the element, `size` does not leak as an attribute | Step 3 |
| **P5-C** | Our Dialog's closed-state axe assertions run clean | §5's register: closed-state calls carry **no** allowance, so needing one fails | Step 5 |
| **P5-D** | `styleSource` closes the collision class rather than only `editable`'s case | `check:style-prop-collisions`. If a collision survives, the addition is a per-part deny-list beside rule 1.4, not a change to it | Step 5, then per batch |
| **P5-E** | Two presences per Dialog plus the machine is an acceptable instance count | `check:bundle` at milestone 5 — see §8.4 | Milestone 5 |

### 8.3 P6 and P7

| # | Assumption | Gate | Runs at |
|---|---|---|---|
| **P6-A** | The popper `--z-index` seam is priceable in one component and costs the same for the other eight | `check:floating-zindex` — the computed value survives interleaved reactive renders and `raf` writes | Step 5b, re-confirmed at the first B5 component |
| **P6-B** | `useCollapsible` is the only second presence source | `grep -rl 'isUnmounted' ark-ui/packages/react/src/` pinned as a fixture with an expected file list | B2 |
| **P6-C** | The six unstyled-by-key components are unstyled **by intent** upstream | `check:coverage-allowlist` re-derives the "absent from both registries" set from the checkouts | Step 4, then every Chakra minor |
| **P6-D** | The seven duplicated slots are transcription artifacts with no runtime meaning | `check:css-coverage`'s dedupe assertion: each duplicated slot emits exactly one class token | Step 4 |
| **P6-E** | Field is re-derivable from its ARIA contract without reading Ark's expression | The ARIA conformance suite, plus the header/NOTICE proxy of §7.2. **The cost half has no script** — see §8.4 | B3 |
| **P6-F** | An unresolvable token reference **drops the declaration rather than failing the build** | **`check:preset-token-resolution`: one `panda codegen` with the `cursor.switch` delta and one without, reading the emitted `cursor` declaration.** Cheap and unambiguous. If Panda *errors* instead, the preset does not build for anyone and the finding is larger than one component | Step 3 |
| **P7-A** | Panda's generated recipe function exposes its variant map | `check:css-coverage`'s enumerator builds, or falls back to reading variant keys off the imported preset object — one line either way | Step 4 |
| **P7-B** | The Storybook test runner drives a Solid 2.0 Storybook build and observes per-story console errors | `test:storybook` runs at all; its fallback is `testing.md` §13, and costs more code rather than a redesign | Step 3, first story |

### 8.3b P8

Four, from `docs-site.md` §7.2 (§8 row 3). **P8-A is the runnable form of `brief-plan` §8 assumption
6**, which §8.1 lists as *"P8's script to write"* — the assumption and its gate are one row apart and
neither is a duplicate of the other: 6 is the claim, P8-A is the script.

| # | Assumption | Gate | Runs at |
|---|---|---|---|
| **P8-A** | `dist/client` is self-sufficient for static hosting — no route needs a server runtime | `docs-site.md` §7.1's assertions 1–4, then 5–7: a deploy smoke test over the prerendered output | **Step 8**, and every docs build thereafter |
| **P8-B** | MDX compiles through `vite-plugin-solid` under Solid 2.0 with the `compiler: "babel"` pin, and the pin's stated expiry is the only thing that changes later | The docs build runs at all, plus one MDX-authored example mounting in the `browser` project | Step 8, first page |
| **P8-C** | The props-table generator can read a machine's `Props` type and the preset's variant map with **no running system object** | A non-empty, correct table for Dialog — the first component page written. **Shares its fate with P7-A**, which needs the same variant map | Step 8, first component page |
| **P8-D** | The docs app's Panda run is representative of a consumer's, so `check:css-coverage` against its sheet means what the step-4 run means | `check:docs-consumer-config`. Note what it does **not** prove: representativeness of one config, not of all | Step 8, every push |

### 8.4 The three whose gate is a measurement plus a judgement

Recorded separately rather than dressed up as pass/fail:

- **P5-E** — `check:bundle` produces the number at milestone 5; *acceptable* is a review call against
  the budget, not a threshold anyone can set today.
- **P6-E** — the conformance suite decides whether Field is **correct**; whether re-deriving it cost
  *"comparably to a machine component"* is an estimate, and only B3 finding out settles it.
- **P6-A** — 5b produces a number; whether the seam is *free* is the reading of that number. What is
  mechanical is that a rule gets written or a sentence does, before B1's five components are written
  against the pattern (`roadmap.md` §8.2).

---

## 9. The scheduled checks — what fires them, who reads them

The jobs are `testing.md` §11. The ownership is here.

- **What fires them:** Renovate, **grouped by upstream, never auto-merged, one upstream per PR.** A
  Chakra bump and a Zag bump in the same PR means the coverage check and the anatomy diff fail
  together and neither is diagnosable. Versions are pinned exactly in the workspace catalog, because
  a floating range turns a reviewable upstream change into an unreproducible local one
  (`legal.md` §5).
- **Who reads the output:** the PR's human reviewer, and each check posts its diff as the job
  summary, so reading the diff *is* the review rather than an errand beside it.
- **They fail rather than warn.** `prior-art.md` §8.1: a check verified by nobody running it is
  verified in name only.
- **Six triggers, six jobs** — the table is `testing.md` §11. Two of them are obligations rather than
  hygiene: the **Zag minor → anatomy diff** is what keeps `brief-plan` §8 assumption 2 *closed* rather
  than merely answered once, and the **preset minor → coverage check** is not optional, because under
  the no-runtime-CSS rule a removed variant silently unstyles rather than erroring.
- **Any upstream major** → the legal re-check and a re-stamped `legal.md` §1.1 table (rule 4.13).

---

## 10. What P7 changes — re-plan P8 and P9 against this

> **Every row marked P9 was applied at P9**, each in exactly one place: row 1 →
> `zag-solid-adapter.md` §6.4, §8.2 · row 3 → `plan.md` §5.2 · row 4 → `CLAUDE.md`'s document index ·
> row 5 → `legal.md` §6 items 6 and 7 · row 6 → `legal.md` §2.6 · row 7 →
> `component-blueprint.md` §1.3 · row 8 → `plan.md` §0.4 · row 9 → `plan.md` §12 row 3. Row 2 was
> P8's and is discharged in `docs-plan.md` §1.2. The full log is `decisions.md` §7; this table stays
> as the record of what was carried.

| # | The source says | P7 decides | Touches |
|---|---|---|---|
| **1** | `zag-solid-adapter.md` §6.4: *"`prior-art.md` §7 is explicit that a faithful Dialog port scores six inherited axe allowances, and the DoD has to record them as expected"* | **Three, not six, and open-state only.** `component-blueprint.md` §9.2 revises the count on three independent grounds and P5 is the later document; §5 above records the revised register and the retired rows. §6.4's sentence is stale in its number, right in its instruction | **P9** — the reconciliation pass |
| **2** | `docs-plan.md` §2 **D-2**: does the route-3 lint rule exist by the time the static-extraction page ships? | **Yes, by five steps — with one qualification about whose source it runs on.** The answer and its consequences for the page are `testing.md` §6.5 | **P8** — §1.2 section 4 loses its hedge and gains a scope sentence; section 6 gains the three consumer-reachable mechanisms |
| **3** | `plan.md` §5.2: `internal-test-utils` depends on `system` | **Right about the direction, early about the date.** At milestone one the harness touches no styling and that edge must not exist; it appears at milestone 3 (`testing.md` §1.8) | **P9** |
| **4** | `brief-plan` §4.1 doc 6: *"per-file and per-component DoD"* | **Four tiers.** Per **batch** is where a batch's proof stops being prose (`roadmap.md` §13 row 8), and per **release** is where the distribution and attribution checks live | **P9** |
| **5** | `legal.md` §6 items 6 and 7 are open, assigned to P7 | **Closed here, by name:** `check:license-headers`, `check:notice-rows`, `check:package-files` for item 6; `check:readme-disclaimer` as a **publish-time** gate for item 7 | **P9** — `legal.md`'s open-items table |
| **6** | `legal.md` §2.6 describes a per-file checklist; nothing names where the list of derivatives lives | **`attribution.config.ts` at the repo root** is the registry every attribution check reads — eight entries today, seven fork files plus the `container` recipe delta | **P9** |
| **7** | `brief-plan` §2.10 / `component-blueprint.md` §1.3: Storybook is a dev harness and a canary | **It is also a required CI job.** `test:storybook` builds and drives every story; it must be Storybook, not `composeStories` under Vitest, because the two failures it exists for are invisible to any other compile (`testing.md` §7.3, §7.4) | **P9** |
| **8** | `roadmap.md` §13 row 1b: `plan.md` §0.4 gains a `React→Solid` row — Portal's `disabled` is absent | **Recorded, not written.** `plan.md` is P3's document and editing it here would put the same correction in two places, exactly as with row 10 below | **P9** |
| **9** | `plan.md` §12 row 3: *"a **three-rung** fallback ladder (§1)"* | **Stale, and left stale on purpose.** `a8b4995` rewrote §1.5 to **two** rungs — §4.4 removed the prebuilt-stylesheet floor. `roadmap.md` §13 row 10 flagged it; P7 carries it forward unedited for the same reason | **P9** — the reconciliation pass |

---

## 11. What P7 could not act on

| Item | Why not | What it blocks |
|---|---|---|
| **Running any of it** | No package exists, by P-pass rule. Every artefact above is specified; none has been executed | Nothing. §8's register carries the exposure |
| **Panda's generated recipe surface** | Panda is installed in no checkout (`plan.md` §13) — the same limit `component-blueprint.md` §14 and `roadmap.md` §14 hit. The coverage check's enumerator is written against a documented shape | **P7-A**, and through it **P5-A**/**P5-B**, at steps 3 and 4 |
| **The axe baseline** | Predicted from the reference sources; axe has not run. If it turns out wrong the number goes up and §5 records it — **what must not happen is the first `aria-hidden-focus` failure being "fixed" by re-introducing the kernel** | **P5-C**, at step 5 |
| **The popper `--z-index` seam's price** | It needs a running floating component and a browser; no spike built one and neither could P5 or P6. P7 can name the check and its assertions, not its result | **P6-A**, at step 5b |
| **Whether tier 1 of `check:data-attr-vocab` is complete** | Some `data-*` values are computed rather than literal in a `.connect.ts`, so a source read can under-collect. That is why tier 2 drives real machines — but tier 2 needs components | Assumption **9**'s full closure, per batch |
| **Every bundle number** | Not reproducible from git; no machine closure exists until step 5 and no library closure until B8 | `testing.md` §10's three measurement points |
| **The Storybook runner against Solid 2.0** | Nobody has run the two together here | **P7-B**, at the first story |

**Rows from the earlier phases that reach P7, and what P7 did with each:**

- `roadmap.md` §13 — row **3** (§2's per-kind rules: 34 + 7 + 15, and the atomic half exactly true),
  row **4** (`testing.md` §3.3's dedupe, and the seven pinned), row **5**
  (`RootProvider`/`PropsProvider`/`Context` as rule 2.10, per batch rather than a sweep), row **6**
  (rule 2.14 — both presence families, and the render-strategy split gated at step 5), row **7**
  (§6's preset delta and the upstream filing), row **7b** (§6's two tiers and `attribution.config.ts`),
  row **8** (§3 — the per-batch tier), row **9** (`testing.md` §10 — milestone 5 and per-batch
  closure). Rows **1b** and **10** are §10 rows 8 and 9: **recorded for P9, deliberately not fixed.**
- `component-blueprint.md` §13 — row **1** (§5's revised register), row **2** (rule 1.4 and
  `check:style-contract` rule 2), row **8** (the floor grows by category → §3's per-batch tier and
  5b's own gate). Rows **3** and **9** are P9's.
- `zag-solid-adapter.md` §10 — row **5** (rule 2.11), row **6** (`testing.md` §5 — two checks, with
  what merging them would have wrongly failed in both directions), row **7** (§9's attribution
  checks), row **8** (`testing.md` §10 — the re-measurement at milestone 5), row **9** (the three
  `flush()` cases, in step 1's gate), row **10** (step 2's gate says 86 and 51, never 137), row **11**
  (`testing.md` §1.8 — the harness and the split land at milestone one).
- `prior-art.md` §10.1 row **F** (§5's whole shape), §10.2 rows **6/7/8** (quoted correctly or not at
  all), §10.5 (`testing.md` §10).
