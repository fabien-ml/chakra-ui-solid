# Third-party notices

> **Skeleton.** The repo has no source files yet, so every derived-file table below is empty by
> fact, not by omission. The sections exist up front so the first derivative lands into a shape that
> already matches [`__internal__/legal.md`](__internal__/legal.md) §2 — see §2.6 there for the
> checklist that fills a row in.

chakra-ui-solid is released under the MIT License (see [`LICENSE`](LICENSE)). Portions of this
software are derived from the projects listed below and remain subject to their original licenses.
Nothing
here relicenses those portions; the MIT grant in `LICENSE` covers chakra-ui-solid's own code.

Where a file is derived from an Apache-2.0 work, it carries an attribution header naming the
upstream and stating that it has been modified.

Reading a reference for its reasoning, its public API shape, or an ARIA pattern owes nothing and
does not appear here. Only files that reproduce an upstream's **expression** get a row.

---

## Zag.js

- **Project:** https://github.com/chakra-ui/zag (`@zag-js/*`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2021 Chakra UI

Zag's machine packages (`@zag-js/dialog`, `@zag-js/accordion`, …) are ordinary npm dependencies:
resolved as bare specifiers in the published output, never bundled, shipping with their own license.
No obligation beyond this notice.

`@zag-js/solid` is different — it is **forked**, not consumed, because the published adapter targets
Solid 1.x (see [`__internal__/legal.md`](__internal__/legal.md) §1.3). Every forked file carries an
`@license` header and a row here.

| File | Derived from |
| ---- | ------------ |
| _(none yet)_ | |

```
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

## Chakra UI

- **Project:** https://github.com/chakra-ui/chakra-ui (`@chakra-ui/react`, `@chakra-ui/panda-preset`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2019 Chakra Systems Inc.

`@chakra-ui/panda-preset` is consumed as a published npm dependency — the design tokens, recipes,
and slot recipes are used as shipped, not copied into this repository. No obligation beyond this
notice.

`@chakra-ui/react` is a **read reference** for public API shape, prop names, component anatomy, and
naming. Its `src/styled-system/` is an Emotion serializer and is read for API shape only, never for
implementation. Files that reproduce Chakra's expression get a row.

| File | Derived from |
| ---- | ------------ |
| _(none yet)_ | |

## Ark UI

- **Project:** https://github.com/chakra-ui/ark (`@ark-ui/react`, `@ark-ui/solid`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2024 Chakra Systems Inc.

Ark UI is a **read-only reference** and is not a dependency of any published package here. It is
consulted for *what* a component is — its parts, its props, its machine wiring, and its edge cases —
never for *how* it composes them. chakra-ui-solid components are written from zero directly on Zag
machines, and polymorphism is a `render` prop rather than Ark's `asChild`. No Ark source is
reproduced in this repository, and this section is expected to stay tableless.

| File | Derived from |
| ---- | ------------ |
| _(none — by policy)_ | |

## Panda CSS

- **Project:** https://github.com/chakra-ui/panda (`@pandacss/*`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2023 Segun Adebayo

Panda is a build-time dependency and a runtime dependency of `@chakra-ui-solid/styled-system`,
consumed as published. The artifacts under `packages/styled-system/styled-system/` are **generated
output**, regenerated on install and never committed. Panda's Solid JSX factory is generated but never
exported.

| File | Derived from |
| ---- | ------------ |
| _(none yet)_ | |

## hope-ui

- **Project:** https://github.com/hope-ui/hope-ui
- **License:** MIT License
- **Copyright:** Copyright (c) 2026 Fabien Marie-Louise

Same author, same license, so no third-party obligation arises. Carried-over files still get a
provenance note in their header — not as a legal requirement but so the lineage stays legible and
the next reader can find the commit that argued the design. Carried files **fork on copy**: there is
no sync obligation in either direction.

The exception is `create-hide-outside.ts`, which is an Apache-2.0 derivative in hope-ui and stays
one here — it appears under **Adobe React Spectrum** below, not in this section.

| File | Carried from |
| ---- | ------------ |
| _(none yet)_ | |

## Adobe React Spectrum

- **Project:** https://github.com/adobe/react-spectrum (`@react-aria/*`)
- **License:** Apache License, Version 2.0 — full text in `licenses/LICENSE-APACHE-2.0.txt`
- **Copyright:** Copyright 2020 Adobe. All rights reserved.

**Not yet applicable.** This section is pre-declared because a planned carry-over will trigger it:
`createHideOutside` is a port of `@react-aria/overlays`' `ariaHideOutside.ts`, retained because Zag
has no `inert` handling of its own. The moment that file lands, `licenses/LICENSE-APACHE-2.0.txt`
must be added to the repo and to the owning package, and each derived file needs the Apache-2.0
§4(b) *"This file has been modified from the original"* line in its header. See
[`__internal__/legal.md`](__internal__/legal.md) §1.2.

| File | Derived from |
| ---- | ------------ |
| _(none yet)_ | |

---

## Trademarks

**Chakra UI** and the Chakra UI logo are trademarks of Chakra Systems Inc. chakra-ui-solid is an
independent, unofficial project. It is not affiliated with, sponsored by, or endorsed by Chakra
Systems Inc. or the Chakra UI maintainers. References to Chakra UI in this repository and in its
documentation are descriptive — they identify the upstream project whose component API and design
tokens chakra-ui-solid targets — and no claim of association is made or implied.

Zag.js, Ark UI, and Panda CSS are likewise projects of Chakra Systems Inc. and its maintainers, used
here under their MIT licenses.

SolidJS is a trademark of its respective owners. chakra-ui-solid is an independent project and is
not affiliated with, sponsored by, or endorsed by the SolidJS team.
