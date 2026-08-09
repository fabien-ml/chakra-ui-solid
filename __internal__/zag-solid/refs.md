<!--
Carried from hope-ui `ef91b69`, `__internal__/primitives/zag-solid/refs.md`. Same author, MIT —
ours, forked on copy (`legal.md` §1.6). Every `__internal__/…` path, `CLAUDE.md` reference and
`@hope-ui/*` specifier **below** is hope-ui's at that commit, not this repo's; follow them into
`../hope-ui`. The spike findings they cite (`__internal__/spikes/zag-{dialog,listbox}-findings.md`)
are where the four defects were measured, and `prior-art.md` §6 is this repo's summary of them.
-->

# `createRefs`

A typed, non-reactive key/value box. `useMachine` builds one from `machine.refs?.(…)` and hands
it to every machine callback as `refs`, which is where a machine keeps things that must survive a
transition without driving one — DOM nodes, timer ids, observers.

Part of the vendored `@zag-js/solid@1.42.0` fork — read `machine.md` first. This file has no
`solid-js` import at all and is copied verbatim from upstream.

## API

```ts
function createRefs<T>(refs: T): {
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
};
```

Reads and writes go straight through to one backing object. Nothing is tracked, nothing is
unwrapped: `get` returns exactly what `set` stored, which is what lets a machine hold a callback
in `refs` without it being invoked.

Each call gets its own storage; two `createRefs` over equal seeds do not share.
