# Settled

Decisions and measured traps that exist nowhere else in this repo. Anything already enforced by a
check, a test, or a code comment is not repeated here. Full reasoning:
`git show 6613a4e:__internal__/`.

## The merged bag meets style props — read this before the first machine part

**A machine-emitted key that is also a style-prop name is swallowed into a class, silently.**
`renderStyled` partitions style props out of `Object.keys(props)` over *whatever bag it is handed*.
Every component so far passes a **consumer** bag, so it is safe. A machine part passes the
**merged** bag, which carries the machine's own DOM attributes.

The measured case: `editable`'s `getInputProps()` emits a top-level `size: 1` — the attribute that
makes the input auto-resize (`__reference-impl__/zag/packages/machines/editable/src/editable.connect.ts:113`).
`size` is a style prop here by construction, so the bag becomes `css({ size: 1 })`, the attribute
never reaches the `<input>`, autoresize dies, and a class-name assertion still passes.

The `html*` renames do not help — `htmlSize` is a *consumer* prop and the machine writes bare
`size`. Fix at the part, with the seam `renderStyled` already has:

```ts
forwardProp: (key, isStyleProp) => key === "size" || !isStyleProp
```

`{ size }` is the whole measured intersection between `connect()` keys and `isCssProperty` today —
and "no other key collides" was never proven. Chakra is immune structurally, not deliberately: it
layers `chakra(ArkDialog.Content)`, so its factory only ever sees consumer props. Our layering is
flat, one component doing both jobs.

## The Root of a machine component

- **A Root renders no host element** — providers only, like Chakra's `withRootProvider(ArkDialog.Root)`.
  A wrapper `<div>` shifts every `_hk` hydration key after it in the *consumer's* markup.
- **Four things a Root injects**: `id` (`props.id ?? createUniqueId()` — part ids are
  `dialog:${scope.id}:<part>` and must survive SSR→hydrate), `dir` from locale, `getRootNode` from
  environment, then its own props — `<machine>.props.ts` minus those, narrowed to Chakra's surface.
- **A Root defaults behavior, never variants.** `{ unmountOnExit: true, lazyMount: true }` goes in
  `withDefaults`; the recipe's `defaultVariants` owns the rest, and restating one drifts on a bump.

## Part components

- **One `sva` call per Root**, exposing a per-slot class map through context; part components read
  their slot from it. Not resolved per part.
- **Anatomy and the recipe's slot list are different sets, neither containing the other.** Every
  machine part gets a part component — a missing one drops an ARIA relationship the machine emits;
  a slot with no machine part is shape C; a component with neither is shape D.
- **Merge order is machine → presence → consumer.** Presence is second on purpose: its `hidden` and
  `data-state` must beat the machine's while the exit animation runs.
- **Handler order is machine-first, consumer-second**, and Zag's handlers open with
  `if (event.defaultPrevented) return`, so a consumer cannot cancel one. Changing that is a divergence.
- **We write no `data-*` attributes.** They come from `connect()`, and the preset's `_open`/`_checked`
  conditions are written against those. `data-slot` is hope-ui's invention and appears **zero** times
  in Chakra — one vocabulary: the slot class from `createSlotClasses`, plus the machine's `data-part`.
  Never add a translation getter speculatively; an unnecessary one is invisible.
- **Part components do not strip `id`.** A consumer `id` reaches the element, last-wins; the Root's
  `ids` prop is the documented override. Ark and Chakra both forward it.
- **Four part shapes (A–D).** The fifth — the *repeated* part (rows, cells, carousel indicators) —
  is not invented until the first component that has one. Accordion settles it.
- **`Children.toArray` + `cloneElement` becomes `children()` plus a render effect that writes onto
  the resolved nodes.** Solid cannot clone: by the time a parent sees a child it is a constructed
  DOM node. Settled on Group, whose `data-first`/`data-last`/`data-between` and `--group-index` are
  written that way, leaving Chakra's selectors untouched. **The cost is SSR** — server markup
  carries none of it until the client takes over. That covers *decorating* a child.
