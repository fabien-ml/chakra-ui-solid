# Third-party notices — `chakra-ui-solid`

This package contains the files derived from another project listed in the table below.

Reading a reference for its reasoning, its public API shape, or an ARIA pattern owes nothing and
does not appear here. Only a file that reproduces an upstream's **expression** gets a row, and
`attribution.config.ts` at the repository root is where one is declared.

The repository-wide notice is [`NOTICE.md`](https://github.com/fabien-ml/chakra-ui-solid/blob/main/NOTICE.md);
this file lists only this package's own derived files, because it is the one that travels in the npm
tarball and the only one a consumer who never visits the repository will see.

## Chakra UI

- **Project:** https://github.com/chakra-ui/chakra-ui (`@chakra-ui/react`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2019 Chakra Systems Inc.

`@chakra-ui/react` is a read reference for public API shape, prop names, component anatomy and
naming, none of which owes anything. What is derived is a set of **SVG paths**: the 18 internal
glyphs a component renders when the caller passes no icon of their own — the ✕ on a `CloseButton`,
the chevron on an `Accordion`, the tick on a selected `Menu` item — plus the two `Checkmark` draws
itself, a tick and an indeterminate dash, and the alert circle `Field.ErrorIcon` draws. A copied
path is expression however few bytes it takes; the components around them are not. `LinkBox` and
`LinkOverlay` are the other kind: the pair is styled by two inline style objects rather than by a
recipe — there is no `linkBox` key in the preset — so those declarations live in our source and are
upstream's expression.

| File | Derived from |
| ---- | ------------ |
| `src/components/icons.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/components/icons.tsx` |
| `src/components/checkmark/checkmark.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/components/checkmark/checkmark.tsx` |
| `src/components/field/field-parts.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/components/field/field.tsx` |
| `src/components/link/link-box.tsx` | `chakra-ui/chakra-ui` — `packages/react/src/components/link/link-box.tsx` |

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
