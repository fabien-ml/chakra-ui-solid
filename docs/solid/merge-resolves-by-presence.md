# `merge` resolves by presence, not by value

Solid 2.0's `merge` lets a later source win as soon as it **has the key**, even when the value is `undefined`. So none of these is a default:

```tsx
merge({ type: "button" }, props)
<Button type="button" {...props} />
```

A wrapper that forwards an unset `type` wins with `undefined` and the control submits its form. Forwarding an optional prop from a wrapper is the most ordinary thing a consumer writes, so it hits the broken case every time.

Silent examples: `merge({ modal: true }, props)` with `modal={props.modal}` forwarded unset gives a non-modal dialog, with no focus trap, no scroll lock, no `aria-modal` and no error. A forwarded unset `display` gives a `Loader` a box it is defined not to have.

## Fix

`withDefaults(props, { … })` resolves each defaulted key by value with `??`. Once merged, the returned object is the only props object: it copies nothing, so reaching back to raw `props` for a defaulted key reads the undefaulted value. Every default owes a forwarded-`undefined` test (`<X prop={undefined} />`).
