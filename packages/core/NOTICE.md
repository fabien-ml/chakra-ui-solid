# Third-party notices — `@chakra-ui-solid/core`

chakra-ui-solid is released under the MIT License (see [`LICENSE`](LICENSE)). The file listed below
is derived from **Chakra UI** and remains subject to its original license; nothing here relicenses
it.

- **Project:** https://github.com/chakra-ui/chakra-ui (`@chakra-ui/react`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2019 Chakra Systems Inc.

Reading a reference for its reasoning, its public API shape, or an ARIA pattern owes nothing and
does not appear here. Only a file that reproduces an upstream's **expression** gets a row, and
`attribution.config.ts` at the repository root is where one is declared. `factory.tsx` is a row for
one table inside it — `exceptionPropMap`, the seven SVG tags whose geometry attributes must reach
the DOM rather than be folded into a class. The factory around it reproduces none of Chakra's
Emotion machinery.

The repository-wide notice is [`NOTICE.md`](https://github.com/fabien-ml/chakra-ui-solid/blob/main/NOTICE.md);
this file lists only this package's own derived files, because it is the one that travels in the npm
tarball and the only one a consumer who never visits the repository will see.

| File | Derived from |
| ---- | ------------ |
| `src/factory/factory.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/styled-system/factory.tsx` |
