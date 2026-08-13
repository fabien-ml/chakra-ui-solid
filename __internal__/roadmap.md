# Roadmap

v0.1.0 is the whole port: 111 components. 33 done.

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

### What a note is worth, and the propagation rule

**The checkbox is the note's provenance.** A note under `- [x]` was checked against
`__reference-impl__` when the row shipped and corrected in that commit, so it can be read as fact. A
note under `- [ ]` was written before any of that component's code was read: it is a **prediction**,
and four of the five component rows ported so far have found theirs wrong. `icon` said "the
chevron/check/close set", where upstream exports 19 glyphs and 24 files import 18 of them
(`ErrorIcon` alone unused). `checkmark`, `radiomark` and `color-swatch` each said "Composed into X"
about a relationship with four possible states, and hit a different one each time — because whether
the recipe *sources* compose and whether the *components* do are separate questions with separate
answers, and "composed" names neither. Correcting a note is routine work, not a finding: budget for
it rather than reporting it.

**The fifth failed the other way.** `collapsible` said *"the machine-owned presence family (§6.2)"*,
which was true and settled nothing. The ship still corrected three sections of
`component-blueprint.md`, two of `parity-matrix.md`, one of `docs-site.md`, and the `accordion` and
`presence` rows — none of which this note asked about. **A one-clause note is not a cheap correct
note; it is a prediction that declined to make one**, and it costs the same measurement to close.

**A measurement settles every note it touches, not only the row being ported.** This is the failure
the three composition rows exposed: shipping `radiomark` established how `radiomark` composes into
`radioGroup` and `radioCard` *in both directions*, that fact was written onto the `radiomark` row —
and the `radio-group` row went on claiming the old guess for two more ports, one row away from the
answer, because nothing said to look. When a row's measurement answers a question another row's note
asks, correct **both** in the same commit.

## Machine components (45)

- [ ] accordion — S:accordion · 5/6 · M
      `+itemBody`. **Settles the fifth part shape** (§7). The `aria-controls` gate is **Accordion's
      own line, not the machine's** — the `collapsible` row measured the trigger emitting the IDREF
      unconditionally, so nothing arrives gated. Ark reads `collapsible.isUnmounted`; ours reads the
      store's `unmounted`. Family M's render strategy already ships, so this row waits on nothing
      there — and its item content inherits the `skip` that leaves an initially-open one with no
      `data-state`
- [ ] action-bar — popover · S:actionBar · 10/5 · D
      Uses 3 of popover's 10 parts + Chakra-only `separator`, `selectionTrigger`. No trigger part → no `aria-controls` line
- [ ] avatar — S:avatar · 3/3
      Anatomy re-exported from Ark unchanged
- [ ] carousel — S:carousel · 10/11
      **Duplicate slot `progressText`** (§1.3b)
- [ ] checkbox — S:checkbox · 4/5
      Its indicator part renders `<Checkmark unstyled>` and passes it `styles.indicator` — the
      component, not the `checkmark` recipe, which is shipped
- [ ] checkbox-card — checkbox · S:checkboxCard · 4/7
      Second public component on one machine
- [ ] clipboard — ✗clipboard · 6/—
      Recipe key resolves to nothing **in Chakra too** (§2.5). Coverage-check allow-list
- [ ] code-block — clipboard · S:codeBlock · 6/14
      14 slots, one machine part used. Shiki adapters are consumer-supplied
