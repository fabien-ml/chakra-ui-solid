# Architecture — `chakra-ui-solid`

**Status:** written at P3, 2026-08-09. Decides the styling layer, the distribution model, and the
package graph, and settles the plan's open questions **Q2** (`staticCss` for internally-emitted
recipe variants, §1) and **Q4** (style-props API shape, §2).

**What this document is.** The architecture. Every decision below has a rejected alternative and a
gate that verifies it. Where a decision rests on something unverifiable from this machine, it says
so and names the implementation step that checks it (§11).

**What it is not.** The evidence base — that is `prior-art.md`, cited by section throughout rather
than restated. **Where the plan and `prior-art.md` §10 disagree, §10 wins**; §12 lists every place
this document departs from the plan so P4 and P5 get re-planned before P4 begins.

> **Reconciled at P9, 2026-08-09.** Nine corrections from P4–P8 were applied in place — §0.4 (the
> exclusion note and a new `React→Solid` row), §1.3 (`swittch`), §2.3 (a fourth `renderStyled`
> addition), §3.3 (two preset deltas, one of them expression-tier), §4.4 (the README line's three
> placements), §5.2 (two edges), §5.3 (`composeEventHandlers`), §10 (115 folders; the slot-recipe
> half), §12 row 3 (two rungs). Each is one line and cites the document that owns it. The decision
> record is `decisions.md`.

**Two things settled earlier and not reopened here.** The brand is `chakra-ui-solid`, scope
`@chakra-ui-solid` (`legal.md` §3.3.3). The **port rule** is *no accessibility behavior beyond what
Zag ships, nothing invented that Chakra UI v3 does not have, SolidJS idioms excepted*
(`prior-art.md` §8.2).

---

## 0. The governing constraint: no runtime CSS-in-JS

**No runtime CSS-in-JS engine — not in this repo, not in its dependency closure.** No Emotion,
styled-components, goober, stitches; nothing that serializes component styles into a stylesheet at
render time. And **our own code writes no stylesheet at runtime**: nothing of ours calls
`createElement("style")`, `insertRule` or `adoptedStyleSheets`, or maintains a runtime sheet.

Those are two sentences with two different scopes, and collapsing them into one breaks the rule.
A **dependency** is judged by what it *is* — a manifest check over the closure. **Our own source** is
judged by what it *does* — a grep. Applying the grep to dependencies fails things that were never the
target: a behavior library writing one static rule for the duration of a drag gesture is not a
styling engine and does not touch build-time extraction. *Settled at the P4 gate, 2026-08-09, on the
worked case — `zag-solid-adapter.md` §5.1, §5.3.*

This makes `chakra-ui-solid` explicitly **not a 1:1 port**. It is *"as close to Chakra v3 parity as
is achievable without runtime CSS-in-JS."* That sentence belongs in the README, `CLAUDE.md`, and the
docs home. Everything in §1 through §10 is justified from this section; nothing downstream may
weaken it.

### 0.1 Panda satisfies the rule

Panda's generated runtime is pure class-name computation — `css()`, `cva()` and `sva()` compute
strings over a precomputed map, and the generator's source contains no `createElement`, `insertRule`,
`adoptedStyleSheets`, or sheet object anywhere (`brief-plan` §0.1, read from
`@pandacss/generator/src/artifacts/js/css-fn.ts`). Panda is build-time by construction. It is the
only styling stack that satisfies §0 while giving us Chakra's tokens and recipes, which is why the
constraint decides the stack rather than merely constraining it (`brief-plan` §3.6).

### 0.2 The hazard the rule creates — the central risk of the styling layer

Because `css()` only *computes* class names and never injects, **a class whose CSS was never
generated silently does nothing.** No error, no warning, no fallback — an unstyled element and a
green test suite.

Three consequences, each load-bearing below:

- **Extraction coverage is config, not optimization.** §1 is entirely about this.
- **Class-name assertions are insufficient.** hope-ui's own suite asserts
  `classList.contains("p_4")`, which is compatible with a completely unstyled element
  (`prior-art.md` §4.4). Browser tests assert **computed styles**.
- **A CI check must prove every recipe variant a component can emit exists in the generated CSS.**
  It is the only mechanical defense, and §1's whole design is built so that check has something to
  check against.

### 0.3 What the rule does *not* forbid

The ban is on **runtime stylesheet generation**, not on the DOM `style` attribute.

| Allowed | Why |
|---|---|
| Inline `style={{ … }}` | A DOM attribute, not CSS-in-JS. Zag's `normalizeProps` (the adapter function that turns a machine's framework-agnostic prop bag into framework props) emits `style` objects; floating positioning, slider thumb offsets, progress fills and collapsible heights all require it |
| Inline CSS custom properties (`style={{ "--x": v }}`) | The sanctioned escape hatch for genuinely dynamic values (§3.5) |
| Panda's runtime `css` / `cva` / `sva` / `cx` | Pure string computation (§0.1) |
| Panda's `/patterns` helpers (`flex.raw`, `getFlexStyle`, …) | Pure prop→style-object functions. No Solid, no JSX (`prior-art.md` §2.4) |
| Build-time emitted global CSS (preflight, keyframes, tokens) | Build output, not runtime |

### 0.4 What it costs — the parity delta, with its cause named

Two different causes produce a parity delta, and conflating them makes the second look like a
consequence of the first. The **Cause** column separates them: `CSS-in-JS` deltas follow from §0 and
are permanent; `React→Solid` deltas follow from the target framework and would exist in any Solid
port.

| Chakra v3 capability | Mechanism there | Status here | Cause |
|---|---|---|---|
| `css` prop / style props with **runtime** values | Emotion serializes on the fly | **Not supported.** Three routes in §3.5 | CSS-in-JS |
| `createSystem(defaultConfig, {…})` runtime theming | runtime | **Not supported.** Build-time `panda.config.ts` only | CSS-in-JS |
| Arbitrary one-off values anywhere | runtime | Only if statically extractable, declared in `staticCss`, or routed through a CSS variable | CSS-in-JS |
| `useRecipe({ key })` / `useSlotRecipe({ key })` | Both resolve through `useChakraContext()` — a runtime system object (measured: `styled-system/use-recipe.ts`, `use-slot-recipe.ts`) | **Replaced by a static import** from the generated `@chakra-ui-solid/styled-system/recipes`. Same variant API, no context, no runtime override | CSS-in-JS |
| **Responsive recipe variants** — `<Button size={{ base: "sm", md: "lg" }}>` | runtime | **Supported, off by default** — the consumer opts in per recipe or per variant key with `chakraConfig({ responsive })` (§3.8) | CSS-in-JS |
| `useToken()` runtime token lookup | runtime dictionary | Supported, reimplemented as a read of the generated build-time token map | CSS-in-JS |
| Token / recipe / variant styling | runtime | **Full parity** — the bulk of the surface | — |
| `asChild` | React `cloneElement` | **`render` prop** (`brief-plan` §0, fixed) | React→Solid |
| `hideMode: "activity"` on presence | React 19 `<Activity>` | **Not supported.** `"display-none"` only — there is no Solid equivalent (`prior-art.md` §8.3) | React→Solid |
| `"use client"` / RSC-shaped API surface | React Server Components | **Absent.** SolidStart has its own model; nothing to port | React→Solid |
| Component-level `ref` typing (`ComponentPropsWithoutRef`, `forwardRef`) | React | Solid props + `render`; `as` stays a loose `ValidComponent` rather than a generic that re-types props from the element (`prior-art.md` §2.5) | React→Solid |
| `Portal`'s `disabled` — render children in place instead of portalling them | React re-renders on the prop | **Not shipped at all.** The reactive Solid form needs a `children()`-resolved `<Show>`, which relocates `_hk` for the whole portalled subtree; a non-reactive prop that silently ignores changes is §0.2 in prop form, so omitting it makes passing it a type error (`roadmap.md` §5.1, §13 row 1b) | React→Solid |
| **Colour mode** | A **CLI snippet** over `next-themes`, installed into the consumer's app — not library API (`colorMode` appears zero times in `@chakra-ui/react`) | **We ship a built-in primitive** — a pre-paint script, a module-level signal, `.light`/`.dark` on the root and `color-scheme` beside it. **A divergence in the pleasant direction, flagged rather than absorbed** (D-116's precedent): `next-themes` has no SolidJS equivalent, so porting the composition faithfully would ship a wrapper around nothing and leave every consumer to rediscover the same 80 lines. §7.1 | React→Solid |

Per-component exclusions are P6's parity matrix, not this table — and P6 measured them: **only `for`,
`show` and charts are excluded.** `portal`, `client-only` and `presence` ship, and `environment` is
relocated to a context rather than excluded (`roadmap.md` §5, §13 row 1). The six-name list this
paragraph used to carry was wrong by four.

### 0.5 Consequence for the reference policy

`@chakra-ui/react`'s `src/styled-system/` (46 files plus a `generated/` directory) **is an Emotion
serializer.** Reference for **API shape and naming only — never implementation** (`legal.md` §1.4).
Reading `css.types.ts` to learn what `SystemStyleObject` accepts is correct; porting its resolution
pipeline violates §0 long before it raises a licensing question. §2 is where that line does real
work.

---

## 1. Q2 — how consumers get CSS for variants their source never writes

**The question, restated with what P2 measured.** If our Dialog calls
`dialogSlotRecipe({ size: props.size ?? "md" })`, the argument is dynamic, so Panda cannot extract it
statically from our source — and `panda ship` (the command that writes a *buildinfo*, a JSON file
recording everything Panda extracted from our source, which the consumer feeds to their own build)
hits the identical limit. Under §0.2 the result is an unstyled dialog and a green suite.

### 1.1 The problem is one step wider than the plan states

Measured in `@chakra-ui/panda-preset@3.36.1`:

