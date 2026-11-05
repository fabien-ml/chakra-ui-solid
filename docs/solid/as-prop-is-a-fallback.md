# A part's element is a fallback, never a merged default

A part resolves its element with `??`:

```tsx
as: (props.as ?? "button") as ValidComponent,
```

Not with `merge`, and not with a bare literal. A wrapper that forwards an unset `as` resolves by presence (see [merge resolves by presence](merge-resolves-by-presence.md)) and hands the part `undefined`, which `<Dynamic>` renders as nothing at all.

Each part owes an `<X as={undefined} />` test beside the one that names an element.
