# Third-party notices — `@chakra-ui-solid/panda-preset`

This package contains **31 files derived from another project**, listed in the table below.

- **Project:** https://github.com/chakra-ui/chakra-ui (`@chakra-ui/react`, `@chakra-ui/panda-preset`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2019 Chakra Systems Inc.

Reading a reference for its reasoning, its public API shape, or an ARIA pattern owes nothing and
does not appear here. Only a file that reproduces an upstream's **expression** gets a row, and
`attribution.config.ts` at the repository root is where one is declared.

**`@chakra-ui/panda-preset` — Chakra UI v3's design system as a Panda preset — is vendored into
this package rather than depended on.** Chakra v3's look is a *skin* here, one preset among several
a consumer may write, and a skin that can only override a dependency is `theme.extend` with extra
steps. So the preset is copied in, under `src/chakra/`, and maintained as ours. One file per
upstream file, so a Chakra release is a `diff -r` against their `src/` rather than a merge.

**29 of those files have moved so far: the token tables and the compositions.** The recipe bodies
and the conditions are still resolved from the published package as shipped. Two modifications, both
mechanical: the import specifier, since Chakra's own `src/def.ts` is not copied and `@pandacss/dev`
exports the same helpers, and — in `src/chakra/utilities.ts` alone — a type annotation standing in
for the one helper it does not export, `defineUtilities`.

Everything else in this package is a key added on top: `staticCss` declarations, `jsx` tracking
hints, one `cursor` token, and any shorthand alias Panda does not already provide.

**Two more files come from `@chakra-ui/react` rather than from the preset**, because the preset
ships neither. `container` is a recipe Chakra's own theme defines; its body is reproduced from that
theme, with the `className` changed to the unprefixed form every other recipe here uses. `currentBg`
is a Chakra keyword two recipes write and no shipped utility resolves, because the transform
compiling it lives in `@chakra-ui/react`'s runtime config; it is reproduced with one modification —
a `transparent` background publishes nothing.

The repository-wide notice is [`NOTICE.md`](https://github.com/fabien-ml/chakra-ui-solid/blob/main/NOTICE.md);
this file lists only this package's own derived files, because it is the one that travels in the npm
tarball and the only one a consumer who never visits the repository will see.

| File | Derived from |
| ---- | ------------ |
| `src/container-recipe.ts` | `chakra-ui/chakra-ui` — `packages/react/src/theme/recipes/container.ts` |
| `src/current-bg-utilities.ts` | `chakra-ui/chakra-ui` — `packages/react/src/preset-base.ts` |
| `src/chakra/tokens/animations.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/animations.ts` |
| `src/chakra/tokens/aspect-ratios.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/aspect-ratios.ts` |
| `src/chakra/tokens/blurs.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/blurs.ts` |
| `src/chakra/tokens/borders.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/borders.ts` |
| `src/chakra/tokens/colors.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/colors.ts` |
| `src/chakra/tokens/cursor.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/cursor.ts` |
| `src/chakra/tokens/durations.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/durations.ts` |
| `src/chakra/tokens/easings.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/easings.ts` |
| `src/chakra/tokens/font-sizes.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/font-sizes.ts` |
| `src/chakra/tokens/font-weights.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/font-weights.ts` |
| `src/chakra/tokens/fonts.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/fonts.ts` |
| `src/chakra/tokens/index.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/index.ts` |
| `src/chakra/tokens/letter-spacings.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/letter-spacings.ts` |
| `src/chakra/tokens/line-heights.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/line-heights.ts` |
| `src/chakra/tokens/radii.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/radii.ts` |
| `src/chakra/tokens/sizes.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/sizes.ts` |
| `src/chakra/tokens/spacing.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/spacing.ts` |
| `src/chakra/tokens/z-index.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/tokens/z-index.ts` |
| `src/chakra/semantic-tokens/colors.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/semantic-tokens/colors.ts` |
| `src/chakra/semantic-tokens/index.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/semantic-tokens/index.ts` |
| `src/chakra/semantic-tokens/radii.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/semantic-tokens/radii.ts` |
| `src/chakra/semantic-tokens/shadows.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/semantic-tokens/shadows.ts` |
| `src/chakra/animation-styles.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/animation-styles.ts` |
| `src/chakra/breakpoints.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/breakpoints.ts` |
| `src/chakra/global-css.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/global-css.ts` |
| `src/chakra/keyframes.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/keyframes.ts` |
| `src/chakra/layer-styles.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/layer-styles.ts` |
| `src/chakra/text-styles.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/text-styles.ts` |
| `src/chakra/utilities.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/utilities.ts` |
