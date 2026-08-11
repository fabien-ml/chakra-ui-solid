# Roadmap

v0.1.0 is the whole port: 111 components. 22 done.

## Done, per component

1. Source + export from the package index and a subpath.
2. `pnpm typecheck` passes.
3. One browser test asserting a **computed style** — never a class name. A Panda class whose CSS
   was never generated renders nothing and raises no error, so a class-name assertion passes on a
   completely unstyled element.
4. A `staticCss` entry or a CSS custom property (`style={{ "--w": w }}` with `w="var(--w)"`) for any
   value Panda cannot extract statically.

A one-part component is usually `name.tsx`, `index.ts` and `__tests__/name.browser.test.tsx`. A
multi-part one lays its parts out however reads best — nothing counts the files.

## Reading a row

`name — machine · recipe · anatomy parts/recipe slots · presence · CIJ`, each omitted when it does
not apply. **Recipe**: `S:key` slot recipe, `A:key` atomic, `✗key` a key with no recipe anywhere —
that component is unstyled by key in Chakra too, and a faithful port reproduces that.
**Presence**: `Z` a `@zag-js/presence` instance, `M` machine-owned visibility, `D` `Z` plus Chakra
defaulting `lazyMount`/`unmountOnExit` to true. **CIJ** marks where Chakra feeds a render-time value
into the style system, so no `staticCss` declaration can pre-generate the class: `●` unbounded, use
a CSS custom property; `○` bounded to a finite set, one `staticCss` declaration closes it. The ten
marked rows are the only ones — everything else resolves statically.

**⚠ carries a recorded trap — read [decisions.md](decisions.md) before starting that row.** The
indented line under a row is its per-component note: duplicate slots, part-count mismatches, and
what the anatomy adds over Zag's. A bare `§n` in a note points into
[parity-matrix.md](parity-matrix.md), which holds the measurements the notes were drawn from; a note
naming a file (`blueprint §1.2`) points there instead.

## Machine components (45)

- [ ] accordion — S:accordion · 5/6 · M
      `+itemBody`. **Settles the fifth part shape** (§7). `aria-controls` gated on `collapsible.isUnmounted`
- [ ] action-bar — popover · S:actionBar · 10/5 · D
      Uses 3 of popover's 10 parts + Chakra-only `separator`, `selectionTrigger`. No trigger part → no `aria-controls` line
- [ ] avatar — S:avatar · 3/3
      Anatomy re-exported from Ark unchanged
- [ ] carousel — S:carousel · 10/11
      **Duplicate slot `progressText`** (§1.3b)
- [ ] checkbox — S:checkbox · 4/5
      Composes the `checkmark` **atomic** recipe from Workstream B
- [ ] checkbox-card — checkbox · S:checkboxCard · 4/7
      Second public component on one machine
- [ ] clipboard — ✗clipboard · 6/—
      Recipe key resolves to nothing **in Chakra too** (§2.5). Coverage-check allow-list
- [ ] code-block — clipboard · S:codeBlock · 6/14
      14 slots, one machine part used. Shiki adapters are consumer-supplied
- [ ] collapsible — S:collapsible · 4/4 · M
      The machine-owned presence family (§6.2)
- [ ] color-picker — S:colorPicker · 24/26 · Z
      Largest anatomy in the library. `+channelText`. Floating
- [ ] combobox — S:combobox · 14/16 · Z ⚠
      **Duplicate slot `empty`**. `+indicatorGroup`, `+empty`. Floating. Restrictive-content-model hazard (§10.4 of the blueprint)
- [ ] date-picker — S:datePicker · 24/26 · Z
      **Duplicate slot `view`**. `+indicatorGroup`. Floating
- [ ] dialog — S:dialog · 7/10 · D ⚠
      **Duplicate slot `backdrop`**. `+header/body/footer`. The worked blueprint
- [ ] drawer — dialog · S:drawer · 7/10 · D ⚠
      **Duplicate slot `backdrop`**. Runs on `dialog`, not `@zag-js/drawer` (§2.2)
- [ ] editable — S:editable · 9/10 ⚠
      **`connect()` emits a top-level `size: 1`** when `autoResize` — collides with the `size` style prop; `styleSource` (blueprint §4.1 addition 4) is what closes it. `+textarea`
- [ ] file-upload — S:fileUpload · 12/15
      `+itemContent`, `+dropzoneContent`, `+fileText`. Repeated part (items)
- [ ] floating-panel — S:floatingPanel · 11/11 · D ⚠
      Own positioning, **not** popper
- [ ] hover-card — S:hoverCard · 5/5 · Z
      Floating. No `root` part in the anatomy
- [ ] listbox — S:listbox · 10/11 ⚠
      `@zag-js/collection`. `aria-labelledby` on content is **not** overridden — Chakra ships the dangling IDREF (blueprint §1.2)
