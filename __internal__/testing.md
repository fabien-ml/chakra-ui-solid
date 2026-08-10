# Testing — the apparatus

**Status:** written at P7, 2026-08-09. Builds the machinery every definition-of-done rule points at:
the three-project split, the harness, the coverage check, the axe runner, the lint rules, the
distribution and attribution checks, the Storybook canary, and the bundle measurement.

**What this document is.** The *how*. Every enforcing artefact in this repo is **defined exactly
once, here** — its name, its input, its algorithm, its failure output, and what it cannot see.

**What it is not.** The bar. When each artefact must be green, what a file/component/batch owes, and
which assumption each one closes is `definition-of-done.md` §0's split, restated in §0 below so the
boundary is not guessed at. It is also not the evidence (`prior-art.md`), the architecture
(`plan.md`), the adapter spec (`zag-solid-adapter.md`), the component pattern
(`component-blueprint.md`) or the inventory (`roadmap.md`) — all six are cited by section, never
restated.

**Vocabulary, once.** A **machine** is a `@zag-js/*` state machine — framework-agnostic behavior and
ARIA; its **anatomy** is its list of named parts, each of which becomes a **part component**
(`Dialog.Trigger`). A **slot recipe** is a Panda style definition for a multi-part component, one
style block per named **slot**; an **atomic recipe** styles a single element. **`staticCss`** is the
Panda config key that pre-generates CSS for values no source file literally writes. **Presence** is
enter/exit lifecycle. **`_hk`** is the positional key Solid stamps on server-rendered nodes and
matches against on hydrate. **`mount()`** is hope-ui's test-render helper, which fails a test on any
Solid reactivity diagnostic. **Silent unstyling** is this project's central hazard, and the reason
most of this document exists: a Panda class whose CSS was never generated renders nothing and raises
no error (`CLAUDE.md`; `plan.md` §0.2).

**Settled earlier, not reopened here.** The brand; the **port rule** (`prior-art.md` §8.2); Zag
`1.43.0`; Solid `2.0.0-beta.32`; `plan.md` §0's two scopes; zero published CSS with Panda a hard
prerequisite (`plan.md` §4.4); presence is a build over `@zag-js/presence` (`plan.md` §6); the a11y
kernel is `createRegisteredId` alone (`component-blueprint.md` §8); the three-project Vitest split;
Dialog then Popover as the two probes and the batch order (`roadmap.md` §9); P3's Q2/Q4, P4's Q6,
P5's Q7.

---

## 0. The division of labour with `definition-of-done.md`

Two documents, one rule each, and they do not overlap:

| | `testing.md` (this file) | `definition-of-done.md` |
|---|---|---|
| Answers | **How does the check work?** | **When must it pass, and what does a failure mean for the change in front of me?** |
| Contains | Artefact definitions: name, input, algorithm, failure output, blind spots | Rule rows: the rule, the artefact enforcing it **by name**, the step it runs at |
| Registers | — | The axe allowance list, the coverage allow-list, the assumption gates, the scheduled upstream checks, the CI job map, the unenforced conventions |
| Never contains | A bar ("every mounting test runs axe") | An algorithm ("the check diffs set E against set G") |

**The one deliberate seam.** The two live registers — the axe allowances (§4.2) and the coverage
allow-list (§3.4) — have their **shape** defined here and their **contents** in the DoD. That is
because the contents change per component and the shape does not, and because a reviewer adding an
allowance needs one place to look. Nothing else is written in both files.

**Assumptions follow the same seam.** An assumption's statement and mechanism live where it arises
(inline, here, when a check rests on it); its **gate row** — the script, the step, what it blocks —
lives only in `definition-of-done.md` §8.

---

## 1. The three-project split, and why it is by module resolution

