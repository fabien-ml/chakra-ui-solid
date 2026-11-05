# A call expression in a JSX spread

`<Group {...omit(props, "size")} />` fails `mount()` with `[STRICT_READ_UNTRACKED] Reactive value read directly in <Anonymous>`.

## Cause

Solid's compiler wraps a call expression in a JSX spread in a function. `merge` turns a function source into a memo and calls it on every `get`, `has` and `keys`. The receiving component reads that memo in its body (for example `props.as ?? element`), which is an untracked read. The diagnostic names `<Anonymous>` (the factory's returned arrow), not the caller, so it takes bisecting to find.

`<Group {...props} />` with a plain identifier passes; only the call form fails.

## Fix

Assign the call to a named const first and spread the identifier. Never inline `omit(...)`, `merge(...)` or any call in a spread.

```tsx
const rest = omit(props, "size")
return <Group {...rest} />
```
