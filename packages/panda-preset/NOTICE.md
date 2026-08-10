# Third-party notices — `@chakra-ui-solid/panda-preset`

This package contains **one file derived from another project**, listed in the table below.

- **Project:** https://github.com/chakra-ui/chakra-ui (`@chakra-ui/react`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2019 Chakra Systems Inc.

Reading a reference for its reasoning, its public API shape, or an ARIA pattern owes nothing and
does not appear here. Only a file that reproduces an upstream's **expression** gets a row, and
`attribution.config.ts` at the repository root is where one is declared.

`@chakra-ui/panda-preset` — Chakra UI v3's design system as a Panda preset — is an ordinary MIT
**dependency** of this package, not vendored into it. Almost everything here is a key added on top
of it: `staticCss` declarations, `jsx` tracking hints, one `cursor` token, and any shorthand alias
Panda does not already provide.

**The one exception is `container`**, a recipe `@chakra-ui/react`'s own theme defines and the preset
does not ship. Its body is reproduced from that theme, with the `className` changed to the
unprefixed form every other recipe here uses. No other recipe body and no token table is re-emitted.

The repository-wide notice is [`NOTICE.md`](https://github.com/fabien-ml/chakra-ui-solid/blob/main/NOTICE.md);
this file lists only this package's own derived files, because it is the one that travels in the npm
tarball and the only one a consumer who never visits the repository will see.

| File | Derived from |
| ---- | ------------ |
| `src/container-recipe.ts` | `chakra-ui/chakra-ui` — `packages/react/src/theme/recipes/container.ts` |
