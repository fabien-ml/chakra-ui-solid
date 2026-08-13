# SolidJS 2.0 — props, slots and SSR

The caveats behind CLAUDE.md's *second hazard*, *third hazard* and *Every component server-renders*,
with the procedures and the measurements. Ported from hope-ui's `__internal__/solid-2.0-notes.md`
(same author, MIT) and re-checked against this code; the `children()` procedure and the compiler
notes lived in `decisions.md` until 2026-08-12 and moved here, so one file carries the Solid
semantics end to end.

We are on `2.0.0-rc.0`, pinned in lockstep across `solid-js` / `@solidjs/signals` / `@solidjs/web`
by the workspace catalog.

**Nothing in this file changed at the rc**, and that was measured rather than assumed: the rc's
`.d.ts` for `merge`, `omit`, `children()` and the flow controls are identical to `2.0.0-beta.32`'s,
`merge({ type: "button" }, { type: undefined }).type` still answers `undefined`, and every contract
test below passed unedited. The rc's additions — `loadingValue` and `seedLoadingValue` (a declared
commit #0, so a first flight serves a placeholder instead of suspending) and `transparent` (an
effect or memo that consumes no hydration id) — are new options on primitives this port does not
use. The one behavior change that *did* cost a day is not Solid's at all; it is the compiler's, and
it is in *SSR, hydration keys, and the compiler* below. `mergeProps` and `splitProps` are gone from the public API; the 2.0 idiom
is `merge` and `omit`, imported from `solid-js`.

## `merge` resolves a key by presence, not by value — never use it to apply a default

`merge({ modal: true }, props)` looks like a default and is not. A later source wins as soon as it
**has the key at all**, `undefined` included:

```ts
// @solidjs/signals 2.0.0-rc.0, store/utils.js — unchanged since 2.0.0-beta.32
get(key) {
  for (let i = sources.length - 1; i >= 0; i--) {
    const source = resolveSource(sources[i]);
    if (key in source) return source[key];   // ← `in`, not `!== undefined`
  }
}
```

So `<Loader>` (key absent) gets the default and `<Loader display={props.display}>` with `display`
unset gets `undefined` — and the Loader grows a box it is defined not to have. The same shape turned
`merge({ type: "button" }, …)` into a form-submitting Button. **Forwarding an optional prop from a
wrapper is the most ordinary thing a consumer writes, and it hits the broken case every time.**

`withDefaults(props, { … })` from `@chakra-ui-solid/core` resolves each defaulted key with `??`
instead: only a present *and* non-nullish value overrides, an explicit `false` or `0` still wins, and
the defaults stay lazy getters so a signal-backed prop keeps reacting. Pinned in
`utils/__tests__/defaults.test.ts`; the `in` semantics above are pinned in `solid-contract.test.ts`,
*merge resolves a key by presence, not by value*.

**This is parity, not a divergence — for most of them.** Chakra writes its per-component defaults as
*destructuring* defaults (`visible = true`, `align = "center"`, `direction = "column"`,
`loading = false`), and a destructuring default fires on `undefined`. `withDefaults` is that
semantics; Solid's `merge` is not. The exceptions are the two Chakra spells as a JSX attribute before
its spread — Button's `type="button"` and Loader's `display="contents"` — where React drops the
default on an explicit `undefined` just as `merge` does. Those two are ours by decision: the value
each prop's own `@default` claims, honoured on the call a wrapper actually makes.

Two mergers in this repo are deliberately value-based and are not affected: `withDefaults`, and
`zag/merge-props.ts`'s `lastDefinedValue`, which is what a machine part's prop bag resolves through.

## Merged props are the source of truth — never read raw `props` again

`withDefaults` **copies nothing**. It returns a new object exposing `props[key] ?? defaults[key]` as
getters, so the default lives nowhere but that returned object and the raw `props` is untouched.
`omit(props, …)` drops every default; `omit(merged, …)` carries them.

```ts
const merged = withDefaults(props, { visible: true });
omit(merged, "visible")   // ✅  the rest of the bag, defaults intact
omit(props, "visible")    // ❌  silently the undefaulted bag
```

Merge once at the top, then feed **that** object to every downstream operation — `omit`, `{...spread}`,
computed getters, the recipe's variant bag, `as`/`render`. This is the presence-vs-value trap
re-created one layer up and it is just as silent: no type error, and no test failure unless a test
exercises the prop-omitted path.

The measured case here was `factory.tsx`, which applied `defaultProps` inline in an argument and
never bound the result, then read raw `props` three more times — so `defaultProps: { as: "span" }`
did nothing, and a `defaultProps` entry for a *variant* key missed the recipe and landed on the DOM
as an attribute instead. Binding the merge to a name is most of the fix.

## A props context is a default, and takes the same treatment

