# The parity matrix — every Chakra v3 component, and the order they get built in

**Status:** written at P6, 2026-08-09. Builds the matrix from three **measured** enumerations, closes
`brief-plan` §8 assumption 2 (each machine's `anatomy` at Zag `1.43.0`), reconciles the preset's 56 slot
recipes against Zag's 51 machines, reasons every exclusion individually, settles the fifth part shape
and the position of the first floating component, and turns `plan.md` §10's five-step escalation into
a sequence with gates.

**What this document is.** The inventory and the order. Every Chakra `3.36.1` component folder gets a
row saying which Zag machine it runs on (or that it has none), which preset recipe styles it, how many
parts it has, whether it is presence-gated, whether its Chakra implementation needs runtime style
serialization, whether it ships, and in which batch.

**What it is not.** The evidence base (`prior-art.md`), the architecture (`plan.md`), the adapter spec
(`zag-solid-adapter.md`), or the component pattern (`component-blueprint.md`). All four are cited by
section rather than restated. **Where this document and `brief-plan` §4.1's contents list disagree,
`prior-art.md` §10, `zag-solid-adapter.md` §10 and `component-blueprint.md` §13 win** — §13 below
lists every place P6 departs from them, so P7–P9 get re-planned before P7 begins.

**Vocabulary, once.** A **machine** is a `@zag-js/*` state machine — framework-agnostic behavior and
ARIA. Its **anatomy** is its list of named parts (`trigger`, `content`, …); each becomes one **part
component** (`Dialog.Trigger`). A **slot recipe** is a Panda style definition for a multi-part
component — one style block per named **slot**, resolved to one class string per slot. An **atomic
recipe** styles a single element. **`staticCss`** is the Panda declaration that pre-generates CSS for
values no source file literally writes. **Presence** is enter/exit lifecycle: whether a node is in the
DOM and whether it is mid-animation. **Silent unstyling** is this project's central hazard — a Panda
class whose CSS was never generated renders nothing and raises no error (`plan.md` §0.2).

**Settled earlier, not reopened here.** The brand `chakra-ui-solid` / `@chakra-ui-solid`; the **port
rule** — *no accessibility behavior beyond what Zag ships, nothing invented that Chakra UI v3 does not
have, SolidJS idioms excepted* (`prior-art.md` §8.2); Zag `1.43.0`; Solid `2.0.0-beta.32`; `plan.md`
§0's two scopes; **zero published CSS, with Panda a hard prerequisite and `@pandacss/dev` a peer
dependency** (`plan.md` §4.4); presence is a build over `@zag-js/presence` (`plan.md` §6); the a11y
kernel is `createRegisteredId` alone (`component-blueprint.md` §8); P3's Q2/Q4, P4's Q6, P5's Q7.

---

## 1. The three enumerations, measured

Every count below was produced by the command printed beside it, against the checkouts at their
current refs. Nothing is carried from the plan.

### 1.1 Chakra — 115 component directories, not 118 entries

```bash
ls __reference-impl__/chakra-ui/packages/react/src/components | wc -l                     # 118
find __reference-impl__/chakra-ui/packages/react/src/components -maxdepth 1 -mindepth 1 -type d | wc -l   # 115
find __reference-impl__/chakra-ui/packages/react/src/components -maxdepth 1 -mindepth 1 -not -type d      # 3 files
```

**118 is the entry count; 115 is the folder count.** The three non-directories are `index.ts` (the
barrel), `icons.tsx` and `theme.tsx`. `prior-art.md` §10.4 re-confirmed *"118 Chakra component
folders"* from the `ls | wc -l` form, which counts all three files as folders.

This is a counting-convention correction of exactly the kind `prior-art.md` §0.4 warns about, and it
is the same class as §10.2 row 9's *"47 files"* → 46. **It changes no conclusion in any earlier
document** — the gap argument in `plan.md` §10 (118 folders vs 51 machines) survives at 115 — but the
matrix below has 115 rows and it has to say why.

**Charts are not among the 115.** They are a separate package:

```bash
ls __reference-impl__/chakra-ui/packages/          # charts  cli  codemod  panda-preset  react
grep -n 'recharts' __reference-impl__/chakra-ui/packages/charts/package.json   # peer: recharts >=3
```

### 1.2 Zag — 51 machines, 49 anatomy exports, 406 parts

```bash
ls __reference-impl__/zag/packages/machines | wc -l                                    # 51
ls __reference-impl__/zag/packages/machines/*/src/*.anatomy.ts | wc -l                 # 49
```

Each machine's `anatomy` was read from its own file, not asserted. The parser strips everything
before `createAnatomy(`, drops the first string (the anatomy *name*, which may contain a hyphen —
getting that wrong silently eats the first part), and counts the rest:

```bash
for m in __reference-impl__/zag/packages/machines/*/; do
  f=$(ls $m/src/*.anatomy.ts 2>/dev/null | head -1) || continue
  perl -0777 -ne 's/^.*?createAnatomy\(//s; s/\bexport const parts.*$//s;
    my @w = ($_ =~ /"([a-zA-Z][a-zA-Z0-9-]*)"/g); shift @w; print scalar(@w), "\n"' "$f"
done | paste -sd+ | bc            # 406
```

| Machine | Parts | Machine | Parts | Machine | Parts |
|---|---|---|---|---|---|
| accordion | 5 | file-upload | 12 | rating-group | 4 |
| angle-slider | 8 | floating-panel | 11 | scroll-area | 6 |
| **async-list** | **—** | hover-card | 5 | select | 15 |
| avatar | 3 | image-cropper | 6 | signature-pad | 7 |
| carousel | 10 | listbox | 10 | slider | 10 |
| cascade-select | 13 | marquee | 5 | splitter | 4 |
| checkbox | 4 | menu | 14 | steps | 10 |
| clipboard | 6 | navigation-menu | 11 | switch | 4 |
| collapsible | 4 | number-input | 8 | tabs | 5 |
| color-picker | 24 | pagination | 7 | tags-input | 10 |
| combobox | 14 | password-input | 6 | timer | 8 |
| date-input | 6 | pin-input | 4 | toast | 6 |
| date-picker | 24 | popover | 10 | toc | 6 |
| dialog | 7 | **presence** | **—** | toggle | 2 |
| drawer | 10 | progress | 9 | toggle-group | 2 |
| editable | 9 | qr-code | 5 | tooltip | 5 |
|  |  | radio-group | 6 | tour | 11 |

**Two machines export no `anatomy` at all** — `async-list` and `presence`. Both are headless: they
produce state, not DOM. Neither is an omission. `presence` in particular has no anatomy *by design*,
which is exactly why `component-blueprint.md` §7.2 wraps it in a render strategy of our own rather
than deriving parts from it.

**Zag's `dialog` anatomy is 7 parts**, matching `component-blueprint.md` §3.1's transcription
exactly. That was the one machine P5 read directly; the other 48 are read here for the first time.

### 1.3 The preset — 18 recipes + 56 slot recipes, and three things the count hides

```bash
awk '/export const recipes/,/^}/'     __reference-impl__/chakra-ui/packages/panda-preset/src/recipes/index.ts      | grep -cE '^\s+[a-zA-Z]'   # 18
awk '/export const slotRecipes/,/^}/' __reference-impl__/chakra-ui/packages/panda-preset/src/slot-recipes/index.ts | grep -cE '^\s+[a-zA-Z]'   # 56
```

**18 + 56**, confirming `prior-art.md` §4.2. The registry keys:

- **18 atomic** — `badge` `button` `code` `heading` `input` `inputAddon` `kbd` `link` `mark`
  `separator` `skeleton` `skipNavLink` `spinner` `textarea` `icon` `checkmark` `radiomark`
  `colorSwatch`
- **56 slot** — `accordion` `actionBar` `alert` `avatar` `blockquote` `breadcrumb` `card` `carousel`
  `checkbox` `checkboxCard` `codeBlock` `collapsible` `dataList` `datePicker` `dialog` `drawer`
  `editable` `emptyState` `field` `fieldset` `fileUpload` `hoverCard` `list` `listbox` `menu`
  `nativeSelect` `numberInput` `pinInput` `popover` `progress` `progressCircle` `radioCard`
  `radioGroup` `ratingGroup` `scrollArea` `segmentGroup` `select` `combobox` `slider` `splitter`
  `stat` `steps` **`swittch`** `table` `tabs` `tag` `tagsInput` `toast` `tooltip` `status` `timeline`
  `colorPicker` `qrCode` `treeView` `marquee` `floatingPanel`

Three things the two numbers do not show, each measured here and each carried onto the rows it
belongs to:

**(a) The preset is one recipe short of Chakra's own runtime theme, and the missing one is
`container`.**

```bash
ls __reference-impl__/chakra-ui/packages/react/src/theme/recipes | wc -l    # 75 files
awk '/export const recipes/,/^}/'     .../react/src/theme/recipes.ts      | grep -cE '^\s+[a-zA-Z]'  # 19
awk '/export const slotRecipes/,/^}/' .../react/src/theme/slot-recipes.ts | grep -cE '^\s+[a-zA-Z]'  # 56
```

`@chakra-ui/react`'s runtime theme registers **19 atomic + 56 slot**. Diffed against the preset, the
whole difference is two entries: the preset has no **`container`** recipe, and it spells Switch's key
`swittch` where the runtime theme spells it `switch`. Nothing else differs. **`Container` is
therefore a component whose recipe exists in Chakra and not in the package we depend on** — a real
one-recipe gap, and the only one. It is a `Container` row, not a project risk.

> **This does not reinstate "19 + 57".** 19 is the count of *Chakra's runtime theme*, a different
> object from the preset. The preset is **18 + 56** and stays quoted that way everywhere
> (`prior-art.md` §4.2, `plan.md` §12 row 12).

**(b) Seven slot recipes list a duplicated slot, not one.**

```bash
for f in __reference-impl__/chakra-ui/packages/panda-preset/src/slot-recipes/*.ts; do
  perl -0777 -ne 'if (/slots:\s*\[(.*?)\]/s) { my %h; my @d;
    for (($1 =~ /"([^"]+)"/g)) { push @d, $_ if $h{$_}++ } print "$ARGV: @d\n" if @d }' "$f"
done
```

| Slot recipe | Duplicated slot |
|---|---|
| `carousel` | `progressText` |
| `combobox` | `empty` |
| `datePicker` | `view` |
| `dialog` | `backdrop` |
| `drawer` | `backdrop` |
| `field` | `requiredIndicator` |
| `splitter` | `resizeTriggerIndicator` |

`component-blueprint.md` §3.1 names Dialog's. **It is a class, not an incident**, and the cause is
visible: Chakra's runtime theme writes `slots: dialogAnatomy.keys()` — derived, therefore
deduplicated by construction — while the preset hard-codes a literal string array, and the
hand-transcription is where the repeats crept in. Consequence for us is nil at runtime (Panda emits
one class per unique slot) but it matters for **the generated-CSS coverage check** (`plan.md` §0.2):
a check that compares "slots declared" against "slot classes emitted" must dedupe first, or it reports
seven false failures forever. That is P7's, and it is on the row.

**(c) `swittch` is renamed at two definition sites and zero reference sites — and one of the
references is now broken.**

`prior-art.md` §4.2 and `plan.md` §1.3 record the slot-recipe registry key. Measured here, the rename
is wider, and it is not confined to registry keys:

```bash
grep -rn "swittch" __reference-impl__/chakra-ui/packages/panda-preset/src/
# slot-recipes/index.ts:101   swittch: switchSlotRecipe,
# tokens/cursor.ts:25         swittch: { value: "pointer" },

grep -n "cursor" __reference-impl__/chakra-ui/packages/panda-preset/src/slot-recipes/switch.ts
# 49:      cursor: "switch",

# the same two lines in @chakra-ui/react's runtime theme, for contrast
grep -n "switch" __reference-impl__/chakra-ui/packages/react/src/theme/slot-recipes.ts     # 101: switch:
grep -n "switch" __reference-impl__/chakra-ui/packages/react/src/theme/tokens/cursor.ts    # 11:  switch:
```

| Site | preset | `@chakra-ui/react` runtime theme |
|---|---|---|
| Slot-recipe registry key | **`swittch`** | `switch` |
| `cursor` **token** key | **`swittch`** | `switch` |
| The Switch recipe's reference to it | `cursor: "switch"` | `cursor: "switch"` |

**The preset's Switch references a `cursor` token that is not registered.** The full check across all
74 recipes:

```bash
grep -rhoE 'cursor: "[a-z-]+"' .../panda-preset/src/{recipes,slot-recipes}/*.ts | sort -u
# button checkbox default disabled menuitem not-allowed option pointer radio switch text
grep -oE '^\s{2}[a-zA-Z]+:' .../panda-preset/src/tokens/cursor.ts | tr -d ' :'
# button checkbox disabled menuitem option radio slider swittch
```

`default`, `not-allowed`, `pointer` and `text` are plain CSS keywords, not tokens. **`switch` is the
one referenced token with no definition** — every other reference resolves. So the preset's Switch
loses its `cursor: pointer`, silently, in exactly the shape `plan.md` §0.2 describes: one dropped
declaration, no error, a green suite. `@chakra-ui/react`'s runtime Switch does not lose it, because
there the token is spelled `switch`. **This is a preset defect, not Chakra behavior**, so inheriting
it would be a divergence from the port target rather than fidelity to it.

**Decision: our preset adds one token key, and does not touch the recipe.**
`theme.extend.tokens.cursor.switch = { value: "pointer" }` — the same `theme.extend` merge path
`plan.md` §1.2 already relies on for the per-recipe `staticCss` deltas. One key, no recipe body
re-emitted, so it stays inside `legal.md` §1.5's *depend, do not vendor*, and unlike the `container`
delta (§2.5) it owes no `@license` header because a one-word token value is not expression.

**What does not change:** the **slot-recipe** registry key stays `swittch`, consumed verbatim per
`plan.md` §1.3 — aliasing it would register the same `className: "switch"` body twice. The Switch row
records that the **generated recipe function will be named `swittch`**, which is where a component
author actually trips.

Two things this sharpens. The upstream issue `plan.md` §1.3 proposes now has a **concrete defect** to
report — a broken token reference — rather than a spelling observation, which is the difference
between an issue that gets fixed and one that gets closed. And the cause is the same one behind (b):
the preset is a **mechanical flattening** of the runtime theme — `slots: switchAnatomy.keys()` becomes
a literal array, blank lines are stripped, import paths are rewritten — and a key rename applied
across that flattening caught two definitions and missed a value.

### 1.4 `brief-plan` §8 assumption 2 is closed

> *"Each machine's `anatomy` export at 1.43.0 — asserted authoritative, not enumerated per machine."*

**Closed here, and confirmed.** All 51 machines were opened; 49 export an `anatomy` and 2 are headless
by design. The 406 parts in §1.2 are the enumeration the assumption promised.
`zag-solid-adapter.md` §9.1 assigned this to P6 explicitly; `component-blueprint.md` §12.1 carried it
as *"open, and P6's"*. It is now a **standing check** rather than an assumption:
`legal.md` §5's `@zag-js/*` row diffs anatomy per minor, and the command in §1.2 is what it runs.

---

## 2. The 56-vs-51 reconciliation

### 2.1 Both of `plan.md` §10's sentences cannot be exactly true, and one of them is not

`plan.md` §10 asserts *"all 18 atomic recipes belong to the non-machine surface"* and *"the 56 slot
recipes are, correspondingly, the machine surface."*

- **The first is exactly true.** None of the 18 atomic recipes has a machine. `input` and `textarea`
  are the near-misses — they style Ark's `Field.Input` / `Field.Textarea`, and Ark's `field` uses no
  Zag machine at all (§2.4).
- **The second is false by 15.** Fifteen slot recipes have no machine under any name.

The exact decomposition, by name matching first and then by resolving each mismatch to what Chakra
actually imports:

```bash
comm -23 <(slot-recipe keys, kebab-cased, swittch→switch | sort) <(ls .../zag/packages/machines | sort)   # 21
comm -13 <(same) <(same)                                                                                   # 16
```

| | Count |
|---|---|
| Slot recipes whose name matches a machine **and** whose component runs on that machine | **34** |
| Slot recipes reaching a machine under a **different** name | **7** |
| Slot recipes with **no** machine at all | **15** |
| **Total slot recipes** | **56** |
| Machines with a same-named slot recipe driving them | **34** |
| Machines with **no** slot recipe of any name | **17** |
| **Total machines** | **51** |

### 2.2 The seven slot recipes that reach a machine under a different name

| Slot recipe | Machine it actually runs on | How it is measured |
|---|---|---|
| `actionBar` | `popover` | `components/action-bar/action-bar.tsx` imports `@ark-ui/react/popover` |
| `checkboxCard` | `checkbox` | imports `@ark-ui/react/checkbox` |
| `codeBlock` | `clipboard` | `code-block.tsx` imports `useClipboard` from `@ark-ui/react/clipboard` |
| `drawer` | **`dialog`** | `drawer.tsx` imports `@ark-ui/react/dialog` — **not** `@zag-js/drawer` |
| `progressCircle` | `progress` | imports `@ark-ui/react/progress` |
| `radioCard` | `radio-group` | imports `@ark-ui/react/radio-group` |
| `segmentGroup` | `radio-group` | Ark's `segment-group` is built on `@zag-js/radio-group` |

**`drawer` is the one that surprises.** Zag ships a `drawer` machine at 1.43.0 (10 parts, with
`grabber`/`swipeArea`), and Ark `5.38.1` has a `drawer` component built on it — but **Chakra `3.36.1`
does not use either.** Its Drawer is Ark's *Dialog* wearing the `drawer` slot recipe. Under the port
rule the target is Chakra, so **our Drawer runs on `@zag-js/dialog`** and the `drawer` machine stays
unported. Recorded because a future Chakra release adopting Ark's Drawer is a machine swap, not a
restyle.

### 2.3 The fifteen slot recipes with no machine

Each is a Chakra-only composition; each is a real multi-part component we must build by hand over
`renderStyled`, with no `connect()` to merge.

| Slot recipe | Slots | Why it has no machine |
|---|---|---|
| `alert` | 5 | Static status banner; the only state is a `status` variant |
| `blockquote` | 4 | Typography composition |
| `breadcrumb` | 7 | A `<nav>` + list; `currentLink` carries `aria-current` and nothing else |
| `card` | 6 | Layout composition |
| `dataList` | 4 | `<dl>` composition |
| `emptyState` | 5 | Layout composition |
| **`field`** | 8 | **Ark implements it by hand** — 226 lines of React in `use-field.ts`, no `@zag-js/*` machine (§2.4) |
| **`fieldset`** | 5 | Same; Ark's `use-fieldset.ts` is 115 lines of React |
| `list` | 3 | `<ul>`/`<ol>` composition |
| `nativeSelect` | 3 | A real `<select>`; the browser is the machine |
| `stat` | 6 | Typography composition |
| `status` | 2 | Two elements |
| `table` | 8 | `<table>` composition |
| `tag` | 5 | Layout composition; its `closeTrigger` is a plain button |
| `timeline` | 8 | Layout composition |

### 2.4 The seventeen machines with no slot recipe — and the thirteen with no Chakra component

| Machine | Chakra component? | Where it goes |
|---|---|---|
| `clipboard` | **yes** — `Clipboard` | Ships. Its recipe key `"clipboard"` **exists in neither registry** — Chakra ships Clipboard unstyled (§2.5) |
| `pagination` | **yes** — `Pagination` | Ships. Key `"pagination"` exists in neither registry — same shape |
| `toggle` | **yes** — `Toggle` | Ships. Key `"toggle"` exists in neither registry — same shape |
| `presence` | **yes** — `Presence` | Ships. Headless machine; the public component is `chakra(ArkPresence)`, styled by style props only |
| `drawer` | no | **Not ported.** Chakra's Drawer runs on `dialog` (§2.2) |
| `angle-slider` | no | Not ported — no Chakra component |
| `async-list` | no | Not ported — headless collection loader, and Chakra's `useListCollection` covers the surface it exposes |
| `cascade-select` | no | Not ported — **exists at 1.43.0** (`prior-art.md` §10.2 row 10), Ark has no React component for it |
| `date-input` | no | Not ported — no Chakra component |
| `image-cropper` | no | Not ported — **exists at 1.43.0**, Ark React only |
| `navigation-menu` | no | Not ported — Ark has it, Chakra does not |
| `password-input` | no | Not ported — Ark has it, Chakra does not |
| `signature-pad` | no | Not ported — Ark has it, Chakra does not |
| `timer` | no | Not ported — Ark has it, Chakra does not |
| `toc` | no | Not ported — **exists at 1.43.0**, no Ark React component |
| `toggle-group` | no | Not ported — Ark has it, Chakra does not |
| `tour` | no | Not ported — Ark has it, Chakra does not |

**Machines Chakra `3.36.1` actually reaches: 38 of 51.**

```bash
# ark component -> machine, then chakra component -> ark subpath -> machine
grep -rhoE '@zag-js/[a-z-]+' __reference-impl__/ark-ui/packages/react/src/components/<c>/
grep -rhoE 'from "@ark-ui/react/[a-z-]+"' __reference-impl__/chakra-ui/packages/react/src/components/<c>/
```

`prior-art.md` §10.2 row 10 is confirmed and extended: `cascade-select`, `image-cropper` and `toc`
exist at 1.43.0, and `gridlist`, `scheduler`, `dnd` are absent (they are v2-only). None of the three
that exist is portable *by us* under the port rule, because **Chakra has no component for them** —
"the machine exists" is not the test; "Chakra ships it" is (`prior-art.md` §10.3).

### 2.5 Four components whose recipe key resolves to nothing — in Chakra too

`Clipboard`, `Pagination`, `Toggle` and `DownloadTrigger` each call
`createSlotRecipeContext({ key })` / `createRecipeContext({ key })` with a key that appears in
**neither** `@chakra-ui/panda-preset` nor `@chakra-ui/react`'s own theme. `Text` and `Container` are
the two remaining mismatches: `Container`'s recipe exists in Chakra's theme but not the preset (§1.3a),
and `Text`'s exists in neither.

```bash
# the full diff, per component
for k in $(chakra recipe keys); do grep -qx "$k" preset_keys || echo "$k absent"; done
# → clipboard, container, downloadTrigger, pagination, switch(→swittch), text, toggle
```

This matters more here than anywhere else in the project, because it is **§0.2's silent unstyling
shipped upstream on purpose.** Five components (`Clipboard`, `Pagination`, `Toggle`,
`DownloadTrigger`, `Text`) are unstyled-by-key in Chakra and a faithful port reproduces that; one
(`Container`) is styled in Chakra and would be unstyled here. Their rows say so, and **the
generated-CSS coverage check must not flag them** — otherwise the one check that defends against
silent unstyling cries wolf on six components from day one. P7 owns the allow-list, and it is
enumerated per component with a reason, exactly like the axe allowances
(`component-blueprint.md` §9.3).

`Container` is the only one that needs a decision rather than a note: **one `container` recipe delta
in `@chakra-ui-solid/preset`**, ported from `@chakra-ui/react`'s `theme/recipes/container.ts`. That is
a recipe **body** reproduced from Chakra, so unlike everything else in `plan.md` §1.3 it is
expression-tier under `legal.md` §1.4 — it owes an `@license` header and root + package `NOTICE.md`
rows. One file, recorded so P7 does not add it silently.

---

## 3. The matrix — columns, and the one that needs re-pointing

| Column | Meaning |
|---|---|
| **Component** | The Chakra `3.36.1` folder name. All 115. |
| **Machine** | The `@zag-js/*` machine, measured through the Ark subpath Chakra imports. `—` = none. |
| **Recipe** | `S:key` = slot recipe, `A:key` = atomic recipe, `—` = none, `✗key` = a key with no recipe anywhere (§2.5). |
| **Parts** | `machine anatomy parts / unique recipe slots`. `—` on either side means that side does not exist. |
| **Pres** | `Z` = a `@zag-js/presence` instance; `M` = machine-owned visibility (§6); `D` = `Z` **and** Chakra defaults `lazyMount`/`unmountOnExit` to `true`; blank = none. |
| **CIJ** | **The CSS-in-JS column** — see below. |
| **Status** | `ships` / `excluded` / `relocated` / `deferred`. |
| **Batch** | Build-order slot (§9). |
| **Notes** | Per-component traps and deltas. |

**There is no retained-primitive column.** `component-blueprint.md` §8 deletes it: the port rule
removed the exception mechanism it existed to record, so there is nothing to put in it
(`prior-art.md` §10.1 row D). P6 does not build it.

### 3.1 What the CIJ column means, and what it must not become

`plan.md` §0.4 separates two causes of parity delta with a **Cause** column: `CSS-in-JS` deltas follow
from `plan.md` §0 and are permanent; `React→Solid` deltas follow from the target framework. **This
column is the CSS-in-JS one, per component, and it is not the React→Solid one.**

A component is marked when **Chakra's own implementation feeds a value computed at render time into
the style system** — an Emotion-serialized `css` object or style prop built from props — so no
`staticCss` declaration can pre-generate the class.

- **`●`** — unbounded. The value cannot be enumerated, so `staticCss` cannot reach it and route 3 of
  the dynamic-value contract (a CSS custom property through inline `style`, `plan.md` §3.5) is the
  answer. Each is a §0.4 delta made concrete.
- **`○`** — bounded to a finite set. Route 2: one `staticCss` declaration closes it.
- blank — nothing of ours computes a style value.

**Two things deliberately excluded from this column**, because including either would turn it into a
different column:

1. **Machine-emitted inline `style`.** Zag's `normalizeProps` emits `style` objects for popper
   positioning, slider thumb offsets, progress fills, splitter panel sizes. That is a DOM attribute,
   explicitly legal under `plan.md` §0.3, and it is *not* a delta. Marking every positioned component
   would make the column mean "has inline styles", which is not the question.
2. **Consumer style props.** Every styled component in this library carries the §0.4 delta for
   *consumer-written* runtime values, by construction. That is one global fact, stated once
   (`plan.md` §3.5) — repeating it on 115 rows would say nothing per component.

Measured with:

```bash
grep -rn '`[^`]*\${' __reference-impl__/chakra-ui/packages/react/src/components/ \
  | grep -v '\.test\.\|\.stories\.' \
  | grep -iE 'css|style|padding|margin|width|height|repeat|span|translate|calc|var\('
grep -rn 'css={{' __reference-impl__/chakra-ui/packages/react/src/components/ | grep -v '\.test\.'
grep -rln "useChakraContext\|sys\.tokens" __reference-impl__/chakra-ui/packages/react/src/components/
```

**Eight implementations carry a mark, spanning nine component folders; the third command returns
exactly one file.**

| Component | Mark | What Chakra computes | Our route |
|---|---|---|---|
| `aspect-ratio` | ● | `paddingBottom: ${(1 / ratio) * 100}%` from a numeric prop | `style={{ "--aspect-ratio": ratio }}` + a static `_before` rule |
| `grid` → `GridItem` | ● | `span ${n}/span ${n}` for `colSpan`/`rowSpan` (`grid/grid-item.tsx`) | `--col-span` / `--row-span` custom properties |
| `input-group` | ● | `ps: calc(var(--input-height) - ${startOffset})` | The offset becomes its own custom property |
| `simple-grid` | ● | `repeat(${n}, minmax(0, 1fr))`, **plus `sys.tokens.getVar()`** — the only component in the library that touches the runtime system object | `--grid-columns` / `--grid-min-child-width`; the token lookup becomes a build-time `token()` |
| `float` | ● | `${mapX[align]} ${mapY[side]}` for `translate` (finite) **and** `end: offsetX ?? offset` (unbounded) | Placement via `staticCss`; the offset via a custom property |
| `bleed` | ○ | `token(spacing.${v}, ${v})` written into `--bleed-*` custom properties | Already route 3 in Chakra; the `token()` call moves to build time |
| `flex` | ○ | `display: inline ? "inline-flex" : "flex"` | Already covered — it is the `display` row in `plan.md` §1.3's `staticCss.css` block |
| `square` / `circle` | ○ | `boxSize` from a prop, into a `css` object | Token or literal; route 1/2 |

**`plan.md` §4.4 changed no component's status.** The zero-CSS decision removed a *consumer tier*, not
a capability: every row above resolves through a CSS custom property or a `staticCss` declaration,
both of which need the consumer's Panda run either way. No component became unportable, and **no
exclusion or note in this document leans on a non-Panda tier** — there is none to lean on.

---

## 4. The matrix

### 4.1 Machine components — 45 rows

| Component | Machine | Recipe | Parts | Pres | CIJ | Status | Batch | Notes |
|---|---|---|---|---|---|---|---|---|
| accordion | accordion | S:accordion | 5/6 | M | | ships | B2 | `+itemBody`. **Settles the fifth part shape** (§7). `aria-controls` gated on `collapsible.isUnmounted` |
| action-bar | **popover** | S:actionBar | 10/5 | **D** | | ships | B1 | Uses 3 of popover's 10 parts + Chakra-only `separator`, `selectionTrigger`. No trigger part → no `aria-controls` line |
| avatar | avatar | S:avatar | 3/3 | | | ships | B6 | Anatomy re-exported from Ark unchanged |
| carousel | carousel | S:carousel | 10/11 | | | ships | B7 | **Duplicate slot `progressText`** (§1.3b) |
| checkbox | checkbox | S:checkbox | 4/5 | | | ships | B4 | Composes the `checkmark` **atomic** recipe from Workstream B |
| checkbox-card | **checkbox** | S:checkboxCard | 4/7 | | | ships | B4 | Second public component on one machine |
| clipboard | clipboard | **✗clipboard** | 6/— | | | ships | B6 | Recipe key resolves to nothing **in Chakra too** (§2.5). Coverage-check allow-list |
| code-block | **clipboard** | S:codeBlock | 6/14 | | | ships | B6 | 14 slots, one machine part used. Shiki adapters are consumer-supplied |
| collapsible | collapsible | S:collapsible | 4/4 | **M** | | ships | B2 | The machine-owned presence family (§6.2) |
| color-picker | color-picker | S:colorPicker | 24/26 | Z | | ships | B8 | Largest anatomy in the library. `+channelText`. Floating |
| combobox | combobox | S:combobox | 14/16 | Z | | ships | B5 | **Duplicate slot `empty`**. `+indicatorGroup`, `+empty`. Floating. Restrictive-content-model hazard (§10.4 of the blueprint) |
| date-picker | date-picker | S:datePicker | 24/26 | Z | | ships | B8 | **Duplicate slot `view`**. `+indicatorGroup`. Floating |
| dialog | dialog | S:dialog | 7/10 | **D** | | ships | **step 5** | **Duplicate slot `backdrop`**. `+header/body/footer`. The worked blueprint |
| drawer | **dialog** | S:drawer | 7/10 | **D** | | ships | B1 | **Duplicate slot `backdrop`**. Runs on `dialog`, not `@zag-js/drawer` (§2.2) |
| editable | editable | S:editable | 9/10 | | | ships | B4 | **`connect()` emits a top-level `size: 1`** when `autoResize` — collides with the `size` style prop; `styleSource` (blueprint §4.1 addition 4) is what closes it. `+textarea` |
| file-upload | file-upload | S:fileUpload | 12/15 | | | ships | B7 | `+itemContent`, `+dropzoneContent`, `+fileText`. Repeated part (items) |
| floating-panel | floating-panel | S:floatingPanel | 11/11 | **D** | | ships | B8 | Own positioning, **not** popper |
| hover-card | hover-card | S:hoverCard | 5/5 | Z | | ships | B1 | Floating. No `root` part in the anatomy |
| listbox | listbox | S:listbox | 10/11 | | | ships | B5 | `@zag-js/collection`. `aria-labelledby` on content is **not** overridden — Chakra ships the dangling IDREF (blueprint §1.2) |
| marquee | marquee | S:marquee | 5/5 | | | ships | B6 | |
| menu | menu | S:menu | 14/15 | **D** | | ships | B1 | `+itemCommand`. Floating. Presence-gated `aria-controls` |
| number-input | number-input | S:numberInput | 8/8 | | | ships | B4 | |
| pagination | pagination | **✗pagination** | 7/— | | | ships | B7 | Key resolves to nothing in Chakra too (§2.5) |
| pin-input | pin-input | S:pinInput | 4/4 | | | ships | B4 | Repeated part (inputs, by index) |
| popover | popover | S:popover | 10/13 | Z | | ships | **step 5b** | `+header/body/footer`. **The floating probe** (§8). Presence-gated `aria-controls` |
| presence | presence | — | —/— | Z | | ships | step 6 | Headless machine, no anatomy. `chakra(ArkPresence)`; our `createPresence` already lives in `system` (`plan.md` §6) |
| progress | progress | S:progress | 9/9 | | | ships | B6 | Machine-emitted inline `style` for the fill — legal, not a CIJ mark |
| progress-circle | **progress** | S:progressCircle | 9/9 | | | ships | B6 | Second public component on one machine |
| qr-code | qr-code | S:qrCode | 5/5 | | | ships | B6 | |
| radio-group | radio-group | S:radioGroup | 6/8 | | | ships | B4 | `+itemAddon`, `+itemIndicator`. Composes the `radiomark` atomic recipe. Repeated part |
| radio-card | **radio-group** | S:radioCard | 6/10 | | | ships | B4 | Extends Chakra's *extended* radioGroup anatomy: `+itemContent`, `+itemDescription` |
| rating-group | rating-group | S:ratingGroup | 4/5 | | | ships | B4 | `+itemIndicator`. Repeated part |
| scroll-area | scroll-area | S:scrollArea | 6/6 | | | ships | B7 | Browser tests keep real scrollbars (`brief-plan` §2.8) |
| segment-group | **radio-group** | S:segmentGroup | 6/6 | | | ships | B4 | Third public component on the radio-group machine |
| select | select | S:select | 15/16 | Z | | ships | B5 | `+indicatorGroup`. Floating. Hidden native `<select>` → restrictive-content-model hazard |
| slider | slider | S:slider | 10/12 | | | ships | B7 | `+markerIndicator`, `+markerLabel`. Thumb offsets are machine inline `style` — legal |
| splitter | splitter | S:splitter | 4/5 | | | ships | B7 | **Duplicate slot `resizeTriggerIndicator`**. `+resizeTriggerSeparator`. The machine writes a gesture cursor rule — **audited and cleared** at P4 (`zag-solid-adapter.md` §5.3) |
| steps | steps | S:steps | 10/12 | | | ships | B7 | Chakra's anatomy is its **own** `createAnatomy("steps")` with 12 parts, not Zag's 10 (`+title`, `+description`) |
| switch | switch | S:**swittch** | 4/5 | | | ships | B4 | **The generated recipe function will be named `swittch`** (§1.3c). **And its `cursor: "switch"` references a token the preset registers as `swittch`, so the pointer cursor is silently lost** — one `theme.extend.tokens.cursor.switch` key in our preset restores it. `+indicator` |
| tabs | tabs | S:tabs | 5/6 | Z | | ships | B2 | Chakra's own `createAnatomy("tabs")`, `+contentGroup`. **`_active` in the recipe is Panda's `:active` pseudo-class, not a Zag `data-active`** (`prior-art.md` §4.3) |
| tags-input | tags-input | S:tagsInput | 10/10 | | | ships | B7 | Repeated part (tags) |
| toast | toast | S:toast | 6/6 | | | ships | B8 | Imperative `createToaster` store living outside the component tree — the only such surface |
| toggle | toggle | **✗toggle** | 2/— | | | ships | B4 | Key resolves to nothing in Chakra too (§2.5) |
| tooltip | tooltip | S:tooltip | 5/5 | **D** | | ships | B1 | Floating |
| tree-view | tree-view | S:treeView | 15/15 | | | ships | B7 | Repeated **and recursive** part — branches nest. The one place §7's shape gets stressed |

### 4.2 Multi-part components with no machine — 15 rows

| Component | Machine | Recipe | Parts | Pres | CIJ | Status | Batch | Notes |
|---|---|---|---|---|---|---|---|---|
| field | — | S:field | —/8 | | | ships | B3 | **The largest machine-less behavior in the library.** Ark implements it in 226 React lines; under `legal.md` §1.4 we read the ARIA contract, never the expression. **Duplicate slot `requiredIndicator`** |
| fieldset | — | S:fieldset | —/5 | | | ships | B3 | Ark: 115 React lines. `+content` |
| native-select | — | S:nativeSelect | —/3 | | | ships | B3 | Chakra's anatomy is `createAnatomy("select")` — **the same `data-scope` as `select`**. A hand-written selector that assumes scope uniqueness will match both |
| alert | — | S:alert | —/5 | | | ships | B6 | |
| blockquote | — | S:blockquote | —/4 | | | ships | B6 | |
| breadcrumb | — | S:breadcrumb | —/7 | | | ships | B6 | Repeated part (items) |
| card | — | S:card | —/6 | | | ships | B6 | |
| data-list | — | S:dataList | —/4 | | | ships | B6 | Repeated part (items) |
| empty-state | — | S:emptyState | —/5 | | | ships | B6 | |
| list | — | S:list | —/3 | | | ships | B6 | Repeated part (items) |
| stat | — | S:stat | —/6 | | | ships | B6 | |
| status | — | S:status | —/2 | | | ships | B6 | |
| table | — | S:table | —/8 | | | ships | B6 | Repeated parts (rows, cells) |
| tag | — | S:tag | —/5 | | | ships | B6 | |
| timeline | — | S:timeline | —/8 | | | ships | B6 | Repeated part (items) |

### 4.3 Atomic-recipe components — 21 rows

| Component | Machine | Recipe | Parts | CIJ | Status | Batch | Notes |
|---|---|---|---|---|---|---|---|
| badge | — | A:badge | —/1 | | ships | step 6 | |
| button | — | A:button | —/1 | | ships | step 6 | `useRecipe({ key })` directly, not a recipe context. Also ships `ButtonGroup`, `IconButton`, `CloseButton` |
| checkmark | — | A:checkmark | —/1 | | ships | step 6 | Composed **into** `checkbox`/`checkboxCard` slot recipes — must land before B4 |
| code | — | A:code | —/1 | | ships | step 6 | |
| color-swatch | — | A:colorSwatch | —/1 | | ships | step 6 | Composed into `colorPicker` — must land before B8 |
| container | — | **✗container** | —/1 | | ships | step 6 | **The one recipe the preset is missing** (§1.3a). One preset delta, expression-tier, `@license` + `NOTICE` rows |
| download-trigger | — | **✗downloadTrigger** | —/1 | | ships | step 6 | Key resolves to nothing in Chakra too |
| heading | — | A:heading | —/1 | | ships | step 6 | |
| icon | — | A:icon | —/1 | | ships | step 6 | Plus `createIcon`; the internal chevron/check/close set (`brief-plan` §2.10) |
| input | — | A:input | —/1 | | ships | B3 | Styles Ark's `Field.Input` |
| input-addon | — | A:inputAddon | —/1 | | ships | B3 | `useRecipe({ key })` directly |
| kbd | — | A:kbd | —/1 | | ships | step 6 | |
| link | — | A:link | —/1 | | ships | step 6 | |
| mark | — | A:mark | —/1 | | ships | step 6 | |
| radiomark | — | A:radiomark | —/1 | | ships | step 6 | Composed into `radioGroup`/`radioCard` — must land before B4 |
| separator | — | A:separator | —/1 | | ships | step 6 | |
| skeleton | — | A:skeleton | —/1 | | ships | step 6 | Plus `SkeletonCircle`, `SkeletonText` |
| skip-nav | — | A:skipNavLink | —/1 | | ships | step 6 | `SkipNavLink` + `SkipNavContent` |
| spinner | — | A:spinner | —/1 | | ships | step 6 | |
| text | — | **✗text** | —/1 | | ships | step 6 | Key resolves to nothing in Chakra too; styled by `textStyles` + style props |
| textarea | — | A:textarea | —/1 | | ships | B3 | Styles Ark's `Field.Textarea` |

### 4.4 Styled primitives and layout — 25 rows

Pure style props over `renderStyled`, composing Panda `/patterns` where one exists
(`prior-art.md` §2.4). No machine, no recipe.

| Component | CIJ | Status | Batch | Notes |
|---|---|---|---|---|
| absolute-center | | ships | step 6 | |
| aspect-ratio | **●** | ships | step 6 | `paddingBottom` from a numeric `ratio` (§3.1) |
| bleed | ○ | ships | step 6 | Already routes through `--bleed-*` custom properties |
| box | | ships | **step 3** | The styling-seam gate. hope-ui's 34-line port is the start |
| center | | ships | step 6 | |
| circle | ○ | ships | step 6 | `Square` with a radius |
| em | | ships | step 6 | |
| flex | ○ | ships | step 6 | hope-ui's 85-line port; reuse `flex.raw` (`prior-art.md` §2.4) |
| float | **●** | ships | step 6 | Placement is finite; `offset` is not (§3.1) |
| grid | **●** | ships | step 6 | Ships `Grid` **and** `GridItem`; `grid-item.tsx` computes `span ${n}/span ${n}` (§3.1) |
| group | | ships | step 6 | Already writes `--group-count`/`--group-index` inline — route 3, legal |
| image | | ships | step 6 | |
| input-element | | ships | B3 | Part of the input-group family |
| input-group | **●** | ships | B3 | `calc(var(--input-height) - ${offset})` (§3.1) |
| loader | | ships | step 6 | Composition of `Spinner` + `AbsoluteCenter` |
| quote | | ships | step 6 | |
| simple-grid | **●** | ships | step 6 | `repeat(${n}, …)` **and** the only `sys.tokens` call in the library (§3.1) |
| spacer | | ships | step 6 | |
| span | | ships | step 6 | |
| square | ○ | ships | step 6 | |
| stack | | ships | step 6 | Plus `HStack`, `VStack`, `StackSeparator` |
| sticky | | ships | step 6 | |
| strong | | ships | step 6 | |
| visually-hidden | | ships | step 6 | |
| wrap | | ships | step 6 | Plus `WrapItem` |

### 4.5 Utilities, providers and re-exports — 8 rows, 9 folders

| Component | Status | Batch | Reason |
|---|---|---|---|
| portal | **ships, cut to ~6 lines** | **step 5** | Not an exclusion, but only `container` + `children` + the SSR guard + the environment-aware mount. **`disabled` is not shipped** — §5.1 |
| client-only | **ships** | step 6 | Not an exclusion — §5.2 |
| environment | **relocated** | step 3 | The context lives in `@chakra-ui-solid/system` (`plan.md` §7.2) and is re-exported from `components/environment` so Chakra's import path resolves. Not a component |
| locale | **relocated** | step 3 | Same. Plus `useFilter`, which is `createFilter` from `@zag-js/i18n-utils` — the same MIT package `plan.md` §7.2 already takes `isRTL` from. No machine |
| focus-trap | ships | step 6 | `chakra(ArkFocusTrap)` over `@zag-js/focus-trap` — a Zag **utility**, not a machine. Nothing Solid-specific |
| format | ships | step 6 | `FormatNumber` / `FormatByte` over `Intl`. No machine, no recipe |
| highlight | ships | step 6 | Over `@zag-js/highlight-word`. Plus `useHighlight` |
| for / show | **excluded** | — | §5.3, §5.4 |

**115 folders: 45 + 15 + 21 + 25 + 9 = 115.** Of those, **113 ship**, **2 are excluded** (`for`,
`show`), and **2 of the 113 are relocations** (`environment`, `locale`) rather than new components.
Charts is a 116th exclusion that is not one of the 115, because it is not a component folder (§1.1).

---

## 5. Exclusions, one reason each

The gate for this phase is that no exclusion is justified by category. Each line below stands on its
own measurement, and **none of them leans on a non-Panda consumer tier** — `plan.md` §4.4 removed that
tier, so a component that could not be styled would be an exclusion with a styling reason, and there
are none.

### 5.1 `portal` — not an exclusion, but cut to the two things Solid's `Portal` gets wrong

`brief-plan` §4.1 doc 5 lists `portal` among the *"React-idiom or Solid-native"* exclusions.
`component-blueprint.md` §0.3 and §13 row 5 put it back: `portal` is not in Zag's `dialog` anatomy and
not in Chakra's Dialog namespace — Chakra ships it as a **standalone component**
(`components/portal/index.ts`, a one-line re-export of Ark's) used *inside* `Dialog.Root`.

**P6 keeps it, and shrinks it.** It exists for exactly two reasons, both of which are things
`@solidjs/web`'s own `Portal` does differently, and neither of which a consumer should have to
discover:

1. **Solid's `Portal` throws during SSR.** The server build is
   `function Portal() { throw new Error("Portal is not supported on the server") }` — measured, and
   recorded in hope-ui's own notes (`../hope-ui __internal__/plan.md:195`, carried by
   `component-blueprint.md` §10.4). Chakra's renders children in place instead. Without our wrapper,
   the canonical Dialog snippet crashes on every SolidStart / TanStack Start app until the consumer
   hand-writes an `isServer` guard.
2. **Solid's `Portal` mounts to `document.body`; the machine looks its elements up through
   `getRootNode()`** from the environment context (`plan.md` §7.2). Different roots means a machine
   that cannot find its own content — and shadow-DOM and iframe usage break **silently**, which is the
   failure mode this project is built to avoid.

Everything else is dropped. The shipped surface is `container`, `children`, the `isServer` guard, and
the environment-aware default mount — about six lines.

> **`disabled` is not shipped at all.** Neither the reactive form nor the non-reactive one.

Three reasons, in order of weight:

1. **A non-reactive `disabled` is a silent failure in the API.** Set it, change it, nothing happens,
   no error. That is `plan.md` §0.2's shape in prop form. **Not shipping it makes passing it a type
   error**, which is the behaviour this repo prefers everywhere else.
2. **The reactive form has a real hydration cost on every Portal use.** It needs `<Show>` over a
   `children()`-resolved accessor so the subtree is not built twice — and `children()` resolves in the
   ambient owner, which **relocates `_hk` for the whole portalled subtree**
   (`component-blueprint.md` §10.2). Paying that on every Dialog, Popover, Menu, Select and Tooltip is
   the wrong trade.
3. **Nothing in Chakra uses it.** `grep -rn "<Portal" chakra-ui/packages/react/src/` returns nothing
   outside tests and stories — no Chakra component renders a `<Portal>` at all, let alone with a
   `disabled` that changes. A consumer who wants it writes `<Show>` in their own tree, where the `_hk`
   shift is local to markup they wrote.

Two `React→Solid` rows for `plan.md` §0.4's table, then: **`disabled` is absent**, and `container` is
an `Element` rather than a `RefObject` because Solid has no ref objects. Chakra's third difference —
portalling each child separately via `Children.map(createPortal)` — has no Solid analogue and no
observable effect, so it is not a row.

### 5.2 `client-only` — **not an exclusion** either

Chakra's `ClientOnly` is `useState(false)` + `useEffect(() => setHasMounted(true))` + a `<Show>`
(measured, `client-only/client-only.tsx`). The reason it exists is **not** a React idiom: it is that
server markup and first-client-render markup must agree, and children that touch browser APIs cannot
render in either. **Solid has the identical constraint** — `isServer` from `@solidjs/web` is `false`
on the client from the very first render, so branching on it would render children *during hydration*
and mismatch the server's fallback.

So `ClientOnly` is neither a React idiom nor Solid-native. Its Solid form is `createSignal(false)` +
`onMount` — a SolidJS idiom expressing the same behavior, which is the port rule's explicit exception,
not an invention. **Ships**, ~12 lines, no styling, no machine. This corrects `brief-plan` §4.1 doc 5 on
the same measured basis `component-blueprint.md` §13 row 5 corrected `portal`.

### 5.3 `for` — **excluded**

Chakra's `For` is `each?.map(children)` with a `fallback` (measured, 27 lines). `solid-js` exports
`<For each fallback>{(item, index) => …}</For>` with **the same three-part public API** and reference
-keyed reconciliation, which is precisely what `.map()` in Solid JSX destroys. Shipping ours would
mean either re-exporting Solid's under our brand — adding a second name for a framework primitive the
reader already imports — or reimplementing `.map`, which is the anti-pattern `<For>` exists to
prevent. The only delta is that Solid's `index` is an accessor rather than a number.

**Excluded as Solid-native.** The docs' Chakra-to-Solid page maps `<Chakra.For>` → `<For>` from
`solid-js`; P8 owns that page.

### 5.4 `show` — **excluded**

Chakra's `Show` is `when` + `fallback` + optional callback children, wrapping a non-element result in
a fragment (measured, 29 lines). `solid-js`'s `<Show>` has `when`, `fallback` and callback children
receiving a narrowed accessor, and needs no fragment wrap because Solid JSX has no element/node
distinction to bridge. **Same API, strictly better semantics, already in the reader's imports.**

**Excluded as Solid-native**, same page as `for`.

### 5.5 `environment` — **not excluded; relocated**

`components/environment/index.ts` is a pure re-export of Ark's `EnvironmentProvider` /
`useEnvironmentContext` (measured — the file has no implementation). It is a **context**, not a
component: no anatomy, no recipe, no machine, nothing to render. `plan.md` §7.2 already places it in
`@chakra-ui-solid/system` as one of two contexts, and `component-blueprint.md` §2.3 already threads
`getRootNode` from it into every machine.

**Ships from `system`, re-exported from `components/environment`** so Chakra's import path resolves.
Calling that an exclusion would be wrong twice: the API is present, and it is load-bearing for every
machine component's shadow-DOM correctness.

### 5.6 `presence` — **not excluded**

Chakra ships `Presence` as `chakra(ArkPresence)` — a **public, styled component** (measured,
`components/presence/index.tsx`), not an internal mechanism. `plan.md` §6 and
`component-blueprint.md` §7 already build `createPresence` in `@chakra-ui-solid/system` over the
`@zag-js/presence` machine; the public component is a thin styled wrapper over it plus the render
strategy.

The one thing it does **not** get is `hideMode: "activity"` — React 19's `<Activity>` has no Solid
equivalent and Ark's own Solid package does not ship the prop either. That is a `React→Solid` row in
`plan.md` §0.4, already recorded (`component-blueprint.md` §7.3), not an exclusion.

### 5.7 Charts — **excluded**, and the reason is a dependency, not a style

`@chakra-ui/charts` is a separate package (§1.1) peer-depending on **`recharts >= 3`** and
**`react >= 18`** (measured, `packages/charts/package.json`). Recharts is a React component library
with no Solid port. The exclusion is therefore not about §0, not about parity, and not about effort:
there is no charting substrate to bind to, and inventing one would be the largest violation of the
port rule in the project.

**Excluded**, per the brief. If a Solid charting library reaches recharts' surface later, this row is
revisited on its own, not as part of a release.

### 5.8 Seven of the fourteen `./hooks` — **excluded individually**

`@chakra-ui/react`'s `./hooks` subpath exports fourteen hooks (measured, `src/hooks/index.ts`). Seven
are React re-render machinery with no referent in a framework whose components run once:

| Hook | Why it has no Solid meaning |
|---|---|
| `useCallbackRef` | A user-land `useEffectEvent` — a stale-closure workaround. Solid closures are never stale |
| `useConst` | `useRef` guarding re-initialization across renders. A `const` in a Solid component body already is one |
| `useForceUpdate` | `useReducer(x => x + 1)`. Solid has no re-render to force |
| `useLiveRef` | A ref reassigned every render so effects read current values. Solid props are already live |
| `usePrevious` | *"Storing information from previous renders"* — its own JSDoc. There are no previous renders |
| `useSafeLayoutEffect` | `useLayoutEffect` on the client, `useEffect` on the server. Solid's effects do not run on the server at all |
| `useUpdateEffect` | An effect that skips the first render. Solid effects already run on change |

The other seven ship: `useBreakpoint`, `useMediaQuery`, `useDisclosure`, `useControllableState`,
`useElementRect`, `useListCollection`, `useOverlay`.

---

## 6. The presence-gated set — two families, not one

`component-blueprint.md` §1.2's `aria-controls` line belongs to presence-gated trigger parts and to
nothing else, so the set has to be enumerated rather than described.

### 6.1 Family Z — a `@zag-js/presence` instance

```bash
grep -rln 'usePresence\|splitPresenceProps' __reference-impl__/ark-ui/packages/react/src/components/
```

Fourteen Chakra components: **action-bar, color-picker, combobox, date-picker, dialog, drawer,
floating-panel, hover-card, menu, popover, presence, select, tabs, tooltip.**

**Six of the fourteen default `lazyMount: true` and `unmountOnExit: true`** — measured:

```bash
grep -rln 'unmountOnExit: true' __reference-impl__/chakra-ui/packages/react/src/components/
# action-bar dialog drawer floating-panel menu tooltip
```

`prior-art.md` §5.1's list of six is confirmed exactly. The other eight have a presence and no
defaults, so their closed state is *mounted* unless a consumer opts in — which is the case that makes
the `aria-controls` rule presence-gated rather than open-gated (`component-blueprint.md` §1.2).

### 6.2 Family M — machine-owned visibility, no presence instance

**Two components: `collapsible` and `accordion`.** Measured:

```bash
sed -n '26,52p' __reference-impl__/ark-ui/packages/react/src/components/collapsible/use-collapsible.ts
sed -n '17,23p' __reference-impl__/ark-ui/packages/react/src/components/accordion/accordion-item-trigger.tsx
```

Ark's `useCollapsible` computes `isUnmounted` from the **collapsible machine's own `api.visible`**
plus `lazyMount`/`unmountOnExit` — the identical render-strategy expression as `usePresence`, over a
different source. `AccordionItemTrigger` then gates `aria-controls` on `collapsible.isUnmounted`, not
on a presence.

**Consequence for `@chakra-ui-solid/system`:** the render strategy of `component-blueprint.md` §7.2
must be **separable from the presence machine** — the `lazyMount`/`unmountOnExit`/`unmounted`
computation takes a `present: Accessor<boolean>` and does not care where it comes from. That is a
small refactor of a 30-line function, and it is cheap now and annoying after B2 is written against
the presence-only shape. **Assigned to step 5**, so Dialog's presence and Collapsible's share one
render strategy from the start.

### 6.3 The `aria-controls` override, by component

Six Ark components carry it; all six have a Chakra component, so all six get the one line:

```bash
grep -rn "aria-controls" __reference-impl__/ark-ui/packages/react/src/components/ | grep -v test
# drawer, accordion, dialog, popover, menu, floating-panel
```

**`accordion` reaches it through family M**, the other five through family Z. Four of the six carry a
dedicated upstream test named *"should not have aria-controls if lazy mounted"* — those four are the
ones our own tests mirror.

**Not taken, deliberately:** `select`, `combobox`, `hover-card`, `tooltip`, `color-picker`,
`date-picker` and `tabs` have a presence and **no** `aria-controls` override in Ark. They emit the
dangling IDREF while unmounted, in Chakra exactly as in ours. Adding it would be an accessibility
improvement over the port target, which the port rule forbids; the fix belongs upstream in Zag
(`zag-solid-adapter.md` §8).

---

## 7. The fifth part shape — the repeated part

`component-blueprint.md` §3.2 has four shapes (A machine part, B presence-gated machine part, C
slot-only part, D behavior-only part) and §0.2 hands the fifth here: a part that renders **once per
item** under one Root, each instance needing a per-item context.

### 7.1 The component that settles it: **Accordion**

Not because it is first alphabetically, and not because P5 mentioned it — because it is the smallest
component that carries a per-item context of the *general* shape, and because it settles a second
unknown in the same pass.

| Why Accordion | |
|---|---|
| **Its item context is a props bag, not behavior** | Ark's `useAccordionItemPropsContext` carries the item's identity, and the *Root's* getters consume it: `accordion.getItemTriggerProps(itemProps)`. That is the shape every repeated part needs — the context carries **who I am**, the machine still owns **what I do**. `component-blueprint.md` §3.3's rule ("anything a part needs that is not `api`/`slots`/presence is a smell") survives intact |
| **It is small** | 5 machine parts, 6 recipe slots, 2 variant keys. The shape is not entangled with a 26-slot surface |
| **It settles family M at the same time** | Its `aria-controls` gate is the collapsible machine's `isUnmounted` (§6.2). One component, two open shapes |
| **It exercises shape C inside the repeat** | `itemBody` is a Chakra-only slot with no machine part, rendered per item |

**Rejected alternatives, each for a reason:**

- **`listbox` / `select` / `menu`** — their items come from `@zag-js/collection`, so the per-item
  context would carry a *collection item* and the shape would over-fit to a mechanism only three
  components use. Settling the general shape on the special case is how a pattern gets stamped wrong
  100 times.
- **`radio-group`** — a fine second data point, but its item context is `{ value }` alone, which is
  too thin to reveal whether the shape generalises.
- **`tree-view`** — the repeated part is also **recursive** (branches nest). That is a strictly harder
  problem and the right place to *stress* the shape (B7), not to define it.
- **`table` / `timeline` / `data-list`** — repeated parts with **no machine**, so they exercise the
  repetition without the context-plus-getter interaction that is the actual question.

### 7.2 What Accordion must prove

Do not write the shape's code before these five hold. Each is a test, not an argument.

1. **The per-item context is created once per item and read by every descendant part**, and no part
   reaches past it into Root state for the item's identity.
2. **The item props bag round-trips through the Root's getters** — `getItemTriggerProps(itemProps)`,
   `getItemContentProps(itemProps)` — with the parts passing it through unmodified.
3. **The context value is built without an untracked read.** The item context is created inside a
   `<For>`/repeat callback, which Solid 2.0 labels a **strict-read phase**
   (`component-blueprint.md` §2.2). This is the one place the fifth shape can differ from the four,
   and `mount()` failing on a `[STRICT_READ_UNTRACKED]` there is a genuine defect, never a wrapper's
   absence.
4. **N items allocate the same `_hk` keys on server and client.** An SSR→hydrate round-trip fixture
   with a non-trivial item list, not a green typecheck (`component-blueprint.md` §10.1).
5. **The slot class map is resolved once on the Root, not once per item.** Every `Accordion.ItemTrigger`
   carries the *same* `itemTrigger` class string; a per-item `sva()` call would be correct and wasteful,
   and proving it is unnecessary is what lets B5/B7's larger collections scale.

When those hold, `component-blueprint.md` §3.2 gains **shape E — repeated part**, written from what
Accordion actually needed. Until then, no other component with a repeated part starts.

---

## 8. The floating seam, and where the first floating component lands

### 8.1 The seam, restated so the sequencing argument is legible

`prior-art.md` §3.3 seam 3, carried by `component-blueprint.md` §14 as *the one seam the blueprint
knows about and cannot price*: `@zag-js/popper` writes `--z-index` **imperatively** into the floating
element's `style` attribute, in a `raf`, while Solid binds that same attribute reactively — with a
`MutationObserver` watching it. Two writers on one attribute, one watching the other.

```bash
grep -rn 'z-index\|layer-index' __reference-impl__/zag/packages/utilities/popper/src/get-placement.ts
# floating.style.setProperty("--z-index", getComputedStyle(contentEl).zIndex)
```

Neither hope-ui spike built a floating component, so nobody has measured what a Solid reactive `style`
binding does when a `raf` callback writes into the same attribute between renders.

**Ten machines pull `@zag-js/popper`:**

```bash
for m in __reference-impl__/zag/packages/machines/*/; do grep -q '"@zag-js/popper"' $m/package.json && basename $m; done
# cascade-select color-picker combobox date-picker hover-card menu popover select tooltip tour
```

Of those, **eight have a Chakra component**: color-picker, combobox, date-picker, hover-card, menu,
popover, select, tooltip — **plus `action-bar`**, which runs on the popover machine. **Nine Chakra
components inherit whatever this seam turns out to cost.**

### 8.2 The first floating component: **Popover, at step 5b — immediately after Dialog, before volume**

Placed there because the alternative is discovering the cost after Workstream B has built ~45
components on the assumption it is free, and after B1's five components have been written against a
Popover pattern that may not hold.

**Why Popover and not one of the other eight:**

| Candidate | Why not first |
|---|---|
| `tooltip` | Smallest (5/5) but has no interactive content, no presence-gated `aria-controls`, and no Chakra-only slots. It would under-test the seam's interaction with the recipe layer |
| `menu`, `select`, `combobox` | Floating **and** a collection, typeahead, `aria-activedescendant`, and — for select/combobox — the restrictive-content-model compile crash (`component-blueprint.md` §10.4). Two unknowns at once is how the spike produced two wrong verdicts (`prior-art.md` §8.1) |
| `hover-card` | Floating with no `root` part and no trigger override. A narrower surface than Popover for the same cost |
| `color-picker`, `date-picker` | 26-slot recipes. The seam would be the smallest thing being measured |
| `action-bar` | Uses 3 of the popover machine's 10 parts. It tests the seam on a fraction of the surface |

**Popover is the smallest complete floating surface**: 10 machine parts, 13 recipe slots, a presence,
a Portal, `arrow`/`arrowTip` (the two slots that read the popper's own `--arrow-size` /
`--arrow-background` custom properties — the exact place the imperative writes land), the
presence-gated `aria-controls` override, and three Chakra-only slots (`header`/`body`/`footer`) that
re-exercise shape C outside Dialog.

**And it is the machine `action-bar` reuses**, so step 5b also proves the *one machine, two slot
recipes, two public components* shape — which B1 then stamps four more times (dialog→Dialog/Drawer,
popover→Popover/ActionBar) rather than discovering.

**What step 5b must produce, either way:** a number. If the seam is free, that is one sentence in the
blueprint and B1 proceeds. If it is not, the fix lands in one component before nine inherit it, and
`component-blueprint.md` gains the rule the way it gained the `hidden`-vs-`display` one.

---

## 9. The build order

`plan.md` §10's five-step escalation is the spine and its steps keep their numbers. P6 adds **step
5b** inside the probe phase and extends past step 7 into batches. Every batch names what it proves
that the previous one did not, and has a gate.

### 9.1 The probe phase — unchanged, plus one insertion

| Step | What | Gate |
|---|---|---|
| 1 | Repo bootstrap | Three Vitest projects green; `solid-contract` characterization tests written |
| 2 | `@chakra-ui-solid/zag-solid` | `zag-solid-adapter.md` §6.5. Plus the §0 manifest audit re-run against the *installed* closure |
| 3 | Styling seam — Panda config, preset, `renderStyled`, style props. **Plus the two contexts** (locale, environment) | `Box` renders correct **computed styles** in unit, SSR and browser, and a consumer `panda.config.ts` override changes them |
| 4 | One real slot recipe, in a throwaway consumer whose source never names the variant | `plan.md` §1's gate — `staticCss` per recipe confirmed or the ladder's rung 2 taken |
| **5** | **Dialog** — the blueprint end to end. **Plus `Portal`**, and the render strategy split so `present` can come from a machine as well as a presence (§6.2) | `component-blueprint.md` §11 compiles; axe clean on closed-state assertions, `aria-hidden-focus` only on open (§9.2 there); SSR→hydrate round-trip |
| **5b** | **Popover** — the floating probe (§8) | The popper `--z-index` seam is **measured**: a number, and either a sentence or a rule in `component-blueprint.md` |
| **3b** | **The two visual surfaces**, both rendering `Box` — Storybook (a local playground and the compile-mode canary, **never deployed**) and the **docs app shell** with its own consumer `panda.config.ts`. Added at the S1 review, **D-98** | Both run; `test:storybook` and the `docs` job go live; **P7-B**, **P8-B**, **P8-C** close |
| **6a** | **18 atomic-recipe components** (§4.3's step-6 rows) | The atomic recipe layer at volume; `splitVariantProps` (**P5-B**); `container`'s expression-tier preset delta |
| **6b** | **22 styled primitives and layout** (§4.4's step-6 rows) | The eight CIJ route-3 conversions of §3.1, held converted by `check:style-contract` rule 1 |
| **6c** | **4 utilities + `Presence` + the 7 surviving `./hooks`** | The presence render strategy standalone, over both families |
| 7+ | Machine components at volume, in batches B1–B8 | Below |

**Workstream B keeps its position** — after the factory, before the machine-component *volume*
workstream — exactly as `plan.md` §10 fixes it. Steps 5 and 5b are probes, not the volume workstream;
saying so is what keeps both statements true. Its **weight** is what changed: **45 components**, the
largest single step in the project — more than B1–B5 combined — and five of
its atomic recipes (`checkmark`, `radiomark`, `colorSwatch`, `input`, `inputAddon`) are **composed
into slot recipes by later batches**, so it is a hard prerequisite for B3, B4 and B8 rather than a
parallel track.

**Split three ways at the S1 review (D-100), and the weight is why.** 45 components in one phase is
the longest stretch in the order with no review in it, and it is the stretch whose output is judged
most by eye — spacing, typography and colour across Button, Badge, Text, Heading, Stack, Flex and
Grid. The position is unchanged; the phase is now **6a** (18 atomic-recipe components), **6b** (22
styled primitives and layout) and **6c** (4 utilities + `Presence` + the hooks), with a gate each.
The prerequisite also **tightens usefully**: it is **6a alone** that blocks B3/B4/B8, because the
three composed primitives live there — `input` and `inputAddon` are B3's own rows (§4.3). 6b and 6c
gain scheduling freedom the single step did not have.

### 9.2 The batches

| Batch | Components | What it proves that the previous one did not |
|---|---|---|
| **B1** — reuse | Drawer, ActionBar, Tooltip, HoverCard, Menu | **One machine, two public components, two slot recipes** — twice (dialog→Dialog/Drawer, popover→Popover/ActionBar). Completes the six `lazyMount`/`unmountOnExit` defaults. Floating with an arrow at volume, against 5b's measurement |
| **B2** — the repeated part | Collapsible, Accordion, Tabs | **The fifth part shape** (§7) and **family M** (§6.2). Chakra-only anatomy inside a repeat (`itemBody`, `contentGroup`). Tabs' `_active`-is-a-pseudo-class trap |
| **B3** — the field family | Field, Fieldset, NativeSelect, Input, Textarea, InputGroup, InputAddon, InputElement | **A multi-part family with no machine** — the only one. Ark's 226-line `use-field` re-derived from the ARIA contract, never its expression. Atomic recipes composed *into* a slot recipe. `input-group`'s runtime `calc()` converted to route 3 |
| **B4** — form controls | Checkbox, CheckboxCard, Switch, RadioGroup, RadioCard, SegmentGroup, RatingGroup, PinInput, NumberInput, Editable, Toggle | **Three public components on one machine** (radio-group). `swittch` as a generated function name. `editable`'s top-level `size` collision — the live case for `styleSource`. A recipe key with no recipe (`toggle`). Field's context consumed from outside its own family |
| **B5** — collections | Listbox, Select, Combobox | `@zag-js/collection` and the `./collection` subpath. `aria-activedescendant`. **The restrictive-content-model compile crash** — a hidden native `<select>` with a static child and a dynamic sibling, visible only in Storybook (`component-blueprint.md` §10.4) |
| **B6** — display & data | Alert, Avatar, Blockquote, Breadcrumb, Card, Clipboard, CodeBlock, DataList, EmptyState, List, Marquee, Progress, ProgressCircle, QrCode, Stat, Status, Table, Tag, Timeline | **The 15 machine-less slot recipes** at volume, over the shape B3 proved. Two more recipe keys with no recipe (`clipboard`). One machine styled by two recipes again (progress) |
| **B7** — positioned & stateful | Carousel, FileUpload, Pagination, ScrollArea, Slider, Splitter, Steps, TagsInput, TreeView | Machine-emitted inline `style` at volume — legal, and the place a §0 false positive would surface. Four of the seven duplicate-slot recipes. **TreeView stresses the fifth shape recursively.** Splitter is the audited gesture-cursor case |
| **B8** — the heaviest | ColorPicker, DatePicker, FloatingPanel, Toast | 26-slot recipes. Date-picker's duplicate `view`. FloatingPanel positions itself without popper — the one floating component 5b's measurement does **not** cover. **Toast's imperative `createToaster` store lives outside the component tree**, the only such surface in the library |

**All 115 folders are placed, and the placement adds up:** step 3 = 3 (`box`, `environment`,
`locale`), step 5 = 2 (`dialog`, `portal`), step 5b = 1 (`popover`), step 6 = 45, B1–B8 = 62,
excluded = 2. **3 + 2 + 1 + 45 + 62 + 2 = 115.**

**Gate shared by every batch:** axe on every mounting test with the allowance list of
`component-blueprint.md` §9.3; computed-style assertions, never class-name assertions
(`prior-art.md` §4.4); the generated-CSS coverage check green, with §2.5's six known-unstyled
components on its allow-list and the seven duplicate-slot recipes deduplicated before comparison.

### 9.3 Ordering constraints that are not preferences

- **Workstream B before B3/B4/B8** — five atomic recipes are composed into later slot recipes.
- **Step 5 before B2** — the render strategy has to be source-agnostic before Collapsible needs it.
- **Step 5b before B1** — five components are written against the floating pattern it settles.
- **B2 before B5/B6/B7** — nine batched components have a repeated part, and the shape is settled once.
- **B3 before B4** — Field's context is what carries `invalid`/`disabled`/`required` into every form
  control.

---

## 10. `RootProvider`, `PropsProvider`, `Context`, and `./hooks`

`component-blueprint.md` §11.13 defers all of these without deciding, on the stated reason that
`RootProvider` *"needs a public `useDialog` hook (`plan.md` §5.5's `./hooks` subpath)."` **Measured,
that reason is wrong, and the answer splits four ways rather than one.**

```bash
grep -n "useDialog" __reference-impl__/chakra-ui/packages/react/src/components/dialog/index.ts
# export { useDialog, useDialogContext } from "@ark-ui/react/dialog"
ls __reference-impl__/chakra-ui/packages/react/src/hooks    # 14 files, none of them a machine hook
```

Chakra exports `useDialog` from **the component's own barrel**, not from `./hooks`. `./hooks` is
fourteen standalone utility hooks — `useBreakpoint`, `useDisclosure`, `useMediaQuery`, … — and none of
them is a `useX` machine hook. So:

| Surface | Count | Shape | Lands |
|---|---|---|---|
| **`Context`** — `<Dialog.Context>{(api) => …}</Dialog.Context>`, a render prop over the component's own context | **43** components | **Per-component row.** Ten lines, no recipe, no machine props | **With the component's batch.** No separate work item |
| **`useX` / `useXContext`** — the machine hook and its context reader | one per machine family | **Per-component row**, exported from the component's own subpath (`@chakra-ui-solid/components/dialog`), **not** from `./hooks` | With the component's batch. `useX` is what `RootProvider` consumes |
| **`RootProvider`** — `<Dialog.RootProvider value={useDialog(...)}>` | **41** components | **Per-component row**, but it needs `useX` first | With the component's batch |
| **`PropsProvider`** — a defaults-injection context | **47** components | **One cross-cutting mechanism in `@chakra-ui-solid/system`**, then one thin row per component | **Mechanism at step 5b** (the first batch with two components on one machine, which is where injected defaults first earn their keep); rows with each batch |
| **`./hooks`** — the fourteen standalone hooks | 7 ship, 7 excluded (§5.8) | **A `plan.md` §5.5 subpath obligation**, independent of any component | **Step 6.** `useBreakpoint`/`useMediaQuery` are needed by the responsive story, and `useListCollection` by B5 |

```bash
grep -l 'as RootProvider'  .../components/*/namespace.ts | wc -l   # 41
grep -l 'as PropsProvider' .../components/*/namespace.ts | wc -l   # 47
grep -l 'as Context'       .../components/*/namespace.ts | wc -l   # 43
```

**None of these is deferred past its own component**, which is the correction to
`component-blueprint.md` §11.13: it recorded them as *planned*, and P6 schedules them as rows in each
component's batch rather than as a later sweep. A sweep would mean 131 namespace edits after the fact.

---

## 11. What the matrix adds to the dependency graph

`plan.md` §5.2's table lists in-repo dependencies only. Three additions the matrix makes visible, all
of which `component-blueprint.md` §13 row 6 flagged and none of which is in that table:

| Package | Gains | Size, measured |
|---|---|---|
| `@chakra-ui-solid/system` | `@zag-js/presence` | 1 machine package. Presence is a machine like any other (`plan.md` §6) |
| `@chakra-ui-solid/components` | one `@zag-js/<machine>` per machine component | **37** distinct machine packages — the 38 Chakra reaches (§2.4) minus `presence`, which `system` owns |
| `@chakra-ui-solid/components` | non-machine Zag utilities | `@zag-js/collection` (the `./collection` subpath, `plan.md` §5.5), `@zag-js/focus-trap` (the `FocusTrap` component), `@zag-js/highlight-word` (`Highlight`), `@zag-js/dom-query` (Field's element lookups). `@zag-js/i18n-utils` belongs to `system`'s locale context (`plan.md` §7.2) |
| `preset`, `styled-system`, `components` | **`@pandacss/dev` as a non-optional `peerDependency`** | `plan.md` §4.4. This is the graph's **first required-of-the-consumer edge** — a dependency the package manager enforces on someone else's tree |

**The real closure is 43 external packages before transitives** — 41 on `components` (37 machines +
`collection` + `focus-trap` + `highlight-word` + `dom-query`) and 2 on `system` (`presence` +
`i18n-utils`) — against `plan.md` §5.2's table,
which lists none. That is what `zag-solid-adapter.md` §9.2 defers the bundle re-measurement to
milestone 5 for: milestone one installs `@zag-js/{core,types,utils}` only, so a number measured there
is the adapter's own weight and not the figure `prior-art.md` §10.5 is about. **The first number worth
comparing against `+13.4 KB gz` arrives at step 5**, and the first number worth comparing against
*the library's* footprint arrives at the end of B8.

Two shapes the matrix makes measurable that were not before:

- **Per-batch closure growth is the useful metric, not per-component.** B1 adds five components and
  **zero** new machine packages — Drawer and ActionBar reuse dialog and popover. B4 adds eleven
  components and **eight** machine packages. Quoting a flat per-component bundle cost across a library
  where three components share one machine would repeat exactly the arithmetic error
  `prior-art.md` §10.2 rows 6 and 8 correct.
- **`@zag-js/popper` is pulled by nine components** (§8.1) and `@zag-js/collection` by three, so both
  amortize the way `prior-art.md` §3.4's dialog/listbox overlap predicted.

---

## 12. Assumptions — closed, opened, left open

### 12.1 `brief-plan` §8 assumptions P6 owns

| # | Assumption | Status after P6 | Gate |
|---|---|---|---|
| **1** | *"Zag v1's machine list — the 56 machines are read from the **v2** checkout; `cascade-select`, `gridlist`, `image-cropper`, `scheduler`, `dnd`, `toc` may be v2-only"* | **CLOSED.** 51 machines at `main`/1.43.0 (§1.2). `cascade-select`, `image-cropper` and `toc` **exist**; `gridlist`, `scheduler`, `dnd` are v2-only. None of the three that exist is portable — Chakra has no component for any of them (§2.4). Confirms `prior-art.md` §10.2 row 10 | — |
| **2** | *"Each machine's `anatomy` export at 1.43.0 — asserted authoritative, not enumerated per machine"* | **CLOSED, and confirmed** (§1.4). 49 of 51 export one; 2 are headless by design; 406 parts enumerated | Standing: `legal.md` §5's anatomy diff per Zag minor |
| **5** | *"`@ark-ui/react` version — brief says 5.38.1; Chakra 3.36.1 pins 5.37.2. Assumed close enough for reference reading"* | **NARROWED, and one concrete divergence found.** Chakra 3.36.1 pins **5.37.2** (`grep '"@ark-ui/react"' packages/react/package.json`); our checkout is **5.38.1**. Ark 5.38.1 ships a `drawer` on `@zag-js/drawer` that Chakra's Drawer does not use (§2.2), so at least one component differs between the two versions in a way that reaches this matrix. **Every machine mapping in §4 was measured from Chakra's own import, not from Ark's folder list**, so the matrix does not depend on the version we happen to have | **Still open** for anything read from Ark's *implementation* rather than Chakra's imports — `component-blueprint.md` §1.2's `aria-controls` list and §6.2's `useCollapsible` are both such reads. Re-checked at **step 5** and **B2** against the installed 5.37.2 |

### 12.2 Assumptions P6 introduces

| # | Assumption | Blocks if wrong | Verified at |
|---|---|---|---|
| **P6-A** | The popper `--z-index` seam is priceable in one component, and the price is the same for the other eight | §8's whole sequencing argument. If Popover is cheap and Select is not, the seam is per-machine and B5/B8 each owe their own probe | **Step 5b**, then re-confirmed at the first B5 component |
| **P6-B** | Ark's `useCollapsible` shape (§6.2) is the *only* second presence source — no other machine exposes visibility that Ark wraps this way | §6's two families become three, and the render strategy needs a third source | **B2**. Cheap: `grep -rl 'isUnmounted' ark-ui/packages/react/src/` |
| **P6-C** | The six components whose recipe key resolves to nothing (§2.5) are unstyled **by intent** upstream, not by a bug about to be fixed | The coverage-check allow-list, and whether `Container`'s preset delta is a port or a divergence | **Step 4**, when the coverage check first runs; and a standing check on each Chakra minor (`legal.md` §5) |
| **P6-D** | Chakra's own `anatomy.ts` — not the preset's `slots` arrays — is the authoritative slot list, so the seven duplicates are transcription artifacts with no runtime meaning | The coverage check's dedupe step, and any generated per-slot type | **Step 4**. If a duplicated slot turns out to emit two classes, the dedupe is wrong and the preset needs a delta |
| **P6-E** | `Field`'s behavior can be re-derived from its ARIA contract without reading Ark's 226-line expression, at a cost comparable to a machine component | B3, and the eight components that consume Field's context | **B3.** This is the only component in the library with no machine and no permission to copy |
| **P6-F** | An unresolvable token reference — the preset's `cursor: "switch"` against a token registered as `swittch` (§1.3c) — **drops the declaration rather than failing the build**, and a `theme.extend.tokens.cursor.switch` key restores it | Whether the fix is one token key or an upstream wait. If Panda *errors* instead, the preset does not build for anyone and the finding is larger than one component | **Step 3**, the first `panda codegen`. Cheap and unambiguous: build once with the delta and once without, and read the emitted `cursor` declaration |

### 12.3 Assumptions P6 depends on and does not touch

Unchanged and assigned elsewhere: **3** (Panda ↔ preset pairing) → step 3; **4** (`staticCss` for
internally-emitted variants) → step 4; **6** (TanStack prerender) → P8; **7** (npm scope) → closed at
P1; **8** (runtime stylesheet injection) → **PASS** at P4 (`zag-solid-adapter.md` §5.3); **9** (the
`data-*` vocabulary) → step 4, still *"the single cheapest check with the largest downside if
skipped"*; **10** (the fork against 1.43.0) → closed and refuted at P4; **11** (presence vs the
preset's animations) → closed at P2, resolved the other way. `plan.md` §11.2's P3-A…P3-F and
`component-blueprint.md` §12.3's P5-A…P5-E all stand as written.

---

## 13. What P6 changes — re-plan P7–P9 against this

> **The rows marked P9 were applied at P9**, each in exactly one place: row 1 → `plan.md` §0.4's
> exclusion note · row 1b → `plan.md` §0.4 gains the `React→Solid` row, with a pointer left on
> `component-blueprint.md` §11.12 · row 2 → `plan.md` §10 (115 directories) · row 3 → `plan.md` §10
> (the slot-recipe half, false by 15) · row 7 → `plan.md` §1.3 · row 7b → `plan.md` §3.3 and
> `legal.md` §6 item 3 · row 9 → `plan.md` §5.2 · row 10 → `plan.md` §12 row 3. The full log is
> `decisions.md` §7.

| # | The source says | P6 decides | Touches |
|---|---|---|---|
| **1** | `brief-plan` §4.1 doc 5 and §0.4: `client-only`, `environment`, `for`, `show`, `portal`, `presence` are per-component **exclusions** | **Two of the six are exclusions.** `for` and `show` are Solid-native (§5.3, §5.4). `portal` ships (P5 already), `client-only` ships (§5.2), `presence` ships (§5.6), `environment` is **relocated**, not excluded (§5.5). Charts is the one clean exclusion, on a **dependency** ground (§5.7) | **P8** (the Chakra-to-Solid mapping page), **P9** (`decisions.md`) |
| **1b** | `component-blueprint.md` §11.12 ships `Portal` with `container`, `disabled` and a note that `disabled` is non-reactive, and assigns the reactive question to P6 | **`disabled` is not shipped at all**, and the component shrinks to ~6 lines: `container`, `children`, the `isServer` guard, the environment-aware mount (§5.1). A non-reactive prop that silently ignores changes is `plan.md` §0.2 in prop form; **omitting it makes passing it a type error.** The two reasons the component still exists — Solid's `Portal` *throws* server-side, and it mounts to `document.body` while the machine queries `getRootNode()` — are the whole justification, and neither is negotiable | **P5** (§11.12's code drops a prop and a paragraph), **P7** (`plan.md` §0.4 gains a `React→Solid` row: `disabled` absent) |
| **2** | `prior-art.md` §10.4: *"118 Chakra component folders"*, re-confirmed | **115 directories**; 118 is the entry count and includes `index.ts`, `icons.tsx`, `theme.tsx` (§1.1). Same class as §10.2 row 9's 47→46. **No conclusion changes** | **P9** — the reconciliation pass |
| **3** | `plan.md` §10: *"the 56 slot recipes are, correspondingly, the machine surface"* | **False by 15.** 34 slot recipes are driven by a same-named machine, 7 by a machine under another name, and **15 have no machine at all** (§2.1–2.3). The companion claim — all 18 atomic recipes are non-machine — is **exactly true** | **P7** (the DoD's per-kind rules), **P9** |
| **4** | `component-blueprint.md` §3.1: `dialog`'s duplicated `backdrop` slot is a live trap | **Seven slot recipes duplicate a slot**, not one — `carousel`, `combobox`, `datePicker`, `dialog`, `drawer`, `field`, `splitter` (§1.3b). The cause is the preset hard-coding what Chakra's theme derives. **The generated-CSS coverage check must dedupe or it reports seven permanent false failures** | **P7** (the check) |
| **5** | `component-blueprint.md` §11.13: `RootProvider` needs *"a public `useDialog` hook (`plan.md` §5.5's `./hooks` subpath)"* | **Measured wrong.** Chakra exports `useDialog` from the **component's own barrel**; `./hooks` is 14 unrelated utility hooks, 7 of which are React re-render machinery and are excluded individually (§5.8, §10). `RootProvider`/`PropsProvider`/`Context` are **per-component rows in each batch**, not a deferred sweep | **P7, P8, P9** |
| **6** | `component-blueprint.md` §7.2's render strategy takes its `present` from a `@zag-js/presence` instance | **Two presence families.** `collapsible` and `accordion` take it from the **collapsible machine's own `visible`** (§6.2). The render strategy must be source-agnostic, and that refactor lands at **step 5**, not after B2 is written against the presence-only shape | **P7** (the DoD's presence tests) |
| **7** | `plan.md` §1.3 treats `swittch` as a spelling oddity in the slot-recipe registry — *"invisible to consumers either way"* | **Wider, and one reference is broken.** `swittch` is also the `cursor` **token** key, while the Switch recipe references `cursor: "switch"` — so the preset's Switch **silently loses its `cursor: pointer`**, where Chakra's runtime theme does not (§1.3c). It is a preset defect, not Chakra behavior, so inheriting it is a divergence. **Our preset adds one `theme.extend.tokens.cursor.switch` key**; the slot-recipe key stays `swittch`, verbatim. The upstream issue now has a concrete defect to report | **P7** (the preset delta, the upstream filing), **P9** |
| **7b** | `plan.md` §1.3's *"depend, do not vendor"* holds with no expression-tier files outside the `zag-solid` fork | Two preset deltas P6 adds, and they are **not** the same tier: the `cursor.switch` token key is one word and owes nothing; the **`container` recipe** (§1.3a, §2.5) is a recipe **body** reproduced from `@chakra-ui/react` — expression-tier under `legal.md` §1.4, owing an `@license` header and root + package `NOTICE.md` rows. Plus **six components whose recipe key resolves to nothing in Chakra too** (§2.5), which the coverage check must allow-list | **P7** (the preset, the coverage allow-list), **P9** |
| **8** | `plan.md` §10's build order ends at step 7 | **Step 5b inserted** (Popover, the floating probe, §8) and **B1–B8** written past step 7 (§9.2). Workstream B keeps its position and carries **45 components**; five of its atomic recipes are hard prerequisites for B3/B4/B8 | **P7** (the DoD is per-batch), **P8** (docs follow the batches) |
| **9** | `plan.md` §5.2's dependency table lists in-repo edges only | **37 `@zag-js/*` machine packages on `components`**, `@zag-js/presence` on `system`, four Zag utility packages, and **`@pandacss/dev` as the graph's first required-of-the-consumer edge** (§11). Per-**batch** closure growth is the honest metric; per-component is the arithmetic error `prior-art.md` §10.2 rows 6/8 correct | **P7** (the bundle check at milestone 5), **P9** |
| **10** | `plan.md` §12 row 3 still reads *"with a **three-rung** fallback ladder (§1)"* | **Stale.** `a8b4995` rewrote §1.5 to **two rungs** — the prebuilt-stylesheet floor was removed by §4.4. **Flagged, not fixed**: `plan.md` is P3's document and editing it here would put the same correction in two places. **Recorded for P9's reconciliation pass** | **P9** |

---

## 14. What P6 could not act on

| Item | Why not | What it blocks |
|---|---|---|
| **Running any of it** | No package exists, by P-pass rule. Every count above is `ls` / `grep` / `perl` over the checkouts; nothing has been compiled, rendered, installed or axe'd | Nothing. §12.2's five assumptions carry the exposure |
| **`prior-art.md` §3.3 seam 3 — the popper `--z-index` seam** | It needs a running floating component and a browser. No spike built one and neither can P6 | **Step 5b.** This is the whole reason §8 exists: P6 could not price it, so it sequenced it early |
| **`prior-art.md` §10.5's bundle bytes** | Not reproducible from git; no machine closure exists until step 5, and no library closure until B8 (§11). `zag-solid-adapter.md` §9.2 already moved the re-measurement to milestone 5 | **P7**, which carries the check |
| **Panda's generated `sva`/`splitVariantProps` surface** | Panda is installed in no checkout (`plan.md` §13, `component-blueprint.md` §14). The matrix says which recipe each component reaches, not what the generated function looks like | Blueprint assumptions **P5-A** and **P5-B**, at steps 4 and 3 |
| **Whether Ark `5.37.2` matches the `5.38.1` checkout** where the matrix read Ark's *implementation* | Only `5.38.1` is checked out and no `@ark-ui/*` is installed. Every **machine mapping** was taken from Chakra's own imports and is version-proof; the `aria-controls` list (§6.3) and `useCollapsible` (§6.2) are Ark-implementation reads and are not | Assumption **5**, re-checked at step 5 and B2 |
| **`component-blueprint.md` §12.1's assumption 9** (the `data-*` vocabulary diff) | It needs Panda and a generated stylesheet. §4 records the one known mismatch — Tabs' `_active` — from `prior-art.md` §4.3's spot check, and nothing more | **Step 4**, unchanged |

**Everything in `prior-art.md` §10, `zag-solid-adapter.md` §10 and `component-blueprint.md` §13/§14
that reaches P6, P6 acted on:**

- `prior-art.md` §10.1 row **D** (§3 — no retained-primitive column), row **C** (§6 — presence is a
  build, and it has two sources); §10.2 row **8** (§11 — per-batch closure, not per-component), row
  **10** (§2.4 — the three machines that exist at 1.43.0 and are still unportable), row **12** (18 + 56
  throughout); §10.3 (§2.2, §2.4 — *whether* comes from Chakra, never from hope-ui or Ark's folder
  list); §10.4 (§1.1 — 118 re-measured as 115, with the counting convention named).
- `zag-solid-adapter.md` §10 row **4** (§2.4, §12.1 — the v2 exposure is this matrix, and the machine
  list it would move is enumerated), row **8** (§11 — the bundle re-measurement lands at step 5 and
  B8, and §9.2's framing is carried, not re-derived).
- `component-blueprint.md` §13 rows **1** (§6.3 — the `aria-controls` set enumerated per component),
  **4** (§3 — the column stays deleted), **5** (§5.1 — `Portal` ships, cut to the SSR guard and the
  mount target, with `disabled` dropped rather than shipped inert),
  **6** (§11 — the graph additions), **7** (§10 — `RootProvider`/`PropsProvider` scheduled),
  **8** (§8, §9 — the floor grows by category, so the floating probe moves to 5b), **10** (§4 — no row
  strips `id`); §14's **repeated-part shape** (§7) and **floating seam** (§8), the two items P5
  explicitly assigned here.

**Rows P6 leaves alone, so silence is not read as oversight.** `prior-art.md` §10.1 rows A/B/E/F and
§10.2 rows 3/4/5/6/7/9/11 are P4/P5/P7's and are already settled in `zag-solid-adapter.md` §10 and
`component-blueprint.md` §13; `zag-solid-adapter.md` §10 rows 1/2/3/5/6/7/9/10/11 are P5's or P7's;
`component-blueprint.md` §13 rows 2/3/9 are P7's and P9's. The one row P6 records without acting on is
**`plan.md` §12 row 3's stale three-rung ladder** (§13 row 10) — P3's document, P9's reconciliation.
