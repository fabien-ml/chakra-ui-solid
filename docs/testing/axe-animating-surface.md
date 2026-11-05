# Axe on an animating-in surface

An axe call made while a surface is part-way through its enter animation flakes. At about 0.03 opacity axe computes a real, failing `color-contrast` ratio and reports a violation, which disappears once the animation settles and comes back on the next run.

Wait for the animation to finish, not for a fixed number of frames:

```ts
await vi.waitFor(() => expect(getComputedStyle(content).opacity).toBe("1"))
```

Every presence-gated part inherits this.