A `PropsProvider` supplies props a local prop overrides — that is a default with a dynamic key set,
not a precedence chain. `merge(usePropsContext(), props)` loses a `<ButtonGroup size="sm">` to a
`<Button size={props.size}>` whose `size` is unset. Use `withContextDefaults(props, usePropsContext())`.

Chakra's own merge is value-based on exactly this line, so presence semantics here are a port
divergence and not only a hazard:

```ts
// __reference-impl__/chakra-ui/packages/react/src/merge-props.ts:49
result[key] = props[key] !== undefined ? props[key] : result[key]
```

`withContextDefaults` is `withDefaults` with an honest return type: `WithDefaults<Props,
Partial<Props>>` marks *every* key required and non-nullish, which is right for a literal defaults
object and a lie for a context bag.

## An internal computed prop must fall back to the consumer's, not overwrite it

Same root cause, other direction. `merge(props, { get "aria-labelledby"() { return context.titleId(); } })`
puts the internal object **last**, so a getter returning `undefined` erases a consumer-supplied
value. Write the fallback explicitly — `props["aria-labelledby"] ?? context.titleId()` — as `Group`'s
`alignItems`/`justifyContent` getters do. Only props derived from state the consumer does not control
(`aria-modal`, `data-state`) stay component-owned and may overwrite.

## Where a default may live — the five places, and only these

| the default is | it lives in | why not `withDefaults` |
| --- | --- | --- |
| a public prop's value (`visible`, `ratio`, `direction`, `type`) | `withDefaults` at the top of the body | — |
| a recipe variant (`size`, `variant`) | the recipe's `defaultVariants` | restating it drifts on a preset bump |
| a **style prop** (`px="0"`, `borderRadius="9999px"`) | a JSX attribute before the spread, or `css.raw` | Panda extracts JSX attributes and `css.raw` calls, never an object literal inside a function call — moving it silently deletes the rule |
| a JSX-valued slot (`spinner`, `children`) | `children(() => props.spinner ?? <Spinner />)` | `withDefaults`'s `defaults` object is built **eagerly**, so it would construct the component on every render |
| the tag a polymorphic `as` falls back to | `merged.as ?? "div"` at the `renderStyled` call | `renderStyled` strips `as` before the element sees it, so a merged default would allocate for a single read. Five components spell it this way; keep it |
| props for a whole subtree | a `PropsProvider` | that is the consumer's default, not ours |

Row three is the one that leaves a real gap, and it is **open by decision**: `Circle`'s
`borderRadius="9999px"` and `IconButton`'s `px="0" py="0" _icon={…}` still lose their defaults to a
forwarded `undefined`. Closing them costs either a `staticCss` entry per value or a move to the `css`
seam, which reverses precedence against a consumer's own `css` prop. Whoever needs it closed should
price both; until then the gap is confined to style props on purpose, because a style prop is the one
kind of default whose failure is *visible* — the element renders unstyled.

Anything else that is not a style prop moves: `CloseButton`'s `variant="ghost"` and
`aria-label="Close"` did, and `HStack`/`VStack`'s `align="center"` did, because the preset's
`staticCss` already carries every `alignItems` keyword and every recipe variant value.

## Naming

`const merged = withDefaults(props, { … })`. The parameter stays `props`, so a diff shows plainly
which object each read goes to; `loaderProps` / `componentProps` renames of the raw bag hide it.

## A JSX-valued prop read twice is built twice — the `children()` procedure

**A JSX-element *prop* compiles to a lazy getter that runs `createComponent` on every read.** Not a
value: a getter. So a `spinner={<MySpinner />}` read in two places builds `MySpinner` twice and
throws one away, along with whatever state it set up. The trigger is exactly **read more than once
in one render** — almost always a flow-control gate plus its body:

```tsx
<Match when={props.text}>…{props.text}…</Match>   // two builds, one discarded
```

Resolve once with `children()` and read the accessor everywhere, **default inside the call**:

```tsx
const spinner = children(() => props.spinner ?? <Spinner size="inherit" />);
// gate and body now both read the memo
<Match when={spinner()}>…{spinner()}…</Match>
```

`children()`'s memo is lazy, so an unselected branch builds nothing — which is also why the default
belongs there and **not** in `withDefaults`, whose `defaults` object literal is constructed eagerly
on every call. Module scope is not the alternative either: JSX there runs at import time and 500s
the SSR route.

**A slot read exactly once needs nothing** — inside a `<Show>` or not — and neither does a
directly-written child (`<Button><Icon /></Button>`), which the compiler creates once as a value.
Only props are getters. `Switch` reads only the selected branch's children, so a `props.children`
appearing in three `<Match>` bodies is still one read. A reflexive `children()` on a single read
only adds a memo and relocates the subtree's hydration key, so it is a cost with no return.