- [x] collapsible — S:collapsible · 4/4 · M
      **Family M, confirmed** (§6.2), and the first machine component. No `@zag-js/presence`: the
      strategy's `present` is the machine's own `visible`, which stays true through the `closing`
      state, so `unmountOnExit` removes the node on `animationend` rather than when the close
      begins. `createRenderStrategy(present, options)` in `core` is the source-agnostic half §6.2
      assigned to step 5 — it shipped here, ahead of the presence family it was split for.
      **The trigger carries no `aria-controls` gate.** Collapsible's own trigger is
      `mergeProps(getTriggerProps(), props)` and nothing else, so the IDREF is emitted even while the
      content is unmounted. The gate lives one level up, in Accordion's item trigger, and belongs to
      that row.
      **`connect()` suppresses the content's `data-state` whenever the machine is settled open** —
      `skip = !context.get("initial") && open`, and `initial` is true only between a user-driven
      transition and its `animation.end`. So an initially-open content carries no `data-state` and
      never runs the enter keyframes, and the attribute disappears again once any enter animation
      finishes; root, trigger and indicator say `open` throughout. Zag's behaviour, not ours, and
      Accordion's item content inherits the same `skip`.
      **A consumer `id` seeds the machine rather than naming the root element** — the root's own
      attribute is `collapsible:{id}`, so `CollapsibleRootProps` is `Omit<HTMLChakraProps<"div">,
      "id">` and `ids` is the way to control the attributes themselves. `RootProvider` is the other
      way round: it starts no machine, so its `id` is the element's. That is the Root rule for every
      machine row, not this one's quirk (blueprint §3.4).
      **No defaults at all**, unusually: Chakra sets neither `lazyMount` nor `unmountOnExit` on
      Collapsible, so there is no `withDefaults` call and no forwarded-`undefined` hazard to guard.
      Zero recipe variants — `collapsibleVariantKeys` is `[]` — and only the `content` slot has a
      body, so the other three carry a class name and no rules and there is nothing to assert on
      them. `hidden` is not stripped: the slot sets `overflow` and no `display`, so the UA `[hidden]`
      rule stands on its own, and a `collapsedHeight`/`collapsedWidth` removes `hidden` entirely and
      keeps the closed box.
      `<Collapsible.Context>`'s render prop is called once in the part's **body**, so a callback
      returning a plain string reads untracked and freezes at mount. It must return JSX — the same
      holds for the 42 other components with a `Context` part (blueprint §3.2)
- [ ] color-picker — S:colorPicker · 24/26 · Z
      Largest anatomy in the library. `+channelText`. Floating
- [ ] combobox — S:combobox · 14/16 · Z ⚠
      **Duplicate slot `empty`**. `+indicatorGroup`, `+empty`. Floating. Restrictive-content-model hazard (§10.4 of the blueprint)
- [ ] date-picker — S:datePicker · 24/26 · Z
      **Duplicate slot `view`**. `+indicatorGroup`. Floating.
      The preset's `prevTrigger`/`nextTrigger` write `boxShadow: "0 0 0 2px
      var(--colors-color-palette-focus-ring)"` as a **literal**, not a token reference, so our
      `chakra` cssVar prefix never reaches it and the shadow resolves to nothing. The only two such
      strings in the whole preset. The `outline-color` beside it still rings the focused trigger, so
      this is a second ring lost, not the indicator
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
      Headless machine, no anatomy. `chakra(ArkPresence)`. **`core` holds no `createPresence`** —
      blueprint §7.1 does not carry hope-ui's, and what the `collapsible` ship actually put there is
      `createRenderStrategy`, the `lazyMount`/`unmountOnExit` half over a plain `present` accessor
- [ ] progress — S:progress · 9/9
      Machine-emitted inline `style` for the fill — legal, not a CIJ mark
- [ ] progress-circle — progress · S:progressCircle · 9/9
      Second public component on one machine
- [ ] qr-code — S:qrCode · 5/5
- [ ] radio-group — S:radioGroup · 6/8
      `+itemAddon`, `+itemIndicator`. Repeated part. **Both compose, and this line said only
      "Composes the `radiomark` atomic recipe" until the `radiomark` row measured it** (§*Reading a
      row*, the propagation rule): the preset's `radioGroup` slot recipe inlines
      `radiomarkRecipe.base` into `itemControl` plus every size and variant, so those styles are
      already in our generated CSS; and `RadioGroupItemControl` *also* renders `<Radiomark unstyled>`
      with `css={[styles.itemControl, props.css]}`. The load-bearing prop is `unstyled`
- [ ] radio-card — radio-group · S:radioCard · 6/10
      Extends Chakra's *extended* radioGroup anatomy: `+itemContent`, `+itemDescription`.
      Composes `radiomark` the same two ways as `radio-group`, on `itemIndicator` rather than
      `itemControl`, and adds `aria-hidden` at the call site — measured on the `radiomark` row,
      where this line said nothing at all
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
      Settled by the `badge` port: `tagSlotRecipe` reuses `badgeRecipe.variants.variant` for its own
      `variant`, and nothing else. Already inlined in the installed preset — this row waits on nothing
