# Benchmarking in headless Chromium

Whichever variant a benchmark runs first measures about 30% slow. Three repetitions of variant A, then three of B, measured A slower than B at small sizes, and the same builder measured 17 µs in one test and 22.5 µs in another. Variants share `mergeProps`, `spread` and `connect`, so the first pays to optimise them. The bias can invent a difference between identical shapes, and it penalises the incumbent, which is usually listed first.

## Method

- Interleave rounds across variants, and keep each variant's minimum.
- Assert the counters are identical across rounds, so a non-deterministic run is caught instead of averaged.
- `performance.now()` is clamped to 100 µs here. Amortise over at least 100 iterations; two iterations measure only the clamp.

```ts
for (let round = 0; round < 3; round++) {
  for (const [label, build] of variants) { /* run, keep the per-label minimum */ }
}
```
