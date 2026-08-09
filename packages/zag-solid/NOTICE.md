# Third-party notices — `@chakra-ui-solid/zag-solid`

This package contains files derived from other projects. Each is listed below with the upstream file
it came from, and each carries an `@license` header naming the same thing.

The repository-wide notice is [`NOTICE.md`](https://github.com/fabien-ml/chakra-ui-solid/blob/main/NOTICE.md);
this file lists only this package's own derived files, because it is the one that travels in the npm
tarball and the only one a consumer who never visits the repository will see.

---

## Zag.js

- **Project:** https://github.com/chakra-ui/zag (`@zag-js/solid`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2021 Chakra UI

This package is a **fork** of `@zag-js/solid`, not a consumer of it: the published adapter targets
SolidJS 1.x and this library targets 2.0. It is meant to be retired the day upstream ships a Solid
2.0 adapter of its own.

The fork was taken from **`@zag-js/solid@1.42.0`** and is maintained against **`1.43.0`**. `1.42.0`
is the baseline a re-sync diffs against.

`use-sync-external-store.ts` is deliberately not carried over: it existed for 1:1 API parity with
React's hook, nothing in Zag consumes it, and SolidJS 2.0 has no equivalent to bind it to.

| File | Derived from |
| ---- | ------------ |
| `src/machine.ts` | `packages/frameworks/solid/src/machine.ts` |
| `src/bindable.ts` | `packages/frameworks/solid/src/bindable.ts` |
| `src/merge-props.ts` | `packages/frameworks/solid/src/merge-props.ts` |
| `src/normalize-props.ts` | `packages/frameworks/solid/src/normalize-props.ts` |
| `src/refs.ts` | `packages/frameworks/solid/src/refs.ts` |
| `src/track.ts` | `packages/frameworks/solid/src/track.ts` |
| `src/index.ts` | `packages/frameworks/solid/src/index.ts` |

```
MIT License

Copyright (c) 2021 Chakra UI

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