Copied from hope-ui with its rationale intact (`prior-art.md` §9; `brief-plan` §2.8's ancestor). The
split is **not by speed, taste, or test kind**. It is by **which build of Solid the project
resolves**, and that is a property no `describe` block can express.

```ts
// vitest.config.ts — three projects, one alias table (vitest-aliases.ts)
projects: [
  { name: "unit",    environment: "node",    /* no DOM, no Solid resolution override */ },
  { name: "ssr",     environment: "node",    /* server builds of BOTH solid-js and @solidjs/web */ },
  { name: "browser", /* @vitest/browser-playwright, real Chromium */ },
]
```

### 1.1 `unit` — node, no DOM

Pure logic: the adapter's `bindable`/`track`/`refs`/`merge-props`/`normalize-props` cases
(`zag-solid-adapter.md` §6.2), the recipe layer's class-string computation, the render strategy's
`present`/`unmounted` algebra, and every check script's own tests.

**It is the one project where asserting a class *string* is correct**, because there the string is
the subject rather than a proxy for styling (§2.3).

### 1.2 `ssr` — the only project resolving the server builds of **both** `solid-js` and `@solidjs/web`

This is the row that makes the split structural. `solid-js` and `@solidjs/web` each ship a server
build; **aliasing one alone gives two disagreeing instances** — the renderer walking a client-shaped
reactive graph — and the symptom is a hydration mismatch three layers away from the cause. Both
aliases live in the shared `vitest-aliases.ts`, so they cannot drift apart, and `hydratable: true` is
set here and nowhere else.

What runs here: `renderToStringAsync` output shape, `createUniqueId` id allocation, the machine
rendering its initial state **without starting** (`zag-solid-adapter.md` §6.2), Portal's `isServer`
guard (`roadmap.md` §5.1), and the server half of every round-trip fixture (§1.5).

### 1.3 `browser` — real Chromium, real scrollbars

`@vitest/browser-playwright`. Everything that needs a layout engine: focus, pointer, **computed
styles** (§2), axe (§4), hydration's client half, and `scroll-area`'s real scrollbars
(`roadmap.md` §4.1). No jsdom anywhere — a jsdom `getComputedStyle` returns the cascade it was told
about, which is precisely the thing under test.

### 1.4 `mount()` — the reactivity-diagnostic gate

`mount()` comes from `@chakra-ui-solid/internal-test-utils` (hope-ui `main`, ours, provenance note —
`zag-solid-adapter.md` §1.2). It renders, and on `dispose()` **throws with a summary of every Solid
diagnostic recorded while the tree was mounted**.

Solid 2.0 labels certain phases strict-read — component render bodies, `<For>`/repeat callbacks, an
effect's second callback — and reports untracked reads inside them as `[STRICT_READ_UNTRACKED]`. It
also throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` when a descendant writes a signal owned by an ancestor
scope from its own synchronous render body. Solid 1.x has neither phase, **so upstream's own suite
cannot see any of it** — every one of the adapter's measured defects A2, A3 and B5 was discovered by
this gate (`zag-solid-adapter.md` §6.5).

Two standing consequences:

- **A diagnostic is a defect, not a missing wrapper.** The idiom that used to silence the one at a
  Root's `useMachine` call no longer exists — the fork's `seedFromProps` absorbed it, and a Root
  calls `useMachine` bare (`component-blueprint.md` §2.1, §2.2).
- **`mount()` silent is a gate line in its own right**, not a style preference. It is the cheapest
  possible check that a port did not smuggle an untracked read into a render body.

### 1.5 Hydration round-trip fixtures

`hydrate-fixture/` (same carry-over). One fixture renders in the `ssr` project, and the emitted HTML
is handed to the `browser` project's `hydrate()` through `vitest-hydration-bridge.ts`; the fixture
fails if any node's `_hk` differs, if hydration logs a mismatch, or if the post-hydrate DOM differs
from the server DOM by anything other than event listeners.

**Why a green typecheck is not a substitute**, in the two cases this repo actually hits:

- **`children()` moves keys.** It resolves in the ambient owner and therefore allocates *ahead* of
  the surrounding element, so adding or removing one shifts `_hk` for that subtree — even now that
  `2.0.0-beta.32` fixed the `<Show>` `when`-gate burning a key
  (`component-blueprint.md` §10.2). Every add or remove owes a real round-trip.
- **A repeated part allocates N keys.** `roadmap.md` §7.2 proof 4 is a round-trip with a non-trivial
  item list, not a smoke test with one.

### 1.6 `solid-contract` characterization tests

These pin **SolidJS's** behavior, not ours, so that when the 2.0 beta line moves, one red contract
test says so instead of thirty adapter tests failing with no common cause. Copied from hope-ui `main`
and extended (`zag-solid-adapter.md` §6.3): **10 unit + 3 ssr + 7 browser = 20 copied**, **plus the
three `flush()` cases** that section adds — a plain write invisible until the next `flush()`,
`flush(fn)` draining before it returns, and a write queued inside `queueMicrotask` landing after the
current synchronous flush, which is the ordering `send` relies on.

**Twenty-three cases, and they are day-one work**, because the adapter's design rests on exactly
those semantics.

> **Corrected at step 2** — this section previously read *"9 unit + 3 ssr + 6 browser"* and
> concluded *"Eighteen cases"*, which is the sum **without** the three `flush()` cases and so could
> not be read both ways. D-96 measured the copied set at 20 and left this site standing for the
> phase that next read it; step 2 is that phase, and the suite it runs is 13 + 3 + 7 = **23**.

### 1.7 `check:test-projects` — a mis-suffixed test is a test that never runs

Each project's `include` glob keys off the filename: `*.test.ts` → `unit`, `*.ssr.test.tsx` → `ssr`,
`*.browser.test.tsx` → `browser`. A file named `dialog.browser.tsx` or `dialog.test.browser.tsx`
matches none of them, **so it never runs and nothing says so** — a green suite with a whole file
missing from it, which is this repo's characteristic failure shape in a new place.

The check asserts every `**/*test*` file under `packages/*/src/` **and `apps/docs/src/`** matches
**exactly one** project's include glob. Zero matches and two matches are both errors.

**`apps/docs/src` joined the scan — and the `browser` project's include glob — at S3b**, because the
docs app owns one test and it is the one `prior-art.md` §8.1's fourth rule now points at: every docs
example mounts (§7.3). A mis-suffixed file there would never run and nothing would say so, in the
one place the repo validates a component the way a consumer uses it.

### 1.8 Sequencing: the harness and the split land at **milestone one**

`brief-plan` §2.8's ancestor reads as though the testing stack were a bootstrap detail and the adapter
were separable from it. It is not: **the fork's seven test files import `mount` and
`expectNoA11yViolations` from `internal-test-utils`** (`zag-solid-adapter.md` §10 row 11, §1.2), so
the harness, the three-project split, `vitest-aliases.ts`, the hydration bridge and the
`solid-contract` files all come over in the same milestone as the adapter. There is no ordering in
which the fork's tests run before the harness exists.

> **One graph correction that follows — applied at P9.** `plan.md` §5.2 gave
> `internal-test-utils → system` with no date. At milestone one that edge does not exist yet and must
> not be created: `mount`, the axe helper and the hydrate fixture touch no styling. The edge appears
> at **milestone 3**, when the harness first renders something styled. The table was right about the
> direction and early about the date, and **`plan.md` §5.2 now carries the date** — this is the
> pointer, not a second copy.

---

## 2. Computed-style assertions, and the ban on class-name assertions

### 2.1 The worked failure, so the rule is not re-derived

```bash
git -C ../hope-ui show e9c2f81:packages/components/src/box/__tests__/box.browser.test.tsx | sed -n '15,50p'
```

```ts
expect(el?.classList.contains("p_4")).toBe(true)   // passes on a completely unstyled element
```

Under Panda, `css()` **only computes class names and never injects a stylesheet**
(`plan.md` §0.1). A class whose CSS was never generated renders nothing and raises no error, so
`classList.contains("p_4")` is compatible with an element that has no padding at all. hope-ui's suite
could not see this because it ran against a dev stylesheet generated from a config it controlled;
ours cannot afford the same blind spot (`prior-art.md` §4.4).

**This is the prior art's one provably incomplete carry-over.** Everything else in hope-ui's testing
stack transfers; this does not.

### 2.2 What a correct assertion looks like

```tsx
// browser project
const { getByRole } = mount(() => <Box p="4" bg="bg.panel" />)
const el = getByRole("generic")

expect(getComputedStyle(el).padding).toBe("16px")
expect(getComputedStyle(el).backgroundColor).toBe("rgb(255, 255, 255)")
```

Three properties of a correct assertion, each of which the class-name form lacks:

1. **It reads the resolved value**, so a missing rule fails.
2. **It reads a value the recipe actually sets**, not a value the token happens to have — which is
   what catches `plan.md` §0.2's other shape, a rule that exists with one declaration dropped
   (`roadmap.md` §1.3c's `cursor: "switch"` is the live case).
3. **It survives `hash: true`.** A hashed class name turns a coverage failure into a hex string
   (`plan.md` §3.1); a computed style is unaffected.

The `hidden`-vs-`display` test is the place this bites hardest, and
`component-blueprint.md` §6.4 fixes its shape:

```tsx
render(() => <Dialog.Root unmountOnExit={false} lazyMount={false}>…</Dialog.Root>)
expect(getComputedStyle(content).display).toBe("none")
```

### 2.3 The one carve-out, so the rule is not wrong

**The ban applies to the `browser` and `ssr` projects.** In `unit`, the recipe layer's own tests
assert strings — `createSlotClasses(dialogRecipe, …)()` returning
`{ content: "dialog__content …" }` is a pure function whose *output is a string*, and asserting it is
testing the function, not the styling. The distinction is mechanical: in `unit` no element exists to
have a computed style.

### 2.4 Enforcement — `check:style-contract` rule 3

An AST rule (`no-class-name-assertion`, §6.3) over `**/*.{browser,ssr}.test.tsx` rejecting
`classList.contains(`, `toHaveClass(`, `.className` compared to a string literal, and
`expect(el.getAttribute("class"))`. Cost if it does not exist: the rule survives exactly as long as
the person who read this section, and the failure it prevents is invisible.

---

## 3. The generated-CSS coverage check — `check:css-coverage`

**The only mechanical defence against silent unstyling** (`plan.md` §0.2, §1.4), and the direct
mitigation for the one thing the prior art does not de-risk at all — the recipe layer
(`prior-art.md` §4.1, §4.2). Everything in `plan.md` §1 is designed so that this check has something
to check against.

### 3.1 What it diffs

Two sets of class names:

| Set | Name | Built from |
|---|---|---|
| **E** | *emittable* | Every class string our components **can** emit: the full variant cross product of every recipe we consume, resolved through the generated recipe functions, plus the atomic values our own logic picks |
| **G** | *generated* | Every class **selector** present in the stylesheet emitted by `panda cssgen` (`plan.md` §9's `cssgen` task, which the check `dependsOn`) |

The check is **`E \ G`**. Non-empty ⇒ fail. It is deliberately one-directional: `G \ E` is large and
healthy — it is every utility a consumer might write.

### 3.2 How set E is built

Without rendering anything, and without a hard-coded list of names:

```ts
// scripts/css-coverage/emittable.ts  (sketch, not the implementation)
for (const [key, recipe] of Object.entries(generatedRecipes)) {
  if (!consumedRecipeKeys.has(key)) continue          // roadmap §4's Recipe column, as data
  const slots = dedupe(slotsOf(key))                  // §3.3
  for (const variants of crossProduct(variantMapOf(recipe))) {
    const result = recipe(variants)                   // Record<slot, string> for a slot recipe,
    for (const cls of tokenize(result)) emittable.add(cls)   // string for an atomic one
  }
}
for (const value of presetAtomicStaticCss) emittable.add(cssFn(value))   // display, colorPalette, …
```

Three inputs, each already owned by another document:

- **`consumedRecipeKeys`** — `roadmap.md` §4's Recipe column, kept as a checked-in data file rather
  than re-derived, so a component that ships without a recipe row fails the check rather than
  slipping past it.
- **`variantMapOf(recipe)`** — Panda's generated recipe function exposes its variant map. **This is a
  third dependency on the generated surface**, beyond `component-blueprint.md` §4.3's two
  (assumptions **P5-A**, **P5-B**), and it is new here: recorded as **P7-A**. Its fallback is real
  and one line — read the variant keys off the imported preset object
  (`chakraPreset.theme.slotRecipes[key].variants`), which is the same read `plan.md` §1.3 already
  performs to build the `staticCss` deltas.
- **`presetAtomicStaticCss`** — the `staticCss.css` block of `plan.md` §1.3: the `display`
  `flex`/`inline-flex` row and the ten `colorPalette` values.

**Cost of the cross product, stated:** 74 recipes, 142 variant keys, 488 values
(`plan.md` §3.8). The cross product is per recipe, not global, so it is thousands of strings and
milliseconds of work — not a combinatorial problem.

### 3.3 The dedupe step — or seven permanent false failures

**Seven slot recipes list a duplicated slot** (`roadmap.md` §1.3b): `carousel` (`progressText`),
`combobox` (`empty`), `datePicker` (`view`), `dialog` (`backdrop`), `drawer` (`backdrop`), `field`
(`requiredIndicator`), `splitter` (`resizeTriggerIndicator`). The cause is visible and upstream:
Chakra's runtime theme writes `slots: dialogAnatomy.keys()` — derived, therefore deduplicated by
construction — while the preset hard-codes a literal array, and the hand-transcription is where the
repeats crept in.

So the check **dedupes before comparing**, and does two more things with the fact rather than one:

1. `slotsOf(key)` returns `[...new Set(recipe.slots)]`. Panda emits one class per unique slot, so
   this is the correct set, not a workaround.
2. **The seven are pinned in a fixture** (`scripts/css-coverage/known-duplicate-slots.json`). An
   eighth is reported as a finding — not a failure of the coverage diff, but a red row in the
   check's own summary, because a new duplicate is a signal about the preset and the only place
   anyone would ever notice it.
3. It asserts **the dedupe is sound rather than convenient**: for each of the seven, that the
   generated recipe function returns exactly one class token for the duplicated slot. That is
   assumption **P6-D** made runnable — if a duplicated slot ever emits two classes, the dedupe is
   wrong and the preset needs a delta.

### 3.4 The allow-list — shape

Six components call `createSlotRecipeContext({ key })` / `createRecipeContext({ key })` with a key
that resolves to no recipe (`roadmap.md` §2.5, §1.3a). **Without an allow-list, the one check that
defends against silent unstyling cries wolf on six components from day one** — which is how a check
gets muted, and muting this one costs the project its only mechanical defence.

**Shape** — identical to the axe allowance register (§4.2), deliberately, so a reviewer adding an
entry to either meets the same three fields:

```ts
// scripts/css-coverage/allowances.ts
{
  component: "clipboard",
  recipeKey: "clipboard",
  reason: "Chakra ships Clipboard unstyled — the key resolves in neither registry",
  evidence: "roadmap.md §2.5",
  expiresWhen: "the key appears in @chakra-ui/panda-preset — checked on each Chakra minor (P6-C)",
}
```

Every entry carries a **reason**, an **evidence citation** and an **expiry condition**, and
`check:coverage-allowlist` re-derives the "key absent from both registries" set from the checkouts,
failing when an entry's premise has changed — so an entry that stops being needed fails, exactly as
for axe.

**The rows, their reasons and the one entry with a scheduled expiry are
`definition-of-done.md` §6.**

### 3.5 The configuration canary — failing loudly on a `hash`/`prefix` mismatch

A `hash` or `prefix` mismatch across the consumer boundary unstyles **everything**, silently
(`plan.md` §3.4, assumption **P3-C**): our published `css()` was generated with `hash: false` and
emits `p_4`; a consumer who sets `hash: true` gets a stylesheet whose rules are hashed, and every
class our runtime computes is absent from their sheet.

Without a guard, the coverage check's response to that is a diff with thousands of rows — which is
indistinguishable from a broken check, and the thing a tired reviewer mutes. So **before diffing**:

```
canary: css({ padding: "4" })  →  "p_4"      computed by the published runtime
        is "p_4" a selector in the sheet?    ← if no, ABORT
```

On abort the check exits with a distinct code and one paragraph, not a diff:

```
✗ E_CONFIG_MISMATCH — the runtime and the stylesheet were generated by different configs.

  runtime   @chakra-ui-solid/styled-system   hash: false   prefix: (none)   → css({padding:"4"}) = "p_4"
  sheet     ./styled-system-app/styles.css   hash: true    prefix: (none)   → no ".p_4" selector

  Every class this library computes is absent from that stylesheet. This is not a coverage
  failure — it is plan.md §3.4's boundary mismatch, and no per-recipe diff below it would be
  meaningful. Fix: spread chakraConfig() rather than re-declaring `hash`/`prefix`.
```

`check:hash-config` is the companion on our side of the boundary (§8), asserting our published
`styled-system` was generated with `hash: false` at all.

### 3.6 Failure output

Every failing row names **the declaration site that should have covered it**. A missing class without
"and here is where you declare it" is the shape of failure that gets muted.

The block below is the required *shape*, written against Dialog and Flex because both are real rows
in `roadmap.md` §4. The angle-bracketed counts are fields rather than measurements, and the class
names are illustrative — Panda is installed in no checkout here, so the exact string a slot recipe
emits is read from its documentation and not from an artifact
(`definition-of-done.md` §11).

```
✗ generated-CSS coverage — 2 emittable classes have no rule

  dialog · slot recipe · content · size=cover
    class      dialog__content--size_cover
    emitted by @chakra-ui-solid/components/dialog  (roadmap.md §4.1)
    declared   theme.extend.slotRecipes.dialog.staticCss = ["*"]     ← declared, NOT generated
    → the per-recipe declaration did not survive the preset merge.
      plan.md §1.5 rung 1: move to a config-level staticCss block.   (assumption P3-A)

  flex · atomic · display=inline-flex
    class      d_inline-flex
    emitted by @chakra-ui-solid/components/flex     (roadmap.md §4.4, CIJ ○)
    declared   NOWHERE
    → a component's own logic picks this value and no consumer source writes it.
      plan.md §3.5 route 2: add it to the preset's staticCss.css block (plan.md §1.3).

  scanned 74 recipes · 488 variant values · <emittable> classes · sheet <selectors> selectors
  allow-listed 5 components (definition-of-done.md §6) · deduped 7 slot recipes
```

The footer is not decoration: **an allow-list that silently grew and a dedupe that silently stopped
running both look like a green check**, so both counts are printed on success too.

### 3.7 What it does **not** catch — five things, each with the artefact that does

Stating this is half the check's value. Each row is a failure that looks exactly like the one the
coverage check exists for, and none of them is visible to it.

| Failure | Why the coverage check is blind to it | What catches it |
|---|---|---|
| A **consumer's** style prop that does not extract — a wrapper forwarding `props.tone` | It is their source, their Panda run, their sheet. Our sets never see it | Nothing mechanical of ours. `brief-plan` §7 concern 2: it is a documentation problem, and the static-extraction page is the loudest page in the docs (`docs-plan.md` §1) |
| The **`styleSource` collision** — `editable`'s machine-emitted `size: 1` folded into `css({size: 1})` | The class it emits **does exist**. The defect is that the machine's attribute never reached the DOM | `check:style-contract` rule 2 (§6.2), and `check:style-prop-collisions` (§6.4) |
| A **responsive variant** the consumer never opted into (`plan.md` §3.8) | Our sheet carries base conditions only *by design*, so "correctly absent" and "consumer forgot" are the same absence. And types cannot follow the flag — `size={{ base: "sm" }}` type-checks either way | The check re-run **inside the step-4 throwaway consumer**, against *their* sheet, with `check:responsive-grain` as the fixture |
| A **`data-*` vocabulary mismatch** — the rule exists, keyed on `[data-state=open]`, and nothing emits that attribute | The class is present in both sets. It simply never matches | `check:data-attr-vocab` (§8) — `brief-plan` §8 assumption 9, *the single cheapest check with the largest downside if skipped* |
| A rule that exists **with one declaration dropped** — the preset's `cursor: "switch"` against a token registered as `swittch` (`roadmap.md` §1.3c) | The class exists and has a rule. One property inside it is gone | A computed-style assertion (§2.2), and `check:preset-token-resolution` for the specific case (assumption **P6-F**) |

### 3.8 Where it runs

- **In-repo**, against the dev stylesheet `cssgen` produces (`plan.md` §9). Every push, from step 3.
- **In the step-4 throwaway consumer**, wired per `plan.md` §4.1 — published `styled-system` +
  `importMap` + buildinfo in `include` — **whose own source never names the variant**. That run is
  `plan.md` §1's gate and the thing that confirms or refutes per-recipe `staticCss` (**P3-A**).
- **On every `@chakra-ui/panda-preset` bump**, because a removed variant silently unstyles rather
  than erroring (`testing.md` §11). Not optional on a preset bump.

---

## 4. axe

### 4.1 The runner

`expectNoA11yViolations` ships with `internal-test-utils` (hope-ui `main`, ours). **Every mounting
test in the `browser` project calls it** — that part is unchanged and non-negotiable
(`component-blueprint.md` §9.3).

The signature changes in exactly one way, and it is what makes the register enforceable in both
directions:

```ts
// not: expectNoA11yViolations(node, { allow: ["aria-hidden-focus"] })
await expectNoA11yViolations(node, { component: "dialog", scope: "open" })
```

The helper looks the allowances up in the register itself. An inline `allow` array does not exist as
an option, so an allowance cannot be added at a call site — only in the register, where it needs a
reason and **where the gap is argued in our own documents** (§4.2 property 2; **D-110**). Not an
issue number: nothing is filed upstream.

> **P — this signature has not been built. Gate: step 5.** What ships is
> `expectNoA11yViolations(container, { allowIncomplete })`
> (`packages/internal-test-utils/src/axe/axe.ts`), called by 11 browser tests. Two differences a
> reader must not skip past: it takes the **container**, not `{ component, scope }`, so there is no
> register lookup at all; and `allowIncomplete` **is** a call-site option, which the paragraph above
> reads as forbidding. It is narrower than it looks — it accepts axe results the engine could not
> *decide* (`color-contrast` headless is the standing case), never a **violation**, and every
> violation still throws. But *"an allowance cannot be added at a call site"* is true of §4.2's
> register and not of the helper in the repo, and step 5 is where the two have to be reconciled —
> by building the register, not by widening `allowIncomplete`.

### 4.2 The allowance register — shape

`packages/internal-test-utils/src/axe/allowances.ts`. One entry per **component × rule × scope**,
never a global flag:

```ts
{
  component: "dialog",
  rule: "aria-hidden-focus",
  scope: "open",                       // matched against the call site's scope, not a wildcard
  inherited: "zag-solid-adapter.md §8.2; component-blueprint.md §9.2",  // OUR evidence, not a URL
  cause: "ariaHidden calls hideOthers unconditionally; the published exports map makes " +
         "suppressOthers unreachable. Chakra v3 has the identical defect (prior-art.md §7).",
  reviewAt: "each @zag-js/* minor — testing.md §11",
}
```

Four properties the register enforces, and `allowances.test.ts` (unit) asserts the first three
structurally:

1. **Enumerated per component and per rule.** No entry may omit `component`, `rule` or `scope`.
2. **Every entry names where the gap is argued, in *our* documents** — a section reference, not a
   URL. What the field has to prove is *"this is not ours to fix"*, and for this project that proof
   is the **port rule**: the behavior is absent from Zag, Chakra has the identical gap, and closing
   it here would be a divergence. An issue number would prove something weaker and something we do
   not do — that we are waiting on a third party. **We use Zag; what Zag does not have, we do not
   have, exactly as Chakra does not.** An entry with no reference is a defect someone decided to
   keep quietly, which is a different thing and is not what this register is for. — D-110.
3. **No wildcard.** `component: "*"` and `rule: "*"` are type errors.
4. **An allowance that stops being needed is a failure.** The helper asserts *both* directions: a
   violation not in the register fails the test, **and** a registered allowance whose rule produced
   no violation fails it too, with `allowance no longer needed — the upstream fix landed; delete this
   entry`. That is `component-blueprint.md` §9.3's rule, mechanised.

### 4.3 What the register's contents are, and where they live

**`definition-of-done.md` §5** — the live rows, the retired ones, and the argument behind each. Two
properties of that list belong here because they are properties of the apparatus rather than of any
row:

- **Every row is *expected*, and the baseline is `component-blueprint.md` §9.2's**, not the six
  hope-ui's ZagDialog measured. It is predicted from the reference sources, not measured — no package
  exists and axe has not run — which is why it is assumption **P5-C** and not a fact.
- **A component's default is zero**, and that is credible rather than optimistic because the cost
  **does not generalise**: it belongs to the modality stack, and ZagListbox's full-anatomy assertions
  came back clean against a closure that pulls no `@zag-js/aria-hidden` at all (`prior-art.md` §7).

---

## 5. The §0 checks — two checks, not one grep

`CLAUDE.md` states the constraint at two boundaries and `plan.md` §0 gives the two scopes. P7 writes
the enforcement, and the enforcement is **two scripts with different scopes and different
instruments** — settled at the P4 gate on a worked case (`zag-solid-adapter.md` §5.1).

| | Scope | Instrument | Script |
|---|---|---|---|
| **The rule proper** | Our own source **and the whole dependency closure** | A **manifest** check — a dependency is judged by what it *is* | `check:no-cij-manifest` |
| **Hygiene on ourselves** | **Our own source only** | A **source grep** — our code is judged by what it *does* | `check:no-runtime-sheet` |

### 5.1 `check:no-cij-manifest`

Walks the installed closure (`pnpm ls --json --depth Infinity`, plus the lockfile as a
cross-check) and fails on any entry matching `@emotion/*`, `styled-components`, `goober` or
`stitches`. It runs against the **installed** tree, not `package.json` alone, because a transitive
edge is the one nobody adds deliberately.

**A failure here is a stop, not a workaround** (`zag-solid-adapter.md` §5.4): it would mean a
dependency had taken a styling dependency, which breaks build-time extraction and takes the
distribution model with it. The response is to not ship that machine's component and to file
upstream. There is no local mitigation, which is exactly why it is cheap enough to run on every
install.

### 5.2 `check:no-runtime-sheet`

Greps **`packages/*/src/**` and `apps/docs/src/**`** — ours, tests excluded — for `insertRule`,
`adoptedStyleSheets`, `new CSSStyleSheet`, `createElement("style")`, `document.head.append*` and
`<style`. Zero hits, no allow-list.

**The `apps/docs/src/**` path is P8's addition** (`docs-site.md` §8 row 1), and it is not
completeness for its own sake: the docs app is our source too, it is the *likeliest* place a runtime
stylesheet appears — a client-side highlighter, a theme toggle, a playground shortcut — and it is the
most visible place for a reader to conclude the rule is negotiable.

It is deliberately over-catching. A hit is adjudicated on one question — *does this serialize
component styles at render time?* — and the answer for our own code should always be that the line
should not exist.

### 5.3 What merging them would have wrongly failed — in both directions

This is not hypothetical; the P4 audit ran the grep over the machine set and produced four hits
(`zag-solid-adapter.md` §5.3):

**Merging *up* — applying the source grep to dependencies** fails:

- `splitter.dom.ts:67-79` — `setupGlobalCursor` puts a `<style>` in `document.head` holding
  `* { cursor: <x> !important }` for the duration of a drag, removed on drag end. One static rule, no
  component styles, irreducible to an inline `style` on purpose: only a `*` selector can beat every
  descendant's own cursor. Zag's own types call it *"the injected splitter cursor stylesheet"* and
  give it a `nonce` prop for CSP.
- `utils/registry.ts:249-264` — the same mechanism, exported from the package entry.
- `number-input.dom.ts:100` — `el.innerHTML = '<svg …>'`, the scrubber cursor. Not a stylesheet at
  all.
- `@zag-js/auto-resize` — `ghost.innerHTML` on a hidden measuring element. Not a stylesheet.

**Splitter was audited and it ships, unchanged, with Chakra's behavior intact.** Excluding it would
have *removed* behavior Chakra has, which the port rule treats as a divergence in exactly the way
adding behavior is. A merged check would have cost the library a component on a false positive.

**Merging *down* — applying only the manifest check to ourselves** fails to catch the case the grep
exists for: nothing in a manifest stops our own `system/presence` from growing a "just inject one
keyframe at runtime" fix. It would install clean, pass the closure check, and defeat build-time
extraction from the inside.

### 5.4 When they run (`zag-solid-adapter.md` §5.5)

- **Question 1 (the grep)** was run at P4 against the reference checkout — `main` at `421844f`, one
  commit-set from the published `1.43.0` — so the P4 result is **provisional on the published
  tarballs**.
- **Question 2 (the manifest)** needs the *installed* closure and therefore runs first at **step 2**,
  as a line in the milestone-one gate (`zag-solid-adapter.md` §6.5), which is also where the P4
  result stops being provisional.
- **Both re-run on every Zag minor**, folded into `testing.md` §11's `@zag-js/*` row alongside the
  anatomy diff, **diffing against the four recorded hits** — so a *new* injection site in a future
  release surfaces as a diff rather than blending in.

---

## 6. The lint rules

Three rules plus one census. They ship as a single script, `check:style-contract`, an AST pass over
`packages/*/src/**` using **oxc-parser** — already in the toolchain through tsdown/rolldown, so the
rules read the same tree the build does. Biome stays the formatter and the general linter; a
GritQL plugin mirroring rules 1 and 3 is an editor-time convenience, never the enforcement, because
the enforcement has to run in CI and has to be able to walk a call's argument shape.

### 6.1 Rule 1 — `style-prop-static-value` (route 3 used as route 1)

**The rule.** A style-prop value in our own source must be one of: a literal, a token reference, a
member of a value set the preset's `staticCss` declares, or a `var(--…)` string. Anything else is an
error.

**Why it exists.** `plan.md` §3.5's three routes are the API contract, and **route 3 used
accidentally as route 1 fails silently** — `<Box w={someNumber}>` computes a class nobody generated,
renders nothing, and passes every class-name assertion. This is the loud half of the contract
(`component-blueprint.md` §5.4 mechanism 1); the coverage check is the quiet half, and computed-style
assertions are the third.

**Cost if it does not exist.** The eight CIJ-marked implementations of `roadmap.md` §3.1 are
conversions *to* route 3 — `aspect-ratio`'s `paddingBottom`, `grid-item`'s `span ${n}`,
`input-group`'s `calc(var(--input-height) - ${offset})`, `simple-grid`'s `repeat(${n}, …)`,
`float`'s offset, `bleed`, `flex`, `square`/`circle`. Every one of them is a place where the
pre-conversion code compiles, type-checks, renders, and is wrong. Without the rule, the conversions
are a checklist someone works through once.

**Lands at step 3**, with the styling seam — before Workstream B (step 6) performs five of the eight
conversions, and before B3 does `input-group`'s.

### 6.2 Rule 2 — `require-style-source` (the style-prop collision)

**The rule.** Any `renderStyled({ … })` call whose `props` argument is a `mergeProps(...)` result
must also pass `styleSource`. A two-node AST match.

**Why it exists.** `renderStyled` computes its style-prop key list once, as
`Object.keys(props).filter(isCssProperty)`. In hope-ui that `props` was the consumer's own props; in
a machine part it is the **merged bag, which contains the machine's emitted DOM attributes**
(`component-blueprint.md` §4.1.1). The live case is in the checkout today:

```bash
grep -n 'size:' __reference-impl__/zag/packages/machines/editable/src/editable.connect.ts
```

`editable`'s `getInputProps()` emits a top-level **`size: 1`** — the HTML attribute that makes the
input auto-resize — and `size` is a style prop here by construction, because addition 3 adopts
Chakra's five `html*` renames precisely so that bare `size` means the CSS one. Fed a merged bag,
`renderStyled` folds the machine's `size` into `css({ size: 1 })`, the attribute never reaches the
`<input>`, autoresize silently stops working, **and the class-name assertion passes**.

**Chakra does not have this bug structurally rather than deliberately** — its layering is
`chakra(ArkDialog.Content)`, so the factory only ever sees the consumer's props. Our layering is
flat, so what Chakra gets from nesting we have to say out loud.

**Cost if it does not exist.** One silently dead HTML attribute per part that forgets the argument,
with no failing test anywhere — and `dir`, emitted at **320 sites** across the machine set, is the
near-miss that would have been catastrophic rather than local.

**On P5-D.** The rule is written in its **structural** form — `mergeProps` ⇒ `styleSource` — which is
total and does not depend on whether `styleSource` closes the whole class of collisions. **P5-D**
asks something narrower: whether any key a `connect()` emits still collides once `styleSource` is in
place. That is §6.4's census, and if it ever answers *yes*, the addition is a per-part deny-list
beside the rule, not a change to it.

### 6.3 Rule 3 — `no-class-name-assertion`

§2.4. Scoped to `**/*.{browser,ssr}.test.tsx`; `unit` is exempt by construction (§2.3).

### 6.4 The census — `check:style-prop-collisions` (P5-D's gate, and `dir`'s tripwire)

Not a lint rule: a test that runs the machines. For every machine `@chakra-ui-solid/components`
consumes, it instantiates the machine, calls every `get*Props()` getter, collects the union of
top-level keys, and intersects it with the generated `isCssProperty` vocabulary.

Two assertions:

1. The intersection equals a pinned set. Today that set is `{ size }` — `editable`'s, already closed
   by `styleSource`. A new member is a new collision and a red build.
2. **`dir` is asserted to be *outside* the vocabulary.** `direction` is the CSS property and `dir` is
   not among Chakra's 95 shorthands, so it is safe today — but "safe" here is a fact about a
   generated `isCssProperty` produced from *our* config, and adding a `dir` alias under `plan.md`
   §2.2's aliasing rule would break every part of every component, silently. This assertion is what
   makes that unconstructable rather than merely unlikely.

Runs per batch, because the vocabulary it intersects grows with the machines we consume.

### 6.5 The answer to `docs-plan.md` §2 **D-2**

> *"Does the route-3 lint rule exist by the time this page ships? If not, §1.2 section 4 says so
> rather than implying it."*

**Yes, by five steps, and with one qualification P8 must carry.**

- The rule lands at **step 3**, with the styling seam (§6.1) — because Workstream B's route-3
  conversions at step 6 and B3's at step 7+ depend on it. `/docs/styling/static-extraction` ships with the
  docs site, which is the last step of the build order (`brief-plan` §5 step 8).
- **The qualification: the rule runs on *our* source, not the consumer's.** The page's reader is a
  consumer, and their route-3 mistakes are in their files, scanned by their Panda run. So §1.2
  section 4 may state that the rule exists and what it enforces, and **must not** tell a reader to
  run it on their own code.
- **What P8 writes instead**, in section 6 (*"How you find out it broke"*): the three mechanisms that
  *do* reach a consumer — computed-style assertions in their own tests (§2), the coverage check's
  behaviour and its failure output (§3.6), and the fixture-backed catalogue that keeps the page's own
  ✅/❌ rows true (`docs-plan.md` §1.4).
- **What changes for P8 relative to the open question:** section 4's route-3 row loses its "if the
  rule does not exist yet" hedge, and gains one sentence saying the rule is the library's own and a
  consumer-facing equivalent is not shipped at v1. That is a scope statement, not a caveat.

---

## 7. Storybook — the local playground

**This section defines no artefact.** It is the one thing in this document with no script, no CI job
and no failure output, and it says so at the top rather than at the bottom: **nothing automated
opens a story** (**D-133**). What it still owns is the configuration in §7.2, which is not optional
and whose absence is silent.

### 7.1 Scope, restated because it decides what is *not* built

**A local playground.** `pnpm storybook`, look at a component, close it. Not user-facing docs — the
docs site is a separate deliverable on TanStack Start (`docs-plan.md`). No MDX authoring, no
published build, no visual-regression suite, no addons, and **no CI job**.

### 7.2 The warm-up and the pin — P7's configuration, once per preview

Storybook 10.5's `enhanceContext` loader replaces `HTMLElement.prototype.focus` with an **accessor**
whose getter reads `this.ownerDocument`. `@zag-js/focus-visible`'s `setupGlobalFocusEvents` reads
that property **off the prototype**, so the getter runs with `this === HTMLElement.prototype`;
`ownerDocument` rejects a non-element receiver and throws `TypeError: Illegal invocation` before the
optional chain can help. The throw escapes into the machine's effect, Solid halts the reactive system
with `[REACTIVITY_HALTED]`, and **every story renders nothing** (`prior-art.md` §5.3).

```ts
// .storybook/preview.ts — module scope, above every import that pulls a machine
import { trackFocusVisible } from "@zag-js/focus-visible"

// Storybook 10.5 replaces HTMLElement.prototype.focus with an accessor whose getter throws when
// read off the prototype. Zag reads it exactly that way. Story modules evaluate before Storybook's
// loaders run, so warming the tracker here — while `focus` is still a plain data property — makes
// every later call an early return. See prior-art.md §5.3; pinned Storybook version below.
trackFocusVisible({ onChange() {} })
```

Three lines plus a version pin in the catalog. **Per-component cost: zero** — `setupGlobalFocusEvents`
is once-per-window and every later call early-returns (`component-blueprint.md` §1.3). Since every
Zag machine pulls focus-visible tracking, this reaches the whole library rather than one component,
which is why it is configuration rather than a workaround.

The warm-up is **measured, not predicted** (**D-130**). The same read, in the two places, on the same
Chromium driven by the same Playwright:

| | `HTMLElement.prototype.focus` is | reading it off the prototype |
|---|---|---|
| Storybook 10.5.7 | an **accessor** | **throws `TypeError: Illegal invocation`** |
| the `browser` Vitest project | a **data property** | returns a function |

**Deleting the warm-up has no failing test to announce it.** It crashes every story that uses a
machine, and the symptom — a blank canvas plus `[REACTIVITY_HALTED]` in the browser console — is
visible only to whoever runs `pnpm storybook` next. It reaches nothing else: the docs app has no
such loader, so §7.3's real gate would stay green through it.

### 7.3 There is no story gate, because a story is not the validation surface

`prior-art.md` §8.1's fourth rule has a specific origin: ZagListbox's stories were written,
typechecked, linted and committed, every one of them crashed, and nobody knew because nobody opened
them. **The rule stands; its subject moves.** What proves a component works is **a real app using
it** — `apps/docs`, which installs the published packages, resolves them through `exports` → `dist`
under the `"solid"` condition, and runs its own Panda build (`docs-site.md` §1.1). A story is a
convenience for the author; a docs example is the consumer path.

So the ZagListbox failure is caught by **`check:docs-examples`** (`docs-site.md` §4.1), which is a
real gate and a stricter one: every example typechecks, imports only real subpaths, **mounts in the
`browser` project** with no console error and a non-empty root, and runs axe. Nothing about Storybook
is asserted anywhere, and no story is required to exist (**D-133**).

**A story may therefore be broken on `main`, and that is accepted rather than overlooked.** It costs
the author a debugging session the next time they open the playground, and it costs nothing else,
because no shipped artefact and no other check reads a story.

**Ruled out, and why, so it is not re-derived.** `composeStories` under Vitest would not have been a
substitute even if a gate were wanted: it reproduces neither the `focus` accessor above nor the
`hydratable: false` compile below, so it is green on precisely the two failures Storybook is the only
witness to. §13's shape — driving the built Storybook — is what a gate would have to be. Neither is
built.

**The real gate exists from S3b, and it is the docs app's.** `check:docs-examples` runs
`apps/docs/src/examples/__tests__/examples.browser.test.tsx` in the `browser` project, and it was
verified against deliberate failures rather than trusted: an example that **throws** at mount, and
an example that **renders nothing**, both pass Biome, `tsc` and `check:style-contract` and both fail
here. That is the ZagListbox failure, caught — by the surface a consumer actually shares.

### 7.4 What only Storybook can see

Storybook compiles with `hydratable: false`, and that is the whole point:

> **A static child plus a dynamic sibling inside an element with a restrictive HTML content model
> (`<select>`, `<table>`) crashes the non-hydratable compile.** `babel-preset-solid` omits closing
> tags unless `hydratable: true`, the parser reparents the placeholder comments, and the generated
> walk throws on a `null`. The fix is to make the restricted element's children a **single** dynamic
> expression (`component-blueprint.md` §10.4).

No Vitest project here compiles that way, so **no test in any of the three projects can see it.** It
reaches `select`, `combobox` and `listbox` — every component with a hidden native `<select>` — which
is **B5** (`roadmap.md` §9.2).

**Two corrections from S3b, and neither deletes the hazard.** First, the crash **did not reproduce**
at `babel-preset-solid@2.0.0-beta.32`: four shapes were compiled at `hydratable: false` and none
produced a null-dereferencing walk, and a rendered probe story opened cleanly. The non-hydratable
output omits the markers entirely, so there is nothing for a restrictive parser to reparent — which
is the mechanism this section names. Second, `vite-plugin-solid@3.0.0-next.23` defaults to the
**native (oxc)** backend, so the compile a consumer's Storybook performs is not the Babel one the
claim was written against. The paragraph above is left standing because four shapes at one version
is not a refutation of a hazard whose named victims do not exist yet — but it is a **prediction with
no current evidence**, and B5 is where it acquires some (**D-131**).

**And B5 can no longer discharge it through Storybook.** With no story gate, B5's proof has to be a
`select` that works in `apps/docs` — a docs example that mounts, which `check:docs-examples` runs —
plus whatever the compile turns out to do by then. If the hazard is real and only the non-hydratable
compile shows it, the docs app will not see it either, and B5 owns saying so.

---

## 8. The distribution, styling-config and structural checks

Each one is a script — except `check:floating-zindex`, which is a browser test and says so. Each
failure line below is what the failure *means*, not what it prints.

| Script | Asserts | A failure means |
|---|---|---|
| `check:exports` | **No export resolves to `jsx/index`** | The Solid 1.x factory is reachable. It imports `splitProps` (gone in 2.0) and `solid-js/web` (does not exist; it is `@solidjs/web`), so a consumer's first import throws at load — `plan.md` §3.1, §4.2 |
| `check:exports` | **`./is-valid-prop` exists and resolves *inside* `jsx/`** | Either the module `renderStyled` imports is unresolvable (loud), or someone "fixed" it by pointing at the standalone `@pandacss/is-valid-prop`, which knows only Panda's defaults — so **our** utilities and tokens stop being recognised as style props and every custom style prop silently becomes a DOM attribute. The rule is *not* "expose nothing from `jsx/`" (`plan.md` §4.2) |
| `check:exports` | **No published `package.json` exposes a `.css` file** in `exports`, `files` or `style` | We have grown the second, half-functional support tier `plan.md` §4.4 rejected — one that cannot carry consumer style props or consumer theming, and that every later knob must be documented twice for |
| `check:externals` | `@chakra-ui-solid/styled-system` is **external, not inlined**, in the built bundle | Two `css` runtime instances in the consumer's app. Silent, and it defeats the single-instance guarantee that makes `hash: false` merely useful rather than load-bearing (`plan.md` §4.3) |
| `check:buildinfo-fresh` | The published `dist/panda.buildinfo.json` matches a fresh `panda ship` | Consumers extract against a stale variant surface: anything added since the last ship is silently unstyled. This is option B's one failure mode, and mitigating it mechanically is why B was chosen (`plan.md` §4.1) |
| `check:peer-panda` | `@pandacss/dev` is a **`peerDependency`** on `preset`, `styled-system` and `components`, **with `peerDependenciesMeta.optional` unset** | `npm install`, run the app, every component renders naked, and no tool anywhere says why — `plan.md` §0.2 at project scale. The peer warning *is* the enforcement; optionality would delete it (`plan.md` §4.4) |
| `check:hash-config` | The published `styled-system` was generated with `hash: false` | Our runtime emits hashed names the consumer's sheet does not carry. Total silent unstyling, and the coverage check's canary (§3.5) is the other half of the same guard (`plan.md` §3.4) |
| `check:resolution-sync` | `tsconfig.base.json#paths`, `vitest-aliases.ts` and the docs app's Vite alias **agree** | A package resolves to a stale sibling `dist`, and the build passes. Drift between the three is silent by construction, which is why they are one unit with a check (`plan.md` §9) |
| `check:preflight-hidden` | The emitted sheet contains a `[hidden]` rule that beats a recipe's `display` | The `hidden`-vs-`display` tax comes back — a closed dialog leaves a full-viewport backdrop over the page, a listbox check glyph is visible on every row (`prior-art.md` §5.1). The check asserts the **outcome**, so it is correct under either answer to **P3-E**: either Panda's preflight carries it or our preset's `globalCss` ports Chakra's rule verbatim |
| `check:data-attr-vocab` | Every `data-*` attribute/value pair the preset's conditions select on is emitted by some consumed machine's `connect()` | Assumption 9's downside, priced in `definition-of-done.md` §8.1. Two tiers: at step 4 the emitting side is read from each machine's `.connect.ts` sources; per batch it is read from a real machine driven through its states |
| `check:preset-token-resolution` | Building the preset with and without the `theme.extend.tokens.cursor.switch` delta changes the emitted `cursor` declaration — and the build **without** it does not error | **P6-F.** Either Panda drops the declaration silently — in which case our one-key delta restores Chakra's behavior — or it errors, which is a much larger finding (`roadmap.md` §1.3c; `definition-of-done.md` §8.3) |
| `check:alias-coverage` | Every one of Chakra's 95 shorthands satisfies the generated `isCssProperty` | **P3-D** made runnable: the failing set *is* the alias list our preset must declare, so the check both verifies and produces it |
| `check:responsive-grain` | `chakraConfig({ responsive })` at each of its three grains emits the expected number of `@media` rules, and the default emits none | **P3-B**, and the guard on `plan.md` §3.8's opt-in — the one place where types cannot follow the flag, so forgetting the opt-in is a silent unstyling with no type error |
| `check:dark-selector` | The generated `_dark` condition matches the selector the docs tell consumers to put on `<html>`, verified by a computed-colour assertion under that attribute | **P3-F**. Chakra ships color mode as a consumer snippet, not library API (`plan.md` §7.1), so the selector *is* our whole contract |
| `check:anatomy-parts` | For every shipping component: **one part component per machine anatomy key, and one per unique recipe slot** — plus the `RootProvider` / `PropsProvider` / `Context` exports its `roadmap.md` §10 row declares | The two lists are not the same set and neither contains the other (`component-blueprint.md` §3.1). A missing machine part is an ARIA relationship the machine emits and nothing consumes; a missing slot component is a style block nothing wears. Both are silent. It reads the anatomy from the machine and the slot list from the generated recipe — **deduplicated first** (§3.3) — so it cannot be satisfied by a stale hand-written list |
| `check:floating-zindex` | **A browser test, not a script.** The computed `z-index` / `--z-index` on a floating element survives interleaved reactive re-renders and `raf` writes, with the measured value recorded | `@zag-js/popper` writes `--z-index` **imperatively** into the floating element's `style` attribute inside a `raf`, while Solid binds that same attribute reactively, with a `MutationObserver` watching it — two writers on one attribute, one watching the other (`roadmap.md` §8.1). **Nine Chakra components inherit whatever it costs**, and nobody has measured it. Introduced at step 5b as the floating probe's whole deliverable: a number, and either a sentence in the blueprint or a rule (**P6-A**) |
| `check:no-hand-written-data-attrs` | Zero `data-*` string literals in `packages/components/src/**` (tests excluded) | We write none — every state attribute comes from the machine's `connect()` (`component-blueprint.md` §3.7). A speculative translation getter is **invisible** when unnecessary, which is why the rule is "do not add one" and this is how that is checked |
| `check:commit-trailers` | No commit message contains `Co-Authored-By`, `Co-authored-by` or *"Generated with"* | `CLAUDE.md`'s git convention, as a commit-msg hook plus a CI pass over the branch's commits |
| `check:doc-index` | `__internal__/INDEX.md` is byte-identical to a fresh `pnpm docs:index` | The index disagrees with the documents, so a citation resolves to the wrong line range — §8.1 |
| `check:skill-pointers` | Every pointer in every repo-authored skill under `.agents/skills/` resolves, and every line of one is a pointer | A skill is a reading order over the corpus and nothing else. A dead pointer sends a reader to a section that is not the one named; a rule restated in a skill is a second copy, and the copy is the one that goes stale — §8.2 |
| `check:context-budget` | No `##` section and no sharded file exceeds **25 KB**, `CLAUDE.md` does not exceed **16 KB**, and every allow-list row is still needed | The corpus grew 179 KB in one day of implementation commits. A unit past the ceiling is one nobody consults precisely — it gets grepped and guessed at instead, which is the 40 KB read the index was built to make inexcusable — §8.3 |

**The per-check definitions are files, under [`testing/`](testing/).** One per check, named for its
anchor — `§8.2` is `testing/8.02-skill-pointers.md`, zero-padded so the directory sorts in order.
The table above is the routing surface and stays here; a definition is opened one at a time.

| § | The check, and the file it lives in | What that file owns |
|---|---|---|
| **8.1** | [`check:doc-index` — the anchor index](testing/8.01-doc-index.md) | Why the index is generated, what it reads, and the four things it cannot say |
| **8.2** | [`check:skill-pointers` — the repo-authored skills](testing/8.02-skill-pointers.md) | The citation grammar, the two shape rules, and why it is not merged into §8.1 |
| **8.3** | [`check:context-budget` — the growth guard](testing/8.03-context-budget.md) | The three ceilings and where 25 KB comes from, the allow-list register, and the transcript half that is not a gate |

**Why this section is sharded and §1–§7 are not.** §8 is a container of independently-citable units
that grows by one every time a check is written, and `definition-of-done.md` §7b names **25** still
to come — most of them owing a definition here. It reached 16.7 KB carrying **two** definitions, and
§8.3 is 10.2 KB: unsharded, this section would be **~27.5 KB — over the ceiling on the very commit
that introduces it.** The other sections are single arguments that do not grow with the build.
This is `decisions.md` §3's situation one document over, and it takes §3's answer — the machinery
D-163 built is general, and this is its second use.

---

## 9. The attribution checks

`decisions.md` §6 items 6 and 7 assign these here. **Both failure modes are silent and green**, which is
why they are scripts rather than a review habit (`CLAUDE.md` obligation 5).

**The registry.** One checked-in file, `attribution.config.ts` at the repo root, listing every
expression-tier derivative: `{ file, upstreamProject, upstreamFile, license, package }`. Every check
below reads it, so the registry is the single place a new derivative is declared.

**`package` is `string | null`, and `null` is the docs app.** It names the owning directory under
`packages/`, or says no package publishes this file. An entry with `package: null` owes the registry
entry, the `@license` header and the root `NOTICE.md` row, and is skipped by the three obligations
whose subject is an npm consumer — a package `NOTICE.md`, the `files` array, and the header surviving
into `dist/`. `docs-site.md` §3.3 is the table and the argument; this row is the mechanism.

Its contents today are **eight entries**, of which one is outside `packages/`:

- The seven `zag-solid` fork files — `machine`, `bindable`, `merge-props`, `normalize-props`, `refs`,
  `track`, `index` — each naming `chakra-ui/zag` → `packages/frameworks/solid/src/<file>.ts`
  (`zag-solid-adapter.md` §7.1).
- **`apps/docs/src/components/site/icons.tsx`**, `package: null` — Chakra's bolt in three forms,
  from `apps/www/components/site/icons.tsx` and `apps/www/components/logo.tsx` (**D-173**).

And **one entry not yet written**: the `container` recipe delta in `@chakra-ui-solid/panda-preset`, a
recipe **body**, arriving with the Container component at step 6a. It brings the preset package its
first `NOTICE.md`. Its tier, its provenance and the allow-list entry it retires are
`definition-of-done.md` §6.

**The second list — `noticeOnlyPaths`.** Six root-`NOTICE.md` rows owe a row and can carry no
header: a directory (`apps/docs/src/content`), a binary (`favicon.ico`), and four framework logos
that are another project's mark rather than our derivative. Each is declared with the reason it
cannot be an entry. It exists so the orphan scan can read `apps/` rows at all — without it every one
of them reports as a row with no entry (`docs-site.md` §3.3).

**What the registry must not gain:** the `theme.extend.tokens.cursor.switch` key. A one-word token
value is not expression (`roadmap.md` §1.3c), and a check that demanded a header for it would be
wrong.

| Script | Asserts | A failure means |
|---|---|---|
| `check:license-headers` | (a) every registry entry's source file opens with an `@license` header of the right shape, naming the **upstream file**; (b) **the header is still present in `dist/`** — entries with `package: null` build no `dist/` and are skipped by (b) alone; (c) `comments.legal` is pinned `true` in `tsdown.config.base.ts`, **with its comment** | (b) is the load-bearing one. Rolldown strips every unmarked block comment, so an untagged provenance paragraph vanishes from `dist/` and the published package becomes an unattributed derivative — of the project we are porting — silently, with a green build (`CLAUDE.md` obligation 5). (c) is how (b) breaks: unpinning `comments.legal` is a one-word edit nobody reviews |
| `check:notice-rows` | Every registry entry has a row in the root `NOTICE.md` — **and** in its own package's, unless `package` is `null`; every `noticeOnlyPaths` path has a root row; and **no `packages/` or `apps/` row exists without an entry in one of the two lists** | A stale row claims a derivation that is not there; a missing row is the obligation itself. The root file is the audit surface, the package file is the one that travels in the tarball and the only one a consumer who never visits the repo will see (`CLAUDE.md` obligation 3) |
| `check:package-files` | Every published package's `files` contains `LICENSE` and `NOTICE.md`, and **every file named in an `@license` header's *"distributed with this package as …"* clause is actually in that array** | That clause is a promise to the consumer and it is the easiest one in the repo to break — the default `files` ships `dist` and nothing else (`CLAUDE.md` obligation 4) |
| `check:readme-disclaimer` | **Every published package's README** carries the disclaimer, not just the root's | `decisions.md` §6 item 7, and the reason it is a check: a per-package README is written once per package and then never looked at again. It runs at **publish time** — a `prepublishOnly` gate plus a release-workflow job — so a new package cannot ship without it |
| `check:fork-drift` | Upstream `@zag-js/solid`'s `packages/frameworks/solid/src/` file set and contents against the fork; and whether upstream's peer range admits `solid-js@2` | Not a failure — a **report**. The fork is meant to be retired: the day the peer range admits 2.x, it is a deletion candidate (`zag-solid-adapter.md` §1; `testing.md` §11) |

**Commit order matters and is checkable.** `zag-solid-adapter.md` §7.3's checklist requires the
attribution to land **in the same commit as the code**. `check:license-headers` and
`check:notice-rows` run on every push precisely so that a commit adding a registry entry without its
header, or a file without its registry entry, fails on the branch rather than at publish.

---

## 10. The bundle measurement — `check:bundle`

**Method.** `esbuild --bundle --minify` over a package or component entry, gzipped, plus the
package's external closure counted from the lockfile. Recorded per measurement point into
`bundle-budget.json`, which is **updated deliberately in the commit that moves it**; the check fails
when the measurement and the budget disagree. The budget is the artefact, not the number — an
unexplained growth is the failure, not a threshold.

**Three points where the number means something, and they are different numbers.**

| Point | What it is | Compared against |
|---|---|---|
| **Milestone one** | The adapter's own **fixed weight** — what every Zag component pays before any machine. Milestone one installs `@zag-js/{core,types,utils}` only | **Nothing. It is a new number nobody has** (`zag-solid-adapter.md` §9.2). It becomes the baseline the per-component deltas are measured *from* |
| **Milestone 5** (Dialog) | The first real machine closure | **The first comparison against `+13.4 KB gz`.** `brief-plan` §5 step 2's framing expected this at milestone one; it cannot be, because no machine closure exists there |
| **End of B8** | The first library-wide figure | Nothing prior. There is no earlier honest total |

**Per-batch closure growth is the metric; per-component is an arithmetic error.**
`roadmap.md` §11: **B1 adds five components and zero new machine packages** — Drawer and ActionBar
reuse `dialog` and `popover` — while **B4 adds eleven components and eight machine packages**.
Quoting a flat per-component cost across a library where three public components share the
`radio-group` machine repeats exactly the error `prior-art.md` §10.2 rows 6 and 8 correct. So the
check records, per batch: new external packages, total closure, and the gzipped delta of the batch's
entries — and it prints all three, because the first is the one that explains the third.

The real closure to measure against is **43 external packages before transitives** — 41 on
`components` (37 machines plus `collection`, `focus-trap`, `highlight-word`, `dom-query`) and 2 on
`system` (`presence`, `i18n-utils`) (`roadmap.md` §11).

**Two figures to quote carefully**, because earlier documents quote them wrongly
(`zag-solid-adapter.md` §9.2): the listbox closure at 1.43.0 is 8 packages of which **5** are shared
with dialog's 11 and **3** are new; and the `untrack` seam is **2 call sites in the component and 2
in the fork**, with the component-layer count at the fork's tip being **0**.

---

## 11. The scheduled upstream checks

`testing.md` §11's tracking policy, turned into jobs — one per upstream, because a single "check for
updates" habit produces a single kind of check and these break different things. Each posts its diff
as the PR's job summary. **What fires them and who is expected to read that summary is
`definition-of-done.md` §9.**

| Trigger | Job | What it runs | What it protects |
|---|---|---|---|
| `@chakra-ui/react` minor | `check:parity-matrix` | Diff `packages/react/src/components/`'s folder list against `roadmap.md` §4's 115 rows; assert `@chakra-ui/panda-preset` released **the same version** — they are lockstep, both `3.36.1` today, and a preset that lags is the signal to hold; re-derive the six unstyled-by-key components (**P6-C**) | New components, renamed props, changed anatomy — and an allow-list entry whose premise expired |
| `@chakra-ui/panda-preset` minor | `check:css-coverage` + a recipe-registry diff | The 18 + 56 registry keys, the seven duplicate slots, then the full coverage check | Under the no-runtime-CSS rule a removed or renamed variant **silently unstyles** rather than erroring. Not optional on a preset bump |
| `@zag-js/*` minor | **`check:anatomy-diff`** + `check:no-cij-manifest` + `check:no-runtime-sheet` + `check:data-attr-vocab` | The anatomy command is `roadmap.md` §1.2's, verbatim — 51 machines, 49 anatomy exports, 406 parts — diffed against our part components; then the §0 audit re-run against the four recorded hits (§5.4) | Parts added or renamed, and `data-*` drift — the two ways a machine bump reaches a part component (`roadmap.md` §1.4) |
| `@zag-js/solid` any | `check:fork-drift` | §9 | Fork drift, and the retirement signal |
| Panda minor | `check:panda-artifacts` | Regenerate and diff the generated artifacts (`css`/`cva`/`sva` signatures, `is-valid-prop`, the exports map); re-assert the no-runtime-sheet property **over the generated output**; assert we are still on Panda 1.x while the preset declares `@pandacss/types@^1.4.2` | The generated surface is three of this repo's assumptions (**P5-A**, **P5-B**, **P7-A**) and one of its checks' inputs |
| Any upstream **major** | The legal re-check | Re-verify the `license` field and `LICENSE` copyright line of every package in `NOTICE.md`, and re-stamp it with the date | A major is when a project changes its license, and the only way to notice is to look |
| Each release of ours | `check:readme-disclaimer`, the `dist` job, and the `NOTICE.md` re-stamp | §8, §9 | A license table with no date is a table nobody trusts |

---

## 12. The CI job map

**Seven** jobs. Grouped so that a red build names a category before anyone opens a log. It was eight
until S3b deleted `stories` (**D-133**) — deleted rather than stubbed, because a job with nothing to
run is a green tick for work no machine performs.

| Job | Runs | Contains |
|---|---|---|
| `verify` | every push | Biome; `tsc --noEmit`; `check:style-contract` (rules 1–3); `check:test-projects`; `check:resolution-sync`; `check:commit-trailers`; `check:doc-index`; `check:skill-pointers`; `check:context-budget` (the static half only — §8.3.2 has no CI input) |
| `constraint` | every push | `check:no-cij-manifest`; `check:no-runtime-sheet` |
| `test` | every push, matrix ×3 | `test:unit`, `test:ssr`, `test:browser` — the browser leg installs Chromium with `playwright install --with-deps --only-shell`, and carries `check:floating-zindex` from step 5b. Every leg fails on a `mount()` diagnostic |
| `styling` | every push, after `codegen` + `cssgen` | `check:css-coverage`; `check:coverage-allowlist`; `check:anatomy-parts`; `check:hash-config`; `check:preflight-hidden`; `check:data-attr-vocab`; `check:style-prop-collisions`; `check:no-hand-written-data-attrs` |
| `docs` | every push, after `codegen` + `cssgen` | **Live from S3b:** the docs build (prerendered, not an SPA shell); `check:docs-inventory`; `check:docs-consumer-config`; `check:docs-examples`. **Joining at step 4:** `check:extraction-fixture`, `check:docs-links`, `check:docs-no-server-fns`, `check:docs-forbidden-claims`, and `check:css-coverage` against the docs app's own sheet — which is the step it first has a buildinfo to read (`decisions.md` **D-139**). A deploy step on PRs and on the release branch. **Added at P8** (`docs-site.md` §6.1, §8 row 2) — the docs app is a standing instance of the step-4 consumer gate, so its build failing is a distribution failure, not a documentation one |
| `dist` | main + release PRs | build; `check:exports`; `check:externals`; `check:buildinfo-fresh`; `check:peer-panda`; `check:license-headers` (over `dist/`); `check:notice-rows`; `check:package-files`; `check:bundle` |
| `publish` | release workflow | everything in `dist`, plus `check:readme-disclaimer`, with npm provenance |
| `upstream` | Renovate PRs only, matrix by upstream | §11 |

Turbo ordering is `plan.md` §9's and is not restated: `codegen` before anything that reads the
artifacts, `cssgen` after `codegen`, and `check:css-coverage` after `cssgen`.

---

## 13. What this apparatus assumes

Two assumptions are introduced here rather than inherited. Their **gate rows** — script, step, what
they block — are in `definition-of-done.md` §8 with every other assumption; the statements are here
because this is where the mechanism lives.

- **P7-A** — Panda's generated recipe function exposes its **variant map**, so §3.2 can enumerate the
  cross product without a hard-coded name list. Fallback: read the variant keys off the imported
  preset object, the same read `plan.md` §1.3 already does. One line either way.
- **P7-B** — **Retired at S3b, not closed** (**D-133**). It asked whether a runner could drive a
  Solid 2.0 Storybook build and observe per-story console errors. It can — both halves were measured
  before the question was withdrawn (D-130) — but **nothing depends on the answer any more**: there
  is no story gate, so the assumption has no consequence to carry. Recorded rather than deleted,
  because the measurement is what makes §7.2's warm-up a fact rather than a prediction.

---

## 14. Where this document ends

Every rule that cites an artefact defined above lives in `definition-of-done.md`: the per-file,
per-component and per-batch bars, the two live registers, the assumption gates, the scheduled checks'
ownership, and the conventions that have no script and are labelled as such.
