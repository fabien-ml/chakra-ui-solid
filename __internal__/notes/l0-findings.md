# L0 findings

What the comprehension backlog's reading pass turned up that is **not** a concept. Nothing here was
fixed — L0 is a reading pass. Each item is its own `feat/<name>` if it is ever taken up, red before
green.

Recorded 2026-08-20. Ordered by how much it would cost to be wrong about, not by where it lives.

## 1 — Eleven `check:*` scripts are cited from live source and do not exist

Five exist: `no-runtime-css`, `attribution`, `declaration-support`, `ssr-coverage`,
`component-recipes`. Eleven more are named in **source comments**, most of them in the present
tense, as if they ran. Counted over `packages/*/src`, `apps/docs/src`, `scripts/`, `.github/` and the
root configs, with `dist/` excluded:

| Named | Source files citing it |
|---|---|
| `check:style-contract` | 8 |
| `check:docs-inventory` | 3 |
| `check:style-prop-collisions` | 2 |
| `check:test-projects` | 2 |
| `check:alias-coverage` · `check:bundle` · `check:css-coverage` · `check:dark-selector` · `check:docs-consumer-config` · `check:preset-token-resolution` · `check:resolution-sync` | 1 each |

`CLAUDE.md`'s stale-corpus warning covers `__internal__/`. These are in shipped source, where a
reader has no reason to doubt them. Two are load-bearing beyond the wording:

- `alias-utilities.ts:27-28` says the 17-entry shorthand table **"is produced by
  `check:alias-coverage`, not guessed"**. It has no way to be regenerated or verified against a
  Panda or Chakra bump.
- `check:style-contract` is what 8 files name as the enforcement of *"assert computed styles, never
  class names"*. That rule is currently convention only.

## 2 — One genuine live gap, already named in the code

`vitest-aliases.ts` and `tsconfig.base.json#paths` must agree, and nothing holds them together. The
file says so twice (`:13-14`, `:88-89`) and names the commit that deleted the check — `76382c5`.
`apps/docs/vite.config.ts` is the third member of that unit.

## 3 — A code comment that teaches the wrong mechanism

`core/src/zag/merge-props.ts:130-141` claims the adapter's bag stays unrecognised as a proxy, and
that *"staying unrecognised sends `merge`/`omit` down their non-proxy path"*. Measured against the
installed `solid-js`:

```
$PROXY in merge(plain, plain)          → false
$PROXY in omit(lazy)                   → true
$PROXY in merge(omit(lazy), { … })     → true
Object.keys(merge(omit(lazy), { … }))  → ['id', 'class']      // `size` does not come back
```

The **outcome** is right and the guard works. The **cause** is the `get` trap returning `undefined`
for symbol keys, not the `has` trap — `propTraps.has` answers `true` for `$PROXY` unconditionally.
The stated cost ("a key set frozen at each copy") therefore does not apply in the common case
either. This is `CLAUDE.md`'s fourth hazard: the comment is the record of a dependency's
undocumented behaviour, and it records it wrong.

## 4 — Dead code

| What | Where |
|---|---|
| `createKeyboardHandler` — 163 lines plus a 130-line browser test, **zero** consumers in `components/` or `apps/docs/` | `core/src/utils/keymap.ts` |
| `runIfFunction` — **zero** consumers. Its JSDoc names *"Button's `loader`/`loadingText`"*; `button.tsx` passes `loadingText` and `spinner` straight through and never calls it | `core/src/utils/run-if-function.ts` |
| `HydrateFixtureOptions.expectNodeReuse` — zero callers; its own doc says so | `internal-test-utils/src/hydrate-fixture/hydrate-fixture.tsx:16-29` |
| `exampleNames`, `exampleComponent` — exported, imported by nothing | `apps/docs/src/components/mdx/example.tsx:65,67` |
| `Td`'s `colSpan` prop and its whole `render` branch — no call site passes it, and its comment describes a cell that no longer exists | `apps/docs/src/components/mdx/props-table.tsx:327-351` |
| `export const order` (sidebar sorting) and `export const description` — nothing reads either; order comes from the register, descriptions from frontmatter | `apps/docs/src/mdx.d.ts:17,19` |
| `packages/panda-preset/out.css` — a **tracked** 38 kB generated stylesheet, referenced by nothing, not in `files`, not gitignored. `check:no-runtime-css` passes because it inspects the tarball | committed in `22e3241` |
| `turbo.json:104-122` — `test:unit` / `test:ssr` / `test:browser` resolve to nothing; no package owns those scripts. The file admits it | |
| `vitest-projects.ts` exists as its own module so `check:test-projects` could read the same declaration. That consumer is gone | |

