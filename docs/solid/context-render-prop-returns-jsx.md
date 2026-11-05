# A Context render prop must return JSX

`<Collapsible.Context>{(c) => …}</Collapsible.Context>` compiles to `props.children(useContext())`, called **once in the part's body**. The body is not a tracking scope, so anything the callback reads is read untracked unless the callback returns JSX, which puts the read inside a memo.

```tsx
// STRICT_READ_UNTRACKED: the label freezes at its mount value
{(c) => (c.open ? "Show Less" : "Show More")}

// tracked: <Show> reads `open` inside its own memo
{(c) => <Show when={c.open} fallback="Show More">Show Less</Show>}
```

This holds for every component with a `Context` part.

## Why it bites ported examples

The React version's examples write the bare ternary; it works there because React re-runs the whole component. Porting an example means translating the ternary to `<Show>`.

`tsc` cannot see it (both branches are valid `JSX.Element`) and no unit test mounts the example. The docs-examples suite catches it, and only when the example is mounted.

Do not fix the part by wrapping its call in a memo.
