# `withDefaults` resolves by value; `merge` resolves by presence

Solid's `merge` resolves a key by presence, so `merge({ modal: true }, props)` loses to a forwarded `modal={undefined}` and the component silently turns non-modal. `withDefaults(props, { ... })` resolves each defaulted key with `??`: only a present, non-nullish value overrides, an explicit `false` or `0` still wins, and the defaults stay lazy getters so a signal-backed prop keeps reacting.

- A component with defaults opens with `const merged = withDefaults(props, { ... })`, and `merged` is the only props object after that. It copies nothing, so `omit(props, ...)` would drop every default.
- Each default owes a forwarded-`undefined` test (`<X prop={undefined} />`).
- A recipe variant is a default too: it lives in the recipe's `defaultVariants`.

The `in` semantics of `merge` are pinned in the contract tests ([0061](0061-solid-contract-tests.md)). Props contexts follow the same rule ([0055](0055-props-context-is-a-default.md)).
