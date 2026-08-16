# Settled

Decisions and measured traps that exist nowhere else in this repo, plus the long form of the styling
hazard `CLAUDE.md` states as a rule. Anything else already enforced by a check, a test, or a code
comment is not repeated here. Full reasoning: `git show 6613a4e:__internal__/`.

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

## Two writers on one `style` attribute — measured on both halves, and free

**`@zag-js/popper` writes `--z-index` imperatively into the floating element's `style` attribute
inside a `raf`; the dismissable layer writes `--layer-index` the same way and watches the stack with
a `MutationObserver` — while Solid binds that same attribute reactively.** Two writers on one
attribute, one observing the other.

Nobody had measured it, and nobody could have: hope-ui's Panda branch and its Zag branch never
coexisted in one tree, so **no Zag machine had ever rendered through a Panda recipe in this
lineage**. Nine components inherit whatever it costs. **FloatingPanel is not one of them** — it
positions itself without popper, so measuring Popover does not cover it.

**The dismissable half was measured at the `dialog` ship, and it costs nothing.** The layer stack
writes `--layer-index` and `--nested-layer-count` with `setProperty`, and its `MutationObserver` on
`style` rewrites `pointer-events` whenever anything else touches the attribute — including Solid.
The two coexist because **Solid's `style` binding diffs per property against what it last wrote**,
so it only ever removes a key it owns and never sees the imperative ones. Three consequences, all of
which held when Popover re-measured them against popper:

- **Bind `style` as an object, never as a string.** A `cssText` assignment wipes both custom
  properties on every machine update, and the recipe's `z-index: calc(… + var(--layer-index, 0))`
  silently falls back to the base token.
- **The observer wins ties, correctly.** When the machine re-emits the same `pointer-events` value
  Solid already wrote, Solid's diff skips the write and the layer stack's answer stands — which is
  what keeps a dialog below a nested one from taking pointer events.
- **A single layer reads the `var(…, 0)` fallback**, so `--layer-index: 0` is indistinguishable from
  the property being absent. Only a nested pair can tell them apart, which is what Dialog's test
  asserts (1500 and 1501, off the `popover` token).

```bash
sed -n '145,150p;180,205p' __reference-impl__/zag/packages/utilities/dismissable/src/layer-stack.ts
```

This is why Popover came immediately after Dialog and before volume.

**Popper's half was measured at the `popover` ship, and it costs nothing either.** `@zag-js/popper`
writes **eight** custom properties into the positioner's `style` attribute inside a `raf` — `--x`,
`--y`, `--z-index`, `--transform-origin`, `--reference-width/height`, `--available-width/height` —
and the same per-property diff that saved the dismissable half saves these. Measured against three
interleaves in one open window: a consumer's signal-valued `style` on the positioner, the machine
re-emitting its own style object with a key *removed* (`sameWidth` drops `minWidth`, adds `width`),
and an `autoUpdate` pass on a window resize. **A stacked pair reads 1500 on the outer content and
1501 on the inner**, and each positioner takes its own number by `var(--z-index)`.

Three rules for the eight remaining floating components, none enforced by a type:

- **Only the object form of `style` may reach a positioner.** A string binding rewrites the whole
  attribute and erases all eight. Popper does not notice: `zIndexComputed` is a per-identity flag and
  the position writes are guarded by approximate equality, so both believe the attribute is already
  correct.
- **An ordinary update will not resurrect a wipe, but `reposition()` will.** It sends
  `POSITIONING.SET`, whose action builds a whole new `getPlacement` closure with `zIndexComputed`
  back to `false` — proven by deleting `--z-index` and watching it come back. That is the escape
  hatch, and it is the only one; a prop change is not enough, because this machine's `watch` tracks
  `open` alone and `trackPositioning` is an open-state effect that never restarts.
- **Content must stay the positioner's `firstElementChild`.** `--z-index` is a *copy*, taken once per
  floating-element identity off `getComputedStyle(positioner.firstElementChild).zIndex`, which is
  where the recipe puts the number. A wrapper between the two silently unsets it. The arrow is
  resolved the same once-only way, by `querySelector("[data-part=arrow]")`.

**The one order-dependent cell, recorded rather than hidden**: the inner positioner of a nested pair
reads `1501`, stably across a dozen runs, because popper's copy sits behind `await computePosition`
and lands after the layer stack has written `--layer-index: 1`. Were the order to reverse it would
read `1500` under a content reading `1501`, and the two surfaces would still paint in the same order
— they are separate stacking contexts — so the observable stack does not depend on the race.