**Why it needs writing down:** the discarded build is invisible to every other assertion. Same
markup, same geometry, same computed styles, green suite. Measured in `loader.tsx` on 2026-08-12 —
raw reads built both slots exactly twice — which is why any multi-read slot also owes a
**single-creation test that counts real constructions** (`loader.browser.test.tsx`).

On `@solidjs/web` before `2.0.0-beta.32` the gate read also consumed a hydration key it then
discarded, mis-keying the body node on the client only; beta.32 fixed that axis and leaves this one
untouched. The fix survived `2.0.0-rc.0` — `solid-contract.ssr.test.tsx` is what says so, and it is
the assertion to read first after any Solid bump.

## SSR, hydration keys, and the compiler

`components/__tests__/components.ssr.test.tsx` renders every barrel export once on the server and
asserts its own completeness against that barrel, so a new component is registered there or the suite
is red. It exists for the two failures that take a whole route down rather than one element:
module-scope JSX, and a DOM global read during render (`Element is not defined`).

Hydration round-trips stay per-component, because each costs a `*.ssr-entry.tsx` and a row in
`HYDRATION_ENTRIES` (`vitest-hydration-bridge.ts`); `box`, `loader` and `button` carry one. Add one
when a component's tree is conditional or resolves a slot through `children()`. `check:ssr-coverage`
enforces the wiring both ways: registry and fixture files agree, every registered id is really
hydrated, every `*.ssr.test.tsx` really renders.

- **Both sides must make the same calls in the same order.** An `if (!isServer)` *around* a
  `createRenderEffect` shifts every hydration key after it — which is how `Group` was silently
  unhydratable until Button's fixture put one inside it. Put the guard **inside** the compute; only
  what the two sides *read* may differ.
- **A `Portal` must never render during SSR** — `@solidjs/web`'s throws rather than degrading. Guard
  with a plain `if (isServer) return props.children`, not `<Show>`: no reactive branch to allocate.
- **A static child beside a dynamic sibling inside a restrictive content model (`<select>`,
  `<table>`) crashes the non-hydratable compile** — closing tags are omitted unless `hydratable`, and
  the walk throws on `null`. Make those children one dynamic expression. Reaches `select`,
  `combobox`, `listbox`.
- **Three phases are strict-read, not one:** a component render body, a `<For>`/repeat callback, and
  an effect's second callback. The repeat callback is where the repeated part (shape E) lands, so a
  `mount()` diagnostic there is a genuine defect, never a missing `untrack`. Solid 1.x has neither
  strict-read nor `REACTIVE_WRITE_IN_OWNED_SCOPE`, so no upstream suite can see any of it.
- **A call expression in a JSX spread becomes a memo.** `<Group {...omit(props, …)} />` is wrapped by
  the compiler in a function, `merge` turns a function source into a memo, and the receiving
  component reads it in its body — `STRICT_READ_UNTRACKED`, reported against `<Anonymous>`. Bind the
  bag to a `const` first. Live in `ButtonGroup`, `HStack`/`VStack`, `Loader`.
- **`test.environment: "node"` now asks the plugin for Solid's *server* build.** Since
  `@solidjs/vite-plugin@3.0.0-next.24` (the package `vite-plugin-solid` was renamed to) the plugin
  computes `serverTestPosture = isTestMode && (test.environment === "node" || "edge-runtime")` and
  gives such a project Vite's server conditions. Upstream reads `node` as "I want the server
  runtime"; the `unit` project means "no `document` at all", which is a different thing — so it
  silently ran against the server build, where writes land eagerly and `flush(fn)` is inert.
  Thirty-one tests went red across `bindable`, `track`, `mergeProps`, `renderStyled` and
  `withDefaults`, none of them naming resolution. **`resolve.conditions` does not steer this**, in
  either direction; an explicit alias does, which is why `vitest-aliases.ts` now exports
  `clientBuildAlias` beside `serverBuildAlias`. The cheap way to tell which build a project got:
  `Object.keys(await import("solid-js")).length` — 75 is the client, 76 is the server.

## Two more 2.0 facts that touch props

- **A signal write is not visible to a plain read until the next flush — in the *client* build
  only.** `setV(2); v()` returns the old value under the client build (deterministic microtask
  batching) and the new one under the server build, so a test that writes and reads back needs
  `flush(() => setV(2))`. Prototyping in plain `node` resolves the server build and inverts the
  behavior. Live in `defaults.test.ts`.
- **`createSignal(fn)` creates a memo, not a signal holding a function.** 2.0 overloads it, so a
  generic wrapper doing `createSignal(props.defaultValue)` silently invokes a function-typed value
  and stores its return. Box the value in any generic `createSignal<T>` wrapper. Not yet hit here —
  carried because the first controllable-state primitive will meet it.
