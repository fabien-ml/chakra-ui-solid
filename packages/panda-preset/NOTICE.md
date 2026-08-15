# Third-party notices — `@chakra-ui-solid/panda-preset`

This package contains **107 files derived from another project**, listed in the table below.

- **Project:** https://github.com/chakra-ui/chakra-ui (`@chakra-ui/react`, `@chakra-ui/panda-preset`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2019 Chakra Systems Inc.

Reading a reference for its reasoning, its public API shape, or an ARIA pattern owes nothing and
does not appear here. Only a file that reproduces an upstream's **expression** gets a row, and
`attribution.config.ts` at the repository root is where one is declared.

**`@chakra-ui/panda-preset` — Chakra UI v3's design system as a Panda preset — is vendored into
this package rather than depended on.** Chakra v3's look is one preset among several a consumer may
write, and a preset that can only override a dependency is `theme.extend` with extra
steps. So the preset is copied in, under `src/chakra/`, and maintained as ours. One file per
upstream file, so a Chakra release is a `diff -r` against their `src/` rather than a merge.

**All 105 of its files have moved: the token tables, the compositions and all 74 recipe bodies.**
The package is no longer a dependency of this one. Two modifications, both mechanical: the import
specifier, since Chakra's own `src/def.ts` is not copied and `@pandacss/dev` exports the same
helpers, and — in `src/chakra/utilities.ts` alone — a type annotation standing in for the one helper
it does not export, `defineUtilities`. The one addition is in `src/chakra/recipes/index.ts`, which
registers the `container` body described below.

Everything else in this package is a key added on top: `staticCss` declarations, `jsx` tracking
hints, one `cursor` token, and any shorthand alias Panda does not already provide.

**Two more files come from `@chakra-ui/react` rather than from the preset**, because the preset
ships neither. `container` is a recipe Chakra's own theme defines and their preset generator deletes
on its way out, since Panda ships a `container` pattern of its own; its body is reproduced from that
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
| `src/chakra/recipes/badge.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/badge.ts` |
| `src/chakra/recipes/button.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/button.ts` |
| `src/chakra/recipes/checkmark.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/checkmark.ts` |
| `src/chakra/recipes/code.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/code.ts` |
| `src/chakra/recipes/color-swatch.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/color-swatch.ts` |
| `src/chakra/recipes/heading.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/heading.ts` |
| `src/chakra/recipes/icon.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/icon.ts` |
| `src/chakra/recipes/index.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/index.ts` |
| `src/chakra/recipes/input-addon.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/input-addon.ts` |
| `src/chakra/recipes/input.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/input.ts` |
| `src/chakra/recipes/kbd.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/kbd.ts` |
| `src/chakra/recipes/link.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/link.ts` |
| `src/chakra/recipes/mark.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/mark.ts` |
| `src/chakra/recipes/radiomark.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/radiomark.ts` |
| `src/chakra/recipes/separator.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/separator.ts` |
| `src/chakra/recipes/skeleton.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/skeleton.ts` |
| `src/chakra/recipes/skip-nav-link.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/skip-nav-link.ts` |
| `src/chakra/recipes/spinner.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/spinner.ts` |
| `src/chakra/recipes/textarea.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/recipes/textarea.ts` |
| `src/chakra/slot-recipes/accordion.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/accordion.ts` |
| `src/chakra/slot-recipes/action-bar.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/action-bar.ts` |
| `src/chakra/slot-recipes/alert.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/alert.ts` |
| `src/chakra/slot-recipes/avatar.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/avatar.ts` |
| `src/chakra/slot-recipes/blockquote.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/blockquote.ts` |
| `src/chakra/slot-recipes/breadcrumb.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/breadcrumb.ts` |
| `src/chakra/slot-recipes/card.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/card.ts` |
| `src/chakra/slot-recipes/carousel.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/carousel.ts` |
| `src/chakra/slot-recipes/checkbox-card.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/checkbox-card.ts` |
| `src/chakra/slot-recipes/checkbox.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/checkbox.ts` |
| `src/chakra/slot-recipes/code-block.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/code-block.ts` |
| `src/chakra/slot-recipes/collapsible.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/collapsible.ts` |
| `src/chakra/slot-recipes/color-picker.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/color-picker.ts` |
| `src/chakra/slot-recipes/combobox.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/combobox.ts` |
| `src/chakra/slot-recipes/data-list.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/data-list.ts` |
| `src/chakra/slot-recipes/date-picker.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/date-picker.ts` |
| `src/chakra/slot-recipes/dialog.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/dialog.ts` |
| `src/chakra/slot-recipes/drawer.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/drawer.ts` |
| `src/chakra/slot-recipes/editable.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/editable.ts` |
| `src/chakra/slot-recipes/empty-state.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/empty-state.ts` |
| `src/chakra/slot-recipes/field.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/field.ts` |
| `src/chakra/slot-recipes/fieldset.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/fieldset.ts` |
| `src/chakra/slot-recipes/file-upload.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/file-upload.ts` |
| `src/chakra/slot-recipes/floating-panel.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/floating-panel.ts` |
| `src/chakra/slot-recipes/hover-card.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/hover-card.ts` |
| `src/chakra/slot-recipes/index.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/index.ts` |
| `src/chakra/slot-recipes/list.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/list.ts` |
| `src/chakra/slot-recipes/listbox.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/listbox.ts` |
| `src/chakra/slot-recipes/marquee.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/marquee.ts` |
| `src/chakra/slot-recipes/menu.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/menu.ts` |
| `src/chakra/slot-recipes/native-select.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/native-select.ts` |
| `src/chakra/slot-recipes/number-input.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/number-input.ts` |
| `src/chakra/slot-recipes/pin-input.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/pin-input.ts` |
| `src/chakra/slot-recipes/popover.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/popover.ts` |
| `src/chakra/slot-recipes/progress-circle.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/progress-circle.ts` |
| `src/chakra/slot-recipes/progress.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/progress.ts` |
| `src/chakra/slot-recipes/qr-code.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/qr-code.ts` |
| `src/chakra/slot-recipes/radio-card.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/radio-card.ts` |
| `src/chakra/slot-recipes/radio-group.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/radio-group.ts` |
| `src/chakra/slot-recipes/rating-group.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/rating-group.ts` |
| `src/chakra/slot-recipes/scroll-area.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/scroll-area.ts` |
| `src/chakra/slot-recipes/segment-group.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/segment-group.ts` |
| `src/chakra/slot-recipes/select.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/select.ts` |
| `src/chakra/slot-recipes/slider.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/slider.ts` |
| `src/chakra/slot-recipes/splitter.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/splitter.ts` |
| `src/chakra/slot-recipes/stat.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/stat.ts` |
| `src/chakra/slot-recipes/status.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/status.ts` |
| `src/chakra/slot-recipes/steps.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/steps.ts` |
| `src/chakra/slot-recipes/switch.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/switch.ts` |
| `src/chakra/slot-recipes/table.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/table.ts` |
| `src/chakra/slot-recipes/tabs.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/tabs.ts` |
| `src/chakra/slot-recipes/tag.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/tag.ts` |
| `src/chakra/slot-recipes/tags-input.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/tags-input.ts` |
| `src/chakra/slot-recipes/timeline.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/timeline.ts` |
| `src/chakra/slot-recipes/toast.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/toast.ts` |
| `src/chakra/slot-recipes/tooltip.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/tooltip.ts` |
| `src/chakra/slot-recipes/tree-view.ts` | `chakra-ui/chakra-ui` — `packages/panda-preset/src/slot-recipes/tree-view.ts` |
