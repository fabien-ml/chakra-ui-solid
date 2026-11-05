# `onSettled` fires once, untracked

`onSettled` registers a single untracked run. A subscription that must follow a later change never subscribes:

- a subtree that turns `autoresize` on after mount never subscribes, and
- a plain `let element` is assigned after the body registers the effect, so the compute captures `undefined` and nothing re-runs it.

Measured on a textarea: the element grew nothing until the ref became a signal.

Use the split `createEffect(compute, effect)` pair over a ref signal when the element or the flag can arrive after mount.