- [ ] marquee — S:marquee · 5/5
- [ ] menu — S:menu · 14/15 · D
      `+itemCommand`. Floating. Presence-gated `aria-controls`
- [ ] number-input — S:numberInput · 8/8
- [ ] pagination — ✗pagination · 7/—
      Key resolves to nothing in Chakra too (§2.5)
- [ ] pin-input — S:pinInput · 4/4
      Repeated part (inputs, by index)
- [ ] popover — S:popover · 10/13 · Z ⚠
      `+header/body/footer`. **The floating probe** (§8). Presence-gated `aria-controls`
- [ ] presence — Z
      Headless machine, no anatomy. `chakra(ArkPresence)`; our `createPresence` already lives in `core` (`plan.md` §6)
- [ ] progress — S:progress · 9/9
      Machine-emitted inline `style` for the fill — legal, not a CIJ mark
- [ ] progress-circle — progress · S:progressCircle · 9/9
      Second public component on one machine
- [ ] qr-code — S:qrCode · 5/5
- [ ] radio-group — S:radioGroup · 6/8
      `+itemAddon`, `+itemIndicator`. Composes the `radiomark` atomic recipe. Repeated part
- [ ] radio-card — radio-group · S:radioCard · 6/10
      Extends Chakra's *extended* radioGroup anatomy: `+itemContent`, `+itemDescription`
- [ ] rating-group — S:ratingGroup · 4/5
      `+itemIndicator`. Repeated part
- [ ] scroll-area — S:scrollArea · 6/6
      Browser tests keep real scrollbars (`brief-plan` §2.8)
- [ ] segment-group — radio-group · S:segmentGroup · 6/6
      Third public component on the radio-group machine
- [ ] select — S:select · 15/16 · Z ⚠
      `+indicatorGroup`. Floating. Hidden native `<select>` → restrictive-content-model hazard
- [ ] slider — S:slider · 10/12
      `+markerIndicator`, `+markerLabel`. Thumb offsets are machine inline `style` — legal
- [ ] splitter — S:splitter · 4/5 ⚠
      **Duplicate slot `resizeTriggerIndicator`**. `+resizeTriggerSeparator`. The machine writes a gesture cursor rule — **audited and cleared** at P4 (`zag-solid-adapter.md` §5.3)
- [ ] steps — S:steps · 10/12
      Chakra's anatomy is its **own** `createAnatomy("steps")` with 12 parts, not Zag's 10 (`+title`, `+description`)
- [ ] switch — S:swittch · 4/5
      **The generated recipe function will be named `swittch`** (§1.3c). **And its `cursor: "switch"` references a token the preset registers as `swittch`, so the pointer cursor is silently lost** — one `theme.extend.tokens.cursor.switch` key in our preset restores it. `+indicator`
- [ ] tabs — S:tabs · 5/6 · Z
      Chakra's own `createAnatomy("tabs")`, `+contentGroup`. **`_active` in the recipe is Panda's `:active` pseudo-class, not a Zag `data-active`** (`prior-art.md` §4.3)
- [ ] tags-input — S:tagsInput · 10/10
      Repeated part (tags)
- [ ] toast — S:toast · 6/6
      Imperative `createToaster` store living outside the component tree — the only such surface
- [ ] toggle — ✗toggle · 2/—
      Key resolves to nothing in Chakra too (§2.5)
- [ ] tooltip — S:tooltip · 5/5 · D
      Floating
- [ ] tree-view — S:treeView · 15/15
      Repeated **and recursive** part — branches nest. The one place §7's shape gets stressed

## Multi-part, no machine (15)

- [ ] field — S:field · —/8
      **The largest machine-less behavior in the library.** Ark implements it in 226 React lines; under `CLAUDE.md`, *Reference use* we read the ARIA contract, never the expression. **Duplicate slot `requiredIndicator`**
- [ ] fieldset — S:fieldset · —/5
      Ark: 115 React lines. `+content`
- [ ] native-select — S:nativeSelect · —/3
      Chakra's anatomy is `createAnatomy("select")` — **the same `data-scope` as `select`**. A hand-written selector that assumes scope uniqueness will match both
- [ ] alert — S:alert · —/5
- [ ] blockquote — S:blockquote · —/4
- [ ] breadcrumb — S:breadcrumb · —/7
      Repeated part (items)
- [ ] card — S:card · —/6
- [ ] data-list — S:dataList · —/4
      Repeated part (items)
- [ ] empty-state — S:emptyState · —/5
- [ ] list — S:list · —/3
      Repeated part (items)
- [ ] stat — S:stat · —/6
- [ ] status — S:status · —/2
- [ ] table — S:table · —/8
      Repeated parts (rows, cells)
- [ ] tag — S:tag · —/5
- [ ] timeline — S:timeline · —/8
      Repeated part (items)

## Atomic-recipe components (21)