```bash
grep -rn "\bjsx\b" __reference-impl__/chakra-ui/packages/panda-preset/src/   # nothing
```

**No recipe in the preset declares a `jsx` tracking hint.** Panda associates a JSX prop with a recipe
only through that hint (`recipes: { button: { jsx: ["Button"] } }`) or through a direct import from
the generated `styled-system/recipes`. Our consumers do neither: they write `<Button size="lg">` and
never import the recipe module. So it is not only *dynamic* variant arguments that fail to extract —
**no consumer-written recipe variant extracts at all**, static ones included. Every recipe variant in
this library is an internally-emitted variant from Panda's point of view.

Two more measurements that size the answer, both against the preset at `3.36.1`:

| Measured | Value | Why it matters |
|---|---|---|
| Variant keys / variant values across 18 recipes + 56 slot recipes | **142 keys, 488 values** | The upper bound on what `staticCss` must pre-generate |
| `compoundVariants` blocks | **zero** | No cartesian product. Recipe CSS is one class per variant key/value, so `staticCss` cost is **linear in 488**, not combinatorial |
| Breakpoints | 5 (`sm md lg xl 2xl`) | A responsive expansion multiplies 488 by 6 — the reason responsive is opt-in (§1.4) |
| Recipe files referencing `colorPalette` | 44 of 74 | The palette-remap class is a second internally-emitted value class (§1.3) |

Reproduce with:

```bash
grep -c compoundVariants __reference-impl__/chakra-ui/packages/panda-preset/src/{recipes,slot-recipes}/*.ts | grep -v ':0'
```

### 1.2 Decision

**`@chakra-ui-solid/panda-preset` declares `staticCss` per recipe, through `theme.extend`, adding
one key to each of the 74 recipes it inherits and re-emitting none of them.** `jsx` tracking hints
are added in the same pass as an optimization, but **nothing depends on them**.

Three facts make this the shape, all from Panda's own documentation:

1. `staticCss` is a **property of a recipe definition** — `defineSlotRecipe({ …, staticCss: ["*"] })`
   — not only a top-level config key.
2. `theme.extend.recipes.<key>` / `theme.extend.slotRecipes.<key>` **deep-merges into a preset's
   recipe**, and is the documented way to override `className`, extend `variants`, or add a `jsx`
   hint. Adding a `staticCss` key rides the same merge.
3. Config-level `staticCss: { recipes: "*" }` covers *"every defined recipe **and slotRecipe**"* — so
   the slot-recipe half of the mechanism is documented, not assumed.

And one from the prior art: `staticCss` **declared inside a preset** reaches the consumer's codegen
and pre-generates rules for values only a component's runtime chooses. hope-ui shipped exactly that,
in production, at `e9c2f81` (`prior-art.md` §2.7). That proves the *atomic-utility* half. Per-recipe
declaration is the same merge path applied one level deeper.

**Why per-recipe rather than config-level `staticCss: { recipes: "*" }`:**

- **It cannot be clobbered.** A consumer who writes their own top-level `staticCss` block competes
  with a top-level block from our preset; a `staticCss` key living *inside* a recipe body is merged
  by `theme.extend` like any other recipe property. The merge semantics of two competing top-level
  `staticCss` blocks are not documented and not verifiable here, so the asymmetry decides it.
- **It is granular without a second registry.** Adding a recipe delta later touches one object, not
  an object and a name list that must agree.
- **It never re-emits a recipe body**, which is the condition `legal.md` §1.5 and §6 item 3 attached
  to *"depend, do not vendor"*. That condition is met: our preset references recipe **keys**, never
  recipe **contents**.

### 1.3 What the preset declares, exactly

```ts
// @chakra-ui-solid/panda-preset
import chakraPreset from "@chakra-ui/panda-preset"
import { definePreset } from "@pandacss/dev"

const allVariants = (keys: string[]) =>
  Object.fromEntries(keys.map((key) => [key, { staticCss: ["*"] }]))

export default definePreset({
  name: "@chakra-ui-solid/panda-preset",

  // Our preset owns its own base, so a consumer's `eject: true` cannot strip the utility engine
  // out from under Chakra's recipes. See §3.2.
  presets: ["@pandacss/preset-base", chakraPreset],

  theme: {
    extend: {
      recipes: allVariants(Object.keys(chakraPreset.theme.recipes)),
      slotRecipes: allVariants(Object.keys(chakraPreset.theme.slotRecipes)),
    },
  },

  // The atomic half — values a component's own logic picks, which no consumer source ever writes.
  // The `display` row is hope-ui's precedent, verbatim in shape (prior-art §2.7).
  staticCss: {
    css: [
      { properties: { display: ["flex", "inline-flex"] } },
      { properties: { colorPalette: [/* the 10 palettes below */] } },
    ],
  },
})
```

`Object.keys(chakraPreset.theme.recipes)` reads the key list off the imported preset object rather
than hard-coding 74 names, so a Chakra release that adds a recipe is covered by the version bump
alone — which is the whole point of `legal.md` §1.5's *depend, do not vendor*.

**The ten `colorPalette` values**, measured from `semantic-tokens/colors.ts`: `gray`, `red`, `orange`,
`green`, `blue`, `yellow`, `teal`, `purple`, `pink`, `cyan`. (`bg`, `fg` and `border` are semantic
groups in the same file, not palettes.) A component that defaults `colorPalette` internally — or a
consumer wrapper that forwards it — emits `.color-palette_blue`, and without this row that class has
no rule. Ten declarations close the class of failure.

**One upstream trap this section must not paper over.** The slot-recipe registry key for Switch is
misspelled **`swittch`** upstream (`prior-art.md` §4.2). We consume the upstream key **verbatim**:
one exported constant, one comment, one upstream issue. Aliasing it to `switch` in
`theme.extend.slotRecipes` would register the same `className: "switch"` body under two keys and emit
its CSS twice; renaming it in our preset would fork the thing we depend on.

**It is not invisible to consumers, and this paragraph used to say it was.** P6 measured the second
half: `swittch` is *also* the `cursor` **token** key, while the Switch slot recipe references
`cursor: "switch"` — so the preset silently drops Switch's `cursor: pointer`, where Chakra's own
runtime theme does not (`roadmap.md` §1.3c, §13 row 7). That is a **preset defect rather than Chakra
behavior**, so inheriting it would be a divergence. Our preset therefore adds one key —
`theme.extend.tokens.cursor.switch = { value: "pointer" }` — and the slot-recipe key stays `swittch`,
verbatim. The upstream issue now has a concrete defect to report rather than a spelling observation.

### 1.4 What `staticCss` cannot cover

| Not covered | Why | What we do |
|---|---|---|
| **Responsive recipe variants** — `<Button size={{ base: "sm", md: "lg" }}>` | `staticCss: ["*"]` enumerates variant values at the base condition. Responsive expansion is a separate `responsive: true` flag, and turning it on multiplies 488 values by 6 conditions | **Off by default, with a first-class consumer opt-in: `chakraConfig({ responsive })`, three grains — §3.8.** Also a row in the §0.4 delta table. Emitting 6× the stylesheet for every recipe by default is the wrong trade for a library whose default sheet already carries 488 variant values |
| **Arbitrary style-prop values** — `<Box w={someRuntimeNumber}>` | Not a recipe variant; unbounded by construction | §3.5's dynamic-value contract. Route 3 (CSS custom property) is the answer, and it is the loudest page in the docs |
| **A consumer's own recipe overrides** | Their config, their `staticCss` | Documented; their `theme.extend` participates in their own codegen normally |
| **Atomic values our components pick that we forget to declare** | Nothing enumerates them | The **generated-CSS coverage check** (§0.2) is the mechanical backstop, and it is why that check is a P7 requirement rather than a nicety |

### 1.5 If step 4 refutes it — the fallback ladder

Step 4 of the implementation pass builds one real slot-recipe component and styles it in a throwaway
consumer project whose own source never names the variant. That gate confirms or refutes §1.2. The
ladder, in order, so a refutation costs a config line rather than a redesign:

1. **Config-level `staticCss` in the preset** instead of per-recipe — if recipe-level `staticCss` does
   not survive `theme.extend`'s merge. Same package, same release, no consumer change.
2. **Ship the declarations as a config fragment the consumer spreads** —
   `import { chakraConfig } from "@chakra-ui-solid/panda-preset"`. If preset-level `staticCss`
   does not reach a consumer's codegen at all, this bypasses preset merging entirely and costs the
   consumer one documented line. §3.4 ships this fragment **anyway**, for a different reason, so this
   rung is already built.
**There is no third rung, by decision** (§4.4). Shipping a prebuilt stylesheet was the former floor;
it is now excluded, because it is a build artifact that cannot carry consumer style props and would
create a second, half-functional support tier. If rungs 1 *and* 2 both fail, `staticCss` does not
reach a consumer's codegen by any route — that is a defect in Panda, not a fallback situation, and it
invalidates §0's approach rather than this section's.

Rung 2 is the realistic worst case. **Q2 is therefore not a project risk; it is a question about
where one declaration lives.**

### 1.6 Rejected

- **"Make every internal variant selection statically literal at the call site"** (`brief-plan` §9 Q2
  fallback). Rejected: it is impossible for a variant driven by a consumer prop —
  `slots({ size: props.size })` is dynamic by definition, and making it literal means a switch over
  every value at every call site, i.e. hand-writing 488 literals into our source. It also does
  nothing for the case that matters most (`brief-plan` §7 concern 2): a consumer who wraps our `Button` and
  forwards props gets silence either way.
