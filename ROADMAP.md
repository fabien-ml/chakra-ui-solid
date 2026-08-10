# Roadmap

v0.1.0 is the whole port: 111 components. 20 done.

## Done, per component

1. Source + export from the package index and a subpath.
2. `pnpm typecheck` passes.
3. One browser test asserting a **computed style** — never a class name. A Panda class whose CSS
   was never generated renders nothing and raises no error, so a class-name assertion passes on a
   completely unstyled element.
4. A `staticCss` entry or a CSS custom property (`style={{ "--w": w }}` with `w="var(--w)"`) for any
   value Panda cannot extract statically.

Three files per component: `name.tsx`, `index.ts`, `__tests__/name.browser.test.tsx`.

## Reading a row

`name — machine · recipe · anatomy parts/recipe slots · presence · CIJ`, each omitted when it does
not apply. **Recipe**: `S:key` slot recipe, `A:key` atomic, `✗key` a key with no recipe anywhere —
that component is unstyled by key in Chakra too, and a faithful port reproduces that.
**Presence**: `Z` a `@zag-js/presence` instance, `M` machine-owned visibility, `D` `Z` plus Chakra
defaulting `lazyMount`/`unmountOnExit` to true. **CIJ** marks where Chakra feeds a render-time value
into the style system, so no `staticCss` declaration can pre-generate the class: `●` unbounded, use
a CSS custom property; `○` bounded to a finite set, one `staticCss` declaration closes it. The nine
marked rows are the only ones — everything else resolves statically.

**⚠ carries a recorded trap — read [DECISIONS.md](DECISIONS.md) before starting that row.** Other
per-component notes (duplicate slots, part-count mismatches) are at
`git show 6613a4e:__internal__/roadmap.md` §4.

## Machine components (45)

- [ ] accordion — S:accordion · 5/6 · M
- [ ] action-bar — popover · S:actionBar · 10/5 · D
- [ ] avatar — S:avatar · 3/3
- [ ] carousel — S:carousel · 10/11
- [ ] checkbox — S:checkbox · 4/5
- [ ] checkbox-card — checkbox · S:checkboxCard · 4/7
- [ ] clipboard — ✗clipboard · 6/—
- [ ] code-block — clipboard · S:codeBlock · 6/14
- [ ] collapsible — S:collapsible · 4/4 · M
- [ ] color-picker — S:colorPicker · 24/26 · Z
- [ ] combobox — S:combobox · 14/16 · Z ⚠
- [ ] date-picker — S:datePicker · 24/26 · Z
- [ ] dialog — S:dialog · 7/10 · D ⚠
- [ ] drawer — dialog · S:drawer · 7/10 · D ⚠
- [ ] editable — S:editable · 9/10 ⚠
- [ ] file-upload — S:fileUpload · 12/15
- [ ] floating-panel — S:floatingPanel · 11/11 · D ⚠
- [ ] hover-card — S:hoverCard · 5/5 · Z
- [ ] listbox — S:listbox · 10/11 ⚠
- [ ] marquee — S:marquee · 5/5
- [ ] menu — S:menu · 14/15 · D
- [ ] number-input — S:numberInput · 8/8
- [ ] pagination — ✗pagination · 7/—
- [ ] pin-input — S:pinInput · 4/4
- [ ] popover — S:popover · 10/13 · Z ⚠
- [ ] presence — Z
- [ ] progress — S:progress · 9/9
- [ ] progress-circle — progress · S:progressCircle · 9/9
- [ ] qr-code — S:qrCode · 5/5
- [ ] radio-group — S:radioGroup · 6/8
- [ ] radio-card — radio-group · S:radioCard · 6/10
- [ ] rating-group — S:ratingGroup · 4/5
- [ ] scroll-area — S:scrollArea · 6/6
- [ ] segment-group — radio-group · S:segmentGroup · 6/6
- [ ] select — S:select · 15/16 · Z ⚠
- [ ] slider — S:slider · 10/12
- [ ] splitter — S:splitter · 4/5 ⚠
- [ ] steps — S:steps · 10/12
- [ ] switch — S:swittch · 4/5
- [ ] tabs — S:tabs · 5/6 · Z
- [ ] tags-input — S:tagsInput · 10/10
- [ ] toast — S:toast · 6/6
- [ ] toggle — ✗toggle · 2/—
- [ ] tooltip — S:tooltip · 5/5 · D
- [ ] tree-view — S:treeView · 15/15

## Multi-part, no machine (15)

- [ ] field — S:field · —/8
- [ ] fieldset — S:fieldset · —/5
- [ ] native-select — S:nativeSelect · —/3
- [ ] alert — S:alert · —/5
- [ ] blockquote — S:blockquote · —/4
- [ ] breadcrumb — S:breadcrumb · —/7
- [ ] card — S:card · —/6
- [ ] data-list — S:dataList · —/4
- [ ] empty-state — S:emptyState · —/5
- [ ] list — S:list · —/3
- [ ] stat — S:stat · —/6
- [ ] status — S:status · —/2
- [ ] table — S:table · —/8
- [ ] tag — S:tag · —/5
- [ ] timeline — S:timeline · —/8

## Atomic-recipe components (21)

- [ ] badge — A:badge · —/1
- [ ] button — A:button · —/1
- [ ] checkmark — A:checkmark · —/1
- [ ] code — A:code · —/1
- [ ] color-swatch — A:colorSwatch · —/1
- [ ] container — ✗container · —/1
- [ ] download-trigger — ✗downloadTrigger · —/1
- [ ] heading — A:heading · —/1
- [ ] icon — A:icon · —/1
- [ ] input — A:input · —/1
- [ ] input-addon — A:inputAddon · —/1
- [ ] kbd — A:kbd · —/1
- [ ] link — A:link · —/1
- [ ] mark — A:mark · —/1
- [ ] radiomark — A:radiomark · —/1
- [ ] separator — A:separator · —/1
- [ ] skeleton — A:skeleton · —/1
- [ ] skip-nav — A:skipNavLink · —/1
- [ ] spinner — A:spinner · —/1
- [ ] text — ✗text · —/1
- [ ] textarea — A:textarea · —/1

## Styled primitives and layout (25)

- [x] absolute-center
- [x] aspect-ratio — ●
- [x] bleed — ○
- [x] box
- [x] center
- [x] circle — ○
- [x] em
- [x] flex — ○
- [x] float — ●
- [x] grid — ●
- [x] group
- [ ] image
- [ ] input-element
- [ ] input-group — ●
- [ ] loader
- [x] quote
- [x] simple-grid — ●
- [x] spacer
- [x] span
- [x] square — ○
- [ ] stack
- [x] sticky
- [x] strong
- [x] visually-hidden
- [x] wrap

## Utilities, providers and re-exports (9)

- [ ] portal
- [ ] client-only
- [ ] focus-trap
- [ ] format
- [ ] highlight

## Not ported (4)

- color-mode — relocated
- environment — relocated
- locale — relocated
- for / show — excluded

`color-mode`, `environment` and `locale` are relocated: the primitive lives in
`@chakra-ui-solid/system` and `packages/components` re-exports it so Chakra's import path resolves.
`for` and `show` are excluded — Solid has `<For>` and `<Show>`.
