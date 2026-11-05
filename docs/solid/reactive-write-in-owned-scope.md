# REACTIVE_WRITE_IN_OWNED_SCOPE

Solid 2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` when a descendant writes a signal owned by an ancestor scope from its own synchronous render body. The same applies to a synchronous signal write inside a `createRoot` callback.

Typical case: `Title` and `Description` register their ids into the Root's context so `Content` can set `aria-labelledby`.

## Fix

- Defer the write with `onSettled`, or hoist it out of the owned scope.
- Never silence it. `mount()` exists to surface it.
- Solid throws it, so it already fails a test; it is watched separately only where Solid swallows the throw. Raised inside an effect, it comes back as `console.error(err)` with an `Error` object, not a string.

## Re-check outside a Portal

Deferral is safe when the writing components only render inside a Portal-guarded subtree, which never renders on the server: there is no server value for a later client-only write to disagree with. A cross-scope write outside such a subtree needs that reasoning redone, not inherited.
