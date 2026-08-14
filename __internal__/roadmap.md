# Roadmap

v0.1.0 is the whole port: 110 components. 36 done. The five under *Not ported* are outside that
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
      `+indicatorGroup`. Hidden native `<select>` → restrictive-content-model hazard. Floating —
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
`field` does and what `fieldset` will.

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
      rendered at 58px — it is a literal JSX attribute before the spread.
      **The slot classes travel through the styling seam, not the field context.** `FieldContextValue`
      is `CreateFieldReturn` and nothing else, so `<Field.Context>` hands a consumer the field alone —
      which is what Chakra's hands them. The Root publishes the class map with `StylesProvider` and
      each part reads its own slot with `useFieldStyles()`.
      **RequiredIndicator owes no `children()`.** Its `fallback` and `children` are read exactly once
      per branch, measured with Button's counting fixture; the counting tests stay in as the proof.
      One inherited axe violation: `errorText` is `fg.error` (`red.500`) at `textStyle: xs`, 3.76:1
      on white and under AA. The React version renders the identical declaration from the identical
      preset token — both wrong the same way, so it ships and the invalid-state test pins exactly
      that one violation.
      Docs: **9 of upstream's 12 example slots**, and three sections dropped. `Textarea` and `Native
      Select` wait on their rows (the example *is* the section); `Horizontal` keeps its section and
      loses its third row, a `Switch`. `Explorer` is www machinery. **`Customization` is dropped too,
      and it sets a precedent**: its snippets are `createSystem` / `fieldSlotRecipe.extend` /
      `@chakra-ui/cli typegen`, the runtime style system this port structurally does not have, and
      rewriting them into Panda config would be invented content. `field` is the first page here
      whose upstream carries one.
      `popover.mdx`'s `### Form` section still waits on `textarea`
- [ ] fieldset — S:fieldset · —/5
      Ark: 115 React lines. `+content`
      **This row owes `field` the inherited `disabled`**, measured on the `field` ship: Ark's
      `useField` opens with `useFieldsetContext()` and resolves `disabled = Boolean(fieldset?.disabled)`
      — a *default*, so a Field's own `disabled` wins and a Field outside any Fieldset is unaffected.
      Shipped `createField` resolves `props.disabled ?? false` and reads no fieldset, because the row
      does not exist; the read is this row's to add, through the non-strict reader
      `createComponentContext` now returns
- [ ] native-select — S:nativeSelect · —/3
      Chakra's anatomy is `createAnatomy("select")` — **the same `data-scope` as `select`**. A hand-written selector that assumes scope uniqueness will match both
      **The only *other* upstream `useFieldContext()` consumer**, and it reads it in its own body
      rather than through an Ark wrapper (`native-select.tsx:59`) — so this row supplies its own
      merge of `getSelectProps()` under the caller's props, the shape `input` now carries
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
      Popover's debt is paid for three examples: `popover-basic`, `-with-sizes` and
      `-with-custom-bg` each carry their trailing `<Input>` again. `popover-with-form` and
      `popover.mdx`'s `### Form` (upstream places it between `### Initial Focus` and `### Custom
      Background`) remain owed to `field` + `textarea`.
      Docs: **5 of upstream's 19 example slots**. 14 blocked — `Helper Text`, `Error Text`,
      `Field`, `Focus and Error Color`, `Floating Label` on `field`; `Element`, `Addon`, `Button`,
      `Character Counter`, `Card Number`, `Clear Button` on the `input-group` family; `Hook Form`
      and `Mask` on third-party React packages, which do not port at all
- [ ] input-addon — A:inputAddon · —/1
      `useRecipe({ key })` directly — verified against the reference on the `input` ship, and it is
      the shape that does **not** port: we have no `useRecipe`, we import the generated recipe
      function. Not `input`'s `createRecipeContext` shape either, since the body splits variant
      props and honours `unstyled` by hand
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
      **Its page needs `responsive: { separator: ["orientation"] }`**, on the `dialog` row's
      measurement: `separator-with-responsive-orientation` writes `orientation={{ base: "vertical",
      sm: "horizontal" }}`, which no default `staticCss` run generates
- [ ] skeleton — A:skeleton · —/1
      Plus `SkeletonCircle`, `SkeletonText`
- [ ] skip-nav — A:skipNavLink · —/1
      `SkipNavLink` + `SkipNavContent`
- [x] spinner — A:spinner · —/1
- [x] text — ✗text · —/1
      Key resolves to nothing in Chakra too; styled by `textStyles` + style props
- [ ] textarea — A:textarea · —/1
      Styles Ark's `Field.Textarea`. `popover.mdx`'s `### Form` section waits on this row plus
      `input` and `field` — the debt is written out on the `input` row.
      **`input`'s shape ports here unchanged**: upstream is the same `createRecipeContext({ key })`
      + `withContext(ArkField.Textarea)`, so this is `withContext("textarea")` plus the field merge
      — and since the `field` ship the context exists to read. `createField` already exposes
      `getTextareaProps()`; this row layers it under the caller's props exactly as `input` does,
      through `useOptionalFieldContext`

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
      `FormatNumber` / `FormatByte` over `Intl`. No machine, no recipe
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