**`hideWhenDetached` is the one genuine two-writer *property*** (`pointer-events`, written by both
popper and the layer stack's observer). Non-default, deliberately untested, recorded as residue.

## A Zag correction that notifies nothing — and why the fix is ours to make

**Zag's `checkRenderedElements` writes with `Object.assign(context.get("renderedElements"), …)`.** It
mutates the bindable's value in place, notifies no subscriber, and so no memo that reads `connect`
re-runs. The machine's `renderedElements` starts optimistic — `{ title: true, description: true }` —
and that DOM sniff a frame after start is the only thing that corrects it. **Measured on Popover: a
`defaultOpen` root with a Title and no Description kept a dangling `aria-describedby` for its entire
open window**, and only a later transition cleared it.

**This is our defect, not inherited residue**, and the distinction is the point. The React version
ships no such attribute — six popovers on chakra-ui.com, none with a Description, every
`aria-describedby` absent — because React re-renders the root for incidental reasons and any one of
them recomputes `connect`. Nothing gives us one. **Parity is observable behavior; React's re-render
cadence is an implementation artifact and porting it is not available to us**, so a component that
reproduces the cadence's *output* is the faithful port and a component that reproduces its *absence*
is a broken one.

The fix is component-local, in `create-popover.ts`: one `createSignal` the `connect` memo reads, set
from a `requestAnimationFrame` inside `onSettled`. **The ordering is load-bearing** — our `onSettled`
must be registered after `useMachine`'s, so our frame callback queues behind the machine entry
action's and lands after the mutation (`solid-2.0-notes.md`, *`onSettled` registration order*). Three
browser tests cover it: both dangling cases and an over-correction guard, which is the one that
matters — a forced re-read that dropped a *live* IDREF would leave the surface unlabelled, a worse
failure than the dangle.

**The server half is left dangling on purpose.** A server runs no frames and has no DOM to sniff, so
both IDREFs go out optimistically — and React's server render emits exactly the same two, from the
same initial context. Suppressing ours would diverge from the React version and change what hydration
reconciles, to buy nothing a reader can perceive: nothing reads the page before hydration. Pinned by
an assertion in `popover.ssr.test.tsx` so the server half is not later "fixed".

Every machine whose `connect` depends on a bindable Zag mutates in place inherits this shape. Reach
for the same one-frame nudge only with a measurement in hand — the cost is a forced recompute of
`connect` on every instance.

## Presence

- **Presence is a build over the `@zag-js/presence` machine**, consumed through our own adapter. Not
  a hand-written `createPresence`. It lives in `@chakra-ui-solid/core`, alongside the adapter it
  consumes — `core` gains a direct `@zag-js/presence` dependency at step 5.
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
  the gate that renders `null` all live in `core`, not beside the first component that needs them.

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

## Silent unstyling — the three routes, and what breaks each

**A Panda class whose CSS was never generated renders nothing and raises no error.** An unstyled
component and a green suite look identical, which is why this is the hazard the whole styling layer
is arranged around (`plan.md` §0.2 has the long form).

A style value reaches a stylesheet by exactly three routes, and there is no fourth:

1. **Statically extractable** — a literal Panda can read out of the source: a JSX attribute on a
   capitalized component, a `chakra.*` tag, or a `css` / `cva` / `sva` call. **Not** an object
   literal inside any other function call, which is why a style-prop default stays a JSX attribute
   before the spread and cannot move into `withDefaults` (`solid-2.0-notes.md`, the table).
2. **Declared in `staticCss`** — for a value that arrives as a prop and is spelled in no file:
   `display: inline-flex`, the `alignItems` / `justifyContent` keywords, every recipe variant value
   (`staticCss: ["*"]`, 488 of them).
3. **Routed through a CSS custom property** — `style={{ "--w": w }}` with `w="var(--w)"`, for a value
   with no finite set behind it: a track list, an aspect ratio, a grid span.

Two more things the routes do not cover:

- **Static is not resolving.** `mt="4x"` extracts fine and emits `margin-top: 4x`, which no browser
  parses. `check:declaration-support` puts every emitted declaration to a real Chromium.
- **Tests assert computed styles, never class names.** `classList.contains("p_4")` passes on a
  completely unstyled element, so a class-name assertion cannot see this failure at all. The one
  exception is `factory.test.ts`, which asks *which key* produced a class and computes every expected
  value by calling `css()` rather than typing one out.

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
`packages/chakra-ui-solid/src/components/box/__tests__/__fixtures__/consumer`:

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

- **`createRegisteredId` has no call site in a faithful port.** Zag derives part ids from the scope
  and DOM-sniffs them (`checkRenderedElements`, a frame after open) rather than having `Title`
  register upward. A cross-scope write *outside* a Portal-guarded subtree owes fresh reasoning.

The rest of this ground — the `children()` procedure, hydration keys, the `Portal` and `<select>`
crashes, the three strict-read phases — is in `solid-2.0-notes.md`, which carries the Solid
semantics end to end.

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
already says. Lives in `core`, re-exported from `components/color-mode`.

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
  recipes were ever spot-checked. `tabs`' `_active` **is** one, corrected at that row's ship: Panda's
  `_active` is `&:is(:active, [data-active])`, so the `[data-active]` half selects an attribute the
  tabs machine never emits. It is the harmless kind only because the recipe nests the rule inside
  `_disabled`, where the `:active` half cannot fire either — dead CSS upstream rather than a
  translation we owe. Read the machine's `connect()` **and Panda's condition expansion** before
  assuming a `_condition` has an attribute behind it, or that it does not.
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

**Done 2026-08-11, and it lands one package short of the mirror.** The port covers styling and
theming as well as components, and upstream holds those as *siblings* under `packages/react/src`.
Ours put components at the src root of their own package, which spent the level those siblings need.

```
packages/chakra-ui-solid/src/{components/<name>,hooks,utils}
packages/{core,styled-system,panda-preset,internal-test-utils}
```

**The main package is the unscoped `chakra-ui-solid`**, reserved on npm 2026-08-11; the satellites
keep the scope. `@chakra-ui-solid` already names the design system *and* the framework, so a scoped
second segment could only be filler — and owning a scope reserves nothing unscoped, npm keeps the
two in separate namespaces.

**`styled-system` is Panda's word, not Chakra's**, and getting this backwards is the trap this
paragraph exists to close. `@chakra-ui-solid/styled-system` is Panda's generated output under
Panda's own `outdir` convention, which is why it keeps the name. **There is no second thing called
styled-system in this repository and there must not be one** — upstream's `src/styled-system/` is
their Emotion serializer, none of which is ported (`NOTICE.md`); what survives it, the factory,
`renderStyled` and the recipe seams, is `packages/core`. `src/theme/` is their token and recipe
tables, which we depend on rather than vendor (`CLAUDE.md`), so our deltas stay in
`packages/panda-preset`. Mirroring either name would advertise a parity that does not exist.

**Three packages cannot fold in**, mechanically: `@chakra-ui-solid/styled-system` is generated and
must be published separately or library and consumer hold two `css()` instances; `panda-preset` is
read by Panda's config loader under Node's `import` condition, not a `solid`-condition package; and
`core` for the reason the paragraph below measures.

**The reshape:** `packages/components` → `packages/chakra-ui-solid`, components
under `src/components/<name>`; `src/{hooks,utils}` gain the home `create-context`, `merge-props` and
`merge-refs` need before the first machine component. `src/index.ts` arrives with the first of them
— until then the `.` entry is `src/components/index.ts` and a second barrel would hold one line.

**`core` stays a package of its own, and this is settled rather than pending.** Absorbing it was
tried on 2026-08-11 and reverted; the constraint is Panda's extraction model, not tidiness. Panda
registers the `chakra` factory only from an import whose module string is in `importMap.jsx`, so a
relative `../../system` matches nothing and every `chakra()` call in our own source extracts **zero
rules** with a green build — measured, four probe files, one per spelling. The apparent answer is a
**self-referencing import** (`chakra-ui-solid` importing itself, which Node resolves through its own
`exports`), and it does fix extraction. It breaks the **types**: tsdown wipes `dist/` before it
builds, so the declaration generator resolves the self-reference to the `dist/index.d.ts` it is
about to write, gives up, and publishes `declare const Center: any` — 10 components, and only the
docs app's `tsc` against `dist` sees it. A sibling package has no such problem because Turbo's
`^build` writes its declarations first. Upstream imports its factory relatively because Emotion
resolves at runtime and there is no extractor to satisfy; we have one, so **the package boundary is
what buys a factory import that is both extractable and typeable**. Four tsdown/`rolldown-plugin-dts`
levers were tried (`deps.dts.alwaysBundle`, `deps.dts.neverBundle`, `dts.resolver`, `dts.generator`)
and a subpath self-reference fails the build outright. Reopen only if that generator learns to
resolve a self-reference through `tsconfig#paths` instead of through `dist`.

**Published subpaths are keys, never source paths.** A `chakraUiSolid.entries` *key* is the subpath
a consumer imports; only its value moved when components went under `src/components/`. Renaming a
key is the breaking change, and moving a file is not.

**A name lives in more places than a grep for it finds**, and the ones that matter fail silently
rather than erroring: `importMap.jsx` on both sides, `panda.config.ts`'s `include` / `exclude`,
`turbo.json`'s `cssgen.inputs` — which its own comment says must stay in step with that `include` —
and the docs app's `optimizeDeps.exclude` / `ssr.noExternal`. Panda matches an `importMap` entry by
**substring**, so a wrong name can go on working by accident: `@chakra-ui-solid/components` still
matched the entry `chakra-ui-solid`. Never read that as evidence the entry is right.

## Build order

- **Popover comes immediately after Dialog and before B1**, to measure the popper seam on one
  component before any volume depends on it.
- **Responsive recipe variants are off by default**, with a three-grain opt-in through
  `defineChakraConfig({ responsive })`: omitted, `{ button: ["size"] }`, or `["button"]`.
- **`for` and `show` are excluded** — Solid has `<For>` and `<Show>`. Charts is excluded separately;
  it is not a component folder.

## The consumer's system costs the whole recipe barrel — measured on `apps/docs`

`plan.md`'s cost 2, with the number. The generated `chakra-system.ts` reaches the recipes through
`import * as recipes from "./recipes"`, and a namespace import defeats tree-shaking by construction,
so an app that renders three components ships all 75 recipe functions.

Measured on the docs app, one clean `pnpm build:docs` at `033b4a6` (the commit before the plan
landed) against one at phase 6, same content tree, both prerendered:

```
                              raw          gzip -9      recipe modules
before   whole client JS   4,510,269      390,744            39
after    whole client JS   4,615,936      405,728            76
delta                       +105,667      +14,984           +37

before   assets/index-*       97,403       32,119
after    assets/index-*      218,401       55,202
delta                       +120,998      +23,083
```

The app chunk is where the styled-system lives, and it is the honest figure for the cost:
**+121 kB raw, +23 kB gzipped**. The whole-bundle delta is smaller because the same commit rewrote
four content pages and added a fifth, and the MDX chunk lost 18 kB in the process — content churn,
not a saving. `__recipe__` occurrences count the recipe functions that survived bundling: 39 before,
which is the 38 the gate reports for this site plus one, and 76 after, which is all of them.

`plan.md` predicted ~114 kB raw across 153 modules and 12–15 kB gzipped. Raw is within 6% of that;
gzipped is roughly half again as much as the top of the predicted range, because the recipe bodies
share fewer strings with the rest of the chunk than the prediction assumed.

**Accepted, not owed.** Every React consumer on `defaultSystem` ships all 75 as full style
definitions rather than as names — the "both are wrong the same way" case, so it is expected and
says nothing on a docs page. The improvement that would put us ahead is still available and still
optional: `chakra-system.ts` could re-export named recipes gated by the same import scan
`recipeGatePlugin` already runs, which would take the 76 back down to 39.

## A missing recipe key throws, where the React version renders unstyled

**A divergence, and it stays out of `apps/docs`.** `packages/core/src/recipe/recipe.ts` resolves a
recipe by key off the provider's system and throws when the system has none, naming the key and the
config change that fixes it. Measured at phase 3 against `__reference-impl__`: React's
`getRecipeFn` falls back to `cva({})`, so a recipe deleted from a consumer's config there produces
an element with no theme class and no error — silent unstyling, which is the failure this whole
design exists to remove.

The keys are ours, one per component, so a system missing one is a system that component cannot be
styled by. That is the case the fallback is wrong for, and it is not the case `useRecipe({ key })`
in an app is right for.

The throw is raised twice on purpose — once untracked while the component is being constructed, once
inside the memo. The construction-time throw is the one that matters: left to the memo alone it
would fire inside the element's own computation, after the element exists, and SolidJS answers a
throw there by halting the reactive graph for the whole page (`[REACTIVITY_HALTED]`), which turns a
loud failure into a mute one.

**A missing *slot* is the opposite and is not fixable the same way**: `slots().content` answers
`undefined`, `cx()` drops it, and the part renders with its style props and no theme class. There is
no key to name, because the recipe resolved. `/docs/theming/multiple-systems` says so out loud,
which is the only place any of this reaches a reader.
