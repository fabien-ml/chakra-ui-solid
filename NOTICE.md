# Third-party notices

> **The sections outnumber the tables that have rows, and that is the design.** A section exists per
> upstream we read, whether or not anything is derived from it, so an empty table is a statement
> rather than an absence. Four carry rows today — Zag.js, Chakra UI, Project marks, Lucide. The
> rest are guards.
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

Every project listed below is **MIT** but one: **Lucide** is ISC, and eighteen of the glyphs taken
from it are Lucide's own derivatives of Feather and carry a second notice, MIT. Both licences ask
the same single thing MIT asks — that the notice travel with the copy — which is what this file is.
Should a file ever be derived from an Apache-2.0 work, it carries an attribution header naming the
upstream and stating that it has been modified — see **Adobe React Spectrum**, which is retained
empty for exactly that case.

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
| `packages/core/src/zag/machine.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/machine.ts` |
| `packages/core/src/zag/bindable.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/bindable.ts` |
| `packages/core/src/zag/merge-props.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/merge-props.ts` |
| `packages/core/src/zag/normalize-props.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/normalize-props.ts` |
| `packages/core/src/zag/refs.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/refs.ts` |
| `packages/core/src/zag/track.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/track.ts` |
| `packages/core/src/index.ts` | `chakra-ui/zag` — `packages/frameworks/solid/src/index.ts` |

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
naming. Its `src/styled-system/` is an Emotion serializer and is read for API shape, not for
implementation — nothing of that machinery is ported, because Panda replaces it at build time. Files
that reproduce Chakra's expression get a row, and `factory.tsx` is one: its `exceptionPropMap` — the
seven SVG tags whose geometry attributes must reach the DOM rather than be folded into a class — is
carried over verbatim, because a data table is expression where the API around it is not.

**One recipe body is reproduced, and only because the preset omits it.** `container` is a key
`@chakra-ui/react`'s own theme defines and `@chakra-ui/panda-preset` does not ship, so a Container
resolved against the dependency would compute a class with no rule behind it. Its body is ported
into `packages/panda-preset/src/container-recipe.ts` with one modification — the `className` — and
no other recipe or token table is re-emitted anywhere in this repository.