- [ ] badge — A:badge · —/1
- [ ] button — A:button · —/1
      `useRecipe({ key })` directly, not a recipe context. Also ships `ButtonGroup`, `IconButton`, `CloseButton`
- [ ] checkmark — A:checkmark · —/1
      Composed **into** `checkbox`/`checkboxCard` slot recipes — must land before B4
- [ ] code — A:code · —/1
- [ ] color-swatch — A:colorSwatch · —/1
      Composed into `colorPicker` — must land before B8
- [x] container — A:container · —/1
      **The one recipe the preset is missing** (§1.3a). One preset delta, expression-tier, `@license` + `NOTICE` rows
- [ ] download-trigger — ✗downloadTrigger · —/1
      Key resolves to nothing in Chakra too
- [ ] heading — A:heading · —/1
- [ ] icon — A:icon · —/1
      Plus `createIcon`; the internal chevron/check/close set (`brief-plan` §2.10)
- [ ] input — A:input · —/1
      Styles Ark's `Field.Input`
- [ ] input-addon — A:inputAddon · —/1
      `useRecipe({ key })` directly
- [ ] kbd — A:kbd · —/1
- [ ] link — A:link · —/1
- [ ] mark — A:mark · —/1
- [ ] radiomark — A:radiomark · —/1
      Composed into `radioGroup`/`radioCard` — must land before B4
- [ ] separator — A:separator · —/1
- [ ] skeleton — A:skeleton · —/1
      Plus `SkeletonCircle`, `SkeletonText`
- [ ] skip-nav — A:skipNavLink · —/1
      `SkipNavLink` + `SkipNavContent`
- [ ] spinner — A:spinner · —/1
- [ ] text — ✗text · —/1
      Key resolves to nothing in Chakra too; styled by `textStyles` + style props
- [ ] textarea — A:textarea · —/1
      Styles Ark's `Field.Textarea`

## Styled primitives and layout (25)

- [x] absolute-center
- [x] aspect-ratio — ●
      `paddingBottom` from a numeric `ratio` (§3.1)
- [x] bleed — ○
      Already routes through `--bleed-*` custom properties
- [x] box
      The styling-seam gate. hope-ui's 34-line port is the start
- [x] center
- [x] circle — ○
      `Square` with a radius
- [x] em
- [x] flex — ○
      hope-ui's 85-line port; reuse `flex.raw` (`prior-art.md` §2.4)
- [x] float — ●
      Placement is finite; `offset` is not (§3.1)
- [x] grid — ●
      Ships `Grid` **and** `GridItem`; `grid-item.tsx` computes `span ${n}/span ${n}` (§3.1)
- [x] group
      Already writes `--group-count`/`--group-index` inline — route 3, legal
- [ ] image
- [ ] input-element
      Part of the input-group family
- [ ] input-group — ●
      `calc(var(--input-height) - ${offset})` (§3.1)
- [ ] loader
      Composition of `Spinner` + `AbsoluteCenter`
- [x] quote
- [x] simple-grid — ●
      `repeat(${n}, …)` **and** the only `sys.tokens` call in the library (§3.1)
- [x] spacer
- [x] span
- [x] square — ○
- [x] stack — ○
      Plus `HStack`, `VStack`, `StackSeparator`
- [x] sticky
- [x] strong
- [x] visually-hidden
- [x] wrap
      Plus `WrapItem`

## Utilities, providers and re-exports (9)

- [ ] portal
      Not an exclusion, but only `container` + `children` + the SSR guard + the environment-aware mount. **`disabled` is not shipped** — §5.1
- [ ] client-only
      Not an exclusion — §5.2
- [ ] focus-trap
      `chakra(ArkFocusTrap)` over `@zag-js/focus-trap` — a Zag **utility**, not a machine. Nothing Solid-specific
- [ ] format
      `FormatNumber` / `FormatByte` over `Intl`. No machine, no recipe
- [ ] highlight
      Over `@zag-js/highlight-word`. Plus `useHighlight`

## Not ported (4)

- color-mode — relocated
      **A divergence, flagged rather than absorbed** (`decisions-ledger.md` **D-134**, reversing D-38). Chakra ships colour mode as a CLI snippet over `next-themes`, which has no SolidJS equivalent — porting that faithfully ships a wrapper around nothing. **No provider**: a pre-paint script, a module-level signal, `.light`/`.dark` plus `color-scheme` on the root. Documented on `/docs/styling/dark-mode`, not in the component tier
- environment — relocated
      The context lives in `@chakra-ui-solid/core` and is re-exported from `components/environment` so Chakra's import path resolves. Not a component
- locale — relocated
      Same. Plus `useFilter`, which is `createFilter` from `@zag-js/i18n-utils` — the same MIT package we already take `isRTL` from. No machine
- for / show — excluded
      Solid has `<For>` and `<Show>`; a re-export would be a wrapper around nothing
