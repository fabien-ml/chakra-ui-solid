# Third-party notices

> **The sections outnumber the tables that have rows, and that is the design.** A section exists per
> upstream we read, whether or not anything is derived from it, so an empty table is a statement
> rather than an absence. Three carry rows today — Zag.js, Chakra UI, Framework logos. The rest are
> guards.
>
> **What fills a row in** is the five obligations in [`CLAUDE.md`](CLAUDE.md), and
> [`attribution.config.ts`](attribution.config.ts) is where a derivative is declared. Every row below
> under `packages/` or `apps/` is checked against that registry in both directions —
> `check:attribution`.
>
> **Revised at the P2 gate, 2026-08-09.** The **Adobe React Spectrum** section no longer forecasts a
> carry-over: the port rule struck hope-ui's accessibility kernel, so no Apache-2.0 material is
> planned. The section stays, empty, as a guard.

chakra-ui-solid is released under the MIT License (see [`LICENSE`](LICENSE)). Portions of this
software are derived from the projects listed below and remain subject to their original licenses.
Nothing here relicenses those portions; the MIT grant in `LICENSE` covers chakra-ui-solid's own code.

Every project listed below is **MIT**. Should a file ever be derived from an Apache-2.0 work, it
carries an attribution header naming the upstream and stating that it has been modified — see
**Adobe React Spectrum**, which is retained empty for exactly that case.

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
Solid 1.x. Every forked file carries an `@license` header and a row here.

The fork was taken from **`@zag-js/solid@1.42.0`** and is maintained against **`1.43.0`**. `1.42.0`
is the baseline a re-sync diffs against — a reader who only knows `1.43.0` would diff the wrong
direction and mistake upstream's three changes for ours.

| File | Derived from |
| ---- | ------------ |
| `packages/zag-solid/src/machine.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/machine.ts` |
| `packages/zag-solid/src/bindable.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/bindable.ts` |
| `packages/zag-solid/src/merge-props.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/merge-props.ts` |
| `packages/zag-solid/src/normalize-props.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/normalize-props.ts` |
| `packages/zag-solid/src/refs.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/refs.ts` |
| `packages/zag-solid/src/track.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/track.ts` |
| `packages/zag-solid/src/index.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/index.ts` |

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

**The documentation content is different, and it is a derivative.** `apps/docs/src/content` follows
chakra-ui.com's page structure, section order, example set and — where our API has not changed the
claim — its sentences. Chakra's docs are covered by the same single MIT grant as their code: one
`LICENSE` at their repository root, no separate licence under `apps/www`, and `"license": "MIT"` on
the root `package.json`. MIT permits the copy outright; its one condition is that the notice
travels with it, which is what the row below is. The entry is **directory-scoped** rather than one
row per page, because the content tier is one derivative rather than 111
([`CLAUDE.md`](CLAUDE.md), *Reference use*).

**The brand assets are used, and they are used knowingly.** The docs site carries Chakra's bolt —
`BlitzIcon`, `BlitzFillIcon` and the `LogoIcon` glyph — and their `favicon.ico`. All four are files
in the same MIT-licensed repository, so the copy is permitted and the rows below are the condition.
**Trademark is a separate right that no licence moves**, and the mitigations are load-bearing: the
site's logotype reads `chakra-ui-solid` and never `chakra`, none of Chakra's wordmark lettering is
reproduced, no social card or combined mark exists, and the disclaimer appears verbatim above the
fold on the docs home and in every page's footer.

| File | Derived from |
| ---- | ------------ |
| `apps/docs/src/content` | `chakra-ui/chakra-ui` — `apps/www/content/docs` |
| `apps/docs/src/components/site/icons.tsx` | `chakra-ui/chakra-ui` — `apps/www/components/site/icons.tsx`, `apps/www/components/logo.tsx` |
| `apps/docs/public/favicon.ico` | `chakra-ui/chakra-ui` — `apps/www/app/favicon.ico` |

## Framework logos

The docs site's framework grid shows each project's own logo, unmodified, to name the framework
that cell links to. **Nominative use** — identifying a thing by its name and mark — and none of the
three implies endorsement, sponsorship or affiliation.

| File | Source | Mark held by |
| ---- | ------ | ------------ |
| `apps/docs/public/logos/vite.svg` | `vitejs/vite` — `docs/public/logo.svg` | The Vite project |
| `apps/docs/public/logos/solid-start.svg` | `solidjs/solid-docs` — `public/solid-start.svg` | The SolidJS project |
| `apps/docs/public/logos/tanstack-light.svg` | `TanStack/tanstack.com` — `public/images/brand/tanstack-stacked-charcoal.svg` | Tanner Linsley / TanStack |
| `apps/docs/public/logos/tanstack-dark.svg` | `TanStack/tanstack.com` — `public/images/brand/tanstack-stacked-white.svg` | Tanner Linsley / TanStack |

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

hope-ui's own accessibility kernel is **not** carried over. Its `create-hide-outside.ts` is an
Apache-2.0 derivative there, and at P1 it was expected to stay one here; the P2 gate struck it, along
with the rest of that kernel, under the rule that this project adds no accessibility behavior beyond
what Zag ships. See **Adobe React Spectrum** below.

| File | Carried from |
| ---- | ------------ |
| _(none yet)_ | |

## Adobe React Spectrum

- **Project:** https://github.com/adobe/react-spectrum (`@react-aria/*`)
- **License:** Apache License, Version 2.0
- **Copyright:** Copyright 2020 Adobe. All rights reserved.

**Not applicable — and nothing planned triggers it.** This section is retained, empty, as a guard
rather than a forecast.

At P1 a carry-over was expected to trigger it: hope-ui's `createHideOutside`, a port of
`@react-aria/overlays`' `ariaHideOutside.ts`, retained because Zag has no `inert` handling of its own.
The P2 gate struck it. This project is a port of Chakra UI v3, Chakra is built on Ark and Ark on Zag,
so a gap in Zag is a gap Chakra has — closing it here would add behavior the upstream does not have.
No Apache-2.0 material enters this repository, and `licenses/LICENSE-APACHE-2.0.txt` is deliberately
**not** present.

**What would reopen it:** any decision to close a Zag accessibility gap in our own layer. That is a
scope decision before it is a licensing one. If it is ever taken, this section becomes live and the
checklist is this paragraph: `licenses/LICENSE-APACHE-2.0.txt` added to the repo **and** to the
owning package's `package.json#files`, plus the Apache-2.0 §4(b) *"This file has been modified from
the original"* line in every derived file's header, which MIT does not require and Apache-2.0 does.

| File | Derived from |
| ---- | ------------ |
| _(none — nothing planned triggers this section)_ | |

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