**A set of SVG paths is copied.** Chakra keeps an internal glyph module — the ✕ a `CloseButton`
shows, the chevron an `Accordion` points with, the tick a `Menu` marks a selection with — and 24 of
its components render one when the caller passes no icon of their own. Those 18 glyphs' path data
is Chakra's, and a copied path is expression however few bytes it takes. The components around them
are API shape and owe nothing; only the `d` attributes do. Chakra's own header credits
[react-icons](https://react-icons.github.io/react-icons/) for the ideas and several glyphs are
recognisably Lucide's, but Chakra's file is where they were taken from, so that is what the row
below names.

**Two further glyphs are copied, from a different file.** `Checkmark` draws its own tick and its own
indeterminate dash rather than reaching for the set above — Chakra's are direct children of the
element the recipe styles, where the glyph module's are each a nested `svg`. The tick traces the
same three points either way; the dash has no counterpart there. Same reasoning, so the same row:
the two shapes are Chakra's, the component around them is API shape and owes nothing.

**And one more, for the same reason.** `Field.ErrorIcon` is an alert circle Chakra inlines in
`field.tsx` rather than taking from the glyph module — its own `ErrorIcon` there is imported by
nothing — so the path is copied from where Chakra actually draws it, and the part components beside
it in our file are API shape and owe nothing.

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
The four icon files beside the favicon are that same `LogoIcon` glyph again, at the sizes a tab, an
iOS home screen and an Android manifest each ask for; a render of a derivative is one too, and they
are listed for that reason rather than for adding a fifth thing we took.
**Trademark is a separate right that no licence moves**, and the mitigations are load-bearing: the
site's logotype reads `chakra-ui-solid` and never `chakra`, none of Chakra's wordmark lettering is
reproduced, no social card or combined mark exists, and the disclaimer appears verbatim above the
fold on the docs home and in every page's footer.

| File | Derived from |
| ---- | ------------ |
| `packages/core/src/factory/factory.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/styled-system/factory.tsx` |
| `packages/chakra-ui-solid/src/components/icons.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/components/icons.tsx` |
| `packages/chakra-ui-solid/src/components/checkmark/checkmark.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/components/checkmark/checkmark.tsx` |
| `packages/chakra-ui-solid/src/components/field/field-parts.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/components/field/field.tsx` |
| `packages/chakra-ui-solid/src/components/link/link-box.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/components/link/link-box.tsx` |
| `packages/panda-preset/src/container-recipe.ts` | `chakra-ui/chakra-ui` — `packages/react/src/theme/recipes/container.ts` |
| `apps/docs/src/content` | `chakra-ui/chakra-ui` — `apps/www/content/docs` |
| `apps/docs/src/components/ui/logo.tsx` | `chakra-ui/chakra-ui` — `apps/www/components/site/icons.tsx`, `apps/www/components/logo.tsx` |
| `apps/docs/src/examples/decorative-box.tsx` | `chakra-ui/chakra-ui` — `apps/compositions/src/lib/decorative-box.tsx` |
| `apps/docs/public/favicon.ico` | `chakra-ui/chakra-ui` — `apps/www/app/favicon.ico` |
| `apps/docs/public/icon.svg` | `chakra-ui/chakra-ui` — `apps/www/components/logo.tsx` |
| `apps/docs/public/apple-touch-icon.png` | `apps/docs/public/icon.svg`, rasterized |
| `apps/docs/public/icon-192.png` | `apps/docs/public/icon.svg`, rasterized |
| `apps/docs/public/icon-512.png` | `apps/docs/public/icon.svg`, rasterized |

## Lucide

- **Project:** https://github.com/lucide-icons/lucide
- **License:** ISC License
- **Copyright:** Copyright (c) 2026 Lucide Icons and Contributors

The docs site's UI icons are Lucide's, copied as path data from **`lucide-static@1.31.0`** (`icons/`,
one `.svg` per glyph). This is what the React docs use too — their examples and landing page import
`react-icons/lu`, which is Lucide — so the twenty-nine glyphs below are what a 1:1 port of those
pages requires rather than a set we chose. Lucide is not a dependency and has no SolidJS 2.0 build;
the alternative to copying the paths is not importing them.

**One row for twenty-nine glyphs**, directory-scoped for the same reason `apps/docs/src/content` is
one row rather than 111. Which upstream file each glyph came from is named in the comment above its
component, and that is what an audit opens.

| File | Derived from |
| ---- | ------------ |
| `apps/docs/src/components/ui/icons.tsx` | `lucide-icons/lucide` — `icons/` |

### Feather

- **Project:** https://github.com/feathericons/feather
- **License:** MIT License
- **Copyright:** Copyright (c) 2013-present Cole Bemis

Lucide began as a fork of Feather and carries Feather's MIT notice forward for the icons that
descend from it. **Eighteen of our twenty-nine are on that list**, and so owe this second notice as
well as the ISC one above:

`arrow-left`, `arrow-right`, `arrow-up-right`, `at-sign`, `check`, `chevron-down`, `chevron-left`,
`chevron-right`, `circle-check`, `external-link`, `moon`, `plus`, `search`, `star`, `terminal`,
`type`, `voicemail`, `x`

The other eleven — `bell`, `box`, `circle-dashed`, `copy`, `heart`, `menu`, `paint-bucket`,
`party-popper`, `phone`, `phone-forwarded`, `sun` — are Lucide's own and are covered by the ISC grant alone. No separate row: they are the same file, and
`attribution.config.ts` keys one entry per file.

## Project marks

Two places on this site show another project's mark to name that project: the **framework grid**,
where each cell's logo names the setup it links to, and every **docs page header**, where the
two links carry GitHub's mark for the source file and React's for the same page on the React
version's site. **Nominative use** — identifying a thing by its name and mark — and none of the four
implies endorsement, sponsorship or affiliation.

Every file below is the mark as its project publishes it, with **one exception**, recorded here
because "unmodified" is otherwise the claim this section makes.

`project-marks.tsx` holds the two inline marks, each recoloured to `currentColor` because they sit
inside a line of muted text that brightens on hover — GitHub's from their own Octicons set,
unchanged otherwise, and React's with **one further change**: the ellipse stroke is 1.6 where
React's file says 1. Their file is drawn at a logo's size; at the 18px this sits at, a 1-unit stroke
in a 23-unit viewBox falls under a pixel and reads as a smudge. The geometry — three ellipses at 0°,
60° and 120° about a nucleus, in React's own viewBox — is untouched.

Vite's two files and SolidStart's left with the grid's third cell: SolidStart retired into
`@solidjs/vite-plugin`'s start mode, so the grid names who owns the server rather than which
framework compiles the app, and `solid.svg` is the mark that replaced both.

| File | Source | Mark held by |
| ---- | ------ | ------------ |
| `apps/docs/src/components/ui/project-marks.tsx` | `primer/octicons` — `icons/mark-github-16.svg`, monochrome | GitHub, Inc. |
| `apps/docs/src/components/ui/project-marks.tsx` | `facebook/react` — `fixtures/dom/public/react-logo.svg`, monochrome, stroke 1.6 | Meta Platforms, Inc. |
| `apps/docs/public/logos/solid.svg` | `solidjs/solid-site` — `public/img/logo/without-wordmark/logo.svg` | The SolidJS project |
| `apps/docs/public/logos/tanstack-light.svg` | `TanStack/tanstack.com` — `public/images/brand/tanstack-emblem-charcoal.svg` | Tanner Linsley / TanStack |
| `apps/docs/public/logos/tanstack-dark.svg` | `TanStack/tanstack.com` — `public/images/brand/tanstack-emblem-white.svg` | Tanner Linsley / TanStack |

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
