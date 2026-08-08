# Prior art — hope-ui's two branches, re-measured

**Status:** written at P2. Every figure below was measured against the local `../hope-ui` checkout
and the reference checkouts on **2026-08-08**, not copied from the plan. Where a plan figure and a
measurement disagree, the measurement wins and the disagreement is recorded in [§10](#10-what-p2-contradicts--for-re-planning-before-p3).

**What this document is.** The evidence base for `chakra-ui-solid`. `../hope-ui` — same author, MIT —
already built both halves of this stack on two branches: a Panda CSS styling layer with a
Chakra-style style-props API (43 commits), and a SolidJS 2.0 fork of Zag.js's Solid adapter with a
ten-axis adoption study (7 commits). Fifty commits of findings, two of which were **wrong the first
time and later retracted**. This file exists so nobody re-derives them.

**What it is not.** An architecture document. Nothing here decides anything; P3 does that. Where the
evidence bears on a decision, it says so and stops.

---

## 0. How to read this

### 0.1 Every claim is runnable

Every path below is a real `git show` you can run from `../hope-ui`:

```bash
git -C ../hope-ui show e9c2f81:packages/components/src/system/style-props.tsx
```

A claim with no path is a claim the next reader has to re-derive. There should not be one.

### 0.2 The four refs

| Ref | Commit | Date | What it is |
|---|---|---|---|
| **`e9c2f81`** | `e9c2f816421470460a4abd6f86b6ace9ce185630` | 2026-07-14 | Tip of the **Panda era** — 43 commits from the repo's first. `feat(components): add Flex layout component port from Chakra UI` |
| **`26914d9`** | `26914d9252394a9eb8dd2da45dfec0bcebd1f394` | 2026-07-14 | Its direct child — the migration **away**. `refactor(styling): migrate to Tailwind v4 + tailwind-variants; reposition as batteries-included` |
| **`ef91b69`** | `ef91b69e4591852d710588da39899cb3e5af6c57` | 2026-07-24 | Tip of **`spike/zag-solid`**, 7 commits ahead of the point it branched from (`8dc53e9`). `spike(zag): add ZagListbox, and rewrite the adapter in SolidJS 2.0 idioms` |
| **`1dc059f`** | `1dc059fcb9045ea5f066fd6109347f0fdce5a03e` | 2026-08-08 | Current `main` — where the a11y kernel and its Apache-2.0 attribution live now |

All four verified with `git log -1 --format="%H %ad %s" --date=iso <ref>`. Commit counts verified with
`git rev-list --count e9c2f81` (43) and `git rev-list --count main..spike/zag-solid` (7).

The spike branched from `8dc53e9`, **not** from `e9c2f81` — it sits on the post-Tailwind line. So the
Panda styling layer and the Zag adapter **never coexisted in one tree**. Nothing in the prior art
demonstrates a Zag machine rendering through a Panda recipe. Every seam this document reports between
the two is inferred from one side or the other, never observed together.

### 0.3 Paths moved between refs — this is the most common way to waste an hour

Three renames land between the Panda era and today. Using a `main`-era path against `e9c2f81`, or the
reverse, returns "does not exist in" and looks like the file was never there.

| Thing | at `e9c2f81` | at `ef91b69` / `1dc059f` |
|---|---|---|
| Internal design docs | `docs/` | `__internal__/` |
| `renderElement`, `RenderProp` | `packages/primitives/src/utils/render/render.tsx` | `packages/primitives/src/render/render.tsx` |
| Kernel primitives | `packages/primitives/src/internal/<name>/<name>.ts` | `packages/primitives/src/internal/create-<name>.ts` |

Worked example — the file the plan calls `__internal__/solid-2.0-notes.md`:

```bash
git -C ../hope-ui show e9c2f81:docs/solid-2.0-notes.md            # 151 lines
git -C ../hope-ui show main:__internal__/solid-2.0-notes.md       # 246 lines
```

### 0.4 Two counting conventions, and why the difference matters

hope-ui's spike documents quote line counts **two ways**, and mixing them silently changes an
argument by up to 40%:

- **Raw** — `wc -l`. Counts comments and blank lines.
- **Code** — comment-only and blank lines excluded. The spike produced these with TypeScript's own
  scanner, so a `//` inside a string is never miscounted.

Raw counts are unsound in that repo and in this one: both mandate dense *why*-comments, so a raw
count rewards whichever side is worse documented. The spike's own `zag-dialog-comparison.md` §2
recounted its headline table for exactly this reason and found one row *"materially wrong"*.

Everything below states which convention it uses. Code-line figures here were reproduced with a
TypeScript-scanner counter and land within ~0.5% of the spike's; the residual is a tie-break on lines
holding both code and a trailing comment.

---

## 1. The headline: what the prior art proves, and what it does not

**Proven, with running code and passing tests:** Panda tokens, the Chakra-style style-props API,
`renderStyled` (the styling factory), SSR → hydrate round-trips, the ship-source distribution shape,
and **extraction without a factory** — Panda picking style props out of a hand-written component it
was never told about.

**Proven for the behavior half, separately:** a Solid 2.0 fork of `@zag-js/solid` (the adapter binding
Zag's framework-agnostic state machines to a framework) against two real machines, with a measured
verdict that the adaptation seam **amortizes** rather than compounding.

**Not proven, at all:** the recipe layer. `@chakra-ui/panda-preset` ships **18 recipes and 56 slot
recipes** — a *slot recipe* being a multi-part component's style definition, one style block per named
part. hope-ui **never wired a single one**, and never used `@chakra-ui/panda-preset` at any point in
its history. That layer is where the bulk of this project's work lives, and it is the project's
least-evidenced assumption. [§4](#4-16s-calibration--what-the-prior-art-does-not-de-risk) states this
in full, with the evidence for the negative.

**Not applicable to us at all:** hope-ui's a11y kernel. hope-ui was its own library and could hold
its own accessibility bar. This project is a 1:1 port, so the bar is *Chakra's* — and Chakra v3 is
Ark over Zag, which means every gap Zag has, Chakra has. Three of the four kernel carry-overs the
plan marks *copy, mandatory* would make us **more accessible than the thing we are porting**, which
is a deviation even though it points the pleasant way. [§8.2](#82-the-port-rule--no-a11y-beyond-zag-nothing-chakra-does-not-have)
measures each against the Chakra and Ark checkouts and strikes them.

---

## 2. The Panda era — 43 commits to `e9c2f81`

### 2.1 Why they left, and why it is not a Panda failure

```bash
git -C ../hope-ui log -1 --format=%B 26914d9
```

The message, verbatim in its load-bearing parts:

> Replace the Panda styling engine **and the Chakra-style style-props API** with a Tailwind CSS v4 +
> tailwind-variants stack, and reposition the roadmap around a batteries-included component catalog.
> Foundation only: components stay **behavior-only (no useRecipe wiring yet)**.
> […] Rewrite docs/roadmap.md as an aggregation of Ant/Mantine/MUI/shadcn/Nuxt.

It records **no technical defect in Panda**, and closes with *"Verified: typecheck, lint, unit (194),
ssr (16), browser (274), coverage-parity, build, build:storybook all green."* — i.e. green on the
Tailwind side after the swap. hope-ui stopped wanting to be a Chakra port. For a project that
explicitly *is* a Chakra port, the stack it abandoned is the right one.

The diffstat is worth one glance (`git show --stat 26914d9`): 80 files, +1058 / −5447, deleting
`@hope-ui/styled-system`, the box/flex/system style-props surface, and all three Panda theme presets.
Everything in this section exists **only** at `e9c2f81` or earlier.

### 2.2 `panda.config.ts` — and the one knob that does not transfer

```bash
git -C ../hope-ui show e9c2f81:packages/styled-system/panda.config.ts
```

```ts
export default defineConfig({
  hash: false,      // unhashed names, so our runtime css() output matches the consumer's codegen
  eject: true,      // drop Panda's default presets so preset-panda never merges in
  preflight: true,
  presets: [chakraPreset],
  include: ["../components/src/**/*.{ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
  jsxFramework: "solid",
});
```

**`eject: true` is safe there for a reason that does not hold for us.** hope-ui's preset chain
self-declares Panda's utility engine:

```bash
git -C ../hope-ui show e9c2f81:packages/themes/src/base/index.ts    # presets: ["@pandacss/preset-base"]
git -C ../hope-ui show e9c2f81:packages/themes/src/chakra/index.ts  # presets: [basePreset]
```

`@chakra-ui/panda-preset@3.36.1` does **not**:

```bash
sed -n '14,35p' __reference-impl__/chakra-ui/packages/panda-preset/src/index.ts
```

It declares no `presets` array at all, and reaches for `utilities: { extend: … }` and
`conditions: { extend: { icon: "& :where(svg)" } }` — *extend*, which presumes a base is already
there. Copying `eject: true` alongside `presets: [chakraPreset]` verbatim would drop
`@pandacss/preset-base` and take the style-prop utilities (`p`, `bg`, `_hover`) and the base
conditions (`_open`, `_highlighted`, …) with it. Every recipe in the preset would then reference
conditions that do not exist.

The fix is one line (`presets: ["@pandacss/preset-base", chakraPreset]`, or no `eject`), but the
carry-over verdict changes from **copy** to **copy with a named change**. See [§9](#9-carry-over-verdicts-with-attribution-status).

### 2.3 `jsxFramework: "solid"` must be **set** — traced to its source

```bash
git -C ../hope-ui show e9c2f81:docs/plan.md | sed -n '520,527p'
```

The plan's §1.1 reproduces this correctly. hope-ui's own reasoning, at that path:

1. **Style-prop extraction does not require Panda's factory.** With `jsxFramework` set, Panda's
   default `jsxStyleProps: "all"` extracts every style prop from **any capitalized JSX component**
   the consumer writes. hope-ui's record: its generated `styled-system/styles.css` carried
   `.bg_primary` / `.p_4` extracted from `box.stories.tsx`, whose `<Box>` is hand-written and
   registered nowhere.
2. **Recipe *variants* extract through the separate `jsx: [...]` recipe-tracking property**, not
   through the factory.
3. **`is-valid-prop` is config-aware.** The generated `isCssProperty` knows *our* utilities and
   tokens; the standalone `@pandacss/is-valid-prop` package only knows Panda's defaults.
   `renderStyled` imports the generated one, and its exports map has a dedicated `./is-valid-prop`
   subpath for it (`git show e9c2f81:packages/styled-system/package.json`).

So the rule is **"never export Panda's `/jsx`"**, not "never generate it" — stated in the package's
own description field: *"Never exports Panda's /jsx factory (Solid 1.x); hope-ui hand-writes its own
/jsx + /patterns for Solid 2.0."*

> **Reproducibility caveat, stated plainly.** Claim 1's evidence — `.bg_primary` / `.p_4` in the
> generated stylesheet — is **not independently verifiable from git**. `styled-system/` is generated
> and gitignored, and the working tree is long past the Tailwind migration. What *is* verifiable is
> the runtime half: the SSR fixture at
> `git show e9c2f81:packages/components/src/box/__tests__/__fixtures__/box-ssr.html` reads
> `<div _hk=10 class="p_4 bg_primary bdr_lg">Box content</div>` — `css()` emitting the names. That the
> consumer's *codegen* also emits rules for them rests on hope-ui's own record. It is cheap to
> re-confirm at implementation step 3 and should be re-confirmed rather than inherited.

### 2.4 `/patterns` are fair game; only `/jsx` is banned

hope-ui recorded an over-generalization **and then corrected it in-place** — the correction is in the
same paragraph as the original claim, which is why it is worth inheriting rather than re-deriving:

> *(An earlier revision of this note said hope-ui would hand-write its own `/patterns` and "never use
> Panda's" — that over-generalized the `/jsx` ban to the pure helpers; corrected here.)*

Panda's `/patterns` helpers (`flex.raw`, `getFlexStyle`, …) are **pure functions** — prop →
style-object, no Solid, no JSX. `Flex` reuses `flex.raw` for its shorthand → canonical mapping rather
than reimplementing it:

```bash
git -C ../hope-ui show e9c2f81:packages/components/src/flex/flex.tsx   # 85 lines; flex.raw at :65
```

The second reason matters more than the first: reusing the pattern **guarantees our runtime output
matches what the consumer's `panda codegen` extracts from the same pattern config**. Reimplementing
the mapping means two sources of truth for `align → alignItems`.

### 2.5 `renderStyled` — 104 lines, and the four details that cost something to learn

```bash
git -C ../hope-ui show e9c2f81:packages/components/src/system/style-props.tsx   # 104 lines exactly
```

The file is `RenderStyledOptions` plus one function. It layers style-prop extraction and class
composition over `renderElement` (the `as` / render-prop polymorphism + ref-merging primitive). Its
hard-won details, each visible in the source:

- **Style-prop reactivity comes from splitting key from value.** Which keys are style props is
  *static* for a render — the key `p`/`bg` never changes, only its value is reactive — so the key
  list is computed once (`Object.keys(props).filter(…)`) and the values are read lazily inside the
  `class` getter. Recomputing the key list reactively would be wrong *and* slower.
- **The `css` escape hatch is a trap.** `isCssProperty("css")` returns **true**, but `css` is a
  *nested* style object, not a per-prop value. Folding it in with the others emits garbage
  (`color:css_red`). It is excluded from the key list and passed as a **sibling `css()` argument**,
  which is also how it wins ties.
- **Precedence, low → high:** `recipeClass` → style props + `css` prop → consumer `class` (appended
  last, wins ties). Inline `style` is forwarded untouched and always beats a class. Pinned at
  `packages/components/src/system/__tests__/style-props.browser.test.tsx:40-60`, which asserts the
  index of each class within the composed string.
- **SSR-safe by construction** — the `class` getter is pure render-time computation: no DOM, no
  effects, no generated ids. With `hash: false`, `css()` emits stable names, so server and client
  agree.

Two more things the source says that the plan does not:

- **`as` is a loose `ValidComponent`**, never a generic that re-types `Props` from the element. The
  JSDoc names the cost being avoided — *"the deep-conditional polymorphic-type cost that wrecks
  IntelliSense in that other SolidJS overlay library"*. (The plan names Kobalte; the file does not.)
- **`recipeClass?: Accessor<string | undefined>`** is the seam our recipe layer plugs into, and it is
  **unused at `e9c2f81`** — the JSDoc says so: *"`renderStyled` imports no theming and Box does not
  use it."* It is a hole left for a layer that was never built. See [§4](#4-16s-calibration--what-the-prior-art-does-not-de-risk).

Its two consumers:

```bash
git -C ../hope-ui show e9c2f81:packages/components/src/box/box.tsx    # 34 lines — pure delegation
git -C ../hope-ui show e9c2f81:packages/components/src/flex/flex.tsx  # 85 lines — + flex.raw
```

### 2.6 The distribution shape hope-ui shipped

```bash
git -C ../hope-ui show e9c2f81:packages/styled-system/package.json
```

`"private": true`, and the runtime **inlined** into the components bundle at build. Exports map:
`./css`, `./tokens`, `./patterns`, `./is-valid-prop`, `./types`, `./package.json`.

Two things to notice. There is **no `./recipes`** — consistent with never having reached recipes.
And there **is** a `./is-valid-prop`, which the plan's §2.1 exports list omits despite §2.3's reason 3
depending on it.

The dts wrinkle the plan §2.4 records is real and its rationale is in the config:

```bash
git -C ../hope-ui show e9c2f81:tsdown.config.base.ts | sed -n '58,80p'
```

```ts
deps: {
  neverBundle: [/^solid-js/, /^@solidjs\//, /^@hope-ui\/primitives/, /^@pandacss\//, "pkg-types", "typescript"],
},
inputOptions(options) {
  options.transform = { ...options.transform, jsx: "preserve" };
  return options;
},
```

with the comment: *"styled-system stays **out** of this list, so its types inline into the `.d.ts` —
the consumer can't resolve that private package."* Publishing `styled-system` removes the cause, as
the plan says; the `@pandacss/*` / `pkg-types` / `typescript` tail stays either way.

### 2.7 `staticCss` in a preset — the precedent nobody recorded

This is the most useful thing in the Panda era that neither the brief nor the plan mentions.

```bash
git -C ../hope-ui show e9c2f81:packages/themes/src/base/index.ts | sed -n '36,44p'
```

```ts
// Some display values are set by component runtime logic, not by a literal a consumer writes —
// so Panda's usage scan never sees them and would emit no rule. `Flex`'s `inline` prop toggles
// `display: inline-flex` at runtime; `d_inline-flex`/`d_flex` must therefore be pre-generated for
// every consumer. Kept in `base` so every theme (chakra/nova) inherits it.
staticCss: {
  css: [{ properties: { display: ["flex", "inline-flex"] } }],
},
```

That is **exactly** the plan's open question 2 — *"how do consumers get CSS for values our components
emit internally but their source never writes?"* — hit, diagnosed, and solved by shipping `staticCss`
**inside the preset**, in production, at `e9c2f81`.

It de-risks the mechanism by half, and only half:

- **Demonstrated:** `staticCss` declared in a preset reaches the consumer's codegen and pre-generates
  atomic utility rules for values only the component's runtime chooses.
- **Not demonstrated:** the same for **recipe variants** (`staticCss: { recipes: … }`). hope-ui never
  had a recipe to declare. The plan's §8 assumption 4 should be narrowed to that half rather than
  carried whole.

---

## 3. The spike — `spike/zag-solid`, 7 commits to `ef91b69`

### 3.1 What is on the branch

```bash
git -C ../hope-ui log --oneline --format="%h %ad %s" --date=short main..spike/zag-solid
```

```
ef91b69  2026-07-24  spike(zag): add ZagListbox, and rewrite the adapter in SolidJS 2.0 idioms
c8677c3  2026-07-24  docs(spikes): add axis 10 (SolidJS idiom) — the decisive axis
918959f  2026-07-24  docs(spikes): withdraw the ZagDialog NO-GO — two of three blockers were wrong
357dc7d  2026-07-24  docs(spikes): score ZagDialog against Dialog — verdict NO-GO
c102292  2026-07-24  spike(zag-dialog): a Zag-backed Dialog, to measure adoption
c6c86e2  2026-07-24  fix(zag-solid): stringify boolean aria-* and untrack the track callback
e235acf  2026-07-23  feat(primitives): vendor @zag-js/solid as a SolidJS 2.0 fork
```

Contents at the tip: a Solid 2.0 fork of the Zag adapter (7 source + 7 test files), two components
built on it to measure adoption (`ZagDialog`, `ZagListbox`), six per-file design notes under
`__internal__/primitives/zag-solid/`, and three findings documents under `__internal__/spikes/`.

### 3.2 The verdict is a sequence of four commits, not a conclusion

**Do not flatten this to "CONDITIONAL GO".** The sequence is the finding. Each step is a separate
commit precisely so the retraction cannot be quietly overwritten.

| # | Commit | What it did |
|---|---|---|
| 1 | `357dc7d` | **NO-GO.** Decisive axis: *maintenance*. Rested on two loads — a permanently-owned forked interpreter, and `D1`, a supposed unfixable module-scope `layerStack` leak that "poisons every dialog after" an unmount-while-open. |
| 2 | `918959f` | **Withdrew it.** Two of three verdict-driving findings were **wrong**. `C6` (a consumer `id` on a part is "impossible") — a five-line probe showed Zag's `ids` prop does exactly that, resolving attribute and lookup through the same function. `D1` — **does not reproduce**; run in isolation the pinning test *passes*, and a canary after every test in the file never once found a poisoned dialog. `G3` also removed the "permanent fork" premise: upstream has committed to a Solid 2.0 adapter once Solid 2.0 is stable. |
| 3 | `c8677c3` | **Added axis 10 (SolidJS idiom) and scored it decisive** — a new argument against, replacing the two that had just collapsed. Zag's framework-agnostic `connect()` returns a plain object computed eagerly, forcing a render-and-snapshot shape onto a fine-grained runtime. Premise: *every adopted component pays that seam again*. |
| 4 | `ef91b69` | **Measured axis 10 on component #2** and downgraded it. The seam **amortized** — see [§3.4](#34-the-amortization-result--the-finding-that-makes-a-100-component-library-viable). No axis is decisive any more. |

The three documents:

```bash
git -C ../hope-ui show spike/zag-solid:__internal__/spikes/zag-dialog-findings.md      # 180 lines — the raw ledger
git -C ../hope-ui show spike/zag-solid:__internal__/spikes/zag-dialog-comparison.md    # 636 lines — the ten axes + verdict
git -C ../hope-ui show spike/zag-solid:__internal__/spikes/zag-listbox-findings.md     # 410 lines — component #2
```

`zag-dialog-findings.md` carries `D1` **verbatim under a retraction banner** — *"left below verbatim
because the retraction is itself the finding. Do not cite it."* Honour that: `D1` is not evidence for
anything.

### 3.3 The ten axes, as finally scored

From `zag-dialog-comparison.md`'s scorecard, with the axis-10 revision from `ef91b69` applied. **This
is hope-ui's scorecard against hope-ui's bar, reproduced as evidence — not ours.** Axes 1, 4 and 6
score against a bar this project does not use; see [§8.2](#82-the-port-rule--no-a11y-beyond-zag-nothing-chakra-does-not-have)
for what they become against Chakra's.

| Axis | First draft | Corrected |
|---|---|---|
| 1. Feature parity | ✅ / ❌ four regressions + one impossible | ✅ / ⚠️ four regressions, priced |
| 2. Code volume | ➖ wash (−14%) | ✅ **−39%** steady state — but **±0% until the fork retires** |
| 3. Public API delta | ⚠️ one silent contract break | ✅ two documented moves |
| 4. Accessibility | ❌ independent blocker | ❌ real, priced at ~154 retained code lines *(→ **not paid** here: the gaps are Chakra's too, §8.2)* |
| 5. SSR + hydration | ✅ | ✅ — the axis Zag most clearly passes |
| 6. Theming friction | ⚠️ | ⚠️ three permanent seams |
| 7. Escape hatches | ❌ 5 of 9 dead-end | ✅ 8 of 9 have an option |
| 8. Maintenance | ❌ **decisive** | ⚠️ acceptable — the fork is bounded |
| 9. Bundle size | ❌ | ❌ a fixed toll, no remedy |
| 10. SolidJS idiom | *(not scored)* | ~~❌ decisive~~ → ⚠️ priceable, **does not compound** |

Axis 2's "−39%" is measured *"steady state, honest"* — official adapter landed, a11y gaps closed in
hope's own layer. The **interim** row (fork included) is `1071` code lines against a `1068` baseline:
**dead even**. Until upstream ships, adopting Zag buys no volume relief; it *relocates* code from
behavior written to a runtime transcribed.

Axis 6's three seams are the ones that touch Panda directly, and **only the third survives contact
with Chakra**:

1. *Presence supplied by hope's kernel rather than the machine.* **Gone** — presence comes from the
   `@zag-js/presence` **machine**, through our own adapter, like any other machine (§8.3).
2. *Two parallel attribute vocabularies — `data-slot` beside `data-scope`/`data-part`.* **Gone.**
   `data-slot` was hope-ui's own convention and appears in **zero** Chakra files; Chakra attaches
   slot styles as a **class** from `slotRecipe.classNameMap` via `cx(props.className, className)`,
   and styles the machine's own `data-part` directly — its `selectors.ts` lists
   `` `[data-part=${string}]` `` as a first-class selector type. One vocabulary, not two.
   ```bash
   grep -rl 'data-slot' __reference-impl__/chakra-ui/packages/react/src/          # nothing
   grep -n 'data-part' __reference-impl__/chakra-ui/packages/react/src/styled-system/selectors.ts
   ```
3. *Zag writing `--layer-index`/`--z-index` **imperatively** into the same `style` attribute Solid
   binds reactively, with a `MutationObserver` watching it.* Two writers on one attribute, one
   watching the other. **Real for us**, unchanged — and it is the seam a *floating* component would
   stress hardest, which neither spike built.

### 3.4 The amortization result — the finding that makes a 100-component library viable

Axis 10 named its own experiment: *"whether the seam costs less the second time or more … nothing
about Dialog alone answers it, and the answer is the decision."* `ef91b69` ran it, on a 200-item
collection component rather than the Popover the axis suggested, because a collection is what exposes
the granularity claim.

From `zag-listbox-findings.md` §F1, against the criteria registered **before** the run:

| Pre-registered | Result |
|---|---|
| `mergePartProps` reused verbatim | ✅ **exceeded** — the helper was **deleted**, its `untrack` pushed down into the fork |
| `untrack` call sites stay ~2, nothing per-item | ✅ **1** — fewer than Dialog's 2 |
| No new seam machinery | ✅ none |
| *(compounds if)* per-item `untrack` or a per-item merge helper | ❌ did not happen |
| *(compounds if)* `getItemProps` churn forces a memoization layer | ❌ did not happen |
| *(compounds if)* the collection must be mirrored into a Solid store | ❌ did not happen |

Component #2 cost **405 code lines of assembly, one `untrack`, zero new seam lines, and zero new
adapter defects** — and the one fork change it made *removed* a per-component workaround.

**Two corrections the spike made to its own mechanism, both of which matter to us:**

1. **The "Zag is O(N) where Solid is O(1)" claim is wrong.** Measured on 200 rows, one arrow-key
   move: ZagListbox 400 item prop-set recomputations, hope's handmade Listbox **200**. Both O(N).
   Solid's `spread` is one effect per *element* reading all of that element's props, and every row
   subscribes to the shared active signal through its own `data-active` — so every row re-runs on
   every highlight move in both stacks. Fine-grained-ness is per element, not per attribute.
2. **What is real is a 40× constant, and it belongs to *our* helper, not to Zag.** `mergeProps`
   defined one lazy getter per key, and each getter re-invoked its whole source — so one prop-set
   read of an item called `getItemProps` once per key (~20), twice per state change. 8 004 calls per
   keystroke at 200 rows. Nothing user-visible (DOM writes were 6 vs 4; Solid's `spread` diffs before
   writing), and fixable inside our layer. **The tip already fixed it**: the fork's `mergeProps` is
   now a `$PROXY` lazy proxy that reads nothing at construction
   (`git show ef91b69:packages/primitives/src/zag-solid/merge-props.ts`).

**What remains is a ~15-line, three-row recurring floor per component.** Three rows, ~5 lines each,
each a different *class* of collision — [§5](#5-the-three-standing-taxes-with-both-worked-failures).
The spike is explicit that the floor **grew** between component #1 and #2 and grows by category, "which
is the honest reason not to extrapolate a flat per-component number from two data points."

### 3.5 The identity question that stalled hope-ui is not live for us

The comparison's close: *"what would actually decide it now is not a seam question but an identity
one: whether hope-ui wants to be a Solid-native library or a Solid binding over a portable behavior
kernel. That is the maintainer's call, and no further spike will answer it."*

`chakra-ui-solid` is a Chakra port. Chakra v3 is built on Ark; Ark is built on Zag. Binding to the
same behavior kernel Chakra binds to is the point, not a compromise. The question that stopped
hope-ui does not arise here.

---

## 4. §1.6's calibration — what the prior art does **not** de-risk

This section is the one to read if you read nothing else, because it is the negative result and
negative results do not survive summarisation.

### 4.1 hope-ui never used `@chakra-ui/panda-preset`. At all.

```bash
git -C ../hope-ui grep -l "chakra-ui/panda-preset" e9c2f81 -- .   # no output
git -C ../hope-ui grep -n "@chakra-ui" e9c2f81 -- '*.json'        # no output
```

Zero occurrences in the entire tree, and no `@chakra-ui/*` package in any manifest. hope-ui's "Chakra
theme" was **hand-authored tokens only**:

```bash
git -C ../hope-ui ls-tree -r --name-only e9c2f81 -- packages/themes/src/chakra
```

```
packages/themes/src/chakra/index.ts
packages/themes/src/chakra/tokens/colors.ts
packages/themes/src/chakra/tokens/index.ts
packages/themes/src/chakra/tokens/semantic-tokens.ts
```

Four files over a shared `base/` preset. `chakra/index.ts`'s own JSDoc closes the question:
*"Recipes are deferred: like nova, chakra ships tokens only until components consume `useRecipe`."*

### 4.2 The recipe layer, quantified

Measured at `@chakra-ui/panda-preset@3.36.1` (checkout `f6747f9`):

```bash
awk '/export const recipes/,/^}/'     __reference-impl__/chakra-ui/packages/panda-preset/src/recipes/index.ts      | grep -cE '^\s+[a-zA-Z]'   # 18
awk '/export const slotRecipes/,/^}/' __reference-impl__/chakra-ui/packages/panda-preset/src/slot-recipes/index.ts | grep -cE '^\s+[a-zA-Z]'   # 56
```

**18 recipes + 56 slot recipes**, not 19 + 57 — the plan counted `.ts` files including each
directory's `index.ts`. Both figures should be corrected wherever they appear.

hope-ui wired **zero** of either kind. It has no `useRecipe`, no `sva` call, no slot-recipe
consumption, and `renderStyled`'s `recipeClass` seam is documented as unused. The distance between
"tokens work" and "57 multi-part style definitions drive 100+ components" is the whole project.

**One live trap in the preset while you are here:** the slot-recipe registry key for Switch is
misspelled **`swittch`** upstream (`swittch: switchSlotRecipe`, `slot-recipes/index.ts`). It is not a
typo we can fix from outside — a `useSlotRecipe("switch")` will silently resolve to nothing, which
under Panda means an unstyled component and a green test suite.

### 4.3 The `data-*` vocabulary advantage is real — spot-checked, not proven

The plan's §1.5 argues that hope-ui's recurring `data-*` mismatch (its recipe styled `data-active`,
Zag emits `data-highlighted`) *"should largely not exist for us"*, because the preset and the machines
share a lineage: preset ← Chakra ← Ark ← Zag. The spike never tested this, since its recipes were
hand-authored. A five-minute spot check across five components supports it:

| Component | Preset conditions used | Zag `connect()` emits | Reads |
|---|---|---|---|
| `listbox` | `_highlighted` `_selected` `_disabled` | `data-highlighted` `data-state` `data-disabled` | ✅ direct match |
| `select` | `_highlighted` `_open` `_closed` `_invalid` `_placeholderShown` | `data-highlighted` `data-state` `data-invalid` `data-placeholder-shown` | ✅ |
| `combobox` | `_highlighted` `_open` `_closed` `_invalid` | `data-highlighted` `data-state` `data-invalid` | ✅ |
| `accordion` / `dialog` | `_open` `_closed` | `data-state="open"\|"closed"` | ✅ via Panda's `_open` matching `[data-state=open]` |
| `switch` | `_checked` | `data-state="checked"` | ✅ same route |
| `tabs` | `_selected` `_active` | `data-selected` (no `data-active`) | ⚠️ `_active` is Panda's `:active` pseudo-class, not a Zag attribute |

```bash
grep -oE '\b_[a-zA-Z]+:' __reference-impl__/chakra-ui/packages/panda-preset/src/slot-recipes/listbox.ts | sort -u
grep -ohE '"data-[a-z-]+"' __reference-impl__/zag/packages/machines/listbox/src/listbox.connect.ts | sort -u
```

**This is a spot check across 6 of 56 slot recipes, not the diff.** The plan's §8 assumption 9 calls
the full diff *"the single cheapest check with the largest downside if skipped"* and assigns it to
implementation step 4. Nothing here replaces it. What the spot check does establish is that the
structural argument is not wishful — the preset genuinely speaks Zag's vocabulary where hope-ui's
hand-authored recipes did not.

### 4.4 hope-ui's own tests assert class names, which Panda makes insufficient

```bash
git -C ../hope-ui show e9c2f81:packages/components/src/box/__tests__/box.browser.test.tsx | sed -n '15,50p'
```

```ts
expect(el?.classList.contains("p_4")).toBe(true);
expect(el?.classList.contains("bg_primary")).toBe(true);
```

Under Panda, `css()` **only computes class names and never injects a stylesheet**. A class whose CSS
was never generated renders nothing and raises no error. So a passing `classList.contains("p_4")` is
compatible with an entirely unstyled element.

hope-ui's suite could not see that, because it ran against its own dev stylesheet generated from a
config it controlled. Ours cannot afford the same blind spot — which is exactly why the plan's §2.8
adds computed-style assertions and a generated-CSS coverage check. **The prior art's test strategy is
a carry-over that is provably incomplete for our hazard**, and that is worth saying here rather than
discovering at step 4.

---

## 5. The three standing taxes, with both worked failures

The spike's floor is three rows. Each is a different class of collision, each has a known fix, and
each recurs per component.

> **Read this section against [§8.2](#82-the-port-rule--no-a11y-beyond-zag-nothing-chakra-does-not-have).** Two of the three taxes
> are **hope-ui artifacts that Chakra does not pay**, and the fix in both cases is to port Chakra's
> own mechanism rather than to invent one. The rows are kept in full because the *mechanism* is real
> and the failures are worked; only the conclusion about what we owe changes.

### 5.1 `hidden` vs the recipe's `display` — a **styling-convention** collision

Zag emits `hidden` on parts it considers closed. `[hidden] { display: none }` is a UA rule that **any
explicit `display` beats** — and a slot recipe sets `display` on most slots. hope-ui hit it twice, on
two different machines, one component apart.

**Failure 1 — the dialog backdrop.**
```bash
git -C ../hope-ui show ef91b69:packages/components/src/zag-dialog/zag-dialog-backdrop.tsx | sed -n '13,35p'
```
> *"Zag's `hidden` is dropped. `[hidden] { display: none }` is a UA rule an explicit `display` beats,
> and every hope dialog slot sets one (`positioner` is `fixed inset-0 flex`, `content` is `flex
> flex-col`), so a `hidden` part would stay painted and a closed dialog would leave a full-viewport
> layer over the page. Presence gates the render instead."*

Fix: `omit(ctx.api().getBackdropProps(), "hidden")`, with `createPresence` gating the render.

**Failure 2 — the listbox check glyph.**
```bash
git -C ../hope-ui show ef91b69:packages/components/src/zag-listbox/zag-listbox-item-indicator.tsx | sed -n '15,35p'
```
> *"`getItemIndicatorProps()` returns `hidden: !selected` … the recipe's `itemIndicator` slot is
> `absolute right-2 flex …`, and any explicit `display` beats that UA rule. Left in place the glyph
> would be permanently visible on every row."*

Fix: same shape — strip `hidden`, `<Show>`-gate on the item's own `selected`. The file also records
*why the strip happens at the merge and not downstream*: leaving `hidden` on the element and letting
`<Show>` do the work would still ship `hidden` on the one frame the glyph *is* rendered.

With 56 slot recipes, this looked like a **standing per-component rule**. Against Chakra it is not —
Chakra pays neither half of it, by two mechanisms that are ours to port rather than to invent:

```bash
sed -n '138,144p' __reference-impl__/chakra-ui/packages/react/src/styled-system/preflight.ts
grep -rn 'unmountOnExit: true' __reference-impl__/chakra-ui/packages/react/src/components/
```

1. **Chakra's preflight makes `[hidden]` unbeatable.**
   `"[hidden]:where(:not([hidden='until-found']))": { display: "none !important" }` — `!important`
   wins over any recipe `display`, in any cascade layer. hope-ui's own reset carried no such rule,
   which is the *entire* reason its recipes beat `hidden`.
2. **Chakra unmounts rather than hides.** Six components set
   `defaultProps: { unmountOnExit: true, lazyMount: true }` — `dialog`, `drawer`, `tooltip`, `menu`,
   `action-bar`, `floating-panel` — and Ark's `PresenceGate` returns `null` when unmounted
   (`__reference-impl__/ark-ui/packages/react/src/components/presence/presence-gate.tsx`). A closed
   Dialog's content is not in the DOM at all, so `hidden` never has to win.

**Open item, not settled here.** `@chakra-ui/panda-preset`'s `global-css.ts` does **not** carry the
`[hidden]` rule (`grep -n hidden .../panda-preset/src/global-css.ts` → nothing), and whether Panda's
own `preflight: true` emits an equivalent could not be checked — Panda is not installed in any
checkout here. If it does not, one `globalCss` line in our preset reproduces Chakra's rule verbatim.
That is a port, not an invention. Confirm at implementation step 3.

### 5.2 An unconditionally-emitted labelling IDREF — an **id-strategy** collision

Zag derives ids from a scope rather than registering them, so *"does the target exist?"* is a question
the machine structurally cannot answer.

- **Dialog (`C1`):** `getTriggerProps()` sets `aria-controls` unconditionally — closed and during
  SSR. The shipped server HTML carries an IDREF resolving to nothing; axe raises
  `aria-valid-attr-value`.
- **Listbox (`C2`):** `getContentProps()` emits `aria-labelledby="listbox:<id>:label"` whether or not
  a `Label` part was rendered.

Fix in both cases: one override getter (~3 lines) in the merged props. Neither spike took it — **and
neither do we.** Ark forwards `getTriggerProps()` / `getContentProps()` straight through, and Chakra
adds nothing on top of Ark, so **Chakra ships the same dangling IDREF**. Taking the override would be
an accessibility improvement over the port target (§8.2). Ark and Chakra are the reference for
*whether* to fix it; the fix belongs upstream in Zag, where it would reach Chakra too.

### 5.3 `@zag-js/focus-visible` crashes Storybook — a **host-environment** collision

New at component #2, and the only finding that **stopped a deliverable working**.

```bash
git -C ../hope-ui show ef91b69:packages/components/src/zag-listbox/zag-listbox.stories.tsx | sed -n '1,35p'
```

The mechanism, verified in a browser rather than inferred: Storybook 10.5's `enhanceContext` loader
replaces `HTMLElement.prototype.focus` with an **accessor** whose getter reads `this.ownerDocument`.
`@zag-js/focus-visible`'s `setupGlobalFocusEvents` reads that property **off the prototype**
(`let focus = win.HTMLElement.prototype.focus`), so the getter runs with
`this === HTMLElement.prototype`; `ownerDocument` is a native accessor that rejects a non-element
receiver and throws `TypeError: Illegal invocation` before the `?.` can help. Zag wraps only the
subsequent `defineProperty` in a `try`, not the read. The throw escapes into the machine's effect and
Solid halts the whole reactive system — `[REACTIVITY_HALTED]`, every story renders nothing.

The fix is a **warm-up, not a patch**: `setupGlobalFocusEvents` is once-per-window, and story modules
evaluate *before* Storybook's loaders run, so calling `trackFocusVisible({ onChange(){} })` at module
scope succeeds while `focus` is still a plain data property and makes every later call an early
return. Three lines plus a version pin.

Why it matters disproportionately: **no test could see it.** Seven browser tests, axe, SSR, hydration
and the reactivity-diagnostic harness were all green, because Vitest does not patch `focus`. And
`trackFocusVisible` is an unconditional effect in `listbox`, `select`, `combobox`, `menu`, `tabs` and
more — so it hits most of the library, not one component.

---

## 6. The measured adapter defects, and where they live now

Four defects, all **measured** against a running component rather than read out of the source. The
plan's §3.5 records them as A1/A2/A3/B5. Three of the four have moved since.

| # | Defect | Fix at the time | Where it lives at `ef91b69` |
|---|---|---|---|
| **A1** | Every boolean `aria-*` the machine emits is malformed. Zag emits real booleans (correct for React, whose DOM layer stringifies). `@solidjs/web` does `value === false ? removeAttribute : setAttribute(name, value === true ? "" : value)` — so an open modal ships `aria-modal=""` and a **collapsed trigger ships no `aria-expanded` at all**. | Stringify boolean `aria-*` in `normalizeProps` | Unchanged, in `normalize-props.ts`. **Upstream `@zag-js/solid` has the identical bug**; nothing there runs axe, so it has never surfaced. File it. |
| **A2** | Every controlled state change emits `[STRICT_READ_UNTRACKED]` — Solid 2.0 reports untracked reads inside phases it labels strict-read, and a machine's `watch` tracks a prop then re-reads it in the effect callback. Solid 1.x has no such phase, so upstream never had to spell it. | `untrack(effect)` in `createTrack` — a `track` callback is a side effect, not a subscription; `deps` is its whole reactive input by construction | Unchanged, `track.ts:32` |
| **A3** | Every merged part emits `[STRICT_READ_UNTRACKED]`. Building the getter set called each source once to enumerate keys — a reactive read from a render body, false-positive by construction. | `untrack` the construction pass only | **Superseded.** `mergeProps` is now a `$PROXY` lazy proxy that reads nothing at construction, so there is no pass to untrack. `merge-props.ts:65,77` untracks only the structural `has`/`ownKeys` traps. |
| **B5** | `useMachine(...)` in a Root emitted 13 diagnostics — the adapter seeds bindables by reading its props memo from the render body. | `untrack` around the `useMachine` call, **in the component** | **Superseded, and this is the important one.** The fork now runs construction callbacks through a named `seedFromProps` helper (`machine.ts:35-51`), so a consumer writes a bare `useMachine(...)`. Both `zag-listbox-root.tsx` and `zag-dialog-root.tsx` at the tip have **no `untrack` at all**. |

Verify the last row directly:

```bash
git -C ../hope-ui grep -o untrack ef91b69 -- packages/components/src/zag-dialog packages/components/src/zag-listbox | wc -l   # 0
git -C ../hope-ui show ef91b69:packages/primitives/src/zag-solid/machine.ts | sed -n '35,51p'
```

`seedFromProps`'s JSDoc also records what it deliberately does **not** cover: `machine.watch?.()`,
because that only *registers* `track` effects whose deps are collected in their own tracking scope —
*"a machine that reads props directly there has a real bug, and should keep getting the diagnostic."*

**Consequence for later phases:** the plan's §3.5 row B5 and §4.1's instruction that the blueprint
document *"the `untrack`-around-`useMachine` seed idiom"* describe an idiom the prior art has already
retired. See [§10](#10-what-p2-contradicts--for-re-planning-before-p3).

### 6.1 The fork's own trajectory

| Ref | Source files | Raw | Code | Note |
|---|---|---|---|---|
| Upstream `@zag-js/solid@1.43.0` | 8 | **594** | — | `__reference-impl__/zag/packages/frameworks/solid/src/` |
| `e235acf` (vendored) | 8 + 8 tests | 719 | ~573 | minimal-diff copy |
| `c8677c3` (measured by the comparison) | 8 + 8 tests | **746** | ~601 | the doc's "746 raw / 598 code" |
| `ef91b69` (tip) | **7 + 7 tests** | 833 | ~614 | `use-sync-external-store.ts` dropped; rewritten in 2.0 idioms |

`wc -l __reference-impl__/zag/packages/frameworks/solid/src/*.ts` gives **exactly 594** across 8 files
— the plan's "~594" is exact, not approximate. The upstream file set is `machine`, `bindable`,
`merge-props`, `normalize-props`, `refs`, `track`, `use-sync-external-store`, `index`.

The fork is **no longer a minimal-diff copy**, and its own `index.ts` says so at length
(`git show ef91b69:packages/primitives/src/zag-solid/index.ts`): `mergeProps` is a lazy proxy;
`useSyncExternalStore` is gone; `flush` is Solid 2.0's real `flush` rather than upstream's no-op;
`bindable`'s signal is boxed (`{ value: T }` + an unwrapping `equals`) because 2.0's
`createSignal(fn)` is the memo overload; seed reads are named. The public API — `useMachine`,
`mergeProps`, `normalizeProps` — is unchanged.

---

## 7. The `inert` gap, re-measured at our target version

This one **moved**, and it is the clearest example of why the plan's §1 is a hypothesis rather than a
source.

**The spike's evidence** (`zag-dialog-comparison.md` axis 4): *"`@zag-js/aria-hidden@1.42.0` exports
exactly one symbol, `ariaHidden`, and the string `inert` appears **zero times** in its compiled
output."* That correction overrode the ledger's `C2`, which had said an `inertOthers` export exists.

**At `@zag-js/aria-hidden@1.43.0`, the ledger was right and the correction is wrong:**

```bash
grep -n 'inert' __reference-impl__/zag/packages/utilities/aria-hidden/src/aria-hidden.ts
```

```ts
export const inertOthers = (…) => walkTreeOutside(originalTarget, { …, controlAttribute: "inert", … })
const supportsInert = () => typeof HTMLElement !== "undefined" && HTMLElement.prototype.hasOwnProperty("inert")
export const suppressOthers = (…) => (supportsInert() ? inertOthers : hideOthers)(…)
```

Both were measuring different artifacts, and neither said which. The source has had
`inertOthers`/`suppressOthers` since at least 1.41 (`packages/utilities/aria-hidden/CHANGELOG.md`
records only dependency bumps through 1.43.0); the *published entry* has never exposed them.

**The conclusion survives intact, for a reason worth writing down once:**

```bash
cat __reference-impl__/zag/packages/utilities/aria-hidden/src/index.ts   # imports hideOthers only
sed -n '199,202p' __reference-impl__/zag/packages/machines/dialog/src/dialog.machine.ts
cat __reference-impl__/zag/clean-package.config.json                     # exports map: "." → dist/index only
```

`index.ts` exports one function, `ariaHidden`, and it calls `hideOthers` unconditionally.
`dialog.machine.ts:201` calls `ariaHidden(getElements, { defer: true })` with no prop, option, or
alternative to redirect it — as do `popover.machine.ts` and `drawer.machine.ts`. And the published
`exports` map is `"." → dist/index` only, so `inertOthers` is unreachable by a consumer even with a
deep import.

So at **1.43.0**: background content behind an open modal gets `aria-hidden` and stays in the tab
order. axe raises `aria-hidden-focus` (**serious**) on every open modal.

**The axe numbers, re-verified in the test sources:**

```bash
git -C ../hope-ui show ef91b69:packages/components/src/dialog/__tests__/dialog.browser.test.tsx     | grep -c 'expectNoA11yViolations('   # 4
git -C ../hope-ui show ef91b69:packages/components/src/dialog/__tests__/dialog.browser.test.tsx     | grep -c 'allowIncomplete'           # 0
git -C ../hope-ui show ef91b69:packages/components/src/zag-dialog/__tests__/zag-dialog.browser.test.tsx | grep -c 'expectNoA11yViolations(' # 6
```

Handmade Dialog: **4 assertions, 0 allowances.** ZagDialog: **6 assertions, an allowance on all six** —
`aria-valid-attr-value` on the three closed-state calls (§5.2), `aria-hidden-focus` on the three
open-state ones.

**It does not generalise.** ZagListbox runs three axe assertions: two over the full anatomy — the
machine's named part vocabulary, here `Root`/`Label`/`Content`/`Item`/`ItemText`/`ItemIndicator` —
with **zero** allowances, and one that deliberately pins the §5.2 dangling IDREF. The listbox closure
pulls no `@zag-js/aria-hidden` at all. The a11y cost belongs to the **modality stack** specifically,
and the plan is right to confine the exceptions there.

```bash
git -C ../hope-ui show ef91b69:packages/components/src/zag-listbox/__tests__/zag-listbox.browser.test.tsx \
  | grep -n 'expectNoA11yViolations(\|allowIncomplete'
```

**Chakra has this gap too, so we inherit it rather than close it.**

```bash
grep -rn '\binert\b' __reference-impl__/chakra-ui/packages/react/src/   # nothing
grep -rn '\binert\b' __reference-impl__/ark-ui/packages/react/src/      # nothing
```

Zero occurrences in either. Chakra's `dialog.tsx` is three files of Ark re-export plus slot-recipe
wiring and adds no behavior at all. So background content behind an **open Chakra v3 modal** is
`aria-hidden` and still in the tab order, exactly as ZagDialog measured. Under the port rule (§8.2),
`createHideOutside` is struck: it would make us more accessible than the library we are porting.

The practical consequence is that **ZagDialog's six axe allowances are the baseline, not a defect** —
they are what a faithful port of Chakra's Dialog scores. Our definition of done has to say so
explicitly, or the first `aria-hidden-focus` failure gets "fixed" by re-introducing the kernel.

**The upstream ask stands, and is now the *only* route:** `suppressOthers` already exists in
`@zag-js/aria-hidden` and already does the feature-detected `inert`-or-`aria-hidden` dispatch.
Pointing `ariaHidden` at it closes the gap for React, Vue, Svelte, Solid — **and for Chakra** — at
once, which is precisely why it is the right place to fix it and our layer is the wrong one. A second
upstreamable item alongside `A1`.

---

## 8. Two rules this evidence sets, and one boundary they draw

### 8.1 The methodology rule — measure the dependency, do not reason about its source

**The rule:** a finding that says *"impossible"* or *"unfixable"* gets a probe before it reaches a
verdict; a test whose premise is a **defect** gets run in isolation before it is believed.

Its evidence is that **two of the three findings driving the spike's first verdict were wrong, and
both errors ran the same direction — reasoning about a dependency's source instead of measuring it.**
From `zag-dialog-comparison.md`'s closing section:

- **`C6`** — *"a consumer `id` on a part is impossible; it breaks the dismiss layer, the focus trap
  and the aria-hiding at once."* Derived by reading `dialog.dom.mjs` and inferring that a custom id
  must break the machine's element lookup. **A five-line probe** against a raw machine with
  `ids: { content: "my-content", title: "my-title" }` showed the element existing, `role="dialog"`,
  `aria-labelledby` pointing at the custom title id, and Escape still dismissing. It cannot break,
  structurally: `dialog.dom.mjs` resolves every id as ``ctx.ids?.<part> ?? `dialog:${ctx.id}:<part>` ``
  and `dialog.connect.mjs` emits each part's `id` through those **same** resolvers. Attribute and
  lookup cannot diverge. The spike had simply never forwarded `ids`.
- **`D1`** — *"unmounting an open dialog poisons every dialog after it,"* from a module-scope
  `layerStack` singleton. Derived from a test that **passed**, without checking whether it passed *in
  isolation*. It does not: run alone, the dialog it mounts dismisses normally — the test was only ever
  recording state inherited from earlier tests in the file. A canary mounting and disposing a
  throwaway dialog after every test in the file **never once** found a poisoned one. What exists is a
  transient, same-tick interference that clears on `nextTick`; the four tests skipped for it were
  skipped for a **harness-timing** reason, not a product defect.

A third error, found later and pointing the other way, belongs in the same list: **the `inert`
correction in [§7](#7-the-inert-gap-re-measured-at-our-target-version)** overrode a correct ledger
row by measuring a different artifact without saying which.

And a fourth, from `zag-listbox-findings.md` §G, extends the rule beyond dependencies: *"a story is a
deliverable, not a checkbox — open it."* The ZagListbox stories were written, typechecked, linted and
committed **without ever being opened**, and every one of them crashed (§5.3). A definition-of-done
item verified only by a file-existence check is verified in name only.

**Two claims that did not survive measurement and were recorded rather than dropped**, from the same
document — worth citing as the shape the discipline takes when it works:

- *"Zag's typeahead lands on disabled rows because it never consults `getItemDisabled`."* **False.**
  Both `getNextValue` and the typeahead search skip disabled entries.
- *"Focusing a listbox that already has a selection highlights nothing in Zag but highlights the
  selected row in hope."* **False on both halves** — measured `[false, false]` for hope too.

### 8.2 The port rule — no a11y beyond Zag, nothing Chakra does not have

**The rule, set at this gate:** we add no accessibility behavior beyond what Zag ships. The target is
1:1 with Chakra UI v3, and nothing gets invented that Chakra does not have — SolidJS idioms
excepted, since those are what the port *is*.

It is not a lowered bar, it is a *fixed* one. Chakra v3 is Ark over Zag, and neither layer adds
anything to the machines:

```bash
ls __reference-impl__/chakra-ui/packages/react/src/components/dialog/   # dialog.tsx  index.ts  namespace.ts
head -20 __reference-impl__/chakra-ui/packages/react/src/components/dialog/dialog.tsx
cat __reference-impl__/ark-ui/packages/react/src/components/dialog/use-dialog.ts   # 27 lines, all wiring
```

Chakra's entire Dialog is an Ark re-export plus `createSlotRecipeContext({ key: "dialog" })`, and
Ark's `useDialog` is 27 lines that call `useMachine(dialog.machine, …)` and `dialog.connect(…)`,
injecting only `id`, `getRootNode` and `dir` from context. Two layers, zero added behavior. So
Zag's a11y surface **is** Chakra's a11y surface, and anything hope-ui added on top is a divergence —
including the pleasant kind. The plan's §2.11 reverses four kernel primitives from *drop* to *copy,
mandatory* on hope-ui's bar. On Chakra's bar, three of the four go back to **drop**.

| Primitive | Plan §2.11 | Does Chakra/Ark have it? | Verdict under the port rule |
|---|---|---|---|
| **`createHideOutside`** (128 code) | copy, **mandatory** | **No.** `inert` appears **zero times** in both `chakra-ui/packages/react/src/` and `ark-ui/packages/react/src/`. Chakra's open modal leaves the background keyboard-reachable | **DROP.** Inherit the gap. Fix it upstream in `@zag-js/aria-hidden` (§7), where it also reaches Chakra |
| **`createFocusRestore`** (26 code) | copy | **No.** `ark-ui/.../dialog/use-dialog.ts` is `useMachine(dialog.machine, …)` + `dialog.connect(…)` and nothing else; `dialog-root.tsx` and `use-dialog.ts` contain the string `focus` **zero times**. Ark adds no focus handling, so a **non-modal** Chakra dialog does not restore focus on Escape either | **DROP.** Same behavior as the port target |
| **`createPresence`** (143 code) | copy | **Yes, but via the machine.** `presence` is a **Zag machine** at 1.43.0 (`zag/packages/machines/presence/`); Ark composes it and Chakra re-exports the result as `chakra(ArkPresence)` | **REPLACE, not drop** — build our own on `@zag-js/presence` through our adapter (§8.3). Do not carry hope-ui's |
| **`createRegisteredId`** (12 code) | copy | n/a — it is not an a11y feature | **KEEP, as a SolidJS idiom.** 12 lines of `onSettled` deferral to dodge Solid 2.0's `[REACTIVE_WRITE_IN_OWNED_SCOPE]` on a cross-scope write. It has **no call site in a 1:1 port** — Zag derives ids from a scope and Ark never registers upward — so keep it available, do not build a pattern on it |

**Why `createPresence` is replaced rather than dropped, and why the plan's objection evaporates.**
The spike kept it because *"`@zag-js/presence` is animation-**name** based (`animationName` +
`animationend`); a recipe animating with CSS **transitions** reports exit-done immediately and drops
the exit animation."* That is true — **of hope-ui's hand-authored recipe.** Chakra's preset animates
with `animationName` throughout:

```bash
grep -rn 'animationName' __reference-impl__/chakra-ui/packages/panda-preset/src/slot-recipes/dialog.ts
grep -rn -A3 '_open:\|_closed:' __reference-impl__/chakra-ui/packages/panda-preset/src/slot-recipes/*.ts \
  | grep transitionProperty            # nothing
```

Across all 56 slot recipes, **9 use `animationName` and not one uses `transitionProperty` inside an
`_open`/`_closed` block.** The seven files that mention `transitionProperty` at all
(`progress`, `progress-circle`, `switch`, `code-block`, `editable`, `tree-view`, `tags-input`) use it
for value/state transitions, never for enter/exit. Every keyframe the recipes name — `fade-in`,
`fade-out`, `scale-in`, `scale-out`, `slide-from-*`, `slide-to-*` — is defined in the preset's
`keyframes.ts`.

So `@zag-js/presence` is the *correct* mechanism for this preset, and the plan's §8 assumption 11
(*"whether `createPresence` composes with Chakra's preset animations"*) resolves the other way: it is
`@zag-js/presence` that composes, and `createPresence` that would not have needed to exist.

**What the rule strikes elsewhere in this document:** the `aria-controls` override getter (§5.2) and
the `aria-labelledby` override (§5.2) — both are fixes Chakra does not have. The `hidden`-strip
(§5.1) is **not** struck, because it is not an addition: Chakra reaches the same end state through
`unmountOnExit`/`lazyMount` and a preflight `!important`, both of which are ours to port.

**Net effect on the a11y kernel:** the plan's ~154 retained code lines become **12** — and those 12
are a Solid 2.0 mechanism, not accessibility. The behavior kernel is Zag's, entirely.

### 8.3 Presence, drawn precisely — the one carry-over that becomes a build

"Replace with Ark's" would be the wrong instruction, so here is the exact line. **Ark is not a
dependency and never will be** (`legal.md` §1.4: *Ark is `what`, never `how`*). Presence is a **Zag
machine like any other**, so it goes through **our own `zag-solid` adapter** — no special case:

```bash
ls __reference-impl__/zag/packages/machines/presence/src/
cat __reference-impl__/ark-ui/packages/react/src/components/presence/use-presence.ts   # 54 lines
```

| Concern | Owner |
|---|---|
| `present`, `onExitComplete`, `immediate`; `skip`/`present`/`setNode`/`unmount`; **animation-name detection and `animationend` waiting** | **`@zag-js/presence`.** A machine we consume, same as `dialog` or `listbox` |
| `lazyMount`, `unmountOnExit`, `skipAnimationOnMount`, `hideMode`; the `data-state` + `hidden` prop getter; the gate that renders `null` when unmounted | **Ours to write.** ~30 lines of render strategy, **not in the machine** — Ark invents them, and Chakra's public API exposes them |

That second row is why this is a build and not a `git show`. It is **API-shape reading** (owes
nothing, `legal.md` §1.4) — reproduce the prop names and semantics, never the expression. Chakra's
`DialogRoot` ships `defaultProps: { unmountOnExit: true, lazyMount: true }`, so these are consumer-
visible and parity requires them.

Three places Ark's code is React-shaped and a Solid version is simply smaller:

- `wasEverPresent` is a `useRef` guarding a re-render; in Solid it is a closure variable.
- `useEvent(props.onExitComplete)` is a stale-closure workaround. Solid props are already live —
  delete it.
- `hideMode: 'activity'` maps to React 19's `<Activity>`, which **has no Solid equivalent**. We ship
  `'display-none'` only. That is a real parity delta belonging in the §0.4 table, not a gap to paper
  over.

---

## 9. Carry-over verdicts with attribution status

Cross-referenced against `legal.md` §1.2 (Apache-2.0 enters through hope-ui), §1.3 (the fork's MIT
obligation) and §1.6 (hope-ui carry-overs are ours, with a provenance note). The a11y-kernel rows
carry [§8.2](#82-the-port-rule--no-a11y-beyond-zag-nothing-chakra-does-not-have)'s verdicts.

**Attribution key.** **Ours** — hope-ui, same author, MIT: a provenance note (path + commit), no
`NOTICE.md` row required. **MIT derivative** — `@license` header naming the upstream file +
copyright + license, plus a row in the root `NOTICE.md` **and** the package's. **Apache-2.0
derivative** — all of that, plus the §4(b) *"This file has been modified from the original"* line,
`licenses/LICENSE-APACHE-2.0.txt` at the root and in the owning package, and both added to that
package's `package.json#files`.

| Item | Take it from | Verdict | Attribution | Header present today? |
|---|---|---|---|---|
| `renderStyled` — `packages/components/src/system/style-props.tsx` (104 lines) | **`e9c2f81` only** | copy, extend at `recipeClass` | **Ours** | n/a — provenance note to add |
| `renderElement` / `RenderProp` — `utils/render/render.tsx` (59) @ `e9c2f81`; `render/render.tsx` @ `main` (69) | either; `main` is newer | copy | **Ours** | n/a |
| `withDefaults` — `utils/defaults/defaults.ts` (47) @ `e9c2f81`; `utils/defaults.ts` (40) @ `main` | either | **copy, mandatory** | **Ours** | n/a |
| `composeEventHandlers` (`utils/events`), `createKeyboardHandler` (`utils/keymap`) | either | copy | **Ours** | n/a |
| `runIfFunction` | **`spike`/`main` only** — `utils/run-if-function.ts` (17). **Does not exist at `e9c2f81`.** | copy | **Ours** | n/a |
| `panda.config.ts` @ `e9c2f81` | `e9c2f81` only | **copy with a named change** — `eject: true` needs `@pandacss/preset-base` added explicitly (§2.2) | **Ours** | n/a |
| `styled-system` package *shape* @ `e9c2f81` | `e9c2f81` only | adapt — publish + external; keep the exports map incl. `./is-valid-prop`, add `./recipes`; never export `/jsx` | **Ours** | n/a |
| `__internal__/solid-2.0-notes.md` | **`main` (246 lines)**, not `e9c2f81` (`docs/`, 151) | copy, then prune | **Ours** | n/a |
| Three-project test split + DoD + check scripts | `main` | copy, then extend — §4.4 shows the class-name gap | **Ours** | n/a |
| tsdown config incl. `deps.neverBundle` | `e9c2f81` or `main` | copy | **Ours** | n/a |
| Box (34) / Flex (85) ports | **`e9c2f81` only** | adapt — re-point at the official preset | **Ours** | n/a |
| `zag-solid/` fork — **7 source + 7 test files** @ `ef91b69` | `ef91b69` | copy | **MIT derivative** of `chakra-ui/zag`, `packages/frameworks/solid/src/<file>.ts`, © 2021 Chakra UI | ❌ **none of the seven has an `@license` header.** Provenance is prose in `index.ts` and untagged, so the build strips it. All seven need one. |
| `createHideOutside` — 255 raw / 128 code @ `ef91b69`; 434 / 201 @ `main` | — | **DROP** — struck by the port rule (§8.2). Chakra and Ark contain `inert` zero times | *(moot)* Would have been an **Apache-2.0 derivative** of `@react-aria/overlays` → `src/ariaHideOutside.ts` — **and dropping it removes the repo's only planned Apache-2.0 obligation** (see §9.2) | — |
| `createFocusRestore` — 55 raw / 26 code | — | **DROP** — struck by the port rule (§8.2). A non-modal Chakra dialog does not restore focus either | *(moot)* Ours | — |
| `createPresence` — 249 raw / 143 code | — | **REPLACE** — port **Ark's** presence layer over `@zag-js/presence` (`ark-ui/packages/react/src/components/presence/`). Chakra's preset is `animationName`-based throughout, so Zag's presence is the right mechanism (§8.2) | *(moot)* Ours | — |
| `createRegisteredId` — 46 raw / **12 code** @ `ef91b69`; 36 / 12 @ `main` | `main` | **keep as a SolidJS idiom** — `onSettled` deferral for Solid 2.0's `[REACTIVE_WRITE_IN_OWNED_SCOPE]`. No call site in a 1:1 port; keep available, build no pattern on it | **Ours** | ✅ correctly none |
| rest of `primitives/internal/*` | — | **drop, no exceptions** — the port rule removes the exception mechanism the plan reserved | ⚠️ `create-dismissable.ts` (251), `create-press.ts` (449) and `scroll-into-view.ts` (164) are Apache-2.0 derivatives of `@react-aria/*`. With no exceptions, none is copied and none triggers the mechanism | — |
| `packages/themes` (hand-authored tokens) | — | **drop** — replaced by `@chakra-ui/panda-preset` | — | — |
| `primitives/{dialog,combobox,listbox,calendar,popover,tags-input}` | — | **drop** — superseded by Zag machines | — | — |
| Tailwind v4 + `tailwind-variants` era (`main`) | — | **drop** | — | — |
| `packages/i18n` | — | rebuild minimally — **and Ark shows exactly how small.** `use-dialog.ts` is the whole pattern: `dir` from a locale context, `getRootNode` from an environment context, `id` from the framework, spread into the machine props. Two contexts, no catalog, no resolver | ⚠️ hope-ui's three i18n files are **Apache-2.0 derivatives** of `@react-aria/i18n`. A rebuild from Ark's two-context shape owes nothing; copying hope-ui's does — a second reason not to (§9.2) | — |

Verify the header claims:

```bash
git -C ../hope-ui show main:packages/primitives/src/internal/create-hide-outside.ts | head -20   # full Apache-2.0 block, incl. §4(b)
git -C ../hope-ui show spike/zag-solid:packages/primitives/src/internal/create-hide-outside.ts | head -5   # no header
git -C ../hope-ui show main:NOTICE.md | sed -n '20,32p'                                          # the Adobe derivative table
for f in bindable index machine merge-props normalize-props refs track; do
  git -C ../hope-ui show ef91b69:packages/primitives/src/zag-solid/$f.ts | head -20 | grep -c '@license'
done                                                                                             # 0 ×7
```

### 9.1 Carry-overs the evidence no longer supports copying

**Four, three of them from the port rule.**

1. **`createHideOutside`, `createFocusRestore`** — struck outright (§8.2). Chakra has neither
   behavior; copying them is a divergence.
2. **`createPresence`** — replaced by a build, not copied. Our own Solid presence over the
   `@zag-js/presence` **machine**, through our adapter; Ark read for prop names only (§8.3).
3. **`panda.config.ts` (§2.2)** — verbatim copy is a defect: `eject: true` was safe only because
   hope-ui's preset chain declared `@pandacss/preset-base` itself, and `@chakra-ui/panda-preset` does
   not.

One that survives but needs its basis restated rather than its verdict changed: **the three-project
test split** stays a **copy**, but §4.4 shows it is provably incomplete for our central hazard, and
§7 adds a second gap — the definition of done must record the inherited axe allowances as *expected*,
or a faithful port reads as a regression. Copy it as a floor, not a specification.

### 9.2 The port rule removes the repo's only Apache-2.0 obligation

`legal.md` §1.2 opens by correcting the plan: *"Apache-2.0 enters through hope-ui's
`createHideOutside`, which §2.11 marks copy, mandatory."* That was right on the plan as it stood.
**Under the port rule it no longer enters.** `createHideOutside` is the sole planned Apache-2.0
carry-over, and the exception mechanism that could have pulled in `create-dismissable.ts`,
`create-press.ts` or `scroll-into-view.ts` is gone with it.

So the whole graph is MIT again, which is the state `legal.md` §1.1 describes and §1.2 departs from:

- `licenses/LICENSE-APACHE-2.0.txt` is **not needed** — `legal.md` §1.2 deliberately did not add it
  yet, and that call now stands permanently rather than pending.
- `NOTICE.md`'s pre-declared Apache-2.0 section keeps its *not yet applicable* marker.
- The only attribution the repo still owes is the **seven `@license` headers on the `zag-solid` fork**
  (MIT, `legal.md` §1.3) plus provenance notes on the hope-ui carry-overs (§1.6).

**This needs P1's sign-off, not just P2's.** `legal.md` §0's summary table and §1.2 both assert the
Apache-2.0 obligation as live. They should be revised to record it as *avoided by the port rule*
rather than deleted — the analysis is correct and stays useful the moment anyone proposes an
exception.

---

## 10. What P2 contradicts — for re-planning before P3

Every row below is a plan claim the checkout does not support. Ordered by how much later work it
touches.

### 10.1 The port rule — the widest change, and it came from the P2 gate, not the checkout

The rule set at this gate (**no a11y beyond Zag; nothing Chakra does not have; SolidJS idioms
excepted** — §8.2) invalidates the plan's largest reversal. §1.4, §2.11 and §7 all rest on retaining
an a11y kernel priced at *"~154 retained kernel code lines"*; measured against Chakra and Ark, three
of the four primitives are behavior Chakra does not have.

| # | Plan says | Measured / decided | Blast radius |
|---|---|---|---|
| **A** | §2.11: `createHideOutside` **copy — reversed from "drop"**, *"Non-negotiable"* | **DROP.** `inert` appears zero times in `chakra-ui/packages/react/src/` **and** in `ark-ui/packages/react/src/`. Chakra's open modal leaves the background keyboard-reachable | **P4, P5, P7** — and `legal.md` §0/§1.2, which lose the repo's only Apache-2.0 obligation (§9.2) |
| **B** | §2.11: `createFocusRestore` **copy — reversed from "drop"** | **DROP.** Chakra forwards Zag's `restoreFocus` unchanged, so a non-modal Chakra dialog does not restore focus on Escape either | **P4, P5, P7** |
| **C** | §2.11: `createPresence` **copy — reversed from "drop"**; §8 assumption 11 doubts it composes with Chakra's animations | **REPLACE with our own Solid presence** over the `@zag-js/presence` **machine**, through our adapter — Ark read for API shape only, never vendored (§8.3). Assumption 11 resolves the *other* way: across all 56 slot recipes, 9 use `animationName` and **zero** use `transitionProperty` in an `_open`/`_closed` block, so Zag's animation-name-based presence is the correct mechanism and hope-ui's transition-based kernel was never the right shape here | **P5** (the blueprint's presence section is rewritten), **P6** |
| **D** | §2.11: *"rest of `primitives/internal/*` — drop by default, **adopt by exception**"*; §7 concern 3 builds a per-component column for it | **No exceptions.** The rule removes the mechanism. `roadmap.md` does not need the per-component retained-primitive column the plan reserves | **P5, P6** — deletes a planned column |
| **E** | §5.2 / §7: the ~3-line `aria-controls` and `aria-labelledby` override getters | **Not taken.** Chakra ships the same dangling IDREFs. The fix belongs upstream in Zag, where it reaches Chakra too | **P5, P7** |
| **F** | §1.4 / §2.8: the DoD runs axe on every mounting test *"with zero allowances"* | **Not achievable, and should not be.** A faithful Dialog port scores ZagDialog's six allowances (`aria-valid-attr-value` closed ×3, `aria-hidden-focus` open ×3). The DoD must record inherited allowances as **expected**, with a named upstream issue each, or a correct port reads as a regression | **P7** — this is the DoD's shape, not a detail |

**Net:** the a11y kernel goes from ~154 retained code lines to **12** (`createRegisteredId`), and
those 12 are a Solid 2.0 write-deferral mechanism, not accessibility. The behavior kernel is Zag's,
entirely — which is also what makes §1.4's *"hope-ui stops owning component behavior"* fully true here
rather than three-quarters true.

### 10.2 Measurement contradictions

| # | Plan says | Measured | Blast radius |
|---|---|---|---|
| 1 | §2.11 *"`panda.config.ts` @ `e9c2f81` — **copy**"* | `eject: true` drops `@pandacss/preset-base`, which `@chakra-ui/panda-preset` does not self-declare (§2.2) | **P3** (`plan.md`'s styling section), and implementation step 3's gate |
| 2 | §1.6 / §3.6 / §2.9 *"19 recipes + 57 slot recipes"* | **18 + 56** (§4.2) | **P3, P5, P6** — the roadmap matrix is built from these |
| 3 | §3.5 row B5 + §4.1 doc 4: the blueprint documents *"the `untrack`-around-`useMachine` seed idiom"* | Retired at `ef91b69`; the fork's `seedFromProps` absorbs it and the component layer has **zero** `untrack` (§6) | **P4, P5** — the adapter spec and the blueprint would teach a retired idiom |
| 4 | §3.5 row A3: *"`untrack` the construction pass only; per-key getters stay fully reactive"* | Superseded — `mergeProps` is a `$PROXY` lazy proxy with no construction pass (§6) | **P4** |
| 5 | §1.4 / §2.11: *"`@zag-js/aria-hidden` contains the string `inert` zero times"* | False at 1.43.0 in the **source** (`inertOthers`, `suppressOthers` exist); true only of the **published entry**. The gap is real, the evidence must be restated (§7) | **P4** — and it was the load-bearing justification for row A above, which §10.1 drops on other grounds |
| 6 | §1.4: Dialog paid *"**12 `untrack` calls**"* | 12 is **occurrences of the word** (imports and comments included) in non-test source at `c102292`. **Call sites: 2 in the component, 2 in the fork.** The listbox findings' own table uses the honest metric ("call sites in the component layer: 2") | **P4, P5** — quoting 12 overstates the seam ~3× |
| 7 | §1.4 / §2.11: *"`createPresence` (~249 lines)"* alongside *"`createHideOutside` (~128 code lines)"* | Mixed units in one sentence. 249 is **raw**; presence is **143 code**. hideOutside's 128 and focusRestore's 26 are **code** (§0.4) | Any later doc quoting a volume figure |
| 8 | §1.4: *"4 of 8 packages already shared by the second component"* | At 1.43.0 the listbox closure is 8 packages of which **5** are shared with dialog's 11 and **3** are new (`listbox`, `collection`, `focus-visible`) — `anatomy` is shared, not new. Favourable direction | **P4, P6** |
| 9 | §0.5: Chakra's `styled-system/` is *"47 files"* | **46** top-level files + a `generated/` subdirectory (51 total). `legal.md` §1.4 already says 46 | Cosmetic — flagged so the two documents do not diverge |
| 10 | §8 assumption 1: *"`cascade-select`, `gridlist`, `image-cropper`, `scheduler`, `dnd`, `toc` may be v2-only"* | At 1.43.0, `cascade-select`, `image-cropper` and `toc` **exist**. Only `gridlist`, `scheduler`, `dnd` are v2-only | **P6** |
| 11 | §8 assumption 4: *"`staticCss` in a preset covers internally-emitted variants — plausible, **undemonstrated**"* | The **atomic-utility half is demonstrated in production** at `e9c2f81` (§2.7). Only the recipe-variant half is open | **P3** — narrows open question 2 |
| 12 | §4: *"no `Co-Authored-By` … (hope-ui's convention, carried over)"* | It is hope-ui's *current* convention, not its historical one: 31 of the Panda era's 43 commits carry the trailer; the spike's 7 carry none | None — recorded so the attribution is accurate |

### 10.3 Structural facts, not contradictions, that later phases should not assume away

- **The two branches never coexisted** (§0.2). No Zag machine has ever rendered through a Panda recipe
  in this lineage — and none has ever rendered through **Chakra's** preset, on either branch. Every
  claim about how the two interact, the `hidden`/`display` tax above all, is inferred from a Zag
  component wearing a *hand-authored* recipe. §5.1 and §8.2 show that specific inference not
  transferring; treat the rest of §5 the same way until step 4 says otherwise.
- **The carry-over set is split across refs.** The Panda-era items exist **only** at `e9c2f81`
  (deleted by `26914d9`); the adapter, `runIfFunction` and `createRegisteredId` come from `ef91b69`
  or `main`. There is no single ref to copy from, and the flat `create-*.ts` layout at `main` is not
  the nested layout at `e9c2f81` (§0.3).
- **The reference for *whether* a behavior exists is Chakra and Ark, not hope-ui.** hope-ui is the
  reference for *how* to express something in Solid 2.0. Keeping those two roles separate is what
  §8.2 enforces, and it is the question to ask of every remaining carry-over.

### 10.4 Confirmed unchanged, so nobody re-checks them

`renderStyled` is exactly 104 lines; the upstream adapter is exactly 8 files / 594 lines;
`createHideOutside` 128 and `createFocusRestore` 26 code lines, summing to the quoted ~154 (accurate,
and now moot — §10.1 rows A and B); the dialog machine makes exactly 8 `getById` element lookups
against a handmade 0; 4 axe assertions with 0 allowances against 6 with 6; the ~15-line three-row
recurring floor; 51 Zag machines (**not 56** — P1's figure, re-confirmed by
`ls __reference-impl__/zag/packages/machines | wc -l`); 118 Chakra component folders; and
`@chakra-ui/panda-preset@3.36.1` depending only on `@pandacss/types@^1.4.2`.

### 10.5 Not reproducible from git, and not disputed

The bundle figures (+13.4 KB gz for Dialog, +9.7 KB
for Listbox; 5.4×/4.8× and 3.4×/2.8×) came from `esbuild --bundle --minify` runs over an installed
tree. The `@zag-js/*` packages are no longer installed in the hope-ui working tree, so the byte counts
cannot be re-derived here. The **package counts** they rest on do reproduce exactly (11 and 8,
transitively, at 1.43.0), so the shape of the claim is verified even where the bytes are not.
Re-measure at milestone one.
