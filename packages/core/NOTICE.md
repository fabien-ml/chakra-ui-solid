# Third-party notices — `@chakra-ui-solid/core`

chakra-ui-solid is released under the MIT License (see [`LICENSE`](LICENSE)). The files listed below
are derived from other projects and remain subject to their original licenses; nothing here
relicenses them.

Reading a reference for its reasoning, its public API shape, or an ARIA pattern owes nothing and
does not appear here. Only a file that reproduces an upstream's **expression** gets a row, and
`attribution.config.ts` at the repository root is where one is declared.

The repository-wide notice is [`NOTICE.md`](https://github.com/fabien-ml/chakra-ui-solid/blob/main/NOTICE.md);
this file lists only this package's own derived files, because it is the one that travels in the npm
tarball and the only one a consumer who never visits the repository will see.

---

## Chakra UI

- **Project:** https://github.com/chakra-ui/chakra-ui (`@chakra-ui/react`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2019 Chakra Systems Inc.

`factory.tsx` is a row for one table inside it — `exceptionPropMap`, the seven SVG tags whose
geometry attributes must reach the DOM rather than be folded into a class. The factory around it
reproduces none of Chakra's Emotion machinery.

| File | Derived from |
| ---- | ------------ |
| `src/factory/factory.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/styled-system/factory.tsx` |

## Zag.js

- **Project:** https://github.com/chakra-ui/zag (`@zag-js/solid`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2021 Chakra UI

`src/zag/` is a **fork** of `@zag-js/solid`, not a consumer of it: the published adapter targets
SolidJS 1.x and this library targets 2.0. It is meant to be retired the day upstream ships a Solid
2.0 adapter of its own. It is kept together in one directory rather than spread through the package
so that a re-sync can still diff the whole fork against the upstream one.

The fork was taken from **`@zag-js/solid@1.42.0`** and is maintained against **`1.43.0`**. `1.42.0`
is the baseline a re-sync diffs against.

`use-sync-external-store.ts` is deliberately not carried over: it existed for 1:1 API parity with
React's hook, nothing in Zag consumes it, and SolidJS 2.0 has no equivalent to bind it to.

| File | Derived from |
| ---- | ------------ |
| `src/zag/machine.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/machine.ts` |
| `src/zag/bindable.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/bindable.ts` |
| `src/zag/merge-props.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/merge-props.ts` |
| `src/zag/normalize-props.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/normalize-props.ts` |
| `src/zag/refs.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/refs.ts` |
| `src/zag/track.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/track.ts` |
| `src/index.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/index.ts` |

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
