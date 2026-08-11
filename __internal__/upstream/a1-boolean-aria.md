<!--
A1 — written at the S2 gate, 2026-08-09, and NOT POSTED (D-109). This is the filing text, ready to
open against `chakra-ui/zag`. Its premise was corrected before it was written: the bug is created by
Solid 2.0's DOM layer, not by 1.x, so it is latent on `main` and live on the `v2` line the moment
Solid 2.0 ships — D-108, and `zag-solid-adapter.md` §8.1's inline correction.

Searched before drafting: no open or closed issue covers it (`is:issue aria solid normalizeProps`
returns only #619 and #397, both unrelated).

The second filing `zag-solid-adapter.md` §8.2 specifies — `ariaHidden` → `suppressOthers` in
`@zag-js/aria-hidden` — is not drafted here and is the older debt of the two.
-->

# `[solid] boolean aria-* props are serialized incorrectly under Solid 2.0`

**Repo:** `chakra-ui/zag` · **Labels:** `bug`, `solid`

---

## Summary

`@zag-js/solid`'s `normalizeProps` passes machine-emitted boolean ARIA values through untouched. That
is correct on Solid 1.x, whose DOM layer stringifies them. It is **not** correct on Solid 2.0, which
changed `setAttribute` to special-case booleans — so every boolean `aria-*` a machine emits comes out
malformed.

The adapter source is byte-identical between `@zag-js/solid@1.43.0` and `@zag-js/solid@2.0.0-next.1`,
and both declare `"solid-js": ">=1.1.3"`, which admits 2.x. So this reaches a consumer with no peer
warning and no change on Zag's side — they just move Solid up.

## Where it comes from

`packages/frameworks/solid/src/normalize-props.ts` has a rule for `readOnly === false` and no rule
for `aria-*`:

```ts
if (key === "readOnly" && value === false) {
  continue
}
// …no aria-* branch: a boolean reaches the DOM layer as a boolean
```

Zag emits ARIA state as real booleans (`aria-expanded: false`, `aria-modal: true`), which is right
for React — its DOM layer stringifies `aria-*`.

## What each Solid major does with that

| | `setAttribute(node, name, value)` | `aria-expanded={false}` | `aria-modal={true}` |
|---|---|---|---|
| `solid-js@1.9.14` (`web/dist/web.js`) | `value == null ? removeAttribute(name) : setAttribute(name, value)` | `aria-expanded="false"` ✅ | `aria-modal="true"` ✅ |
| `@solidjs/web@2.0.0-beta.32` (`dist/web.js`) | `value == null \|\| value === false ? removeAttribute(name) : setAttribute(name, value === true ? "" : value)` | **attribute absent** ❌ | `aria-modal=""` ❌ |

Two distinct failures under 2.0:

- **`true` → `aria-modal=""`.** Not a valid value for an enumerated ARIA attribute. axe raises
  `aria-valid-attr-value`.
- **`false` → no attribute at all.** The state is silently lost: a collapsed trigger has no
  `aria-expanded`, so a screen reader announces it as a plain button.

The server serializer has the same shape — `@solidjs/web@2.0.0-beta.32`'s `ssrAttribute` returns `""`
for `false` and a bare ` aria-modal` for `true`.

## Reproduction

Any machine with boolean ARIA state — `dialog` (`aria-modal`), `accordion` / `collapsible`
(`aria-expanded`), `checkbox` (`aria-checked`). Render it against `@solidjs/web@2.0.0-beta.32`,
inspect the attribute, run axe.

Minimal, no machine needed:

```tsx
// @solidjs/web@2.0.0-beta.32
const el = <button aria-expanded={false} aria-modal={true} />
el.getAttribute("aria-expanded") // null   — expected "false"
el.getAttribute("aria-modal")    // ""     — expected "true"
```

## Why it has not surfaced

Nothing in `@zag-js/solid`'s own tests runs axe, and in the visible case the attribute is
present-but-empty rather than missing.

## Suggested fix — 4 lines, and correct on both majors

Same shape as the existing `readOnly` rule, in `normalizeProps`:

```ts
if (typeof value === "boolean" && key.startsWith("aria-")) {
  normalized[key] = String(value)
  continue
}
```

On 1.x this is a no-op in effect (the DOM was already coercing); on 2.0 it is the fix.

## Regression tests, if useful

Two cases that drop into the existing bench with no Solid 2.0 dependency:

- *"stringifies boolean `aria-*` values, in both directions"*
- *"leaves non-`aria-` booleans and non-boolean `aria-` values alone"*

Happy to open a PR with the fix and both tests.