- **Option A (put our `dist` in the consumer's `include`)** as the answer to Q2. Rejected on the
  plan's own reasoning (§2.1): it hits the identical static-extraction limit. It stays a documented
  escape hatch for a *different* problem — buildinfo skew (§4.1).
- **Rely on `jsx` tracking hints alone.** Rejected: a hint is a component **name**, so it breaks
  under aliasing (`import { Button as Btn }`), under namespaced part components (`<Dialog.Root>`),
  and under consumer wrappers — and it breaks *silently*, which is precisely the failure mode §0.2
  forbids us to build on. Hints are added, nothing depends on them.

---

## 2. Q4 — the style-props API

**Decision: Panda-shape. `renderStyled`'s mechanism stands unchanged; its prop surface needs three
named additions.**

`renderStyled` is hope-ui's 104-line styling factory at
`git show e9c2f81:packages/components/src/system/style-props.tsx` — style-prop extraction and class
composition layered over `renderElement`, the `as`/render-prop polymorphism and ref-merging primitive
(`prior-art.md` §2.5).

### 2.1 Why Panda-shape, and what "Panda-shape" actually means here

The style-prop vocabulary is not a design choice we make in the factory — it is whatever the
generated `isCssProperty` says, and `isCssProperty` is generated **from our config**
(`prior-art.md` §2.3, reason 3). So the vocabulary is:

```
@pandacss/preset-base's utilities
  + @chakra-ui/panda-preset's 7 additions
  + whatever our preset adds
```

Measured: the Chakra preset's `utilities.ts` is **87 lines** and adds exactly seven entries —
`focusRing`, `focusVisibleRing`, `focusRingColor`, `focusRingOffset`, `focusRingWidth`,
`focusRingStyle`, `boxSize`. It brings **none** of Chakra's style-prop shorthand vocabulary. That
lives in `@chakra-ui/react`'s own `src/preset-base.ts` — **1148 lines, 241 utility entries, 95
distinct shorthand names** — which is an Emotion-runtime config.

So the choice is real, and it is: adopt Panda's vocabulary and alias the gaps, or reproduce Chakra's
241-entry table into our preset.

### 2.2 The aliasing rule

A Chakra style-prop name is added to `@chakra-ui-solid/panda-preset`'s `utilities.extend` **only if
all three hold**:

1. It is one of Chakra's 95 shorthands, and
2. it is **absent** from the generated `isCssProperty` after `@pandacss/preset-base` + the Chakra
   preset, and
3. it is expressible as a Panda utility (`property`, optional `values`, optional pure `transform`)
   without colliding with an existing Panda utility of different semantics.

Anything failing (3) is a §0.4 delta, not an alias. Each alias is one line, named individually in
`decisions.md`.

**The list is a step-3 deliverable, not a P3 one.** Producing it requires diffing the generated
`isCssProperty` against Chakra's shorthand list, and Panda is installed in no checkout here — the same
reason `prior-art.md` §5.1 could not check Panda's preflight. What P3 fixes is the rule and the
bound: **at most 95 names, and the two presets share an author, so the true delta is expected to be
small.** The command that produces it:

```bash
grep -oE 'shorthand: \[[^]]*\]' __reference-impl__/chakra-ui/packages/react/src/preset-base.ts \
  | grep -oE '"[a-zA-Z]+"' | tr -d '"' | sort -u          # 95 names — diff against isCssProperty
```

### 2.3 Three additions `renderStyled` needs

The mechanism stands — the static key list, the lazy value reads in the `class` getter, the `css`-key
exclusion, the precedence order, and the SSR-safe pure-computation property are all correct as
written (`prior-art.md` §2.5). Three prop-surface items are missing, all **API shape** and therefore
free to adopt (`legal.md` §1.4):

| # | Chakra has | `renderStyled` today | Change |
|---|---|---|---|
| 1 | `css?: SystemStyleObject \| (SystemStyleObject \| undefined)[]` (`factory.types.ts:107`) | passes `css` as a single sibling argument to `css()` | `css()` is variadic — spread the array. One line |
| 2 | `unstyled?: boolean` — *"opt out of the theme styles"* (`factory.types.ts:23`) | no such prop | Gate `recipeClass` on it. Two lines at the seam §5.4 already reserves |
| 3 | `htmlSize`, `htmlWidth`, `htmlHeight`, `htmlTranslate`, `htmlContent`, because `color`/`size`/`translate`/`transition`/`width`/`height`/`content` are style props (`factory.types.ts:35-52`) | no renames — `<Box as="input" size={20}>` silently becomes a style prop and never reaches the element | Adopt the five renames verbatim. The collision is identical for us and it is exactly a §0.2-shaped silent failure |

Item 3 is the one worth arguing about at the gate: it is a **user-visible prop rename** inherited from
Chakra, and skipping it would leave seven HTML attributes unreachable on any styled element.

**Three is now four.** P5 added `styleSource?: object` — the object whose *keys* are scanned for
style props, defaulting to `props` — because a machine part feeds the factory a **merged** bag
containing the machine's own DOM attributes, and `editable`'s `getInputProps()` emits a top-level
`size: 1` that would be folded into `css({ size: 1 })` and never reach the `<input>`. Chakra avoids
it structurally by nesting `chakra(ArkDialog.Content)`; our flat layering has to say it out loud.
The rule, the worked failure and the lint rule that enforces it are `component-blueprint.md` §4.1.1.

Two shapes to confirm rather than decide, both step 3 (they need Panda installed): that Panda's
generated `ConditionalValue` accepts Chakra's responsive **array** form (`color={["red", "green"]}`),
and that curly token references (`bg="{colors.red.500}"`) resolve the same way. Both are believed to
be parity; neither changes the decision.

### 2.4 Rejected

**Chakra-shape — reproduce Chakra's 241-entry utility table into our preset.** Rejected on four
counts:

1. It is a **data table reproduced from `@chakra-ui/react`'s Emotion runtime** — expression tier under
   `legal.md` §1.4, owing an `@license` header and root + package `NOTICE.md` rows, on a file we would
   then maintain against every Chakra release.
2. It would **override** the seven utilities the Chakra preset defines, silently forking the package
   we depend on and defeating `legal.md` §1.5's tracking argument.
3. Most of the 95 are already Panda's — same author, largely the same set — so the bulk of the work is
   redundant, and the redundant part is the part that goes stale.
4. `isCssProperty` is generated from config, so every added utility widens the prop surface the factory
   and the type surface must agree on. §2.2 buys the same user-visible parity for the delta only.

---

## 3. The styling layer

### 3.1 `panda.config.ts`, knob by knob

```ts
export default defineConfig({
  eject: true,
  presets: [chakraSolidPreset],
  jsxFramework: "solid",
  hash: false,
  preflight: true,
  include: ["../{system,components}/src/**/*.{ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
})
```

| Knob | Why it is load-bearing |
|---|---|
| `eject: true` | Drops `@pandacss/preset-panda` — Panda's **default theme**. Without it Panda's token palette merges alongside Chakra's and the two disagree on `colors.gray.*`; the result is a theme that is neither, and nothing errors. It does **not** cost us `@pandacss/preset-base`, because our preset declares it (§3.2) |
| `presets: [chakraSolidPreset]` | One entry. The chain `chakraSolidPreset → ["@pandacss/preset-base", "@chakra-ui/panda-preset"]` is the preset's business, not the config's — which is what makes the same one-liner correct in a *consumer's* config too |
| `jsxFramework: "solid"` | Three reasons in `prior-art.md` §2.3. The one that bites hardest: `is-valid-prop` is generated **into `jsx/`** — hope-ui's exports map resolves `./is-valid-prop` to `./styled-system/jsx/is-valid-prop.mjs`. Unset this and the module our factory imports does not exist |
| `hash: false` | Determinism across the library/consumer boundary. §4.3's external-package model downgrades it from *required* to *kept*, because both halves now execute the same `css` module — but it stays, because it is what makes the SSR fixtures and the §0.2 coverage check readable. A hashed name turns a coverage failure into a hex string. **It is also a consumer-side knob that must match ours** (§3.4) |
| `preflight: true` | Emits the reset the recipes assume, and it is where `prior-art.md` §5.1's open `[hidden]` question lands (§3.7) |
| `include` | Covers **our own source only, for the dev stylesheet** Storybook and browser tests render against. It is *not* the consumer's extraction channel — that is the buildinfo (§4.1). Keeping the two straight is what stops a green local suite from hiding a broken consumer |
| `exclude: []` | Set explicitly so an inherited default cannot quietly drop a directory |
| `outdir: "styled-system"` | The generated artifacts land inside the published `@chakra-ui-solid/styled-system` package (§4.2) |
| `importMap` | **Deliberately unset.** It is the *consumer's* knob; our config generates into its own package and imports by relative path |

### 3.2 `eject` vs. an explicit `presets` array — decided, and the fix relocated

**Decision: `eject: true` stays, and `@pandacss/preset-base` is declared by
`@chakra-ui-solid/panda-preset`, not by any `panda.config.ts`.**

`prior-art.md` §2.2 established the defect: `eject: true` drops Panda's default presets, and
`@chakra-ui/panda-preset` does not self-declare a base — it has no `presets` array and reaches for
`utilities: { extend: … }` and `conditions: { extend: { icon: "& :where(svg)" } }`, both of which
presume a base is already there. Copying hope-ui's config verbatim would take the style-prop
utilities (`p`, `bg`, `_hover`) and the base conditions (`_open`, `_highlighted`, …) with it, and
every recipe in the preset would then reference conditions that do not exist.

`prior-art.md` §10.2 row 1 proposed the one-line fix `presets: ["@pandacss/preset-base",
chakraPreset]`. **P3 keeps the fix and moves its location**, for one reason: that line fixes *our*
config only. The consumer writes their own `panda.config.ts`, and if the base-preset dependency lives
in a config file, every consumer has to know a fact about the internals of a preset they merely
listed. Declaring it inside `@chakra-ui-solid/panda-preset` makes `presets: [chakraSolidPreset]`
sufficient on both sides of the boundary — and it reproduces exactly the chain hope-ui proved
works, where the base theme self-declared `presets: ["@pandacss/preset-base"]` and the Chakra theme
declared `presets: [basePreset]` (`prior-art.md` §2.2).

`@pandacss/preset-base` therefore becomes a **dependency of `@chakra-ui-solid/panda-preset`**,
alongside `@chakra-ui/panda-preset`. Both are MIT and config-only; the preset package's runtime cost
stays zero (`legal.md` §1.5).

Rejected: **drop `eject`.** That readmits `@pandacss/preset-panda`'s default theme, which is the
thing `eject` exists to remove. Rejected: **leave the fix in the config.** It works, and it fails
open — a consumer who omits it gets an unstyled library with no error, which is §0.2 again.

### 3.3 `@chakra-ui-solid/panda-preset` — what it is and what it exports

A **public, config-only package with zero CSS**, depending on `@chakra-ui/panda-preset` and
`@pandacss/preset-base`. It is the whole "look'n'feel for free" premise and the package `legal.md`
§1.5 rules must **depend, not vendor**. Two exports:

**One subpath, `.`, with two exports.** There is no `./config`: a consumer who needs the preset and a
consumer who needs the config fragment are the same consumer, and a second subpath only adds a way to
import half of what they need.

| Export | What | Why |
|---|---|---|
| `chakraSolidPreset` (default) | The Panda preset — base declaration (§3.2), the per-recipe `staticCss` deltas and `jsx` hints (§1.3), the atomic `staticCss.css` block, the ≤95 alias utilities (§2.2), and any `globalCss` delta (§3.7) | Composing with another preset — override path 4 (§3.7) |
| `chakraConfig(options?)` (named) | A **function** returning a `defineConfig`-shaped fragment carrying every knob that must match ours: `{ eject, presets, jsxFramework, hash, preflight, importMap }` — with `presets` already containing `chakraSolidPreset` | §3.4, and the responsive opt-in of §3.8 |

`chakraConfig` is a function even when called with no arguments (`chakraConfig()`), so the responsive
opt-in of §3.8 is a change of argument rather than a change of call shape. One documented form, no
object-or-function ambiguity.

Everything the preset adds is a **key** on top of the official preset — never a recipe body, never a
token table. That is the condition `legal.md` §6 item 3 asked P3 to check, and it holds **for the
`staticCss` and alias deltas above**.

**P6 added two deltas that this sentence does not cover, and they are not the same tier**
(`roadmap.md` §13 row 7b; `definition-of-done.md` §6):

| Delta | Tier | Consequence |
|---|---|---|
| `theme.extend.tokens.cursor.switch = { value: "pointer" }` (§1.3) | One word. **Owes nothing** | Must **not** enter `attribution.config.ts` — a check demanding a header for a token value would be wrong (`testing.md` §9) |
| The **`container` recipe body**, ported from `@chakra-ui/react`'s `theme/recipes/container.ts` | **Expression** under `legal.md` §1.4 — the first such file outside the `zag-solid` fork | An `@license` header, a registry entry, and the preset package's first `NOTICE.md`. It lands with the Container component at step 6 and retires that component's coverage allow-list entry in the same commit |

*Depend, do not vendor* still holds as the rule; the `container` recipe is the one measured exception,
and it is exceptional because the preset is exactly one recipe short of Chakra's runtime theme.

### 3.4 The consumer's config, and the two knobs that silently unstyle everything

```ts
// the consumer's panda.config.ts
import { defineConfig } from "@pandacss/dev"
import { chakraConfig } from "@chakra-ui-solid/panda-preset"

export default defineConfig({
  ...chakraConfig(),
  include: [
    "./node_modules/@chakra-ui-solid/components/dist/panda.buildinfo.json",
    "./src/**/*.{ts,tsx}",
  ],
  outdir: "styled-system-app",
})
```

The preset is not imported here — `chakraConfig()` already puts it in `presets`. A consumer composing
their own preset on top reaches for it explicitly (§3.7 path 4).

**Spreading is shallow, so any key the consumer re-declares replaces ours wholesale.** That is fine
for `include` and `outdir` — they are meant to be theirs — and a hazard for `presets`, `staticCss` and
`theme`, where they usually mean *"and also mine"*. The documented form for those is Panda's own
`mergeConfigs([chakraConfig(), { … }])` rather than a spread.

In Panda's external-package model the consumer **does not regenerate the runtime** — `css()` comes
from our published `@chakra-ui-solid/styled-system`, and their Panda run produces the *stylesheet*.
That split creates a failure mode worth naming:

**`hash` and `prefix` must agree across the boundary, or nothing is styled.** Our published `css()`
was generated with `hash: false`, so it emits `p_4`. A consumer who sets `hash: true` gets a
stylesheet whose rules are hashed. Every class our runtime computes is then absent from their sheet —
§0.2 at total scale, with no error anywhere. `chakraConfig()` exists to make this unconstructable: the
consumer spreads it and there is no knob to get wrong.

Two CI checks follow (P7 owns their wiring): assert our published `styled-system` was generated with
`hash: false`, and — in the step-4 throwaway consumer — assert that flipping `hash` **fails loudly**
in the coverage check rather than silently.

### 3.5 The dynamic-value contract

`<Box w={runtimeValue}>` cannot work as it does in Chakra. Three sanctioned routes, in preference
order, documented as a first-class API contract:

1. **Literal / token value** — statically extractable. The overwhelmingly common case; full parity.
2. **A value from a known finite set** — declared in `staticCss` so every member is pre-generated.
3. **Genuinely dynamic** — a **CSS custom property** through inline `style`, consumed by a static
   class: `style={{ "--w": w }}` with `w="var(--w)"`. §0.3-legal.

§1's decision changes route 2's weight: for **recipe variants** it is automated by the preset and no
component author ever declares anything. Route 2 stays manual only for **atomic style-prop values a
component's own logic picks** — hope-ui's worked case is `Flex`'s `inline` prop toggling
`display: inline-flex` (`prior-art.md` §2.7), which is why that row is in §1.3's `staticCss.css`
block.

Route 3 needs a lint rule, because using it accidentally as route 1 fails silently. `brief-plan` §7 concern 2
is right that this is the loudest page in the docs, not a footnote in theming.

### 3.6 How a component reaches a recipe

Chakra resolves recipes through a runtime system object — `useRecipe`/`useSlotRecipe` both call
`useChakraContext()` and then `sys.cva(...)` / `sys.getSlotRecipeFn(key)` (measured). There is no
runtime system here, so:

```
@chakra-ui-solid/styled-system/recipes   ← generated: one exported function per recipe
        ↓ static import
@chakra-ui-solid/system                  ← the slot-recipe context: resolves once per Root,
                                            exposes the per-slot class map to part components
        ↓ context read
a part component                         ← renderStyled({ recipeClass: () => slots().content, … })
```

The variant **API** is Chakra's (same variant names, same `unstyled` opt-out, same defaults from the
recipe's `defaultVariants`); the **resolution** is a static import. That is the §0.4 row, and it is
the only structural difference in this path.

Where the slot-recipe context lives and what it exposes is §5.3; how a part component consumes it —
`data-*` attributes, the `hidden`-vs-`display` rule, ref handling — is **P5's blueprint**, not this
document.

### 3.7 Override paths, and the one open preflight item

Four override paths, from cheapest to widest:

1. **CSS custom properties** on any element — the recipes are written against tokens that compile to
   custom properties, so `style={{ "--dialog-z-index": … }}` retunes one instance. The only path that
   needs no build participation at all.
2. **Style props / `css` prop** on any part — extracted from the consumer's own source, full parity.
3. **`theme.extend.slotRecipes.<key>`** in the consumer's config — deep-merges into the preset's
   recipe exactly as our own `staticCss` deltas do (§1.2). This is the Chakra-equivalent of
   `createSystem(defaultConfig, { theme: { slotRecipes: … } })`, moved to build time.
4. **A different preset** — `presets: [chakraSolidPreset, myPreset]`.

**Open, and assigned to step 3:** whether Panda's `preflight: true` emits an equivalent of Chakra's
`"[hidden]:where(:not([hidden='until-found']))": { display: "none !important" }`
(`preflight.ts:140`). The Chakra **preset**'s `global-css.ts` does not carry it — verified,
`grep -n hidden` returns nothing — and Panda is installed in no checkout here. If Panda's preflight
does not carry it, **one `globalCss` line in our preset reproduces Chakra's rule verbatim.** That is
a port, not an invention, and it is what makes `prior-art.md` §5.1's `hidden`-vs-`display` tax not
apply to us. P5's blueprint depends on the answer.

### 3.8 The responsive-variant opt-in

§1.4 leaves responsive recipe variants — `<Button size={{ base: "sm", md: "lg" }}>` — off by default,
because `responsive: true` multiplies 488 variant values by 6 conditions. **The toggle belongs to the
consumer, not to us: the stylesheet is produced by their Panda run** (§3.4), so this is a knob they
already own and we are only giving it a name.

```ts
// the consumer's panda.config.ts
export default defineConfig({
  ...chakraConfig({ responsive: { button: ["size"] } }),
  include: [ … ],
})
```

Three grains above the default, so nobody pays for conditions they do not use:

| `responsive` | Covers | Rules added |
|---|---|---|
| omitted | nothing — base conditions only | 0 |
| `{ button: ["size"] }` | one variant key on one recipe | ~30 |
| `["button", "heading"]` | every variant key on those recipes | ~180 |
| `true` | all 142 keys / 488 values across 74 recipes | ~2,900 |

`chakraConfig` expands the shorthand into the form Panda already understands — nothing new is asked of
Panda:

```ts
{ button: ["size"] }
// becomes
staticCss: { recipes: { button: [{ size: ["*"], responsive: true }] } }
```

**It is emitted as a top-level `staticCss` block, not through `theme.extend`,** which is the opposite
of §1.2's choice and for the opposite reason. §1.2 avoided a top-level block because *our preset's*
declarations would compete with a consumer's own; here the block **is** the consumer's, written into
their config by a function they called. A consumer who also hand-writes `staticCss` hits the shallow
spread named in §3.4 — `mergeConfigs` is the documented answer, and this is the case that most needs
it in the docs.

**Types cannot follow the flag.** `size={{ base: "sm", md: "lg" }}` type-checks whether or not the
rules were generated, because the prop types come from our recipes while the CSS comes from their
config. So forgetting the opt-in is a §0.2 silent unstyling, and the generated-CSS coverage check is
what catches it. Docs put the opt-in on the same page as the §0.2 warning, not in a theming appendix.

**Owner: P7** (the preset's implementation and its CI checks); the docs page is **P8**.

---

## 4. Distribution

### 4.1 Option B — ship the build info

We follow Panda's documented **"use Panda as an external package"** path, with consumption **option
B**: `@chakra-ui-solid/components` ships `dist/panda.buildinfo.json`, produced by `panda ship`, and
the consumer adds that one file to their `include`.

The reasons are the plan's (§2.1) and stand unchanged — B decouples our source-shipping format from
Panda's parser (we ship JSX-preserved `.jsx` for *Solid-toolchain* reasons, §8, and requiring every
consumer's Panda to also parse that is a coupling we do not need); it is one stable file path rather
than a recursive glob behind pnpm's symlinks; and it costs the consumer one JSON read per build
instead of re-parsing 118 components.

**Option A stays supported as a documented escape hatch** — we ship source regardless, so enabling it
costs nothing. It is for buildinfo skew and for anyone vendoring our source, not the default.

**B's failure mode is stale buildinfo**, and it is mitigated mechanically: the buildinfo is generated
in the release pipeline, and a CI check fails if a fresh `panda ship` differs from what is about to be
published.

**Correction carried from the plan.** The brief's `dependencies` option is *"globs or files that
trigger a config reload when changed"* — a config watcher, **not** an extraction source. Both
consumption options use **`include`**; `importMap` is the correct half of the pairing.

### 4.2 The exports map

`@chakra-ui-solid/styled-system` is **published**, not workspace-private:

| Subpath | Target |
|---|---|
| `./css` | `styled-system/css` |
| `./tokens` | `styled-system/tokens` |
| `./patterns` | `styled-system/patterns` |
| `./recipes` | `styled-system/recipes` — **new vs hope-ui**, which never reached recipes (`prior-art.md` §2.6) |
| `./is-valid-prop` | `styled-system/jsx/is-valid-prop` |
| `./types` | `styled-system/types` (types only) |
| `./package.json` | itself |

**No subpath resolves to a `.css` file** (§4.4). The CI check that asserts no export resolves to
`jsx/index` asserts this in the same pass.

**`./jsx` is never exported** — meaning `jsx/index`, the Solid 1.x factory, which is broken against
Solid 2.0 in three ways at once (`brief-plan` §3.1: `splitProps` is gone, `solid-js/web` does not exist, and
`mergeProps` survives only as an `@solidjs/web` alias with `merge`'s presence-not-value semantics).

Note the precision the exports map forces: **`./is-valid-prop` resolves *inside* `jsx/`**
(`prior-art.md` §2.6 — hope-ui's map points it at `styled-system/jsx/is-valid-prop.mjs`). So the rule
is not "expose nothing from `jsx/`". The CI check must assert **no export resolves to `jsx/index`**,
and separately that **`./is-valid-prop` exists** — it is what makes the generated, config-aware
`isCssProperty` reachable, and §2.1 puts the entire style-prop vocabulary on it.

### 4.3 External, not inlined

`@chakra-ui-solid/styled-system` is marked **external** in our build, so the library and the consumer
app share **one instance** of the `css` runtime rather than duplicating it. This supersedes hope-ui's
model, which kept `styled-system` private and inlined its runtime into the components bundle
(`prior-art.md` §2.6). A CI check asserts it is external in the built bundle: duplicating the runtime
is silent, and it defeats the single-instance guarantee that makes `hash: false` merely useful rather
than load-bearing.

### 4.4 We ship zero CSS — Panda is a prerequisite, not a preference

**No `.css` file is published from any package in this repo, ever.** Panda in the consumer's build is
a hard requirement: without it there is no supported way to use this library.

An earlier draft of this section offered a prebuilt `panda cssgen` sheet as a secondary path for
consumers who do not run Panda. It is rejected, on three grounds:

- **It cannot carry consumer style props**, by construction (§0.2). `<Box p={4}>` in *their* source is
  extracted by *their* Panda run — a sheet frozen at our build has no rule for it. That is the single
  capability the library is best known for.
- **It cannot carry consumer theming.** Only override path 1 of §3.7 (CSS custom properties) survives;
  paths 2–4 all require build participation.
- **It creates a second support tier.** Every knob added afterwards — the responsive opt-in of §1.4
  being the live example — has to be documented twice and either works or silently does not depending
  on which tier the reader is on. A half-functional tier costs more in docs and issues than it earns.

The cost is stated plainly rather than hidden: a consumer who will not run Panda is not a consumer of
this library. Three deliverables carry that, each with an owner, so the prerequisite is enforced by
the package manager rather than by a sentence someone skims:

| Deliverable | Shape | Owner |
|---|---|---|
| **The Panda-prerequisite line**, wording unchanged: *"Requires Panda CSS in your build. Not optional — this library publishes no CSS."* **In three places**, not one — the README's first line above the install snippet and before the feature list; the docs home (`docs-plan.md` §3); and above the install snippet on the install page (`docs-plan.md` §4) | Prose. Writing the README **file** is the implementation pass's step 8, not the document pass | **P8** (specced), step 8 (written) |
| **`@pandacss/dev` as a `peerDependency`** on `@chakra-ui-solid/panda-preset`, `styled-system` and `components` | `"@pandacss/dev": "^1.12.0"`, not a `dependency` — the consumer's Panda must be the one that runs. `peerDependenciesMeta.optional` is **not** set: the warning is the point | **P7** |
| **CI check: no published `package.json` lists a `.css` file** in `exports`, `files` or `style` | Runs beside the §4.2 `jsx/index` check, same pass | **P7** |

Without the peer dependency this failure is §0.2 at project scale — `npm install`, run the app, every
component renders naked, and no tool anywhere says why.

`cssgen` keeps its internal role — it produces the dev stylesheet the browser tests and the
generated-CSS coverage check assert against (§0.2, §9). That output is never published.

---

## 5. The package graph

### 5.1 The graph

```
@chakra-ui-solid/panda-preset      PUBLIC, config-only, zero CSS.
                                   presets: ["@pandacss/preset-base", "@chakra-ui/panda-preset"]
                                   + staticCss deltas + jsx hints + alias utilities.
                                   One subpath "." → default chakraSolidPreset,
                                   named chakraConfig(options?) (§3.3, §3.8).

@chakra-ui-solid/styled-system     PUBLIC, generated by Panda. The importMap target.
                                   EXTERNAL in our build. jsxFramework "solid"; ./jsx never exported.

@chakra-ui-solid/zag-solid         PUBLIC. The Solid 2.0 fork of @zag-js/solid — 7 source + 7 test
                                   files. Depends on @zag-js/* only, nothing in this repo.
                                   ← milestone one.

@chakra-ui-solid/system            PUBLIC, hand-written. §5.3.

@chakra-ui-solid/components        PUBLIC. The components. Ships dist/panda.buildinfo.json.
                                   ^ P — no `ship` script and no buildinfo today. Gate: step 4,
                                     with check:buildinfo-fresh (DoD §7b).

@chakra-ui-solid/internal-test-utils   PRIVATE.

apps/docs                          TanStack Start (beta 2.x line, `brief-plan` §3.2).
```

### 5.2 Dependency direction — strictly downward

> **This table is the FINISHED graph, not today's** — **D-119** says so in as many words, and a
> reader who takes it for a description of `packages/*/package.json` will look for two edges that
> are not there. Marked at S4 against the real manifests. The **P** rows are predictions with a
> gate; the rest are **I**.
>
> The graph **as it actually stands today**, measured from the manifests:
> `panda-preset → nothing`, `zag-solid → nothing`, `styled-system → panda-preset` (dev),
> `system → styled-system`, `components → system + styled-system`,
> `internal-test-utils → styled-system` (dev), `apps/docs → components + styled-system`.

| Package | Depends on, in-repo | Today |
|---|---|---|
| `panda-preset` | nothing | **I** — and the package is `panda-preset`, not `preset`, since **D-161** |
| `zag-solid` | nothing | **I** |
| `styled-system` | `panda-preset` (dev/config-time only — Panda reads it to generate) | **I** |
| `system` | `styled-system`, `zag-solid` | `styled-system` **I**. **`zag-solid` is P — the edge does not exist. Gate: step 5**, when the presence render strategy lands, because the edge exists *because presence is a machine* (**D-40**, **D-119**) |
| `components` | `system`, `styled-system`, `zag-solid` | `system` and `styled-system` **I**. **`zag-solid` is P — same gate, same reason** |
| `internal-test-utils` | `system` — **from milestone 3, not before** (see below) | **P — still not there at step 3b.** The edge today is `internal-test-utils → styled-system`, which this table does not list. Gate: the first test helper that renders something styled |
| `apps/docs` | `components` | **I**, and it also depends on `styled-system` directly — the docs app is a *consumer instance* (`docs-site.md` §1.1), so it takes the generated surface the way any consumer does |

`zag-solid` depends on nothing here — that is what lets it be milestone one and ship before any
styling decision is settled. `system` depending on `zag-solid` is new relative to the plan's graph and
follows from §6: presence is a machine, so the layer that owns the presence render strategy owns an
adapter dependency.

**`internal-test-utils → system` is right about the direction and was early about the date**
(`testing.md` §1.8; `definition-of-done.md` §10 row 3). The fork's seven test files import `mount` and
`expectNoA11yViolations`, so the harness ships **in milestone one, alongside the adapter** — and at
that point `mount`, the axe helper and the hydrate fixture touch no styling. The edge must not exist
yet. It appears at **milestone 3**, when the harness first renders something styled.

**This table is in-repo edges only, and the closure is wider.** P6 measured what the graph looks like
once machines and Panda are installed (`roadmap.md` §11, §13 row 9): **37 `@zag-js/*` machine
packages** on `components`, `@zag-js/presence` on `system`, four Zag utility packages, and
**`@pandacss/dev` as the graph's first edge required *of the consumer*** rather than of us (§4.4).
Growth is measured **per batch**, never as a flat per-component number — the arithmetic error
`prior-art.md` §10.2 rows 6 and 8 correct.

### 5.3 What `@chakra-ui-solid/system` owns

The plan's version of this package was *"renderStyled, styled factory, style props, render prop,
recipe/slot-recipe context, color mode, direction"* plus, implicitly, an accessibility kernel. The
port rule removed three of the four kernel primitives (`prior-art.md` §8.2, §10.1). What remains:

| # | Owned | Source | Note |
|---|---|---|---|
| 1 | `renderStyled` — style-prop extraction, class composition, the `recipeClass` seam | copy from `e9c2f81`, extend | §2.3's three additions |
| 2 | `renderElement` / `RenderProp` — `as` polymorphism, the `render` prop, ref merging | copy | Already the ref-merging owner and Solid-2.0-correct |
| 3 | **The recipe layer** — typed wrappers over the generated `cva`/`sva` functions, the slot-recipe context, `unstyled` | **build** | §3.6. This is the seam `renderStyled`'s `recipeClass` was left open for, and it is unused in the prior art (`prior-art.md` §2.5) |
| 4 | **Presence render strategy** — `lazyMount`, `unmountOnExit`, `skipAnimationOnMount`, `hideMode` | **build** | §6 |
| 5 | **Locale / direction / environment contexts** | **build, minimally** | §7 |
| 6 | `withDefaults`, `composeEventHandlers`, `createKeyboardHandler`, `runIfFunction` | copy | `withDefaults` is mandatory: without it `<Dialog.Root modal={props.modal}>` with `modal` unset silently yields a non-modal dialog (`prior-art.md` §9). **`composeEventHandlers`' justification changed at P5** — a machine part never calls it, because the adapter's `mergeProps` already chains `on*` across sources; it is needed for part shapes **C and D** only (`component-blueprint.md` §3.4, §13 row 9). The carry-over stands; the reason does not |
| 7 | `createRegisteredId` — 12 lines of `onSettled` deferral around Solid 2.0's `[REACTIVE_WRITE_IN_OWNED_SCOPE]` | copy | **Available, not a pattern.** It has no call site in a 1:1 port (`prior-art.md` §8.2) |
| 8 | **Color mode: nothing** | — | §7 |

**The a11y kernel is not here, and that is the decision.** `createHideOutside` and
`createFocusRestore` are struck by the port rule; `createPresence` is replaced by a build over the
`@zag-js/presence` machine. The behavior kernel is Zag's, entirely — the retained set is **12 lines**,
and they are a Solid 2.0 write-deferral mechanism, not accessibility (`prior-art.md` §10.1).

### 5.4 Seams

The named extension points, each one a place a later phase plugs in rather than modifies:

| Seam | Who plugs in |
|---|---|
| `recipeClass?: Accessor<string \| undefined>` on `renderStyled` | The recipe layer (§3.6) and `unstyled` (§2.3) |
| The slot-recipe context | Every part component (P5) |
| The `render` prop | Consumers, for polymorphism |
| A machine's `ids` prop | Consumers overriding a part's id — proven to work, and the retraction of the claim that it could not is `prior-art.md` §8.1 |
| `@chakra-ui-solid/panda-preset` → `chakraSolidPreset` | Consumers, for theming (§3.7) |
| `@chakra-ui-solid/panda-preset` → `chakraConfig(options?)` | Consumers, for Panda wiring (§3.4) and the responsive opt-in (§3.8) |

### 5.5 Subpath exports

Measured, `@chakra-ui/react`'s exports map is `.`, `./anatomy`, `./preset`, `./preset-base`,
`./styled-system`, `./collection`, `./theme`, `./hooks`, `./package.json`, and a **wildcard `./*`**
resolving to `./dist/esm/components/*/index.js`.

**Chakra's monolith exposes as subpaths what our package graph exposes as packages.** Four of those
entries have no equivalent here: `./preset`, `./preset-base` and `./theme` are
`@chakra-ui-solid/panda-preset`, and `./styled-system` is `@chakra-ui-solid/styled-system`. What
remains maps one-to-one:

| `@chakra-ui-solid/components` | Mirrors | Note |
|---|---|---|
| `.` | `.` | The barrel |
| `./anatomy` | `./anatomy` | The part-name vocabulary — a machine's named parts (`Root`, `Trigger`, `Content`, …) |
| `./collection` | `./collection` | Re-export of `@zag-js/collection`, as Chakra does |
| `./hooks` | `./hooks` | The public hooks |
| `./*` | `./*` | Per-component, → `dist/components/*/index.jsx` under the **`"solid"` condition only** (§8) |
| `./package.json` | `./package.json` | |

The wildcard is one line resolved by path convention, not an enumerated list, so it carries no
per-component maintenance — which is why the earlier instinct to skip it was wrong. Tree-shaking is
already covered by ESM-only output with `sideEffects: false`; the wildcard is about matching Chakra's
import paths, which is a parity requirement rather than a performance one.

---

## 6. Presence — a package-graph decision, not a component detail

**Presence lives in `@chakra-ui-solid/system`.** Three reasons: at least six components need it
(`dialog`, `drawer`, `tooltip`, `menu`, `action-bar`, `floating-panel` set
`unmountOnExit`/`lazyMount` by default in Chakra — `prior-art.md` §5.1), so it cannot live in any one
of them; it is a machine plus a render strategy, which is precisely the system layer's job; and it
depends on `zag-solid` and on nothing in `components`, so the graph stays downward.

The split, from `prior-art.md` §8.3:

| Concern | Owner |
|---|---|
| `present`, `onExitComplete`, `immediate`; `skip` / `present` / `setNode` / `unmount`; **animation-name detection and `animationend` waiting** | **`@zag-js/presence`** — a Zag machine we consume through **our own adapter**, exactly like `dialog` or `listbox`. Not a special case, and **not Ark**: Ark is not a dependency and never will be (`legal.md` §1.4) |
| `lazyMount`, `unmountOnExit`, `skipAnimationOnMount`, `hideMode`; the `data-state` + `hidden` prop getter; the gate that renders `null` when unmounted | **Ours to write** — ~30 lines of render strategy that is not in the machine. Ark invents these and Chakra's public API exposes them (`DialogRoot` ships `defaultProps: { unmountOnExit: true, lazyMount: true }`), so parity requires them |

Reading Ark for the prop names and semantics is **API-shape tier and owes nothing** (`legal.md` §1.4);
reproducing its expression would not be. Three places the Solid version is simply smaller:
`wasEverPresent` is a closure variable rather than a `useRef`; `useEvent(props.onExitComplete)` is a
stale-closure workaround that deletes outright because Solid props are already live; and
**`hideMode: "activity"` maps to React 19's `<Activity>`, which has no Solid equivalent** — we ship
`"display-none"` only, and that is the §0.4 row, not a gap to paper over.

**The plan's objection to `@zag-js/presence` is resolved and does not return.** `brief-plan` §8 assumption 11
doubted that Zag's animation-**name**-based presence composes with Chakra's animations. Measured
across all 56 slot recipes: **9 use `animationName`, and not one uses `transitionProperty` inside an
`_open`/`_closed` block** (`prior-art.md` §8.2). Zag's presence is the correct mechanism for this
preset; hope-ui's transition-based `createPresence` was never the right shape here.

---

## 7. Color mode, direction, locale, environment

### 7.1 Color mode: we ship a primitive, and no provider

> **Amended at S3b, 2026-08-09 (`decisions.md` D-134), reversing D-38.** The measurement below is
> unchanged and the contract below is unchanged. What changed is the conclusion drawn from them.
>
> **We ship a built-in colour-mode primitive** — a blocking pre-paint script, a module-level signal,
> `.light`/`.dark` on the root element and `color-scheme` beside it as an inline style. Still **no
> provider**: the source of truth is the DOM class plus storage, so a module-level signal beats a
> `<ThemeProvider>` that would exist only to re-publish what the document already says. That is a
> Solid idiom, which the port rule names as its own exception.
>
> **Why the port rule does not carry here.** D-38's reasoning was *Chakra ships no provider, so
> neither do we*. What Chakra actually ships is a **CLI composition over `next-themes`**, and
> `next-themes` has no SolidJS equivalent — so porting that faithfully means shipping a wrapper
> around nothing and leaving every consumer to rediscover the same 80 lines, three of which
> (the pre-paint script) are the difference between a page with colours and a page with none.
> The rule this project actually optimises for is the best DX achievable with built-in solutions.
>
> **It is a divergence and it is flagged, not absorbed** — D-116's precedent. Its §0.4 delta row is
> above, its inventory row is `roadmap.md` §4.5, and the primitive itself lands at **step 3c**;
> `apps/docs/src/lib/color-mode.ts` is the shape it is extracted from, written at 3b so the site had
> a toggle on day one.
>
> **Deferred with the reason, rather than silently:** `forcedTheme`, arbitrary theme lists beyond
> light/dark/system, a CSP `nonce`, and a `themes` array. `disableTransitionOnChange` is 3c's and
> takes the **Panda route** — a `globalCss` rule in `@chakra-ui-solid/panda-preset`, generated into
> the consumer's stylesheet at build time, with the runtime only setting an attribute on `<html>`.

Measured: `colorMode` and `ColorMode` appear **zero times** in
`__reference-impl__/chakra-ui/packages/react/src/`. Chakra v3 ships color mode as a **CLI snippet**
over `next-themes` (`apps/compositions/src/ui/color-mode.tsx`), installed into the consumer's app —
not as library API. Under the port rule, neither do we.

What we own instead is the **contract**: the preset's semantic tokens are written against Panda's
`_dark` condition (measured — 107 occurrences in `semantic-tokens/colors.ts`, 8 in `shadows.ts`), so color
mode is a class or attribute on the root element and a documented consumer snippet. `@solid-primitives`
or the consumer's own store does the toggling; nothing about it touches §0.

**Measured at step 3, and the class is mandatory rather than an opt-in** (`decisions.md` **D-113**).
`_dark` is `.dark &` and `_light` is `.light &`, so the consumer writes `class="light"` or
`class="dark"` on `<html>` — and there is no third state, because the preset gives its semantic
colours **no base value**. All ~100 are emitted only inside `.light { … }` and `.dark { … }`, so a
page carrying neither class resolves every one of them to an undefined custom property and computes
`transparent`. **A consumer who ships no class has no colours at all**, silently — §0.2 at the scale
of the whole palette. The sentence above therefore understates it: the snippet is a prerequisite,
not a dark-mode feature, and the docs page owes the failure mode beside the instruction.
`check:dark-selector` is what keeps the documented class and the emitted selector in agreement.

**Confirmed a second time at S3b, in a real browser, on a prerendered page.** Reading
`getComputedStyle(document.body).backgroundColor` on the docs site with the root class swapped:
`.light` → `rgb(255, 255, 255)`, `.dark` → `rgb(9, 9, 11)`, **no class → `rgba(0, 0, 0, 0)`**. That
third value is the whole argument for the primitive above: the blocking pre-paint script is not a
flash-of-unstyled nicety, it is what stands between a prerendered page and no colours at all.

### 7.2 Direction, locale and environment: two contexts, no catalog

Chakra re-exports Ark's `LocaleProvider` and `EnvironmentProvider` and adds nothing
(`components/locale/index.ts`, `components/environment/index.ts` — measured, both pure re-exports).
Ark's Solid `LocaleProvider` is **~20 lines**:

```ts
// __reference-impl__/ark-ui/packages/solid/src/providers/locale/locale-provider.tsx
const context = createMemo((): Locale => ({
  locale: props.locale,
  dir: isRTL(props.locale) ? "rtl" : "ltr",
}))
```

`isRTL` comes from `@zag-js/i18n-utils` — an MIT package we depend on rather than reimplement. So the
rebuild `prior-art.md` §9 calls for is genuinely small: **two contexts, no catalog, no resolver, no
message formatting**, because Chakra has none of those.

| Context | Provides | Consumed by |
|---|---|---|
| Locale | `locale`, `dir` | Every machine takes `dir` as a prop; every root element sets the `dir` attribute |
| Environment | `getRootNode` | Every machine, for shadow-DOM and iframe-correct element lookup |

### 7.3 RTL and logical properties

RTL correctness rides on the preset, not on us. The recipes are authored against logical properties
(`insetStart`/`insetEnd`, `borderStart`/`borderEnd`, `marginStart`/`marginEnd`), Panda compiles them
to `inline-start`/`inline-end` CSS, and the browser resolves them from the `dir` attribute. What we
own is exactly two things: threading `dir` from the locale context into every machine's props, and
setting `dir` on root elements so the CSS has something to resolve against.

---

## 8. Build mechanics

Carried from hope-ui and proven against Solid 2.0 (`prior-art.md` §2.6, `brief-plan` §2.4):

- **tsdown** (rolldown + oxc), one config per package from a shared `tsdown.config.base.ts`, with
  `transform.jsx: "preserve"`. Ship JSX-preserved `.jsx` + `.d.ts` under the **`"solid"` export
  condition**, with **no `"import"` / `"default"` fallback**. The rationale is not stylistic:
  `tsup` / `esbuild-plugin-solid` / `unplugin-solid` bundle `babel-preset-solid@1.x`, which compiles a
  JSX `ref` into an import of `use` — a name `@solidjs/web` 2.0 renamed to `ref`/`applyRef`. Any
  `ref=` in shipped output breaks at load.
- **`@chakra-ui-solid/styled-system` external, never inlined** (§4.3). `solid-js`, `@solidjs/web` and
  sibling packages stay external too.
- **The dts wrinkle gets simpler than hope-ui's, because publishing `styled-system` removes its
  cause.** hope-ui had to inline styled-system's types (consumers could not resolve a private
  package), which dragged in `@pandacss/types` → `pkg-types` → `typescript`, and
  **rolldown-plugin-dts throws bundling `typescript`'s declarations**. Published, the `.d.ts` can
  reference it by bare specifier: keep `styled-system` **and** `@pandacss/*` / `pkg-types` /
  `typescript` in `deps.neverBundle`. Recorded because the failure is non-obvious and would cost a day
  to rediscover.
- **`comments.legal` pinned**, and it is load-bearing for attribution rather than cosmetic: an
  untagged provenance paragraph gets stripped by the build, which is exactly the state the `zag-solid`
  fork is in today (`legal.md` §1.3, §2.3). The seven `@license` headers the fork owes depend on this
  setting surviving.
- **ESM-only.** Changesets, with **no changeset while at `0.0.0`**.
- Document **`ssr.noExternal`** for SolidStart consumers.
- Node 24 / pnpm 11.10.0 via corepack + `devEngines`; Solid pinned at `2.0.0-beta.32` through a
  `pnpm-workspace.yaml` catalog, lockstep across `solid-js` / `@solidjs/signals` / `@solidjs/web` /
  `babel-preset-solid`, plus `overrides: { babel-preset-solid: "catalog:" }` (`brief-plan` §3.4).

---

## 9. Dev-time resolution and codegen ordering

**Workspace packages always resolve to `src`, never a sibling's `dist`.** Three files encode that and
they are **one unit**, because drift between them is silent:

1. `tsconfig.base.json#paths` — repo-root-relative, inherited by every package.
2. A shared `vitest-aliases.ts`, used by all three Vitest projects.
3. The docs app's Vite alias.

A check script asserts the three agree. Adding a package without updating all three produces a build
that resolves to a stale `dist` and passes.

**Codegen ordering.** `@chakra-ui-solid/styled-system` is generated, so it must exist before anything
reads it — including type-checking, which fails with hundreds of unrelated errors when it does not.

| Task | `dependsOn` | Why |
|---|---|---|
| `codegen` (in `styled-system`) | `^build` for `preset` only | Panda reads the preset; in dev it resolves from source through the tsconfig path, but the published shape must be buildable |
| `build`, `typecheck`, `test:*` | `codegen` | Nothing may read the artifacts before they exist |
| `cssgen` | `codegen` | Produces the dev stylesheet the browser tests and the coverage check assert against |
| the generated-CSS coverage check (§0.2) | `cssgen` | It diffs emitted rules against the variants components can emit |

Plus a `postinstall` running `codegen`, so a fresh clone type-checks.

---

## 10. Workstream B — the non-machine surface

Chakra ships **115 component directories** — 118 is the entry count and includes `index.ts`,
`icons.tsx` and `theme.tsx` (`roadmap.md` §1.1, §13 row 2; the same counting-convention class as
`prior-art.md` §10.2 row 9's 47→46, and it changes no conclusion here). Zag ships **51 machines**
(`prior-art.md` §10.4). The gap is
the non-machine surface: Box, Flex, Stack, Grid, SimpleGrid, Text, Heading, Container, Center, Square,
Circle, Spacer, Wrap, AspectRatio, Bleed, Float, AbsoluteCenter, Span, Em, Strong, VisuallyHidden,
Group, Sticky, … — pure style-props over `renderStyled`, composing Panda `/patterns` where one exists
(`prior-art.md` §2.4), reusing hope-ui's Box (34 lines) and Flex (85 lines) ports as the starting
point.

**It is heavier than "layout and typography", and that changes its position.** Mapping the preset's
recipes against Zag's machine list: **all 18 atomic recipes belong to the non-machine surface** —
`button`, `input`, `textarea`, `inputAddon`, `heading`, `code`, `kbd`, `mark`, `badge`, `link`,
`separator`, `skeleton`, `skipNavLink`, `spinner`, `icon`, and the three shared primitives
`checkmark`, `radiomark`, `colorSwatch` that machine components' slot recipes compose.

**The atomic half of that sentence is exactly true; its slot-recipe half was false by 15.** P6
measured the mapping (`roadmap.md` §2.1–§2.3, §13 row 3): of the 56 slot recipes, **34** are driven by
a same-named machine and **7** by a machine under another name (`actionBar`→`popover`,
`checkboxCard`→`checkbox`, `codeBlock`→`clipboard`, `drawer`→`dialog`, `progressCircle`→`progress`,
`radioCard`→`radio-group`, `segmentGroup`→`radio-group`) — and **15 have no machine at all**. Those 15
are multi-part components with no `connect()` to merge, which is why
`definition-of-done.md` §2 carries three shapes of its recipe rule rather than one.

So Workstream B is where **the atomic recipe layer lands at volume**, not a mop-up after the
interesting work. That gives the build order a clean escalation:

| Step | What it proves |
|---|---|
| 3 | `Box` — style props, no recipe. The factory and the distribution seam |
| 4 | One **slot** recipe, in a throwaway consumer whose source never names the variant. §1's gate |
| 5 | Dialog — the blueprint end to end |
| 6 | **Workstream B** — 18 atomic recipes plus the layout surface, over a proven factory |
| 7 | Machine components — 56 slot recipes over a proven blueprint |

Its position is unchanged from the plan (after the factory, before machine components); its **weight**
is not, and P6's roadmap should sequence it accordingly.

---

## 11. Assumptions this architecture rests on

### 11.1 `brief-plan` §8 assumptions P3 depends on

| # | Assumption | Status | Verified at |
|---|---|---|---|
| **3** | Panda `1.12.0` ↔ `@chakra-ui/panda-preset@3.36.1` (the preset declares `@pandacss/types@^1.4.2`) | Open. Untested anywhere visible — hope-ui ran Panda against a *hand-authored* preset | **Step 3**, first `panda codegen` |
| **4** | `staticCss` in a preset covers internally-emitted recipe variants | **Narrowed** by `prior-art.md` §10.2 row 11 — the atomic half is demonstrated in production at `e9c2f81`; only the recipe half is open. §1's whole design targets it | **Step 4 gate** |
| **7** | npm scope availability | **CLOSED at P1.** `@chakra-ui-solid` is owned (`legal.md` §3.3.1) | — |
| **8** | Whether any Zag `1.43.0` machine injects a stylesheet at runtime | Open, and a §0 **prerequisite** rather than an assumption to carry | **Step 2**, when `@zag-js/*` first enters the tree |
| **9** | The preset's `data-*` vocabulary already matches Zag's | Spot-checked at P2 across 6 of 56 slot recipes, all matching (`prior-art.md` §4.3). The full diff is *"the single cheapest check with the largest downside if skipped"* | **Step 4** |
| **11** | `createPresence` composes with Chakra's preset animations | **CLOSED at P2, resolved the other way.** 9 of 56 slot recipes use `animationName`; zero use `transitionProperty` in an `_open`/`_closed` block, so `@zag-js/presence` is the correct mechanism (`prior-art.md` §8.2). §6 records the consequence | — |

Assumptions 1, 2, 5 and 10 belong to P4/P6; assumption 6 to P8.

### 11.2 New assumptions P3 introduces

Each is unverifiable from this machine for the same reason: **Panda is installed in no checkout**
(the same limit `prior-art.md` §5.1 hit).

| # | Assumption | Blocks if wrong | Verified at |
|---|---|---|---|
| **P3-A** | A recipe-level `staticCss` key declared through `theme.extend.{recipes,slotRecipes}` in a preset reaches the consumer's codegen | §1.2 — falls to ladder rung 1 or 2 (§1.5) | **Step 4** |
| **P3-B** | `staticCss: ["*"]` enumerates variant values at the base condition only, so responsive recipe variants need an explicit `responsive: true` declaration | The §0.4 responsive row, and the size of the default stylesheet | **Step 4** |
| **P3-C** | A `hash` (or `prefix`) mismatch between our published runtime and a consumer's `cssgen` unstyles everything silently | §3.4's config fragment and its two CI checks | **Step 4**, by deliberately breaking it once |
| **P3-D** | The Chakra↔Panda shorthand delta is a subset of 95 names and mostly empty | §2.2's alias list — a bound, not a count | **Step 3** |
| **P3-E** | Panda's `preflight: true` emits no `[hidden] { display: none !important }` equivalent, so our preset adds one `globalCss` line | §3.7, and P5's `hidden`-vs-`display` rule | **Step 3** |
| **P3-F** | `@pandacss/preset-base`'s `_dark` selector matches what the preset's semantic tokens assume | §7.1's consumer contract | **Step 3** |

---

## 12. What P3 changes in the plan — re-plan P4 and P5 against this

| # | Plan says | P3 decides | Touches |
|---|---|---|---|
| 1 | §2.1's exports list: `./css`, `./tokens`, `./types`, `./patterns`, `./recipes`, `./styles.css` | **Add `./is-valid-prop`**, and it resolves *inside* `jsx/`. **Drop `./styles.css`** — no CSS is published at all (§4.4). The never-export rule sharpens to **"no export resolves to `jsx/index`, and none resolves to a `.css` file"** (§4.2) | P7 (the CI check) |
| 2 | §2.2 / §2.11: `panda.config.ts` copied with `eject: true` + `presets: [chakraPreset]`; `prior-art.md` §10.2 row 1 fixes it in the config | **The fix moves into `@chakra-ui-solid/panda-preset`**, which self-declares `@pandacss/preset-base`. The config keeps `eject: true` and one preset entry, and so does the consumer's (§3.2) | P9 (`decisions.md`) |
| 3 | §2.1 / §9 Q2: *"`staticCss` shipped in the preset"* | **Per-recipe** via `theme.extend`, not a config-level block, plus an atomic `staticCss.css` block and 10 `colorPalette` values — with a **two-rung** fallback ladder (§1.5). *(This row read "three-rung" until P9. §4.4 removed the prebuilt-stylesheet floor and §1.5 was rewritten to two; `roadmap.md` §13 row 10 and `definition-of-done.md` §10 row 9 flagged the stale wording and carried it forward deliberately.)* | P5, P7 |
| 4 | §9 Q2 assumes only *dynamic* variant arguments fail to extract | **No consumer-written recipe variant extracts at all** — the preset declares no `jsx` hints (measured). The problem is wider and the answer is the same (§1.1) | P5, P7 |
| 5 | §2.5: `@<scope>/preset` is *"config-only"* | It also exports **`chakraConfig(options?)`**, a function returning a `defineConfig` fragment carrying the knobs that must match across the boundary. **One subpath `.`, no `./config`** — same consumer needs both exports. New (§3.3, §3.4) | P7, P8, P9 |
| 13 | §1.4 leaves the responsive opt-in as a raw `staticCss` line the consumer hand-writes | **`chakraConfig({ responsive })`, three grains** (`{ button: ["size"] }` / `["button"]` / `true`), expanding to the `staticCss` form Panda already understands. The toggle is the consumer's because the stylesheet is their build's (§3.8) | P7 (preset + CI), P8 (docs) |
| 14 | Nothing states how the Panda prerequisite is enforced | **`@pandacss/dev` as a non-optional `peerDependency`** on three packages, a README first line, and a CI check that no published `package.json` exposes a `.css` file (§4.4) | P7, P8 |
| 6 | §2.5: `@<scope>/system` owns *"…color mode, direction"* | **Color mode: nothing** — Chakra has none in-library (measured, zero occurrences). Direction/locale/environment: two contexts, Ark's shape. And `system` **depends on `zag-solid`**, because presence lives there (§5.3, §6, §7) | P5, P6 |
| 7 | §2.9: Workstream B is layout/typography | It also carries **all 18 atomic recipes**. Same position in the build order, materially more weight (§10) | P6 |
| 8 | §9 Q4: Panda-shape, *"with Chakra's names aliased where the mapping is 1:1"* | Kept — and `renderStyled` needs **three named additions**: the `css` array form, `unstyled`, and Chakra's five `html*` prop renames. The plan implies it stands as-is (§2.3) | P5 |
| 9 | §0.4's delta table | Gains a **Cause** column separating CSS-in-JS deltas from React→Solid ones, and four rows: `useRecipe`/`useSlotRecipe` → static import, responsive recipe variants, `hideMode: "activity"`, and the absent RSC surface (§0.4) | P7, P8 |
| 10 | §2.3 route 2 (*"declare it in `staticCss`"*) reads as a per-component authoring duty | Automated by the preset for **recipe variants**; manual only for **atomic values a component's logic picks** (§3.5) | P5 |
| 11 | §2.1: `hash: false` *"stays for determinism but stops being load-bearing"* | Still true inside our build — but it becomes **load-bearing across the consumer boundary**, because the consumer's `cssgen` names rules from *their* config while the runtime is ours (§3.4) | P7 |
| 12 | §1.6 / §3.6 / §2.9: *"19 recipes + 57 slot recipes"* | **18 + 56** throughout, per `prior-art.md` §4.2 | P5, P6 |

---

## 13. What P3 could not settle

**Three questions, one cause: Panda is installed in no checkout here**, so nothing that requires
running `panda codegen` could be answered. Each is assigned above and none blocks P4 or P5 from being
written.

| Unanswered | Blocks | Assigned |
|---|---|---|
| Does Panda's `preflight: true` emit a `[hidden] { display: none !important }` equivalent? (`prior-art.md` §5.1's open item) | The final shape of the preset's `globalCss` delta, and **P5's `hidden`-vs-`display` rule** — if Panda carries the rule or our preset ports Chakra's, that tax does not apply to us at all | Step 3 (§3.7, P3-E) |
| Which of Chakra's 95 shorthands are absent from Panda's utilities? | The exact alias list. Bounded at ≤95; the rule is fixed (§2.2) | Step 3 (P3-D) |
| Do preset-declared **recipe-level** `staticCss` keys survive the merge into a consumer's codegen? | §1.2's mechanism. Fallback ladder written, worst realistic case is one consumer config line | Step 4 (P3-A) |

**From `prior-art.md` §10, everything P3 could act on, it acted on.** The rows P3 does *not* touch
belong to later phases by construction and are listed so nobody reads the silence as an oversight:
§10.1 rows A–F and §10.2 rows 3–8 are **P4/P5/P7** (the adapter spec, the blueprint, the definition of
done); §10.2 row 10 is **P6**. P3 records only their two structural consequences — the a11y kernel is
not in `@chakra-ui-solid/system` (§5.3), and presence is a build over a machine rather than a
carry-over (§6).

One §10.3 item P3 acts on directly: **the two hope-ui branches never coexisted**, so no Zag machine
has ever rendered through a Panda recipe in this lineage, let alone through Chakra's preset. This
architecture does not bank any inference drawn from one side about the other — which is exactly what
**step 4 is for**, and why it is the first place a machine, a slot recipe, and the distribution model
meet.
