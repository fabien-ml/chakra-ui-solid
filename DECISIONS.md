# Settled

Decisions that exist nowhere else. Anything already enforced by a check, a test, or a code comment
is not repeated here. Full reasoning: `git show 6613a4e:__internal__/decisions/`.

## Component shape

- **One `sva` call per Root**, exposing a per-slot class map through context; part components read
  their slot from it. Not resolved per part.
- **Part components do not strip `id`.** A consumer `id` reaches the element, last-wins; the Root's
  `ids` prop is the documented override. Ark and Chakra both forward it.
- **Four part shapes (A–D).** The fifth — the *repeated* part (rows, cells, carousel indicators) —
  is not invented until the first component that has one. Accordion settles it.
- **`composeEventHandlers` is for part shapes C and D only.** A machine part never calls it; the
  machine's own prop getter already composes.
- **`RootProvider`, `PropsProvider` and `Context` ship with each component**, in its batch, never as
  a later sweep. 41 / 47 / 43 components carry them respectively. Not behind a `./hooks` subpath —
  Chakra exports them per component.

## Presence

- **Presence is a build over the `@zag-js/presence` machine**, consumed through our own adapter. Not
  a hand-written `createPresence`.
- **It lives in `@chakra-ui-solid/system`**, so `system` gains a dependency on `zag-solid` — that
  edge does not exist yet and arrives with presence, at step 5.
- **Two families, and the render strategy must be source-agnostic.** Family `Z` takes `present` from
  a `@zag-js/presence` instance. Family `M` — `collapsible` and `accordion` — takes it from the
  collapsible machine's own `visible`. Writing B2 as if presence always comes from an instance is
  the mistake this exists to prevent.
- **`lazyMount`, `unmountOnExit`, `skipAnimationOnMount`, `hideMode`, the `data-state` + `hidden`
  prop getter, and the gate that renders `null`** all live in `system`, not beside the first
  component that needs them.

## Colour mode — we ship a primitive

A deliberate divergence from Chakra, flagged not absorbed. Chakra ships a CLI snippet over
`next-themes`; that has no SolidJS equivalent, so porting it faithfully ships a wrapper around
nothing.

**Build what `next-themes` would have given you, without the provider**: a blocking pre-paint
`<head>` script, a module-level signal, `.light`/`.dark` on the root, `color-scheme` beside it. The
source of truth is the DOM class plus storage, so a provider would only re-publish what the document
already says. Lives in `system`, re-exported from `components/color-mode`, documented on
`/docs/styling/dark-mode`.

Four requirements, each from measuring hope-ui's version fail:

| # | hope-ui did | Why it breaks here |
|---|---|---|
| 1 | Toggled only `.dark` | Our preset gives semantic colours **no base value** — "no class" is a colourless page, not a light one |
| 2 | Applied stored preference after mount | Flashes from *no colours*, not from the wrong ones |
| 3 | No `color-scheme` on root | Native controls and scrollbars stay light in dark mode |
| 4 | No cross-tab sync | Two tabs disagree after one toggles |

Measured in a real browser: `.light` → `rgb(255,255,255)`, `.dark` → `rgb(9,9,11)`, **no class →
`rgba(0,0,0,0)`**. That third value is requirement 1's justification.

Deferred, with reasons: `forcedTheme`, theme lists beyond light/dark/system, a CSP `nonce`, a
`themes` array. `disableTransitionOnChange` takes the Panda route — a `globalCss` rule generated
into the consumer's stylesheet, runtime only setting an attribute on `<html>`. One unprobed
question there: whether `!important` clears Panda's cascade layers.

## Accessibility

- **No upstream contact, ever.** An axe allowance is justified by the port rule in our own repo, not
  by a filed issue. Nothing is reported and nobody is contacted.
- **The a11y baseline is `aria-hidden-focus`, on open-state assertions only** — three components:
  `dialog`, `drawer`, `popover`.
- **The `aria-controls` presence-gated override is ported.** Six Ark components carry it; Chakra
  inherits it. Gated on the collapsible machine's unmounted state.

## Traps in the parity matrix

- **Six components ship with a recipe key that resolves to nothing** — `clipboard`, `pagination`,
  `toggle`, `download-trigger`, `text`, `container`. They are unstyled by key in Chakra too and a
  faithful port reproduces that. `container` is the exception: it needs one recipe body ported from
  `@chakra-ui/react`, which is expression tier and owes attribution.
- **Seven slot recipes duplicate a slot.** Deduplicate before comparing; each duplicated slot must
  emit exactly one class.
- **The 56 slot recipes are not the machine surface.** 34 recipes match a machine of the same name,
  7 reach a machine under a different name, 15 have no machine; 17 machines have no recipe.
- **All 18 atomic recipes** are part of the non-machine surface, not just layout and typography.
- **`Portal` is a standalone component**, used *inside* `Dialog.Root`, not a Dialog part. Its
  `disabled` prop is **not shipped** — omitting it makes passing it a type error, where a
  non-reactive prop that silently ignores changes would not. ~6 lines.

## Build order

- **Popover comes immediately after Dialog and before B1**, to measure the popper seam on one
  component before any volume depends on it.
- **Responsive recipe variants are off by default**, with a three-grain opt-in through
  `chakraConfig({ responsive })`: omitted, `{ button: ["size"] }`, or `["button"]`.
- **`for` and `show` are excluded** — Solid has `<For>` and `<Show>`. Charts is excluded separately;
  it is not a component folder.