## 5 — Latent defects, none reachable today

- **`service.event` is frozen at the baseline.** `core/src/zag/machine.ts:389` evaluates
  `getEvent()` once, so `service.event.type` stays `""` for the machine's life. Nothing in
  `packages/chakra-ui-solid/src` reads it, and inside actions it is correct because `getParams()`
  calls `getEvent()` fresh.
- **`bindable.ts:70-76` — two locals, one value.** `previousValue` and `settledValue` take identical
  assignments and differ only before the first flush. Two non-`sync` updater writes in one flush
  window both resolve against the pre-flush value.
- **A routing hole.** `apps/docs/src` is included only in the `browser` project. A `.test.ts` or
  `.ssr.test.ts` added under `apps/` would run in **no** project — while `check-ssr-coverage.mjs`
  walks `apps/` for `*.ssr.test.*` and would audit a file that never executes. None exists today.
- **Nothing verifies an `<Example name>` resolves to a file.** Documented at `example.tsx:22-25`.
  All 462 referenced names resolve and no basename is duplicated across the 68 directories today —
  but basename uniqueness is what the whole addressing scheme rests on, and it is unenforced.

## 6 — Duplication that is documented but unlinked

- **`drawer/` is a near-verbatim clone of `dialog/`.** After substituting the name,
  `drawer-parts.tsx` differs from `dialog-parts.tsx` by ~24 lines out of 277 and `drawer-root.tsx`
  by ~10 out of 136 — comment text and the import line. ~800 lines. The clone is intentional
  (Chakra aliases `useDialog as useDrawer`), but nothing links the two files, so a fix to one
  silently misses the other. `checkbox-card/` clones `checkbox/` the same way — `ROOT_OWN_KEYS` is a
  character-identical 12-entry tuple with an identical 6-line comment above it.
- **`renderRoot` is hand-copied across four machine families**, ~30-55 lines each with near-identical
  comments. No shared helper.
- **Test helpers are copy-pasted, not shared.** `partOf` is defined in 15 browser test files,
  `settle` in 13 with at least three different implementations, `countingComponent` in 7. None lives
  in `internal-test-utils`.
- **Three copies of one comment/string-blanking tokenizer**, acknowledged in the source:
  `check-no-runtime-css.mjs:157-206`, `check-ssr-coverage.mjs:52-101`,
  `generate-component-recipes.mjs`.

## 7 — Comments that are stale, wrong, or contradict a standing rule

| What | Where |
|---|---|
| *"Upstreaming it is the right fix … **Filed upstream as A1**"* — contradicts the standing no-upstream-contact rule. (`A1` is a `zag-solid-adapter.md` §8.1 id, not an issue number; the wording reads as a filing either way) | `core/src/zag/normalize-props.ts:66` |
| *"all three attribution checks read it: `check:attribution`, `check:attribution`, `check:attribution`"* — the same name three times, evidently a collapse of three former names | `attribution.config.ts:5-6` |
| Cites `context-budget.config.ts`'s `stale-allowance` rule; no such file exists | `declaration-support.config.ts:19` |
| Names `packages/{system,components}/src` — renamed to `core` / `chakra-ui-solid` | `scripts/check-declaration-support.mjs:53` |
| Says `HYDRATION_ENTRIES` was *"reduced to the one subject that exists at step 2"*; there are 24 | `vitest-hydration-bridge.ts:2-3` |
| Says *"`box`, `loader` and `button` carry one today"*; there are 23 component entries | `components/__tests__/components.ssr.test.tsx:348-350` |
| Says `./stylesheet` is reached from the `ssr` project, *"the only project that both runs in Node and has no DOM"*. `unit` is too, and two unit tests import it | `internal-test-utils/src/index.ts:10-15` |
| An orphaned `ColorSwatchMix` comment; the real `color-swatch:` entry at `:150` has none, unlike every other entry | `vitest-hydration-bridge.ts:126-153` |

## 8 — Shape inconsistencies between siblings

- **`Flex` and `Wrap` mutate the object Panda's `pattern.raw()` returned** (`flex.tsx:63`,
  `wrap.tsx:55`). That rests on `raw()` returning a fresh object per call — true today, undocumented
  by Panda. `Float` and `Square` pass it through untouched. Fourth-hazard shape.