- [ ] timeline — S:timeline · —/8
      Repeated part (items)

## Atomic-recipe components (21)

- [x] badge — A:badge · —/1
      **The recipes compose; the components do not** — ColorSwatch's state, reached from the other
      direction. `theme/recipes/code.ts` destructures `badgeRecipe`'s whole `variants` and
      `defaultVariants`, and `theme/recipes/tag.ts` takes its `variant` map; the installed
      `@chakra-ui/panda-preset` ships both inlined, so **`code` and `tag` owe this row nothing** and
      neither waits on it. Nothing under `components/` imports `Badge` at all — 42 example files do,
      which is what made four shipped docs pages stand in for it.
      The plainest `createRecipeContext` consumer in the package: `withContext("span")`, two variant
      keys, no body of its own. Five `variant` values including `plain`, four `size` steps. It names
      no colour — every variant resolves against `colorPalette`, which is why the recipe is
      colourless and the examples pass a palette instead.
      **`solid` on `green` or `teal` is white on a 600 step — 3.30:1 and 3.74:1 against AA's 4.5,
      and Lc 65 / Lc 70 against APCA.** Measured here, and it is upstream's palette rather than
      ours: `semantic-tokens/colors.ts` sets every `*.contrast` to `white` and every `*.solid` to
      the 600 step. APCA is the harsher measure at badge size — 12px/500 — where `blue` (Lc 80) and
      `purple` (Lc 81) miss the body-text floor too, so **no palette in the set passes** and a swap
      would satisfy axe without satisfying a reader. The port rule leaves nothing to fix, so the
      examples stay 1:1 and **the docs examples suite no longer runs axe** — components are still
      audited in `packages/`, where a defect would be ours
- [x] button — A:button · —/1
      `createRecipeContext({ key })`, read as `usePropsContext` + `createRecipeClass` because the children are wrapped when `loading`. `ButtonGroup` is the one that uses `useRecipe({ key })` directly. Also ships `IconButton`, `CloseButton`
- [x] checkmark — A:checkmark · —/1
      **The generated recipe classes do not compose — the components do.** A Checkbox control never
      carries `.checkmark`; the shared styles are there because the preset inlined
      `checkmarkRecipe.base` into `checkbox.control` and `checkboxCard.indicator` at authoring time.
      (This line read "the recipes do not compose" until the `radiomark` row, which is too strong —
      the recipe *sources* plainly do.)
      `CheckboxIndicator` and `CheckboxCardIndicator` are its only two consumers upstream, and each
      renders `<Checkmark unstyled>` and hands it its own slot's styles through `css`. So the load-
      bearing prop for B4 is `unstyled`, not the recipe key. Still must land before B4. Its glyphs
      are its own, not `components/icons.tsx`'s: Chakra draws them as direct children of the styled
      element, where a glyph from that module is a nested `svg`
- [ ] code — A:code · —/1
      Settled by the `badge` port: `codeRecipe` destructures `badgeRecipe`'s **whole** `variants` and
      `defaultVariants`, so the two share five variants and four sizes and differ only in a base
      (`fontFamily: mono`). Already inlined in the installed preset — this row waits on nothing
