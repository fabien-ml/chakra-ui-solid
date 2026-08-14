# Roadmap

v0.1.0 is the whole port: 110 components. 60 done. The five under *Not ported* are outside that
count, and four of them left the utilities section after it was written.

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
      Uses 3 of popover's 10 parts + Chakra-only `separator`, `selectionTrigger`. No trigger part →
      no `aria-controls` line. **The machine, its adapter wiring and all 13 slot shapes ship at
      5b**, so this row inherits them and adds only its own recipe. **The popper seam does not
      reach it**: `ActionBarPositioner` is `withContext("div", "positioner")` — a plain styled div
      carrying none of the machine's positioner props — so no floating element exists for popper to
      write into, and the recipe's `placement` variant does the positioning
- [ ] avatar — S:avatar · 3/3
      Anatomy re-exported from Ark unchanged.
      **Three shipped pages owe it a section each**, all dropped for this row and all measured at
      Phase 4: `blockquote.mdx`'s *With Avatar*, `card.mdx`'s *With Avatar*, and `tag.mdx`'s
      *Avatar* — the last of which the `tag` recipe really does style, through
      `.tag__startElement:has([data-scope=avatar])`, so a substitute glyph would not exercise it.
      `card-basic` and `card-with-variants` carry a `Circle` in the avatar's place instead
      (`float-with-avatar`'s precedent), because there the avatar is decoration rather than the
      subject
- [ ] carousel — S:carousel · 10/11
      **Duplicate slot `progressText`** (§1.3b)
- [ ] checkbox — S:checkbox · 4/5
      Its indicator part renders `<Checkmark unstyled>` and passes it `styles.indicator` — the
      component, not the `checkmark` recipe, which is shipped
- [ ] checkbox-card — checkbox · S:checkboxCard · 4/7
      Second public component on one machine
- [ ] clipboard — ✗clipboard · 6/—
      Recipe key resolves to nothing **in Chakra too** (§2.5). **There is no coverage check to
      allow-list into** — the four that exist are `no-runtime-css`, `attribution`,
      `declaration-support` and `ssr-coverage`, and none enumerates recipe keys. `text` shipped
      unstyled-by-key with nothing to register and `download-trigger` measured it; this row needs
      nothing but the component
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
      **`useCollapsibleStyles` was missing and now ships**, with `useDialogStyles` and
      `usePopoverStyles` — see the `dialog` row for the shape all three take.
- [ ] color-picker — S:colorPicker · 24/26 · Z
      Largest anatomy in the library. `+channelText`. Floating — **the seam is free**, measured at
      `popover` (1500/1501): object-form `style` only on the positioner, content stays its
      `firstElementChild`, and the arrow is captured once per floating-element identity
- [ ] combobox — S:combobox · 14/16 · Z ⚠
      **Duplicate slot `empty`**. `+indicatorGroup`, `+empty`. Restrictive-content-model hazard
      (§10.4 of the blueprint). Floating — **the seam is free**, measured at `popover` (1500/1501):
      object-form `style` only on the positioner, content stays its `firstElementChild`, and the
      arrow is captured once per floating-element identity
- [ ] date-picker — S:datePicker · 24/26 · Z
      Its duplicate `view` slot is source-only, for the reason measured on the `dialog` row — it is
      Panda's generator, not the recipe. `+indicatorGroup`. Floating — **the seam is free**,
      measured at `popover` (1500/1501): object-form `style` only on the positioner, content stays
      its `firstElementChild`, and the arrow is captured once per floating-element identity.
      The preset's `prevTrigger`/`nextTrigger` write `boxShadow: "0 0 0 2px
      var(--colors-color-palette-focus-ring)"` as a **literal**, not a token reference, and it
      resolves to nothing — the only two such strings in the whole preset. **The cause is upstream's
      literal, not our prefix**, and this line claimed the opposite until it was checked: React's own
      `cssVarsPrefix` defaults to `"chakra"` too (`styled-system/system.ts:42`,
      `theme/index.ts:57`), so chakra-ui.com emits `--chakra-colors-color-palette-focus-ring` and the
      unprefixed `var()` dies there the same way. That is the port rule's **second** case — both
      wrong the same way, ship it — not the first, so **measure chakra-ui.com's date picker in a
      browser before touching this**, and expect to record it as expected rather than fix it.
      `switch`'s cursor is the row that looks like this one and is not. The `outline-color` beside it
      still rings the focused trigger, so this is a second ring lost, not the indicator
- [x] dialog — S:dialog · 7/10 · D ⚠
      `+header/body/footer`. The worked blueprint. **The duplicate `backdrop` slot is
      source-only**: `dialogSlotNames` lists eleven entries for ten slots, both `backdrop` rows
      build the same class into the same key, and the `Object.fromEntries` that assembles the map
      collapses them — nothing de-duplicates anything and the element carries the class once.
      **`focus-trap` is not a dependency of this row**: the machine runs `@zag-js/focus-trap` itself
      in an effect gated on `trapFocus`. The `aria-controls` gate is **presence-gated, not
      open-gated** — while the content is mounted-but-closed the IDREF still resolves, so it stays.
      **The first page to need `defineChakraConfig({ responsive })`**, and the first proof that a
      responsive *recipe variant* is a CIJ case the marks do not cover: `size={{ mdDown: "full", md:
      "lg" }}` makes the generated recipe answer `mdDown:dialog__content--size_full
      md:dialog__content--size_lg`, and the default `staticCss: ["*"]` run generates neither — the
      dialog then renders with no size rule at *any* width and nothing errors. The site's own
      `panda.config.ts` carries `responsive: { dialog: ["size"] }`. It is a fact about the opt-in
      rather than about this recipe, so it lands the same way on the three other rows whose upstream
      pages carry a breakpoint-conditional variant — `button` (`size`), `drawer` (`placement`),
      `separator` (`orientation`) — and each of those rows now carries the clause. **`pagination` is
      not the same case**, and this line claimed it was: its variants are conditional on `_selected`
      rather than on a breakpoint, which is the `conditional` knob rather than this one.
      **And the opt-in was inert when this row shipped.** Panda's `StaticCss.process()` resolves
      `staticCss.recipes[name]` from the recipe *body* whenever the body declares one, and
      `preset.ts` declares `staticCss: ["*"]` on all 75 — so a config-level rule was overwritten
      before it was read, for every recipe we ship. What generated the two classes here was ordinary
      source extraction of `dialog-with-responsive-size.tsx`: deleting the opt-in leaves both in the
      sheet. The rules now go into the recipe body as `["*", …]`, measured on `button`, which had no
      extraction to hide behind and went from zero `md:button--size_lg` rules to two
      **`useDialogStyles` was missing, and so were `usePopoverStyles` / `useCollapsibleStyles`.**
      Upstream gets one free — `createSlotRecipeContext({ key: "dialog" })` returns `useStyles` and
      `dialog.tsx:19,23` re-exports it — where a machine Root here resolves the class map with
      `createSlotClasses` and publishes it on the component context as `slots`, so nothing was
      exported under that name. The hook is now the accessor off that context
      (`useDialogContext().slots`), which is the same `Accessor<Record<Slot, string>>` the 13
      machine-less rows' `use*Styles` already hand back. Upstream's yields `SystemStyleObject`s and
      ours yields class strings, which is the seam's standing difference, not this row's.
- [ ] drawer — dialog · S:drawer · 7/10 · D ⚠
      Runs on `dialog`, not `@zag-js/drawer` (§2.2). Its duplicate `backdrop` slot is source-only,
      for the reason measured on the `dialog` row — it is Panda's generator, not the recipe.
      **Its page needs `responsive: { drawer: ["placement"] }`**, on the `dialog` row's measurement:
      `drawer-with-conditional-variants` writes `placement={{ mdDown: "bottom", md: "end" }}`, and
      without the line the drawer renders with no placement rule at any width and nothing errors
- [ ] editable — S:editable · 9/10 ⚠
      **`connect()` emits a top-level `size: 1`** when `autoResize` — collides with the `size` style
      prop. **`styleSource` is not what closes it, because `styleSource` does not exist**: the
      `dialog` ship measured `renderStyled`'s seven options as `as`, `props`, `render`, `ref`,
      `recipeClass`, `baseStyles` and `forwardProp`, and blueprint §4.1 addition 4 was never built
      that way (§11's preamble). `forwardProp` is the answer on paper and **nothing has exercised
      it** — no key `dialog.connect()` or `popover.connect()` emits is a style prop, so this row is
      the first live case and owes the measurement, not the mechanism. `+textarea`
- [ ] file-upload — S:fileUpload · 12/15
      `+itemContent`, `+dropzoneContent`, `+fileText`. Repeated part (items)
- [ ] floating-panel — S:floatingPanel · 11/11 · D ⚠
      Own positioning, **not** popper
- [ ] hover-card — S:hoverCard · 5/5 · Z
      No `root` part in the anatomy. Floating — **the seam is free**, measured at `popover`
      (1500/1501): object-form `style` only on the positioner, content stays its
      `firstElementChild`, and the arrow is captured once per floating-element identity
- [ ] listbox — S:listbox · 10/11 ⚠
      `@zag-js/collection`. `aria-labelledby` on content is **not** overridden — Chakra ships the dangling IDREF (blueprint §1.2)
- [ ] marquee — S:marquee · 5/5
- [ ] menu — S:menu · 14/15 · D
      `+itemCommand`. Presence-gated `aria-controls`. Floating — **the seam is free**, measured at
      `popover` (1500/1501): object-form `style` only on the positioner, content stays its
      `firstElementChild`, and the arrow is captured once per floating-element identity
- [ ] number-input — S:numberInput · 8/8
- [ ] pagination — ✗pagination · 7/—
      Key resolves to nothing in Chakra too (§2.5). **The `staticCss` declaration this page needs is
      on the `button` recipe, not its own** — every one of its eight upstream examples writes
      `<IconButton variant={{ base: "ghost", _selected: "outline" }}>`, which is the `dialog` row's
      hazard conditioned on a *state* rather than a breakpoint. `responsive` does not reach it —
      Panda keeps breakpoints and conditions as two keys on a staticCss rule — so the sibling knob
      **`conditional` shipped for this row**: `conditional: { button: { variant: ["selected"] } }`,
      one declaration that covers this page, `toggle`, `table-with-pagination` and `rating-emoji`.
      Its ship also found that neither knob had ever worked (see the `dialog` row)
- [ ] pin-input — S:pinInput · 4/4
      Repeated part (inputs, by index)
- [x] popover — S:popover · 10/13 · Z ⚠
      `+header/body/footer`, confirmed — 10 anatomy parts, 13 slots, exact correspondence.
      **The floating probe, and the seam is free.** `@zag-js/popper` writes eight custom properties
      (`--x`, `--y`, `--z-index`, `--transform-origin`, `--reference-width/height`,
      `--available-width/height`) imperatively into the positioner's `style` attribute inside a
      `raf`, and Solid's object-form binding diffs per property, so a reactive rewrite — consumer
      signal, machine re-emit, or `autoUpdate` — disturbs none of them. **A stacked pair reads 1500
      on the outer content and 1501 on the inner**, each positioner taking its own number by
      `var(--z-index)`. Two rules follow for the other floating rows, neither enforced by a type:
      **only the object form of `style` may reach a positioner** (a string binding wipes all eight,
      and popper's `zIndexComputed` flag plus its approximate-equality guards make an ordinary
      update decline to restore them — only `reposition()` does, because it builds a fresh closure);
      and **content must stay the positioner's `firstElementChild`**, since `--z-index` is copied
      once per floating-element identity off `getComputedStyle(firstElementChild).zIndex`. The arrow
      is captured the same once-only way, by `querySelector("[data-part=arrow]")`
      **`Z` stands — Chakra applies no Root defaults at all.** `PopoverRoot =
      withRootProvider(ArkPopover.Root)` with no options object, where Dialog's passes
      `lazyMount`/`unmountOnExit` true, so `createRenderStrategy`'s own `false`/`false` govern and a
      closed popover ships its **whole tree**, hidden. The Root calls no `withDefaults`, by decision
      rather than omission. **`PopoverIndicator` is defined upstream and exported from neither
      `index.ts` nor `namespace.ts`** — the port keeps the omission; 16 components ship. **`Anchor`
      is wired `withContext(…, undefined)`** — a bare positioning handle, and the one recipe slot no
      element claims. Title and Description are both `div` (Dialog's Title is an `h2`);
      Header/Body/Footer are `header`/`div`/`footer`
      Its presence-gated `aria-controls` is not its own: the `dialog` ship measured the gate as
      **Ark-wide, on five triggers** — dialog, drawer, floating-panel, menu, popover — and ported it
      once, so this row inherits the shape rather than deciding it. Because the defaults mount the
      content, the positive case is the *default* one here, and Ark's own Solid popover ships
      `aria-controls="false"` there (`presenceApi().unmounted && null`); the React shape is ported
      **The one defect this row found is ours, and it is fixed here**: Zag's `checkRenderedElements`
      mutates its bindable in place and notifies nothing, so a `defaultOpen` popover with a Title
      and no Description kept a dangling `aria-describedby` for its whole open window
      (`decisions.md` §*A Zag correction that notifies nothing*). **The axe finding was wrong in
      both directions** — `aria-hidden-focus` never fires, and `aria-valid-attr-value` fires in all
      three states (`definition-of-done.md` §5)
      **`usePopoverStyles` was missing and now ships** — see the `dialog` row for the shape
- [ ] presence — Z
      Headless machine, no anatomy. `chakra(ArkPresence)`. **`core` holds `createPresence`**, over
      the `@zag-js/presence` machine through this package's own adapter, beside the
      `createRenderStrategy` the `collapsible` ship put there — the `lazyMount`/`unmountOnExit` half
      over a plain `present` accessor. The two are separate on purpose: presence answers "is the node
      still animating out", the strategy answers "should it be in the DOM at all", and family M reads
      the second without the first. This row is now the public `<Presence>` component alone
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
      `+indicatorGroup`. Hidden native `<select>` → restrictive-content-model hazard. **No collision
      with `native-select`**, settled on that row's ship: its anatomy is `createAnatomy("select")`
      but Chakra applies none of the anatomy's attrs, so nothing it renders carries a `data-scope` at
      all. Floating —
      **the seam is free**, measured at `popover` (1500/1501): object-form `style` only on the
      positioner, content stays its `firstElementChild`, and the arrow is captured once per
      floating-element identity. **This is the row P6-A's re-confirmation lands on** (the first B5
      component), and the price is expected to be the same
- [ ] slider — S:slider · 10/12
      `+markerIndicator`, `+markerLabel`. Thumb offsets are machine inline `style` — legal
- [ ] splitter — S:splitter · 4/5 ⚠
      **Duplicate slot `resizeTriggerIndicator`**. `+resizeTriggerSeparator`. The machine writes a gesture cursor rule — **audited and cleared** at P4 (`zag-solid-adapter.md` §5.3)
- [ ] steps — S:steps · 10/12
      Chakra's anatomy is its **own** `createAnatomy("steps")` with 12 parts, not Zag's 10 (`+title`, `+description`)
- [ ] switch — S:swittch · 4/5
      **The generated recipe function will be named `swittch`** (§1.3c). **And its `cursor: "switch"`
      references a token the preset registers as `swittch`, so the pointer cursor is silently lost** —
      one `theme.extend.tokens.cursor.switch` key in our preset restores it, and **that restoration is
      the port working, not a divergence**: upstream's `theme/tokens/cursor.ts` registers the key as
      `switch`, so the React version renders the pointer and only the Panda preset's rename drops it.
      The port rule's **first** case, measured — where `date-picker`'s focus ring, which reads like
      the same defect, is the second. `+indicator`
- [ ] tabs — S:tabs · 5/6 · Z
      Chakra's own `createAnatomy("tabs")`, `+contentGroup`. **`_active` in the recipe is Panda's `:active` pseudo-class, not a Zag `data-active`** (`prior-art.md` §4.3)
      **`tabs.trigger`'s `currentBg` is already resolved, measured**, and the row inherits it: it and
      `timeline.indicator` are the only two uses of the keyword in the whole preset, and
      `panda-preset/src/current-bg-utilities.ts` compiles both. The trigger is the harder half — it
      is a `button`, and Panda's preflight declares `background: transparent` on every form control
      *through the same utility*, so a faithful port of upstream's transform would publish
      `--bg-currentcolor: transparent` on the trigger itself and a selected `outline` tab would come
      out transparent. chakra-ui.com does not: measured there, a bare `<button>` inherits
      `#09090B` from the page and a selected `outline` trigger computes `rgb(9, 9, 11)`, because
      their preflight emits that reset as plain CSS and never reaches the transform. Our one delta —
      a `transparent` background publishes nothing — reproduces that, and a bare `<button>` in the
      docs now reads `#09090B` too. `generated-css.test.ts` pins the emitted rule for this recipe,
      which is as far as the assertion can go before the component exists.
- [ ] tags-input — S:tagsInput · 10/10
      Repeated part (tags)
- [ ] toast — S:toast · 6/6
      Imperative `createToaster` store living outside the component tree — the only such surface
- [ ] toggle — ✗toggle · 2/—
      Key resolves to nothing in Chakra too (§2.5)
- [ ] tooltip — S:tooltip · 5/5 · D
      Floating — **the seam is free**, measured at `popover` (1500/1501): object-form `style` only
      on the positioner, content stays its `firstElementChild`, and the arrow is captured once per
      floating-element identity
- [ ] tree-view — S:treeView · 15/15
      Repeated **and recursive** part — branches nest. The one place §7's shape gets stressed

## Multi-part, no machine (15)

**The seam these rows are made of is `createSlotRecipeContext` in `packages/core/src/recipe/`**,
shipped with the `field` migration: `withProvider(tag, slot)` mints a Root, `withContext(tag, slot?)`
mints a part, `useStyles()` is the class map a hand-written part reads, and `PropsProvider` /
`usePropsContext` is the Root's props context. A Root that owns a store as well as an element is not
minted — it calls `resolveSlotClasses(props)` and publishes with `StylesProvider`, which is what
`field`, `fieldset` and `native-select` all do. A Root whose *own* props are not all the element's
is the same case, and `native-select` is the reason: `withProvider` omits the variant keys and
nothing else.

**`withProvider`'s `wrapElement` hands over a *function*, corrected at `alert`.** It shipped taking
a resolved `JSX.Element`, which cannot work: `renderStyled` builds the element **and its children**
on the call, so every part below ran before the wrapper's context existed and `Alert.Indicator`
threw the "no Root" error from directly under its own Root. A wrapper now writes
`{element()}` as a JSX child, which compiles to a getter and defers the build into the provider.
The seam's own suite gained the test that would have caught it.

- [x] field — S:field · —/8
      **The largest machine-less behavior in the library**, and the first machine-less multi-part
      component to ship: `createField` is a hand-written store of signals and prop getters, in the
      shape `createPopover` has over a machine. Ark's is 226 React lines, read for the ARIA contract
      and never the expression. It is not exported — upstream ships no `Field.RootProvider` and no
      `useField`, only `useFieldContext`.
      The **duplicate `requiredIndicator`** is real and it is in the *preset's slot list*, not the
      anatomy: generated `FieldSlot` reads `… | "requiredIndicator" | "requiredIndicator"`. 8 unique
      slots, and `errorIcon` is not one of them — upstream styles it with `createIcon` alone.
      **Ark's `MutationObserver` does not port.** It discovers whether the two texts are rendered by
      observing the root subtree for their generated ids; ours is `createRegisteredId`, the primitive
      Dialog's labelling IDREF already uses — each text publishes its **effective** id on mount and
      clears it on cleanup. Neither side emits `aria-describedby` in server markup (`onSettled` does
      not run there, and React's `useState(false)` + layout effect does not either): expected.
      **Two divergences, both fixes upstream lacks.** `ids.root` renames the root and `ids.control`
      the control — Ark reads `ids.control` for the *root* and never reads `ids.root` at all, which
      leaves the control id unoverridable and breaks the item/label derivation. And the two IDREFs
      point at the id the text part registered, so a consumer's own `id` on `Field.HelperText` still
      links where upstream drops the link entirely.
      **Three notes the reference falsified.** HelperText and ErrorText render `span`, not the `div`
      Chakra's type claims — the element it wraps is `ark.span`, and parity is what a consumer
      observes. `ErrorText` is gated on `invalid` upstream, which is what makes `aria-errormessage`
      need both halves for free. And `boxSize: "1em"` cannot go through `createIcon`'s `defaultProps`:
      Panda extracts style props from JSX only, so inside a call it generates no rule and the icon
      rendered at 58px. It shipped as a literal JSX attribute before the spread and is now a
      `withDefaults` entry plus a `boxSize: ["1em"]` `staticCss` row — the `table` row measured that
      the attribute spelling loses the default to a forwarded `undefined`.
      **The slot classes travel through the styling seam, not the field context.** `FieldContextValue`
      is `CreateFieldReturn` and nothing else, so `<Field.Context>` hands a consumer the field alone —
      which is what Chakra's hands them. The Root publishes the class map with `StylesProvider` and
      each part reads its own slot with `useFieldStyles()` — **which the barrel did not export, and
      now does.** Upstream's `field/index.ts:9` exports it; ours had the hook and kept it internal.
      (`fieldset` is not the same case — upstream exports no `useFieldsetStyles` either.)
      **RequiredIndicator owes no `children()`.** Its `fallback` and `children` are read exactly once
      per branch, measured with Button's counting fixture; the counting tests stay in as the proof.
      **And it carries no `data-scope` / `data-part`, alone among the parts here.** It is the one
      element Chakra hand-writes as a `chakra.span` instead of wrapping Ark's component, so Ark's
      attributes never reach the DOM upstream — `aria-hidden="true"` plus the slot class is the whole
      surface. The port emitted the pair until it was corrected; the browser tests locate it by a
      fixture's `data-probe` now, since a slot class is not a handle a test may assert on.
      One inherited axe violation: `errorText` is `fg.error` (`red.500`) at `textStyle: xs`, 3.76:1
      on white and under AA. The React version renders the identical declaration from the identical
      preset token — both wrong the same way, so it ships and the invalid-state test pins exactly
      that one violation.
      **Its subpath export was missing and is now there.** `package.json#chakraUiSolid.entries` had no
      `field` row, so `chakra-ui-solid/field` resolved to nothing while the barrel exported it —
      nothing checks the two agree, and the browser suite is green either way. Found and fixed on the
      Phase-2 batch.
      Docs: **11 of upstream's 12 example slots**, and two sections dropped. `Textarea` and `Native
      Select` were the two waiting on their rows and both landed with Phase 3; `Horizontal` keeps its
      section and loses its third row, a `Switch`. `Explorer` is www machinery. **`Customization` is
      dropped too, and it sets a precedent**: its snippets are `createSystem` /
      `fieldSlotRecipe.extend` / `@chakra-ui/cli typegen`, the runtime style system this port
      structurally does not have, and rewriting them into Panda config would be invented content.
      `field` is the first page here whose upstream carries one.
      **`FieldRoot` no longer defaults `disabled`.** It is resolved in `createField` alone, against
      the surrounding `Fieldset` — a `withDefaults` entry here would land as `false` first and delete
      the inheritance with nothing to say so (`fieldset` row).
      `popover.mdx`'s `### Form` section is paid: `popover-with-form` ships with `textarea`
- [x] fieldset — S:fieldset · —/5
      `createFieldset` in `field`'s shape — signals and getters, no machine — and a Root that is
      `resolveSlotClasses` + `StylesProvider` rather than `withProvider`, because it owns a store as
      well as an element. Not exported, for `createField`'s reason: Chakra re-exports Ark's
      `useFieldsetContext` and neither `Fieldset.RootProvider` nor `useFieldset`.
      **`+content` is a slot and not a part.** The anatomy is `createAnatomy('fieldset').parts(root,
      errorText, helperText, legend)`; `content` exists only in the recipe, so `Fieldset.Content`
      carries no `data-part` — it is the one part the seam's `withContext` mints on its own, since it
      is the one that merges no prop getter.
      **The debt to `field` is paid.** `createField` now resolves `props.disabled ??
      Boolean(fieldset?.disabled)` through `useOptionalFieldsetContext`. The change that made it work
      was **not** in `createField`: `FieldRoot`'s `withDefaults` carried `disabled: false`, which
      resolved to `false` before `createField` ever saw it and would have deleted the inheritance
      silently. The default is gone from the Root and `createField` is the only place `disabled`
      resolves. `invalid` / `readOnly` / `required` keep theirs — nothing above supplies them.
      **The root's `aria-describedby` is error-first**, and both halves register their *effective*
      ids through `createRegisteredId`, so a consumer's own `id` on `Fieldset.HelperText` still links
      — the same divergence from upstream's `MutationObserver` + `getElementById` that `field` ships,
      and for the same reason. `aria-labelledby` names the legend unconditionally, dangling IDREF and
      all, which is upstream exactly: expected.
      Two Root props are narrower than the DOM's and both are omitted from the element bag: `id`
      seeds the id scheme and names nothing (the `fieldset` carries no `id` at all, upstream
      included), and `invalid` is an attribute no element has.
      **There is no `Fieldset.PropsProvider`, and adding one would be an invention.** Upstream
      destructures `const { withProvider, withContext } = createSlotRecipeContext({ key: "fieldset" })`
      and never mints one — this is the one shipped family without it. The port had one and it was
      dropped, props context and all: nothing else populates that context, so `withContextDefaults`
      on the Root was reading a bag that could only ever be empty.
      One inherited axe violation invalid: `errorText` is `fg.error` at `textStyle: sm`, under AA on
      the page background. The React version renders the identical declaration from the identical
      preset token — both wrong the same way, so it ships and the test pins exactly that one.
      Docs: all 3 of upstream's example slots. `Explorer` is www machinery
- [x] native-select — S:nativeSelect · —/3
      **The `data-scope` warning was wrong, and the correction is the stronger fact: this component
      emits no `data-scope` or `data-part` at all.** `nativeSelectAnatomy` is
      `createAnatomy("select")`, but Chakra only ever asks it for `keys()` — the slot list the recipe
      is defined over. No part applies `parts.*.attrs`, so nothing here is addressable by
      `[data-scope]` and there is no collision with the `select` row to guard against. What the
      recipe's selectors read instead are the classes and the `_disabled` / `_invalid` conditions,
      which is why the Root writes both states onto the two parts by hand. The `select` element does
      wear `data-scope="field" data-part="select"` inside a `Field.Root`, but that comes off
      `getSelectProps()` and belongs to `field`.
      **The only *other* upstream `useFieldContext()` consumer** was right, and so was the shape:
      `getSelectProps()` merged under the caller's props through the lazy `mergeProps`, as `input`
      and `textarea` do. The Root reads the field too, for the `disabled` / `invalid` it publishes to
      its own two parts — and **the field wins over the Root's own props** (`field?.disabled ??
      props.disabled`, and a field's value is always a boolean), so a `<NativeSelect.Root disabled>`
      inside a live `Field.Root` is live. That is upstream's resolution: expected, and pinned.
      The Root is hand-written rather than `withProvider`, because `disabled` and `invalid` are
      states the parts read and not the `div`'s attributes — React drops `invalid` on a `div` with a
      warning; Solid would write `invalid=""`, so parity means omitting both.
      `placeholder` is not a `select` attribute: it is a leading `<option value="">`.
      Docs: 8 of upstream's 10 example slots. `Hook Form` is a third-party React package; `Explorer`
      is www machinery. `Closed Component` keeps its section and loses the `@chakra-ui/cli snippet`
      note, which addresses a CLI this project does not have
- [x] alert — S:alert · —/5
      **The only one of the five flat slot recipes with a context of its own**, and the row that
      corrected the seam: `status` is a recipe variant *and* the value `Alert.Indicator` reads to
      pick its glyph, so the Root wraps its element in an `AlertStatusProvider` through
      `withProvider`'s `wrapElement` — see the section preamble for the correction that took.
      Four variant keys, not one: `status`, `inline`, `variant`, `size`. `inline` is the library's
      **first boolean `defaultVariants` entry**, and it broke the docs props-table generator, whose
      emitted `defaultValue` is typed `string | null` — the generator now stringifies.
      **`Alert.Indicator` is the one part `withContext` cannot mint**, because its children default
      to a glyph chosen from the status: `info`/`neutral` share the circle-i, `error`/`warning`
      share the triangle, `success` is the circled check. A **responsive** `status` names no single
      glyph and draws nothing, which is upstream's `Fragment` one indirection later. Read exactly
      once, so no `children()` is owed.
      **A defaulted child yields to `undefined` and to nothing else**, and the note here said `??`,
      which is wrong. Chakra applies a part's `defaultProps` through `merge-props.ts:49`
      (`props[key] !== undefined ? … : …`) and `utils/compact.ts:4` (deletes only `undefined`), so
      `<Alert.Indicator>{null}</Alert.Indicator>` renders an empty box upstream where `??` put the
      glyph back — and `{cond() ? <X/> : null}` is ordinary Solid, so it is a real case. Each getter
      reads the prop into a local first, because the check plus the result would be two
      `createComponent` calls. **The same measurement settles it for `breadcrumb` (Separator,
      Ellipsis), `stat` (both trend indicators, one helper), `tag` (CloseTrigger) and `popover`
      (Arrow's tip, inside its `children()`)** — all fixed together, each with its own test.
      `native-select` and `close-button` are *not* in the set: upstream writes `props.children ??
      <Icon/>` in the body for both, so ours already matches. `withDefaults` is untouched — its
      nullish semantics are the library-wide rule.
      **The flat export is `AlertPropsProvider`**, not `AlertRootPropsProvider` — the port shipped
      the wrong spelling and it is corrected. The namespace alias *is* `Alert.RootPropsProvider`,
      which reads as an inconsistency and is upstream's own: `AlertPropsProvider as RootPropsProvider`
      in its `namespace.ts`. (`Tag` is the other way round — `TagRootPropsProvider` flat there too.)
      Its hydration entry is the batch's only one, and it is earned: three roots give three
      indicator shapes — the default glyph, nothing at all, and a consumer's own spinner — each
      spending a different number of hydration keys, over a context the Root opened around its own
      element.
      Docs: **all 10 of upstream's example slots**, `Explorer` dropped as www machinery. Two
      adaptations: the *Custom Icon* prose named an `icon` prop `Alert.Root` does not have (it is
      the closed component's, and upstream's own example passes children to `Alert.Indicator`), and
      `alert-with-custom-icon` / `alert-with-customization` take `BellIcon` and `PartyPopperIcon`
      from the docs' own lucide set where upstream imports `react-icons/lu` — `badge-with-icon`'s
      precedent
- [x] blockquote — S:blockquote · —/4
      The plainest of the five: `withProvider("figure", "root")` plus three `withContext` parts and
      no body anywhere. **`Blockquote.Icon`'s element is a component, not a tag** — `withContext(
      QuoteIcon, "icon")` — the only part in the batch whose slot class is handed to `chakra.svg`
      rather than written on a host element, and it works unchanged.
      `variantKeys: ["justify", "variant"]`; `plain` keeps the padding and drops only the rule.
      Docs: **8 of upstream's 10 example slots**. `With Avatar` waits on the `avatar` row and
      `Explorer` is www machinery. `blockquote-with-colors` is the `code-with-colors` case — ten
      palettes written out, because `colorPalette` is a style prop the preset deliberately keeps out
      of `staticCss` — and `blockquote-with-custom-icon` takes `StarIcon` from the docs' own set
      where upstream imports `react-icons/lu`
- [x] breadcrumb — S:breadcrumb · —/7
      Repeated part (items) — which `list` measured as a non-event: the same `withContext` component
      is reused per row and needs nothing. Its Root does carry `defaultProps: { "aria-label":
      "breadcrumb" }` and takes `list`'s shape — a `withDefaults` wrapper over the minted Root, no
      seam change. **The note stopped one part too early: three of the six parts carry defaults
      too.** `CurrentLink` has `role="link"` + `aria-current="page"`, `Separator` has
      `aria-hidden` + a `<ChevronRightIcon />` child, `Ellipsis` has `role="presentation"` +
      `aria-hidden` + an `<EllpsisIcon />` child. Only the Root's fits the `withDefaults`-wrapper
      shape; the other three are `stat`'s and `tag`'s — `withDefaults` for the attributes,
      `merge` + a `children` getter for the glyph, `renderStyled` for the element.
      **`Breadcrumb.Ellipsis` renders an `li` where Chakra's own type says `HTMLChakraProps<"span">`**
      — `withContext("li", "ellipsis")` is what upstream renders, and an `ol` may hold nothing else.
      Third row in the library to find its type lying about its element, after `Card.Title` and
      `Tag.Root`.
      `aria-hidden` is `"true"`, not `true`: Solid's JSX types spell it `EnumeratedPseudoBoolean`,
      and the adapter already stringifies Zag's booleans for the same reason.
      Docs: **7 of upstream's 9 example slots**. `Menu` waits on the unported `menu` row and
      `Explorer` is www machinery. Two adaptations: `Routing Library` shows `render` where upstream
      shows `asChild`, and `breadcrumb-with-separator` / `breadcrumb-with-icon` take `SlashIcon`,
      `HouseIcon` and `ShirtIcon` from the docs' own lucide set where upstream imports
      `react-icons/lia` and `react-icons/lu` — `badge-with-icon`'s precedent.
      **One divergence in `breadcrumb-closed-component`, recorded here rather than on the page:**
      upstream's snippet renders `<Item><Link>` for every crumb *and then* an extra
      `<Item><CurrentLink>` for the last, so the last crumb appears twice. The port puts the link
      row in the `Show` fallback, which is what the snippet obviously means
- [x] card — S:card · —/6
      The seam's own reference recipe, and the row that proved `withProvider` carries a plain Root
      with no body at all: six slots, six components, `variantKeys: ["size", "variant"]`, one file.
      **`Card.Title` renders an `h3` where Chakra's own type says `HTMLChakraProps<"h2">`** —
      `withContext("h3", "title")` is what upstream actually renders, so the type is wrong about it
      and parity is what a consumer observes. The port's type says `h3`.
      **No part carries `data-scope` or `data-part`, and none of the five in this batch does.**
      Chakra's `withContext` writes a class and nothing else, so nothing here is addressable by
      `[data-scope]` — the recipe's selectors read the classes. (`native-select` found the same
      thing from the other direction; `field` and `fieldset` carry theirs off prop getters, with the
      one exception the `field` row records — `RequiredIndicator` is hand-written upstream and
      carries none.)
      Docs: **4 of upstream's 7 example slots**. *With Image* and *Horizontal* wait on the `image`
      row and *With Avatar* on `avatar`; `Customization` is dropped on `field`'s precedent — its
      snippets are `defineSlotRecipe` / `createSystem` / `ChakraProvider`, the runtime style system
      this port structurally does not have — and `Explorer` is www machinery. `card-basic` and
      `card-with-variants` keep their sections with a `Circle` where the avatar was
- [x] data-list — S:dataList · —/4
      Repeated part (items) — a non-event, as `list` measured: one `withContext`-minted
      `DataList.Item` rendered per fact, styled from the one class map the Root resolved. Four
      slots, three variant keys (`orientation`, `size`, `variant`), no body anywhere, and the seam
      minted every part unchanged.
      The `dl` groups each pair in a **`div`**, which is the markup a `dl` allows and what makes
      `orientation` expressible: the item is the flex container, so `horizontal` is a row of `dt`
      and `dd` and `vertical` is a column, with the label holding a 120px track on `horizontal`
      only. `variant` swaps *which half is muted* rather than adding emphasis — `subtle` dims the
      label, `bold` dims the value and weights the label.
      Docs: **6 of upstream's 8 example slots**. `Info Tip` and `Closed Component` both wait on the
      `toggle-tip` row — the closed component's whole added surface is its `info` prop, which is an
      `InfoTip` — and `Explorer` is www machinery. The `:::info` admonition pointing at the closed
      component goes with it
- [x] empty-state — S:emptyState · —/5
      Five slots, one variant, no body, no default anywhere — the plainest row of the batch, and
      the seam minted all six components unchanged. **The Root only spans and pads**: the column,
      the centring and the gap are `EmptyState.Content`'s, which is why a full empty state is
      always two elements deep and why a Root with the parts directly inside it renders them in a
      row. `size` moves four things at once and the glyph moves furthest — `2xl` to `6xl` — over an
      indicator that sizes any `svg` inside it to `1em`, so a consumer's icon needs no size.
      Docs: **all 5 of upstream's example slots**. `Explorer` is www machinery, and the
      `@chakra-ui/cli snippet` note under *Closed Component* addresses a CLI this project does not
      have (`card`'s precedent). Two glyph swaps: `empty-state-basic` and `-sizes` take
      `ShoppingCartIcon` from the docs' own lucide set where upstream imports `react-icons/lu`, and
      `-with-action` / `-with-list` take `PaintBucketIcon` — a glyph the set already had — where
      upstream imports `HiColorSwatch` from `react-icons/hi`, which is Heroicons rather than Lucide
      and so has no counterpart to copy
      **`EmptyStateTitleProps` was the one type the barrel dropped** — declared, aliased as
      `TitleProps` in `namespace.ts`, and absent from `index.ts`, so the flat import upstream
      resolves (`empty-state/index.ts:15`) failed here. Fixed. A sweep of every component found no
      second instance.
- [x] list — S:list · —/3
      **A repeated part costs nothing** — the same `withContext`-minted `List.Item` is reused per
      row, and the prediction that named one was naming a non-event. What the row does cost is its
      Root: `ListRoot` is `withProvider("ul", "root", { defaultProps: { role: "list" } })` upstream,
      and our `withProvider` has no `defaultProps`. Rather than grow the seam, the Root is a
      three-line component over the minted one — `withDefaults(props, { role: "list" })` spread into
      it — which is the same fix the third hazard already prescribes and leaves the seam untouched.
      The role is not redundant: Safari drops list semantics from a `ul` whose `list-style` is
      `none`, which `variant="plain"` is.
      Two variant keys, `variant` and `align`; `align` has **no** `defaultVariants` entry, so it is
      the batch's one variant that resolves to nothing at all.
      **`--list-gap` is defined nowhere, in Chakra either.** The root's `gap` and a nested list's
      `margin-top` both read it with no fallback, so both are invalid at computed-value time and
      take their initial value until a consumer passes `gap` — which is what upstream's own icon
      example does. Both wrong the same way; it ships, and the docs page says nothing.
      Docs: **all 5 of upstream's example slots**, `Explorer` dropped as www machinery. Two
      adaptations: `list-with-icon` writes `render` where upstream writes `asChild`, so the
      indicator's slot class lands on the glyph rather than on a span around it; and it takes
      `CircleCheckIcon` / `CircleDashedIcon` from the docs' own lucide set where upstream imports
      `react-icons/lu`. A **bare `✓` in an indicator is an axe `incomplete`**, not a pass —
      `color-contrast` reports `nonBmp` on content that is only non-text characters — so the
      fixtures put a glyph there, which is what upstream's example holds anyway
- [x] stat — S:stat · —/6
      Six slots and **nine** exports, three of which the seam does not mint.
      **`Stat.UpIndicator` and `Stat.DownIndicator` are one component twice**: same slot, same
      element, and the only difference between them is `data-type`, which is what the recipe's two
      attribute selectors colour from. Both carry two defaults — the arrow and the `data-type` — so
      neither can be `withContext`, and they take `Tag.CloseTrigger`'s shape: `withDefaults` for
      the attribute, a `children` getter over `merge(...)` for the glyph. **The `data-type` prop is
      declared on the interface**, where the React version leaves it to a `data-*` index signature
      React's JSX types carry and Solid's do not.
      **`StatGroup` is the library's second props-context writer**, after `ButtonGroup`, and takes
      exactly its shape — a named object of getters into the provider, `omit(merged, ...VARIANT_KEYS)`
      for the element, and the four layout properties in the same `withDefaults` bag as `role` —
      they shipped as JSX attributes before the spread until the `table` row measured that spelling
      losing a default to a forwarded `undefined`. All four values were already in `staticCss`. There is
      **no `rootProps`-style escape hatch anywhere in this row**; the prediction that there might be
      was wrong, and the `mergeProps` carry-forward from `field` had no site here.
      **`Stat.HelpText` is a `span` directly inside a `dl`**, which is markup a `dl` does not allow
      — upstream renders exactly that pair, so the React version is invalid the same way. It ships,
      the browser suite pins the one `definition-list` violation, and a consumer who needs valid
      markup passes `as="dd"`. Nothing on the docs page says so.
      Docs: **5 of upstream's 9 example slots**. `Format Options` and `Progress Bar` wait on the
      `format` and `progress` rows, `Info Tip` on `toggle-tip`, and `Closed Component` on both —
      its `formatOptions` and `info` props are the whole of what it adds. `Explorer` is www
      machinery, and upstream's own page has no section for `stat-with-group`, so neither has
      ours. `stat-with-trend` keeps its section with the currency written out where upstream calls
      `FormatNumber` — the trend badge is the example, `card-basic`'s precedent — and
      `stat-with-icon` takes `DollarSignIcon` from the docs' own lucide set
- [x] status — S:status · —/2
      The smallest multi-part row in the library: two slots, one variant, no body. There is **no
      `Status.Label`** — the word is a plain child of the Root, which is an `inline-flex` row with a
      gap, upstream included. The dot is `0.64em`, so `size` moves the label's type scale and the
      dot follows it rather than taking a step of its own.
      Docs: **3 of upstream's 4 example slots**, and the dropped one is a **new kind of drop**.
      `status-closed-component` maps a `value` to a `colorPalette` at runtime
      (`statusMap[value]`), and `colorPalette` is a style prop the preset deliberately keeps out of
      `staticCss` — so the snippet computes a class with no rule and renders colourless with no
      error. It is the first example blocked by that decision rather than by an unported row;
      `code-with-colors` and its two Phase-4 counterparts could be written out literally, and a
      closed component that takes the palette as a parameter cannot. `Explorer` is www machinery
- [x] table — S:table · —/8
      Repeated parts (rows, cells) — a non-event, per `list`. The row's one default is indeed not on
      the Root: `Table.Caption` carries `defaultProps: { captionSide: "bottom" }`, a *style* prop.
      **The note's conclusion from that is wrong, and measuring it is this row's finding.** A JSX
      attribute before the spread does *not* survive a forwarded `undefined`: a Solid JSX spread is
      a presence merge, so `<Circle borderRadius={props.borderRadius} />` with `borderRadius`
      unset computes `0px`, not `9999px` (measured directly on `Circle`). The style prop reaches
      `css()` as `undefined` and no class is emitted at all. Chakra keeps the same default —
      `packages/react/src/merge-props.ts` resolves by *value* — so the JSX spelling is a divergence,
      not parity.
      `withDefaults` fixes the deletion and creates the other half of the problem: the value moves
      into an object literal, which Panda's extractor never reads, and a deleted default becomes a
      silently unstyled one. **Both halves are needed**, so the row also adds
      `{ properties: { captionSide: ["bottom"] } }` to the preset's `staticCss.css` — the list whose
      stated bar is "a value a *component's* own logic picks", which this is exactly.
      Both follow-ups are closed. `CLAUDE.md`'s *third hazard* now names the spelling as a way to
      keep a value extractable and never as a place a default may live, and the eight sites a grep
      of `components/` turned up were converted with it: `Circle`'s `borderRadius`, `ColorSwatchMix`'s
      `overflow`, `IconButton`'s two paddings and `_icon` font size, `Field.ErrorIcon`'s `boxSize`,
      `LinkBox`'s `position`, `SkeletonText`'s stack width, `StatGroup`'s four layout props (already
      covered by `staticCss`) and `SkipNavContent`'s `tabindex` + inline `outline` (neither a style
      prop, so neither owes a row). The literals left standing are not defaults: `checkmark.tsx` and
      `icons.tsx` set an SVG glyph's own drawing attributes, and `ColorSwatchMix`'s inner cells carry
      no spread behind them to delete anything.
      **`Table.Root` is `withProvider("table", "root")` with no body**, where upstream hand-writes
      it for one reason: the `native` prop. **`native` is not ported.** It takes each slot's
      resolved *style object* and re-hangs it on `& thead`, `& tr`, `& td`; a slot here is a class
      name whose rules were generated in the consumer's build, so there is nothing to compose, and
      composing it would mean re-emitting the recipe body. Upstream's own page states its value as
      performance — "eliminating the runtime styling and React Context overhead" — and neither cost
      exists here. Absence stated on the docs page, under upstream's own *Native Mode* heading.
      **`Table.ScrollArea` drops one of its five base declarations**: `WebkitOverflowScrolling:
      "touch"` is obsolete (Chromium never implemented it, modern WebKit ignores it) and
      `check:declaration-support` rejects it, with no allowance available for a declaration our own
      source emits. The preset's own ScrollArea recipe still ships it, under an existing allowance
      row.
      `TableColumnGroup` and `TableColumn` are the library's first `withContext` calls with **no
      slot** — they read no context, so they render with no Root above them, which is the arm the
      SSR subjects and one browser test cover.
      Docs: **13 of upstream's 18 example slots**. `Pagination`, `Selection` and `Action Bar` wait
      on the unported `pagination`, `checkbox` and `action-bar` rows — `table-with-pagination` also
      needs the `conditional: { button: { variant: ["selected"] } }` knob when it lands — `TanStack
      Table` is a React-only dependency, `Native Mode` is the divergence above, and `Explorer` is
      www machinery. `Caption Top` says `captionSide` where upstream's prose says `side`; upstream's
      own example already passes `captionSide`, so the prose was wrong about its own code
- [x] tag — S:tag · —/5
      The `badge` row's prediction, verified: `tagSlotRecipe` reuses `badgeRecipe.variants.variant`
      and nothing else, the installed preset ships it inlined, and no preset edit was owed.
      **`Tag.Root` renders a `div`** — `withProvider("div", "root")` — where Chakra's own type says
      `HTMLChakraProps<"span", …>`. `Card.Title` has the same mismatch in the same batch; both port
      what the component renders rather than what the type claims.
      **`Tag.CloseTrigger` is the one part `withContext` cannot mint.** It carries two defaults —
      `type="button"` and the ✕ — and both go through `withDefaults` plus a `children` getter rather
      than a JSX attribute before a spread. The glyph is a getter and not a `withDefaults` entry
      because that object is evaluated where it is written, so a JSX default there would construct
      the icon on every render and discard it whenever a consumer passed their own.
      One inherited a11y violation: the default ✕ is a bare `<CloseIcon />` with no title and no
      label, so the button has no discernible text — **and the React version's does not either**,
      from the identical default. Both wrong the same way, so it ships; the test pins exactly that
      one violation and a second pins that `aria-label` clears it.
      Docs: **9 of upstream's 11 example slots**. `Avatar` waits on the `avatar` row — and it is the
      one substitution that would not work, since `.tag__startElement:has([data-scope=avatar])` is a
      real selector — and `Explorer` is www machinery. `tag-with-colors` is the `code-with-colors`
      case; `tag-as-button` is `asChild` → `render`, with the cast
      `concepts/composition.mdx` §*Best Practices* explains. The close triggers in the examples stay
      **unlabelled**, 1:1 with upstream, on `badge`'s precedent that the docs examples suite carries
      upstream's content rather than our corrections
- [x] timeline — S:timeline · —/8
      Repeated part (items) — a non-event, per `list`. Its Root does carry the same `defaultProps:
      { role: "list" }` `list`'s does, and takes the same `withDefaults` wrapper. **The note missed
      the other half of the pair: `Timeline.Item` carries `defaultProps: { role: "listitem" }`**, so
      the row has two wrapper sites, not one — and the second wraps a `withContext` part rather than
      the minted Root. Its markup is nothing but nested flex `div`s, so losing either half loses the
      list outright.
      `variantKeys: ["variant", "showLastSeparator", "size"]`, and `showLastSeparator` is a boolean
      variant whose whole effect is `--timeline-separator-display` on the last item — the separator's
      own `display` reads it, which is why the test asserts `display` there and nowhere else in this
      family.
      **`variant="outline"` shipped with no background at all, and the cause was the preset.**
      `timeline.indicator` writes `bg: "currentBg"`, a Chakra keyword meaning "the background of the
      nearest ancestor that set one"; `@chakra-ui/panda-preset` uses it and ships no utility
      resolving it, so Panda emitted `background: currentBg` and the browser dropped the
      declaration. Measured in a browser on both sides: `rgba(0, 0, 0, 0)` here against
      `rgb(255, 255, 255)` on chakra-ui.com, with the absolutely-positioned separator painting
      straight through the circles on *Alternating Content*. Fixed in
      `panda-preset/src/current-bg-utilities.ts`, not in this component — the port rule's first
      case. Now `rgb(17, 17, 17)` against the docs card it sits on.
      Docs: **all 6 of upstream's example slots**, `Explorer` dropped as www machinery. Three
      adaptations: `timeline-with-sizes`, `timeline-with-variants` and `timeline-composition` put a
      `Circle` with an initial where upstream puts an `Avatar` — the `float-with-avatar` precedent,
      since `avatar` has not shipped — `timeline-composition` writes its own filler text where
      upstream imports `react-lorem-ipsum`, and the glyphs come from the docs' own lucide set
      (`ShipIcon`, `PackageIcon`, `PenIcon` added for it) where upstream imports `react-icons/lu`

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
      `createRecipeContext({ key })`, read as `usePropsContext` + `createRecipeClass` because the children are wrapped when `loading`. `ButtonGroup` is the one that uses `useRecipe({ key })` directly. Also ships `IconButton`, `CloseButton`.
      **The component shipped; its docs page did not** — `button.mdx` and `heading.mdx` are the two
      upstream pages with no counterpart of ours, where `close-button` and `icon-button` have theirs.
      That page brings both `staticCss` cases at once. `button-with-responsive-size` writes
      `size={{ base: "md", md: "lg" }}`, which `responsive: { button: ["size"] }` closes on the
      `dialog` row's measurement. `variant={{ base: "ghost", _selected: "outline" }}` is the other,
      and the knob does not reach it — a state condition, not a breakpoint. **Fourteen upstream
      examples spell it and every one is this recipe**, on a `Button` or an `IconButton`: the whole
      `pagination` page, the whole `toggle` page, `table-with-pagination` and `rating-emoji`.
      Measured against the docs app's own sheet — `button({ variant: { base: "ghost", _selected:
      "outline" } })` returns `selected:button--variant_outline`, and `styles.css` has no rule for
      that selector
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
- [x] code — A:code · —/1
      The `badge` row's prediction, verified: `codeRecipe` destructures `badgeRecipe`'s **whole**
      `variants` and `defaultVariants`, the two share five variants and four sizes, and the base adds
      `fontFamily: mono` plus a radius. Already inlined in the installed preset, so no preset edit was
      owed. `withContext("code")`, `variantKeys: ["variant", "size"]`, no body — badge's file with
      three words changed.
      Docs: **all 4 of upstream's example slots**, and `code-with-colors` is the one that could not be
      copied. Upstream maps over a `colorPalettes` array; `colorPalette` is a **style prop**, which
      `preset.ts` deliberately keeps out of `staticCss` (measured there at 8 kB for a rescue nothing
      uses), so a loop variable computes a class with no rule and the row renders colourless with no
      error. Ten palettes are written out literally instead — same page, extractable source. A recipe
      **variant** in a loop is fine and `mark-with-variants` uses one: `staticCss: ["*"]` covers all 75
      recipe bodies
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
      **It shipped without `ContainerPropsProvider`, which is behaviour Chakra has** — upstream is
      `createRecipeContext({ key: "container" })` and exports the `PropsProvider` it destructures
      (`container/container.tsx:24-25`, `index.ts:1`). Ours was a hand-written `createRecipeClass` +
      `renderStyled` body with no props context at all, so a subtree could not be given `fluid` or
      `centerContent` from above. Corrected to `badge`'s shape — `createRecipeContext` mints both
      halves, the body is gone, and the forwarded-`undefined` test the pattern owes is in.
- [x] download-trigger — ✗downloadTrigger · —/1
      Key resolves to nothing in Chakra too — true, and the only clause this note had. What it did
      not say is that this is **the one atomic row with behavior**: upstream is Ark's
      `DownloadTrigger` + `useDownload`, so what ships is `createDownload` written here.
      **The download itself is `downloadFile` from `@zag-js/file-utils`**, a fourth catalog entry and
      the second Zag utility a component imports directly (`auto-resize`'s precedent). It is the
      function Ark's own `useDownload` calls, so it is what Chakra reaches for *through* Ark;
      writing our own would mean rediscovering the BOM for UTF-8 text, the object URL revoked one
      task after a synthetic click, and the macOS-WebView and legacy-Edge branches that cannot use
      `<a download>` at all. `FileMimeType` comes with it. `sideEffects: false`, so the 6 kB
      extension→MIME table nothing imports tree-shakes out.
      **`createDownload` reads every prop inside `download()`, never at call time** — which is the
      Solid-native expression of a React hook that re-runs on each render, and makes a signal-driven
      `fileName` name the file whatever it is at the moment of the click. The window comes from the
      environment context, so a trigger rendered against another document saves from that document;
      that is the only thing the context changes here and it has a test.
      **`type="button"` is fixed, not defaulted.** Ark writes `<ark.button {...rest} type="button">`
      — *after* the spread — so `<DownloadTrigger type="submit">` is a button on both sides. The
      third hazard does not apply to it and neither does `withDefaults`; both spellings are pinned.
      Expected, not tolerated.
      **A rejected `data` promise is left to reject.** Ark's `.then(saveToDisk)` has no `catch` and
      neither does ours: a dead URL surfaces as an unhandled rejection rather than as a button that
      silently does nothing. The test asserts it by registering its own `unhandledrejection`
      listener, which is also what keeps it off the run's error report — Vitest's browser client
      counts user listeners and steps aside when it finds one.
      **No `DownloadTriggerPropsProvider`**, alone among the atomic rows: upstream destructures only
      `withContext` from `createRecipeContext`, so its props context has no writer and is dead.
      Ours does not mint one either. And the recipe key is genuinely unclaimed — `qrCode`'s slot list
      has a `downloadTrigger` **slot**, which is a different thing and generates `qr-code__downloadTrigger`.
      **There is no coverage check and no allow-list to register in** (see the `clipboard` row, which
      this settles). Docs: **3 of upstream's 4 example slots** — `### File Size` composes
      `FormatByte`, which waits on the `format` row. Every example reaches the look through `render`
      where upstream writes `asChild`, and `with-promise` needed one glyph (`image-down`) added to
      the docs' Lucide set, 37→38 in `NOTICE.md`
- [x] heading — A:heading · —/1
      **The component shipped; its docs page did not** — `heading.mdx` and `button.mdx` are the only
      two upstream component pages with no counterpart of ours. Every other checked row either has a
      page or has none upstream either (`circle`, `loader`, `quote`, `spacer`, `span`, `square`,
      `sticky`, `strong`)
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
- [x] input — A:input · —/1
      **21 lines upstream**: `createRecipeContext({ key: "input" })` plus
      `withContext(ArkField.Input)` — structurally `badge`'s `withContext("span")`, no component
      logic. "Styles Ark's `Field.Input`" was right, and it is the one thing that did not port: Ark
      is not a dependency. `ArkField.Input` merges a **non-strict** field context's
      `getInputProps()` under the caller's props (`field?.getInputProps()`; non-strict is why a
      bare `<Input>` works outside a `Field.Root`). No `field` row shipped at the time, so there was
      no context to read and nothing observable was lost — ours was a plain `input` through the
      factory. **Paid on the `field` ship**: the body is now Button's shape — props context off the
      seam, `createRecipeClass` + `renderStyled` called directly — with the field layered underneath
      through the adapter's lazy `mergeProps`, which resolves by value and re-calls `getInputProps()`
      on each read. `withDefaults` cannot express it: it enumerates `Object.keys(defaults)` at
      construction, which would snapshot the field's state. Ark's own Solid package spells the same
      merge, arrived at independently. The field recipe's `input` slot class stays unapplied — the
      element carries the `input` recipe class plus `data-scope="field" data-part="input"`, which is
      upstream exactly.
      `input.variantKeys` is `["size", "variant"]` — the reverse of badge's order. 7 sizes, 3
      variants, `md`/`outline` defaults, fully statically extractable; `staticCss: ["*"]` in
      `packages/panda-preset/src/preset.ts` already covers it, so no preset edit was owed. The
      recipe publishes **`--input-height` per size** — the contract `input-group` reads for its
      `calc()` padding.
      Popover's debt is fully paid: `popover-basic`, `-with-sizes` and `-with-custom-bg` carry their
      trailing `<Input>`, and `popover-with-form` plus `popover.mdx`'s `### Form` (upstream places it
      between `### Initial Focus` and `### Custom Background`) landed with `textarea` in Phase 3.
      Docs: **10 of upstream's 19 example slots**. The five that only ever needed `field` —
      `Helper Text`, `Error Text`, `Field`, `Focus and Error Color` and `Floating Label` — landed
      with Phase 4 and the debt is paid. `input-with-floating-label` is the one that is not a
      transcription: upstream is `useControllableState` + `useState` + a `defineStyle` constant, and
      ours is two signals and the style object inline in the `css` prop, because `defineStyle` is
      the runtime style system and a `css` value has to be a literal Panda can see. Six slots stay
      blocked on the `input-group` family (`Element`, `Addon`, `Button`, `Character Counter`,
      `Card Number`, `Clear Button`); `Hook Form` and `Mask` are third-party React packages, which
      do not port
- [ ] input-addon — A:inputAddon · —/1
      `useRecipe({ key })` directly — verified against the reference on the `input` ship, and it is
      the shape that does **not** port: we have no `useRecipe`, we import the generated recipe
      function. Not `input`'s `createRecipeContext` shape either, since the body splits variant
      props and honours `unstyled` by hand
- [x] kbd — A:kbd · —/1
      `withContext("kbd")`, four variants and three sizes, `raised`/`md` defaults. The base's
      `wordSpacing: -0.5em` is the load-bearing rule: one element carries a whole chord, so
      `<Kbd>Shift + Tab</Kbd>` reads as a single cap rather than three spaced words.
      **`KbdPropsProvider` is exported here and unreachable upstream** — `kbd.tsx` declares it,
      `kbd/index.ts` re-exports only `Kbd`, and `components/index.ts` re-exports that. A declared
      export a consumer cannot import is an oversight rather than a decision, and shipping it keeps
      every atomic row in this package one shape. Recorded as a divergence; the docs page says nothing.
      Docs: all 6 of upstream's example slots
- [x] link — A:link · —/1
      **Three components, not one, and the roadmap row named only the first**: upstream's directory is
      `link.tsx` **plus `link-box.tsx`**, whose `LinkBox` and `LinkOverlay` are exported from the same
      barrel and documented on their own page (`link-overlay.mdx`). Both ship here.
      `Link` is `withContext("a")` with one variant (`underline`/`plain`, `plain` by default) — the
      plainest row in the batch. The pair is not: they carry **two inline style objects and no recipe
      at all**, because there is no `linkBox` key in `@chakra-ui/panda-preset` and none upstream
      either. Those declarations are upstream's expression, so `link-box.tsx` is the batch's one
      derivative — `attribution.config.ts`, `@license`, both `NOTICE.md` tables.
      The mechanism is one class name: `LinkBox` lifts every anchor inside it above the overlay's
      `::before` with `& a[href]:not(.chakra-linkbox__overlay)`, so the overlay must really carry
      `chakra-linkbox__overlay`. `cx` puts a consumer's own class beside it.
      **`asChild` appears in three upstream places here and `render` answers all three** —
      `link-overlay-basic`, the `link.mdx` routing-library guide, and `link-overlay.mdx`'s custom-link
      guide.
      Docs: **two pages**. `link.mdx` is all 3 example slots plus both `## Guides` sections, and
      `link-overlay.mdx` is a page `docs-config.ts` had no nav entry for — chakra-ui.com carries
      *Link Overlay* between *Link* and *List* in Typography, and ours dropped it. Added
- [x] mark — A:mark · —/1
      `withContext("mark")`, one variant, and **the only recipe in this batch with no
      `defaultVariants`** — so `MarkProps.variant` carries no `@default` tag and a bare `<Mark>` is the
      base alone. That base is what earns the component: it neutralises the UA sheet's yellow
      highlight, so every colour comes from `colorPalette` and an `unstyled` Mark goes yellow again.
      Docs: both of upstream's example slots
- [x] radiomark — A:radiomark · —/1
      **Both compose, differently.** The preset's `radioGroup`/`radioCard` slot recipes inline
      `radiomarkRecipe.base` and its size/variant objects, so those styles are already in our
      generated CSS and this row owes them nothing. What B4 consumes is the **component**:
      `RadioGroupItemControl` and `RadioCardItemIndicator` each render `<Radiomark unstyled>` and
      hand it their own slot's styles through `css`, and `radio-card` adds `aria-hidden` at the call
      site. `class="dot"` is the seam that survives `unstyled` — the slot recipes carry the `& .dot`
      rule the dropped `.radiomark` class would have supplied. Four `variant` values, not five: no
      `plain`
- [x] separator — A:separator · —/1
      **Its page needs `responsive: { separator: ["orientation"] }`**, and the prediction held:
      `separator-with-responsive-orientation` writes `orientation={{ base: "vertical", sm:
      "horizontal" }}`, which no default `staticCss` run generates. One line in `apps/docs/
      panda.config.ts` beside `dialog`'s; the rule lands in the recipe **body** as `["*", …]`, which
      is `defineChakraConfig`'s own doing and needed no code change here.
      **The one row in this batch with a body of its own.** `orientation` is a recipe variant *and* a
      decision the component makes: a plain value gives `role="separator"` + `aria-orientation`, a
      responsive one has no single orientation to announce and drops to `role="presentation"`. A
      `withContext` component has no seam for a computed `role`, so this is Button's shape —
      `createRecipeContext()` for the props context alone, then `createRecipeClass` + `renderStyled`.
      `variantKeys` is `["variant", "orientation", "size"]`, in that order.
      **`SeparatorPropsProvider` is inert upstream and works here** — a divergence, and the repairing
      kind. `createRecipeContext`'s `useRecipeResult` never reads the props context; only its
      `withContext` does, and Separator is the one component that calls `useRecipeResult` directly. So
      on the React side the provider changes nothing at all, styles included. Ours reads it through
      `withContextDefaults`, which is the same one line every other row in the batch spends.
      **`role` and `aria-orientation` are written *before* the props spread**, upstream and here, so
      a consumer's own `role="presentation"` wins. The port had them in getters merged last, which
      made both props type-check and do nothing; they now sit in the first `merge` source with the
      omitted bag second.
      Docs: all 6 of upstream's example slots, plus the config snippet the responsive one needs
- [x] skeleton — A:skeleton · —/1
      Plus `SkeletonCircle`, `SkeletonText` — right, and both are composition rather than recipe.
      `Skeleton` itself is `withContext("div")` over `loading` + `variant`; `SkeletonCircle` is
      upstream's `<Circle asChild><Skeleton/></Circle>`, which ports as **`render`** — one element
      wearing both, where nesting would put the recipe's radius on the inner block and animate a
      square inside a round box. `SkeletonText` is a `<Stack>` over a `<For>` whose length is
      `noOfLines`, or 1 when `loading` is false.
      **Two Solid-specific traps, both measured on this row.** A JSX spread of a **member
      expression** (`{...merged.rootProps}`) compiles to a memo, and the untracked read then fires in
      the *receiving* component: four `STRICT_READ_UNTRACKED` diagnostics from one spread, naming
      `<Anonymous>`. Binding it to a name is not enough either — `merge(() => …)` fails the same way,
      because any bag with a **dynamic key set** is enumerated by `renderStyled`'s `Object.keys` in
      the receiving body. The adapter's `mergeProps` is the one proxy whose `ownKeys` is untracked, so
      `mergeProps(() => merged.rootProps ?? {})` is the spelling that works.
      **`rootProps` cannot carry an arbitrary style value.** `SkeletonText` is not a name Panda tracks
      (only recipe *keys* get a jsx hint, so `Skeleton` is tracked and `SkeletonText` is not), and a
      style prop nested inside an object prop is not extractable anyway — `rootProps={{ maxW: "xs" }}`
      computes a class with no rule. No upstream example uses it that way; its test asserts an `id`.
      The stack's own `width: "full"` is the one style value that bag does carry, and it needs both
      halves: `withDefaults` over the bag, because `rootProps={{ width: props.width }}` deletes the
      default in a presence merge, plus a `width: ["full"]` `staticCss` row, because that is exactly
      the unextractable case this paragraph describes.
      The batch's one **hydration entry**: the `<For>`'s length is a prop, so two lines, three lines
      and a `loading={false}` collapse are three different `_hk` counts — `color-swatch`'s question
      asked of a component whose count a consumer sets.
      Docs: **7 of upstream's 8 example slots**. `skeleton-text-with-children` is referenced by no
      page upstream and is not ported. `skeleton-with-children`'s `asChild` arm is `render`
- [x] skip-nav — A:skipNavLink · —/1
      `SkipNavLink` + `SkipNavContent`, right. Neither goes through `createRecipeContext`: upstream's
      link calls `useRecipe({ key })` directly — the shape the `input-addon` row's note already names
      as the one that does **not** port, since we import the generated recipe function instead — and
      the content is a bare `chakra.div`. So the link is `createRecipeClass(skipNavLink, …)` +
      `renderStyled` with no variants at all, and no props context on either half, which is upstream.
      `skipNavLink` is the batch's only variantless recipe, and the generated function is `skipNavLink`
      over a `skip-nav` class.
      **`id` names the target, not the element.** The link consumes it into `href={`#${id}`}` and
      carries no `id` of its own; the content wears it. Both spell it through `withDefaults`, because a
      JSX attribute before the spread loses to a forwarded `undefined` and the failure is silent — the
      anchor still renders and still takes focus, pointing at `#undefined`.
      Docs: all 3 of upstream's example slots. **A `## Props` section where upstream has none**, on the
      standing divergence — both halves declare an `id` of their own, with a default and a meaning the
      DOM attribute does not have
- [x] spinner — A:spinner · —/1
- [x] text — ✗text · —/1
      Key resolves to nothing in Chakra too; styled by `textStyles` + style props
- [x] textarea — A:textarea · —/1
      `input`'s shape, as predicted — props context off the seam, `createRecipeClass` +
      `renderStyled` called directly, `getTextareaProps()` layered underneath through the lazy
      `mergeProps` — **plus one thing the note missed entirely: `autoresize`**. Ark's
      `Field.Textarea` is not a bare wrapper; it takes an `autoresize` prop, sets `resize: none`
      inline when it is on, and subscribes `autoresizeTextarea` from `@zag-js/auto-resize`. Two of
      upstream's example slots are that prop, so dropping it would be removing behavior Chakra has.
      `@zag-js/auto-resize@1.43.0` joins the catalog — the first Zag utility a *component* imports
      directly rather than the adapter or `core`.
      The subscription is the split `createEffect(compute, effect)` pair over a **ref signal**, and
      both halves are measured: `onSettled` registers a single untracked fire, so a subtree turning
      `autoresize` on after mount would never subscribe; and a plain `let element` is assigned after
      the body registers the effect, so the compute captures `undefined` and nothing ever re-runs it.
      The element grew nothing at all until the ref became a signal.
      `resize: none` rides an inline `style` layered *under* the caller's, since `mergeProps`
      composes `style` rather than replacing it. A `<Textarea resize="…">` style prop is a class and
      so loses to that inline declaration — upstream has the same collision, from the same layering.
      `textarea.variantKeys` is `["size", "variant"]`, 5 sizes and 3 variants, `md`/`outline`
      defaults, all statically extractable under `staticCss: ["*"]` — no preset edit owed.
      Docs: 9 of upstream's 10 example slots (`Ref` is prose, adapted — Solid has no `forwardRef`).
      `Hook Form` is a third-party React package. Upstream's `### Field` section names
      `input-with-field`, which is its own typo; ours renders `textarea-with-field`

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
      **Two `card.mdx` sections wait on it**, measured at Phase 4: *With Image* and *Horizontal*
      are both `<Image>` beside `Card.Body`, and in *Horizontal* the image is the layout the
      section demonstrates rather than decoration, so neither substitutes
- [ ] input-element
      Part of the input-group family. Upstream is `chakra("div", { base, variants: { placement } })`
      — no recipe key, no `Field` context; it is also the identity `input-group` compares against
- [ ] input-group — ●
      `calc(var(--input-height) - ${offset})` (§3.1) — **`--input-height` is real and already
      generated**: the `input` recipe publishes it per size, one value per the 7 sizes.
      Upstream's body is `Children.only` + `cloneElement` + `skip={(el) => el.type === InputElement}`
      — React element identity, the same pattern the `icon` row already found does not port to
      Solid. The port has to reach the offsets another way; it is not a `cloneElement` translation
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

## Utilities, providers and re-exports (4)

- [ ] client-only
      Not an exclusion — §5.2
- [ ] focus-trap
      `chakra(ArkFocusTrap)` over `@zag-js/focus-trap` — a Zag **utility**, not a machine. Nothing
      Solid-specific. **No machine component waits on it**: `@zag-js/focus-trap` arrives
      transitively under `@zag-js/dialog` and the dialog machine runs it itself, so this row is the
      standalone component only
- [ ] format
      `FormatNumber` / `FormatByte` over `Intl`. No machine, no recipe. Pays
      `download-trigger.mdx`'s `### File Size` section, dropped there because `FormatByte` is its
      whole subject
- [ ] highlight
      Over `@zag-js/highlight-word`. Plus `useHighlight`

## Not ported (5)

- color-mode — relocated
      **A divergence, flagged rather than absorbed** (`decisions-ledger.md` **D-134**, reversing D-38). Chakra ships colour mode as a CLI snippet over `next-themes`, which has no SolidJS equivalent — porting that faithfully ships a wrapper around nothing. **No provider**: a pre-paint script, a module-level signal, `.light`/`.dark` plus `color-scheme` on the root. Documented on `/docs/styling/dark-mode`, not in the component tier
- environment — relocated
      The context lives in `@chakra-ui-solid/core` and is re-exported from `components/environment` so Chakra's import path resolves. Not a component
- locale — relocated
      Same. Plus `useFilter`, which is `createFilter` from `@zag-js/i18n-utils` — the same MIT package we already take `isRTL` from. No machine
- for / show — excluded
      Solid has `<For>` and `<Show>`; a re-export would be a wrapper around nothing
- portal — excluded
      `@solidjs/web` ships `<Portal>`; a re-export would be a wrapper around nothing, the same
      reason `for / show` is here. The `dialog` ship measured the half that was in doubt: the
      **server** version does not throw, it renders nothing, returns `undefined` and consumes
      exactly one hydration child id — the same number its client counterpart consumes — so no `_hk`
      after a portal shifts between the two builds. That closes the environment-aware mount and the
      SSR guard this row used to specify, and `disabled` was already decided out (§5.1)