- **`Checkmark` and `Radiomark` are the same component by two different styling routes.** Checkmark
  hand-composes `class={system().cx(recipeClass(), props.class)}` and honours `unstyled` itself;
  Radiomark goes through `renderStyled`'s `recipeClass`. The asymmetry is argued in Checkmark and
  not mentioned in Radiomark, so a reader meeting Radiomark first finds no reason.
- **`InputAddon` mints a `PropsProvider` it never exports** — a live `useContext` per render for a
  context with zero writers. Documented as deliberate, because upstream exports no provider.
- **`skip-nav` holds two shapes in one file**: `SkipNavLink` is a hand-written recipe body,
  `SkipNavContent` a bare `<chakra.div>` with no recipe. Neither has a props context, where every
  other atomic-recipe component does. `SkipNavContent`'s `style: { outline: "0" }` also sits in the
  `withDefaults` bag, so a consumer's `style` **replaces** it rather than composing — matching
  upstream React exactly, so parity, but the only such place in the family.
- **Namespace naming is split two ways.** 21 folders export `PropsProvider`; 6 export
  `RootPropsProvider` — `alert`, `checkbox-card`, `list`, `table`, `tag`, `timeline`. Nothing in the
  code says which rule decides, so the next port has to guess.
- **`box/__tests__/box.browser.test.tsx:20-32` hand-rolls its own mount helper**, where all 44 other
  files in its families import `mountElement` from the barrel.
- **`environment/` and `locale/` are not components.** Both folders hold only an `index.ts`
  re-export, with no component and no test in this package, yet they count toward "78 folders".
- **`@chakra-ui-solid/styled-system`'s exports map advertises runtime `.mjs` entry points its `files`
  field excludes** (`.d.ts` only). Harmless today — every import of it in shipped source is
  `import type` — and `check:no-runtime-css` only flags `.css` targets in an exports map.
- **42 top-level `function foo()` in `packages/panda-preset/src`**, against the arrow-function-by-
  default style rule. Biome's `useArrowFunction` only judges function *expressions*, so nothing
  catches them; `CLAUDE.md` lists this as a style-review item for exactly that reason.
- **`dropContainerPatternPlugin` is fail-open on one path.** `defineChakraConfig()` appends it;
  anyone using `defineConfig` + `presets: [chakraSolidPreset]` by hand — as
  `packages/styled-system/panda.config.ts` does — must remember it, or `styled-system/jsx` exports a
  second `Container` that silently ignores `fluid` and `centerContent`.

## 9 — Standing debt with one home

`packages/panda-preset/src/preset.ts:263-265` names nine recipes — `colorPicker`, `combobox`,
`datePicker`, `numberInput`, `pinInput`, `progress`, `select`, `slider`, `tagsInput` — *"known to
carry the same defect"* as the cascade-layer correction, awaiting rows when they ship. The note is
correct; it is also the only place that list lives, and those rows are behind the freeze.

## 10 — Two things a reader will re-find, already settled

Recorded so the next pass does not spend a session on them.

- **`popover` carries a raf nudge that `dialog` does not**
  (`components/popover/create-popover.ts:84-104`). This is **correct**, not an inconsistency:
  `@zag-js/popover@1.43.0` mutates `renderedElements` in place and notifies nothing, while
  `@zag-js/dialog@1.43.0` calls `context.set(...)`, a real signal write. The reason is recorded on
  popover and not beside dialog.
- **`PopoverIndicator` is deliberately absent** (`components/popover/popover-parts.tsx:79-82`) — the
  machine has the part and the recipe has the slot, but upstream exports the component from neither
  barrel.

## Not findings

Two things that look like findings and are not, checked directly:

- **`HYDRATION_ENTRIES` exists.** `vitest-hydration-bridge.ts:47`, 24 entries, enforced by
  `check:ssr-coverage`. `CLAUDE.md` is accurate.
- **`*.ssr-entry.tsx` files do not pair with `*.ssr.test.tsx`.** `alert`, `avatar`, `button`,
  `field`, `fieldset`, `input-group`, `portal` and `skeleton` ship an entry with no `ssr.test`
  beside it, and `checkbox-card`, `group` and `icon` ship an `ssr.test` with no entry. That is the
  design: an entry feeds the hydration bridge and is consumed by a **browser** test through
  `hydrateFixture()`, never by the `ssr` project.