- **Injecting styles into a passed-in child is context, and the child must be a COMPONENT.** Settled
  on Stack's separator, both halves measured. *Styles*: `StackSeparator` reads the direction off a
  `StackDirectionContext` and computes its own class, so unlike the decorate route this one costs no
  SSR — and the separators must be built inside the provider, since Solid resolves context through
  the owner that created a component. *Repetition*: `separator={<X />}` yields a fresh node per read
  because Solid compiles JSX in a prop position to a getter, but `const sep = <X />` yields **one**,
  and inserting one node N−1 times moves it — a single separator at the last gap, silently. So the
  prop takes a component (`separator={StackSeparator}`), which makes the element spelling a type
  error. The value a repeated part carries (Chakra's separator margins are the `gap` prop) has no
  rule in anyone's sheet: Stack keeps the flex `gap` on instead, same geometry, measured not assumed.
- **`composeEventHandlers` is for part shapes C and D only.** A machine part never calls it; the
  machine's own prop getter already composes.
- **`RootProvider`, `PropsProvider` and `Context` ship with each component**, in its batch, never as
  a later sweep. 41 / 47 / 43 components carry them respectively. Not behind a `./hooks` subpath.

## Two writers on one `style` attribute — unmeasured, and it gates Popover

**`@zag-js/popper` writes `--z-index` imperatively into the floating element's `style` attribute
inside a `raf`; the dismissable layer writes `--layer-index` the same way and watches the stack with
a `MutationObserver` — while Solid binds that same attribute reactively.** Two writers on one
attribute, one observing the other.

Nobody has measured it, and it cannot have been: hope-ui's Panda branch and its Zag branch never
coexisted in one tree, so **no Zag machine has ever rendered through a Panda recipe in this
lineage**. Nine components inherit whatever it costs. **FloatingPanel is not one of them** — it
positions itself without popper, so measuring Popover does not cover it.

```bash
sed -n '145,150p;180,205p' __reference-impl__/zag/packages/utilities/dismissable/src/layer-stack.ts
```

This is why Popover comes immediately after Dialog and before volume.

## Presence

- **Presence is a build over the `@zag-js/presence` machine**, consumed through our own adapter. Not
  a hand-written `createPresence`. It lives in `@chakra-ui-solid/system`, so `system` gains a
  dependency on `zag-solid` — that edge arrives with presence, at step 5.
- **Two families, and the render strategy must be source-agnostic.** Family `Z` takes `present` from
  a `@zag-js/presence` instance. Family `M` — `collapsible` and `accordion` — takes it from the
  collapsible machine's own `visible`. Writing B2 as if presence always comes from an instance is
  the mistake this exists to prevent.
- **One presence per independently-mounted subtree, created on the Root — never inside the part it
  gates.** One created inside a lazily-mounted `Content` sees `present` already true on its first
  run and latches to "entered", skipping the enter animation. A backdrop owns its own, but reads the
  Root's render strategy — which must be a stable object with reactive getters, since a getter
  returning a fresh object rebuilds that presence on every read.
- **`data-state` in the presence prop getter reads the `present` PROP, not the machine's `present()`.**
  While closing, the prop is already false and the machine is still `unmountSuspended`; reading the
  machine flips `data-state` only after the exit animation it should have started has finished.
- **`hideMode` is NOT shipped.** Ark's `"activity"` renders children inside React 19's `<Activity>`;
  Solid has no equivalent and Ark's own Solid package omits the prop. `display-none` only — the gate
  is a plain `<Show>`, and there is no `PresenceGate` component to write. A parity delta to state.
- **Two pieces of Ark's presence exist only because of React.** `wasEverPresent` is a `useRef`
  guarding a re-render — a plain closure variable here; `useEvent(props.onExitComplete)` is a
  stale-closure workaround that deletes outright, because Solid props are already live.
- `lazyMount`, `unmountOnExit`, `skipAnimationOnMount`, the `data-state` + `hidden` prop getter, and
  the gate that renders `null` all live in `system`, not beside the first component that needs them.

## `hidden` vs a recipe's `display`

- **Never strip Zag's `hidden`.** On a presence-gated part presence supplies its own and it wins;
  elsewhere the machine's answer stands. The one legitimate strip is a *delegation* — Ark's
  `AccordionItemContent` drops `hidden` and `data-state` because `Collapsible.Content` supplies both.
  Strip only when you can name the owner.
- **The cell that still fails: a slot with an explicit `display` that carries `hidden` and is mounted
  while closed** (`unmountOnExit={false}`) — the configuration the computed-style test must run in.
  For Dialog that is exactly `content`; `backdrop` sets no `display`, so the UA rule suffices.

## Zag and runtime stylesheets

**Zag injects stylesheets in four places, and one of them ships.** `splitter.dom.ts`'s
`setupGlobalCursor` puts a `<style>` holding `* { cursor: … !important }` in `document.head` for the
duration of a drag — irreducible to an inline style, since only `*` beats every descendant's own
cursor. It was audited and **ships unchanged**: dropping it would remove behavior Chakra has.
`utils/registry.ts` exports the same mechanism; `number-input.dom.ts` and `@zag-js/auto-resize` set
`innerHTML` on a scrubber cursor and a measuring ghost, which are not stylesheets at all.

So `check:no-runtime-css`'s source grep must **never** be pointed at dependencies. On a Zag minor,
diff against these four sites rather than re-adjudicating them.

## Style props outrank the `css` prop

**Chakra's order, and ours since 2026-08-10: `css(recipe, cssProp, styleProps)`.** The escape hatch
is a default a caller overrides per property, not a trump card — `use-resolved-props.ts` ends its
merge with `propStyles` and `css.ts`'s `mergeWith` gives the last argument the property. Chakra's
docs say nothing either way; only the code decides.

Ours read the other way until then, on the belief that a documented escape hatch outranks a prop.
It matters because `css` is also where a layout component parks **its own** shorthand mapping
(`composeCss`), so the inverted order made `<Flex direction="column" flexDirection="row">` answer
`column`. Chakra answers `row`, and reaches it twice by two routes — Flex puts the mapping in `css`
and lets the style prop beat it; Stack writes `flexDirection={direction}` then spreads `{...rest}`
after it. The consumer's own `css` entries still land after the component's, which is all
`composeCss` exists to do.

## Panda's `/patterns` are fair game; only `/jsx` is banned

The ban is on Panda's generated **`/jsx` factory**, which targets Solid 1.x. Its `/patterns`
helpers — `flex.raw`, `grid.raw`, … — are **pure prop → style-object functions**. Reuse them for a
layout component's shorthand mapping; reimplementing `align → alignItems` puts one copy in our
runtime and another in the consumer's extractor. `styled-system/patterns` is already generated
and exported. Worked example, 85 lines: `git -C ../hope-ui show
e9c2f81:packages/components/src/flex/flex.tsx` — `flex.raw(...)` inside a lazy `css` getter,
handed to `renderStyled`, so a consumer's own `css` still spreads last and wins.

**And it is not optional, because a pattern claims the JSX NAME.** Panda's `jsxName` defaults to
`capitalize(patternName)`, with no import required, so `Flex`, `Grid`, `GridItem`, `Wrap`, `Stack`,
`Square`, `Circle`, `Center`, `Spacer`, `Float`, `Bleed`, `AspectRatio`, `Container` and
`VisuallyHidden` are **already** styled tags in a consumer's build. A shorthand's value is a prop,
so it exists in no source file as a style value; the consumer's own `<Flex direction="row">` going
through that pattern is the only thing that puts `flex_row` in their sheet. Reuse it and the two
sides agree by construction.

**Where Chakra's mapping differs from the pattern's, the pattern is actively wrong** — measured,
`packages/components/src/box/__tests__/__fixtures__/consumer`:

| Component | What the consumer's build emits for it |
|---|---|
| `Grid` | pattern props are `columns`/`minChildWidth`/`gap`, so `templateColumns` falls to `…rest`, is not a CSS property, and emits **nothing** |
| `GridItem` | `colSpan` → `span 2` where Chakra's is `span 2/span 2` |
| `Wrap` | no `direction` prop, so it falls through and emits `direction: column` — a real property, meaningless value |
| `Bleed` | two custom properties (`--bleed-x/y`), where Chakra has four edges |
| `VisuallyHidden` | one `srOnly` class, where Chakra has nine declarations |

Those are the rows that take the CSS-custom-property route. **`Float` is the opposite surprise**:
Panda's pattern reproduces Chakra's Float exactly, defaults included, so it needs no route at all.

**Two channels reach a consumer's stylesheet, and a value needs the right one.** The **pattern /
style-prop channel** is their own source, and it is the only one that can carry a prop's value. The
**library channel** is our published files in their `include` — a literal inside `chakra(tag, {…})`
or `css.raw({…})`, which is where a base style, a variant and every `var(…)` rule must live.

**A boolean runtime toggle needs `staticCss`.** `<Flex inline>` flips `display` to `inline-flex`
at runtime and Panda's usage scan cannot see it — pre-generate the rule or the prop silently
does nothing.

**Two ways to write a `staticCss` row that emits nothing.** `["*"]` expands a property's *token*
values, so on a keyword property (`alignItems`, `flexWrap`) it produces zero rules; and several
`properties` keys in **one** entry produce zero rules. One property per entry, values enumerated.

**`pattern.raw()` called with literals is extracted twice.** In a file Panda scans,
`flex.raw({ direction: "row" })` emits `flex-direction: row` **and** `direction: row` — the raw
prop name as a declaration, which no browser parses. This is why `packages/styled-system/
panda.config.ts` excludes node-side tests: that is where an expected class is computed by calling
the runtime.

**An unset `var()` is safe in a longhand and fatal in a shorthand.** `grid-column-start:
var(--unset)` is invalid at computed-value time and falls back to `auto`, exactly as if undeclared.
`grid-area: var(--unset)` resets all four line properties — so a shorthand on the custom-property
route must be applied **conditionally**, never from an always-on base.

**The custom-property route costs the conditional value form**, since an inline style has no
breakpoints. Narrow those props to `PlainCssValue<…>` so a responsive spelling is a type error
rather than a prop that type-checks and does nothing.

**A responsive variant prop type-checks whether or not its rules were generated.**
`size={{ base: "sm", md: "lg" }}` *and* the array spelling `size={["sm", "lg"]}` both satisfy the
generated types (`ConditionalValue<V> = V | Array<V | null> | {…}`), while the CSS comes from the
consumer's config. Forgetting `defineChakraConfig({ responsive })` is a silent unstyling in two spellings,
and the array form is the one no doc page shows.

## SSR and the Solid compiler

- **A `Portal` must never render during SSR** — `@solidjs/web`'s throws rather than degrading. Guard
  with a plain `if (isServer) return props.children`, not `<Show>`: no reactive branch to allocate.
- **A static child beside a dynamic sibling inside a restrictive content model (`<select>`,
  `<table>`) crashes the non-hydratable compile** — closing tags are omitted unless `hydratable`,
  and the walk throws on `null`. Make those children one dynamic expression. Reaches `select`,
  `combobox`, `listbox`.
- **Three phases are strict-read, not one:** a component render body, a `<For>`/repeat callback, and
  an effect's second callback. The repeat callback is where the repeated part (shape E) lands, so a
  `mount()` diagnostic there is a genuine defect, never a missing `untrack`. Solid 1.x has neither
  strict-read nor `REACTIVE_WRITE_IN_OWNED_SCOPE`, so no upstream suite can see any of it.
- **`createRegisteredId` has no call site in a faithful port.** Zag derives part ids from the scope
  and DOM-sniffs them (`checkRenderedElements`, a frame after open) rather than having `Title`
  register upward. A cross-scope write *outside* a Portal-guarded subtree owes fresh reasoning.

## Performance — do not "fix" what is already O(N)

**Fine-grained-ness is per element, not per attribute, so a Zag collection is not slower than a
handmade one.** Measured on 200 rows, one arrow-key move: Zag-backed listbox 400 item prop-set
recomputations, handmade 200 — both O(N), because Solid's `spread` is one effect per *element*
reading all of that element's props. Do not add per-item memoization and do not mirror a collection
into a store. The one real constant (~8,000 prop-getter calls per keystroke) was in our own
`mergeProps` and the lazy `$PROXY` already removed it.

## Colour mode — we ship a primitive

A deliberate divergence from Chakra, flagged not absorbed. Chakra ships a CLI snippet over
`next-themes`; that has no SolidJS equivalent, so porting it faithfully ships a wrapper around
nothing.

**Build what `next-themes` would have given you, without the provider**: a blocking pre-paint
`<head>` script, a module-level signal, `.light`/`.dark` on the root, `color-scheme` beside it. The
source of truth is the DOM class plus storage, so a provider would only re-publish what the document
already says. Lives in `system`, re-exported from `components/color-mode`.

Four requirements, each from measuring hope-ui's version fail:

| # | hope-ui did | Why it breaks here |
|---|---|---|
| 1 | Toggled only `.dark` | Our preset gives semantic colours **no base value** — "no class" is a colourless page, not a light one |
| 2 | Applied stored preference after mount | Flashes from *no colours*, not from the wrong ones |
| 3 | No `color-scheme` on root | Native controls and scrollbars stay light in dark mode |
| 4 | No cross-tab sync | Two tabs disagree after one toggles |

Measured in a real browser: `.light` → `rgb(255,255,255)`, `.dark` → `rgb(9,9,11)`, **no class →
`rgba(0,0,0,0)`**. That third value is requirement 1's justification.

Deferred: `forcedTheme`, theme lists beyond light/dark/system, a CSP `nonce`, a `themes` array.
`disableTransitionOnChange` takes the Panda route — a `globalCss` rule generated into the
consumer's stylesheet, runtime only setting an attribute on `<html>`; unprobed there is whether
`!important` clears Panda's cascade layers.

## Accessibility

- **No upstream contact, ever.** An axe allowance is justified by the port rule in our own repo, not
  by a filed issue. Nothing is reported and nobody is contacted.
- **The a11y baseline is `aria-hidden-focus`, on open-state assertions only** — three components:
  `dialog`, `drawer`, `popover`.
- **The `aria-controls` presence-gated override is ported.** Six Ark components carry it; Chakra
  inherits it. Gated on the collapsible machine's unmounted state.

## Traps in the parity matrix

- **Five components ship with a recipe key that resolves to nothing** — `clipboard`, `pagination`,
  `toggle`, `download-trigger`, `text`. They are unstyled by key in Chakra too and a faithful port
  reproduces that. **`container` was the sixth and no longer is**: its body is ported from
  `@chakra-ui/react`'s theme into the preset, registered in `recipeKeys` so `staticCss`, the jsx
  hint and `defineChakraConfig({ responsive })` all cover it without being told, and its `className` is
  normalized off `chakra-container` because `componentNameFor()` reads the jsx hint out of it.
  **It also warns, in every Panda run including a consumer's** — `[recipes] This recipe name is
  already used in `patterns`` — because `@pandacss/preset-base` has a `container` *pattern* too.
  Measured, benign, and not silenceable without renaming the key Chakra uses: the pattern's
  transform is the recipe's base minus `width: 100%`, both are generated, and the recipe's own
  rules are in both sheets.
- **Seven slot recipes duplicate a slot.** Deduplicate before comparing; each duplicated slot must
  emit exactly one class.
- **Recipes are not the machine surface.** Of 56 slot recipes: 34 match a machine of the same name,
  7 reach one under a different name, 15 have no machine; 17 machines have no recipe. All 18 atomic
  recipes are non-machine too. Chakra reaches **38 of 51** machines — the test is never "the machine
  exists" but "Chakra ships it".
- **A recipe condition can select on a `data-*` pair no machine emits.** The class is in both the
  emittable and the generated set and never matches, so no coverage diff sees it. Only 6 of 56 slot
  recipes were ever spot-checked. `tabs`' `_active` is *not* an example — that is Panda's `:active`
  pseudo-class. Read the machine's `connect()` before assuming a `_condition` has an attribute
  behind it.
- **Chakra's Drawer is Ark's *Dialog* wearing the `drawer` slot recipe.** Zag ships a `drawer`
  machine (10 parts, `grabber`/`swipeArea`) and Ark has a component on it; Chakra 3.36.1 uses
  neither, so `@zag-js/drawer` stays unported — and a future Chakra release adopting Ark's Drawer is
  a machine swap, not a restyle.
- **51 machines, 49 `*.anatomy.ts` exports, 406 parts.** `async-list` and `presence` are headless and
  export none. Re-deriving parts from `createAnatomy(...)`: the first string is the anatomy *name*,
  not a part, and a hyphenated name silently eats a part if the parser fails to drop it.
- **`Portal` is a standalone component**, used *inside* `Dialog.Root`, not a Dialog part. Its
  `disabled` prop is **not shipped** — omitting it makes passing it a type error, where a
  non-reactive prop that silently ignores changes would not. ~6 lines.

## The repository mirrors `packages/react/src`, minus the two tiers Panda replaced

**Settled, not yet executed.** The port covers styling and theming as well as components, and
upstream holds those as *siblings* under `packages/react/src`. Ours put components at the src root
of their own package, which spends the level those siblings need.

```
packages/core/src/{components/<name>,system,hooks,utils}
packages/{styled-system,panda-preset,zag-solid,internal-test-utils}
```

`packages/core`, published as **`@chakra-ui-solid/core`** — one import path, as `@chakra-ui/react`
is. It absorbs today's `packages/system`.

**`styled-system` is Panda's word, not Chakra's**, and getting this backwards is the trap this
paragraph exists to close. `@chakra-ui-solid/styled-system` is Panda's generated output sitting
under Panda's own `outdir` convention, which is why it keeps the name; upstream has a
`src/styled-system/` only because they run their own Emotion serializer instead of Panda. **There
is no second thing called styled-system in this repository and there must not be one.**

**So two of upstream's siblings are deliberately absent, and neither is an oversight.**
`src/styled-system/` is that serializer, and nothing of that machinery is ported (`NOTICE.md`);
what survives it — the factory, `renderStyled`, the recipe seams — is `src/system/`. `src/theme/`
is their token and recipe tables, which we depend on rather than vendor (`CLAUDE.md`), so our
deltas stay in `packages/panda-preset`. Mirroring either name would advertise a parity that does
not exist.

**Two packages cannot fold in**, for a mechanical reason rather than taste:
`@chakra-ui-solid/styled-system` is generated and has to be separately published or the library and
the consumer app hold two `css()` instances; `@chakra-ui-solid/panda-preset` is read by Panda's
config loader under Node's `import` condition and cannot sit in a `solid`-condition package.

**The move is mechanical except for one thing, and that one thing fails silently.** Panda
registers the `chakra` factory only from an import whose module is in `importMap.jsx`. Today our
components import it from `@chakra-ui-solid/system`, which is listed. After the merge that import
becomes relative, matches nothing in the map, and every `chakra()` call in our own source extracts
**zero rules** — with a green build. The answer is a **self-referencing import**: components go on
importing `chakra` from `@chakra-ui-solid/core`, which Node resolves through the package's own
`exports`. Verify it against a real `cssgen` before trusting it.

**Every other site, and the first five are load-bearing** — each fails silently or wrecks the
build rather than erroring usefully:

1. `defineChakraConfig()`'s `importMap.jsx` — consumer-facing. Wrong, and every `<chakra.div>` in
   their app is unstyled.
2. `packages/styled-system/panda.config.ts`'s `importMap` / `include` / `exclude`.
3. `turbo.json`'s `cssgen.inputs` — its own comment says these globs must stay in step with that
   `include`; out of step, a style prop added anywhere is a cache hit and the sheet keeps its
   previous contents.
4. `apps/docs/vite.config.ts`'s `optimizeDeps.exclude` / `ssr.noExternal` — a stale name there
   hands the docs app a runtime that is not Solid.
5. `attribution.config.ts` (`package: "system"` → `"core"`) plus the root and package
   `NOTICE.md` rows for `factory.tsx`, and `packages/system/{LICENSE,NOTICE.md}` move with it.

Then the mechanical ones: `tsconfig.base.json#paths`, `vitest-aliases.ts`, `repo-shape.test.mjs`
(`packages/core/src/components/*`, and the component name moves to `split("/")[4]`),
`scripts/generate-props-tables.mjs`'s `componentsSrc`, the 22 `chakraUiSolid.entries`, both
`tsconfig.json#include`s, `apps/docs/package.json`'s dependency and its imports, and the package
list in `README.md`. Published subpaths do not change: an entry *key* is the subpath, not the
source path.

**Do it before the docs pages**, whose frontmatter carries `links.source: packages/components/src/…`
per page.

## Build order

- **Popover comes immediately after Dialog and before B1**, to measure the popper seam on one
  component before any volume depends on it.
- **Responsive recipe variants are off by default**, with a three-grain opt-in through
  `defineChakraConfig({ responsive })`: omitted, `{ button: ["size"] }`, or `["button"]`.
- **`for` and `show` are excluded** — Solid has `<For>` and `<Show>`. Charts is excluded separately;
  it is not a component folder.