- [x] color-swatch — A:colorSwatch · —/1
      **The recipes compose; the components do not** — the inverse of the two rows above, and this
      line read "Composed into `colorPicker` — must land before B8" until it was measured.
      `theme/recipes/color-picker.ts:122` spreads `...colorSwatchRecipe.base` into the `swatch` slot,
      and the installed `@chakra-ui/panda-preset` already ships it inlined. But `color-picker.tsx`
      never renders a `ColorSwatch`: `ColorPickerSwatch` and `ColorPickerValueSwatch` are Ark parts
      through `withContext(…, "swatch")`. So `unstyled` is not load-bearing here at all, and **B8
      waits on nothing from this row.** Nothing in scope consumes the component — upstream's only
      consumers are compositions (`combobox-color-picker`, referenced by no page; a charts example;
      a rich-text-editor snippet, not a row), and the `empty-state` hits a grep turns up are
      `react-icons`' `HiColorSwatch`. Its own docs page is the only thing that renders it.
      Three exports, and the first props context of the three composed primitives. Nine `size`
      values and a `shape` variant (`square`/`circle`/`rounded`) — not the `variant`/`filled` pair.
      `value` is **required** and reaches the element as an inline `--color`: it is an arbitrary
      runtime colour, so `css` would generate nothing, and an unset `--color` invalidates the whole
      `background` shorthand at computed-value time, taking the checkerboard with it. So the
      assertion that means anything here is `background-image`, never `backgroundColor`, which reads
      `rgba(0, 0, 0, 0)` on a working swatch.
      `ColorSwatchMix`'s over-4 guard is a **body-level** check, where Chakra's is a render check
      that re-runs: thrown from the accessor `<For>` reads, Solid 2.0 halts the reactive graph for
      the whole page (`[REACTIVITY_HALTED]`) and every later render anywhere no-ops. Measured
- [x] container — A:container · —/1
      **The one recipe the preset is missing** (§1.3a). One preset delta, expression-tier, `@license` + `NOTICE` rows
- [ ] download-trigger — ✗downloadTrigger · —/1
      Key resolves to nothing in Chakra too
- [x] heading — A:heading · —/1
- [x] icon — A:icon · —/1
      Plus `createIcon`, and the internal glyph module at `components/icons.tsx` — **18 glyphs, not
      the "chevron/check/close set" this note used to claim**: upstream exports 19 and 24 component
      files import 18 of them, `ErrorIcon` alone unused. Read `components/icons.tsx` upstream, not
      this line.
      **Upstream's `Icon` has no body of its own — it is `asChild` by default** (`asChild:
      !props.as`, `icon.tsx:28`), so `<Icon><HiHeart/></Icon>` renders the *glyph's* svg carrying the
      recipe and `<Icon/>` alone throws `No valid child found` at `factory.tsx:241`. That default is
      `cloneElement` and **does not port**. The two spellings that do are **`as`** — upstream's own
      `icon-with-as-prop`, which sets `asChild: false` and puts the recipe on `props.as` — and
      `render`. `createIcon` is the third: it passes `asChild={false}` explicitly, which is why
      children are the glyph's *contents* there and not an element. Ours accepted the child spelling
      and nested an svg inside its own until 2026-08-13, sizing an empty wrapper. It cannot be
      repaired by resolving the child: on the server a resolved child is already an HTML **string**,
      so there is no element left to put the class on, and a client-only collapse would have the two
      sides render different trees
- [ ] input — A:input · —/1
      Styles Ark's `Field.Input`
- [ ] input-addon — A:inputAddon · —/1
      `useRecipe({ key })` directly
- [ ] kbd — A:kbd · —/1
- [ ] link — A:link · —/1
- [ ] mark — A:mark · —/1
- [x] radiomark — A:radiomark · —/1
      **Both compose, differently.** The preset's `radioGroup`/`radioCard` slot recipes inline
      `radiomarkRecipe.base` and its size/variant objects, so those styles are already in our
      generated CSS and this row owes them nothing. What B4 consumes is the **component**:
      `RadioGroupItemControl` and `RadioCardItemIndicator` each render `<Radiomark unstyled>` and
      hand it their own slot's styles through `css`, and `radio-card` adds `aria-hidden` at the call
      site. `class="dot"` is the seam that survives `unstyled` — the slot recipes carry the `& .dot`
      rule the dropped `.radiomark` class would have supplied. Four `variant` values, not five: no
      `plain`
- [ ] separator — A:separator · —/1
- [ ] skeleton — A:skeleton · —/1
      Plus `SkeletonCircle`, `SkeletonText`
- [ ] skip-nav — A:skipNavLink · —/1
      `SkipNavLink` + `SkipNavContent`
- [x] spinner — A:spinner · —/1
- [x] text — ✗text · —/1
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
      The styling-seam gate. `chakra("div")` and nothing else, as upstream is — the hope-ui port it
      started as was the seam before the factory existed
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
- [x] loader
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
