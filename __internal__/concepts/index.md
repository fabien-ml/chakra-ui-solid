# Concepts

What has been confirmed understood, and when. A concept is `validated` only once its QCM has been
answered correctly. **Nothing that depends on a concept gets implemented before that.**

A row carries where the concept *lives in this repo* — that column is what makes this comprehension
of the codebase rather than a lecture. `Backs` points at the `D-nn` entries already cited from code
comments ([decisions.md](../decisions.md), [decisions-ledger.md](../decisions-ledger.md),
`decisions/3.x-*.md`), so the existing corpus gets indexed by the walk rather than reorganized.

## The backlog

**77 concepts, derived by L0 on 2026-08-20** from the source tree, not from the corpus. The unit is
the **mechanism**, never the component: 78 component folders rest on the 12 rows of §D–§G below.

Ordered so **no concept depends on one numbered after it**. The sections are reading order, not
categories — §A is the ground everything else stands on, §J is the last thing that needs any of it.

A row is sized to **one round**: a diagram, a table, a snippet. Where a set is only learnable
together — the five checks, the two ambient contexts — it is one row with a table, not five rows.

Status is `not started` on every row until its QCM is passed.

### §A — The styling seam: what happens at build time (L1)

| # | Concept | Rests in | Backs | Status | Date |
|---|---|---|---|---|---|
| C1 | Panda writes the CSS at **build time**; the runtime only recomputes the name the rule was generated under | `components/box/box.tsx` · `core/src/system/system.tsx` (`CssFn`) · `styled-system/panda.config.ts` (`include`) · `components/box/__tests__/factory-extraction.test.ts` | | not started | |
| C2 | **Silent unstyling** — a class whose rule was never generated renders nothing and raises nothing | `internal-test-utils/src/stylesheet/stylesheet.ts` · `dev-stylesheet.ts` · `components/box/__tests__/box.browser.test.tsx` · `.../box.ssr.test.tsx` | | not started | |
| C3 | The **three routes** a style value can take — a static literal, a `staticCss` row, a CSS custom property. There is no fourth | `panda-preset/src/preset.ts` §`staticCss` · `components/grid/grid.tsx` · `components/bleed/bleed.tsx` · `components/color-swatch/color-swatch.tsx` · `core/src/render-styled/render-styled.tsx` (`composeStyle`) | | not started | |
| C4 | A preset is a plain config object, and this one carries its own base chain | `panda-preset/src/preset.ts` · `panda-preset/src/index.ts` · `styled-system/panda.config.ts` | | not started | |
| C5 | **Four locked config keys** — `eject`, `jsxFramework`, `jsxFactory`, `importMap` — each of which fails silently | `panda-preset/src/config.ts` (`LOCKED`, `defineChakraConfig`, `lockedKeysPlugin`) · `styled-system/panda.config.ts` · `apps/docs/panda.config.ts` | D-120 | not started | |
| C6 | `theme.extend` deep-merges; a sibling key **replaces** | `panda-preset/src/preset.ts` · `panda-preset/src/config.ts` (`ExtendOnly`) | | not started | |
| C7 | The recipe list is read off the dependency, never typed out | `panda-preset/src/recipe-registry.ts` · `panda-preset/src/container-recipe.ts` | | not started | |
| C8 | Extending a Panda utility merges **shallowly per property**, so an inherited value must be re-emitted | `panda-preset/src/alias-utilities.ts` · `panda-preset/src/current-bg-utilities.ts` | D-112 | not started | |
| C9 | Cascade layers, and the flat variant that defeats a base condition | `panda-preset/src/preset.ts` (`shadowedBaseConditions`, `conditionsOf`, `inRecipeOrder`) · `panda-preset/src/__tests__/base-condition-variants.test.ts` | | not started | |
| C10 | A Panda plugin is a set of hooks; which hook you pick is decided by what exists yet | `panda-preset/src/config.ts` (`dropContainerPatternPlugin`, `lockedKeysPlugin`) · `recipe-gate-plugin.ts` · `system-module-plugin.ts` | | not started | |
| C11 | A recipe **body's** `staticCss` is assigned over the config's, so the documented spelling is unreachable | `panda-preset/src/config.ts` (`placeRecipeRules`, `withStaticCssBodies`) · `panda-preset/src/__tests__/config.test.ts` | | not started | |
| C12 | **The import gate** — a consumer's import specifiers decide which recipes get CSS | `panda-preset/src/recipe-gate-plugin.ts` · `panda-preset/src/component-recipes.ts` · `scripts/generate-component-recipes.mjs` | | not started | |
| C13 | The generated system module, and the `declare module` augmentation that carries config-decided types | `panda-preset/src/system-module-plugin.ts` · `panda-preset/src/preset-vocabulary.ts` · `core/src/recipe/preset-variants.ts` · `components/index.ts` | | not started | |

### §B — The SolidJS 2.0 facts the spine is built out of (L2–L4)

| # | Concept | Rests in | Backs | Status | Date |
|---|---|---|---|---|---|
| C14 | A prop is a **getter**; `merge` resolves a key by *presence*, `withDefaults` by *value* | `core/src/utils/defaults.ts` · `components/button/button.tsx` · `internal-test-utils/src/__tests__/solid-contract.test.ts` | | not started | |
| C15 | A JSX-valued prop read twice builds twice — `children()`, its default, and the construction count | `components/loader/loader.tsx` · `components/checkbox/checkbox-parts.tsx` · `components/portal/portal.tsx` (the counter-case) · `components/switch/__tests__/switch.browser.test.tsx` | | not started | |
| C16 | A props bag is always bound to a **name** — a call or member expression in a spread compiles to a memo | `components/input-group/input-group.tsx` · `components/button/button-group.tsx` · `components/skeleton/skeleton.tsx` | | not started | |
| C17 | A write is deferred until the next **flush** in the client build | `core/src/zag/machine.ts` · `core/src/zag/bindable.ts` · `internal-test-utils/src/__tests__/solid-contract.test.ts` | | not started | |
| C18 | Throwing inside a memo halts the page's reactive graph, so a guard runs at **construction** | `core/src/recipe/recipe.ts` (`requireRecipe`, the duplicate untracked lookup) | | not started | |
| C19 | A descendant writing an ancestor's signal — why the write goes in `onSettled` | `core/src/internal/create-registered-id.ts` · `components/field/field-parts.tsx` · `components/fieldset/create-fieldset.ts` | | not started | |
| C20 | `createUniqueId()` shares the hydration-key counter, so the call site is unconditional and top-of-body | `components/collapsible/create-collapsible.ts` · `components/dialog/create-dialog.ts` · `components/field/create-field.ts` | | not started | |
| C21 | **Contract pinning** — the undocumented dependency behaviour this repo rests on, and where it is recorded | `internal-test-utils/src/__tests__/solid-contract.test.ts` · `.ssr.test.tsx` · `.browser.test.tsx` | | not started | |

### §C — The runtime spine: how a component is built at all (L3)

| # | Concept | Rests in | Backs | Status | Date |
|---|---|---|---|---|---|
| C22 | The system on the provider, carried as an **accessor** because a Solid context is not reactive | `core/src/system/system.tsx` | | not started | |
| C23 | The polymorphism seam — `as`, `render` as a *function*, and one merged function ref | `core/src/render/render.tsx` · `components/skeleton/skeleton.tsx` · `components/link/link.tsx` | | not started | |
| C24 | `renderStyled` — the key split done once and untracked, the lazy `class` getter, the cascade order, the five `html*` renames | `core/src/render-styled/render-styled.tsx` · `core/src/render-styled/html-props.ts` · `components/box/__tests__/box.browser.test.tsx` | | not started | |
| C25 | The `chakra` factory — the tag proxy, the inline `cva`, and why it reaches the element as `raw()` not a class | `core/src/factory/factory.tsx` · `components/box/box.tsx` · `components/center/center.tsx` · `components/group/group.tsx` | | not started | |
| C26 | The generated-recipe class — key → system → the recipe's own `variantKeys` → one class in `@layer recipes` | `core/src/recipe/recipe.ts` · `components/button/button.tsx` · `components/badge/badge.tsx` | | not started | |
| C27 | The props context — the key set snapshotted untracked, each value left lazy | `core/src/recipe/props-context.tsx` · `components/button/button-group.tsx` · `components/badge/__tests__/badge.browser.test.tsx` | | not started | |
| C28 | A named component context, and the optional reader a Field-adopting control needs | `core/src/internal/create-component-context.ts` · `components/collapsible/collapsible-context.ts` · `components/field/field-context.ts` | | not started | |
| C29 | `createRecipeContext().withContext(tag)` — the atomic-recipe one-liner, and the no-recipe case | `core/src/recipe/recipe-context.tsx` · `components/badge/badge.tsx` · `components/text/text.tsx` | | not started | |
| C30 | The hand-written recipe body — Button's shape, and when a component outgrows `withContext` | `components/button/button.tsx` · `components/separator/separator.tsx` · `components/input/input.tsx` | | not started | |
| C31 | `createSlotRecipeContext` — the multi-part seam, `wrapElement`, and the raw halves a store-owning Root uses | `core/src/recipe/slot-recipe-context.tsx` · `components/card/card.tsx` · `components/alert/alert.tsx` · `components/field/field-context.ts` | | not started | |

### §D — Component idioms with no machine (L5)

| # | Concept | Rests in | Backs | Status | Date |
|---|---|---|---|---|---|
| C32 | State as a `data-*` attribute, written **before** the spread so a consumer can override it | `components/radiomark/radiomark.tsx` · `components/checkmark/checkmark.tsx` · `components/input-element/input-element.tsx` | | not started | |
| C33 | Panda **pattern reuse** — the shorthand mapping is theirs, so our runtime and their extractor agree | `components/flex/flex.tsx` · `components/square/square.tsx` · `components/float/float.tsx` · `components/wrap/wrap.tsx` · `core/src/render-styled/render-styled.tsx` (`composeCss`) | | not started | |
| C34 | A structural fact is a CSS selector; only a marker fact becomes a context | `components/group/group.tsx` · `components/group/group-item-context.ts` · `components/stack/stack.tsx` · `components/input-element/input-element.tsx` | | not started | |

### §E — The Zag adapter (L2)

| # | Concept | Rests in | Backs | Status | Date |
|---|---|---|---|---|---|
| C35 | A machine is a state chart; a **service** is the live handle, and `connect()` turns it into an api | `core/src/zag/machine.ts` · `components/collapsible/create-collapsible.ts` | | not started | |
| C36 | The **scope** — how a machine reaches the DOM without touching `document` | `core/src/zag/machine.ts` (`createScope`) · `core/src/environment/environment.tsx` | | not started | |
| C37 | `useMachine`, the accessor form, and `seedFromProps` — why a bare call in a render body is legal | `core/src/zag/machine.ts` · every `components/*/create-*.ts` | | not started | |
| C38 | The **bindable cell** — controlled or uncontrolled, decided per read; the boxed signal; strict `!== undefined` | `core/src/zag/bindable.ts` · `core/src/zag/__tests__/bindable.test.ts` | | not started | |
| C39 | Refs — the deliberately non-reactive scratch space, and why Zag separates them from context | `core/src/zag/refs.ts` | | not started | |
| C40 | `track` — a watch effect on **deep** equality, over Solid 2.0's split `createEffect` | `core/src/zag/track.ts` | | not started | |
| C41 | The transition pipeline and the effect-cleanup ledger | `core/src/zag/machine.ts` (`send`, `rememberCleanup`, the state cell's `onChange`) | | not started | |
| C42 | The lifecycle window `onSettled` → `onCleanup`, and why the server fires no entry action | `core/src/zag/machine.ts` · `core/src/zag/__tests__/machine.ssr.test.tsx` | | not started | |
| C43 | `normalizeProps` — Zag's React spelling into Solid's, and the boolean-`aria` fix | `core/src/zag/normalize-props.ts` | | not started | |
| C44 | Prop composition — which key wins last-defined, and which four kinds chain across every source | `core/src/zag/merge-props.ts` · `core/src/zag/__tests__/merge-props.test.ts` | | not started | |
| C45 | The **lazy proxy** bag, the per-source memo, and why `has`/`ownKeys` are untracked | `core/src/zag/merge-props.ts` | | not started | |
| C46 | **Symbol withholding** — the `$SOURCES` defect that put recipe variants on the DOM | `core/src/zag/merge-props.ts` · `internal-test-utils/src/__tests__/solid-contract.test.ts` · `components/collapsible/collapsible-root.tsx` | | not started | |
| C47 | The **machine store** — getters over one memo, and why it is never spread | `core/src/machine-store/machine-store.ts` · `components/collapsible/collapsible-root.tsx` | | not started | |

### §F — Behaviour over time

| # | Concept | Rests in | Backs | Status | Date |
|---|---|---|---|---|---|
| C48 | **Presence** — a node kept in the DOM through its exit animation, and why the Root owns it | `core/src/presence/presence.ts` · `components/dialog/dialog-root.tsx` · `components/tabs/tabs-parts.tsx` | | not started | |
| C49 | The **render strategy** — `lazyMount` / `unmountOnExit`, and why it takes a plain accessor | `core/src/render-strategy/render-strategy.ts` · `components/collapsible/create-collapsible.ts` · `components/dialog/dialog-root.tsx` | | not started | |
| C50 | **Portal**, and the deferred build that keeps a nested portal from painting over its container | `components/portal/portal.tsx` · `components/popover/popover-parts.tsx` | | not started | |
| C51 | The two ambient contexts every machine reads — environment and locale — and why both default | `core/src/environment/environment.tsx` · `core/src/locale/locale.tsx` · `components/environment/` · `components/locale/` | D-126 | not started | |

### §G — Machine and multi-part anatomy (L5)

| # | Concept | Rests in | Backs | Status | Date |
|---|---|---|---|---|---|
| C52 | The machine-family **Root** — `ROOT_OWN_KEYS`, one shared `renderRoot`, and two roots off it | `components/collapsible/collapsible-root.tsx` · `components/dialog/dialog-root.tsx` · `components/checkbox/checkbox-root.tsx` | | not started | |
| C53 | A **part component** — the machine's getter merged *under* the consumer's props, and its slot class | `components/collapsible/collapsible-parts.tsx` · `components/dialog/dialog-parts.tsx` · `components/switch/switch-parts.tsx` | | not started | |
| C54 | The **item-scoped derived store** — a repeated part that carries identity | `components/radio-group/radio-group-parts.tsx` · `components/segment-group/segment-group-parts.tsx` · `components/field/field-parts.tsx` | | not started | |
| C55 | **Optional-context adoption** — a control usable alone and enriched inside a `Field.Root` | `components/textarea/textarea.tsx` · `components/field/create-field.ts` · `components/input/input.tsx` | | not started | |
| C56 | The folder layout, and the two barrels — `index.ts` (long names) and `namespace.ts` (`Collapsible.Root`) | `components/collapsible/` (7 files) · `components/card/` (3 files) · `components/field/` (7 files) | | not started | |

### §H — The test apparatus (L6)

| # | Concept | Rests in | Backs | Status | Date |
|---|---|---|---|---|---|
| C57 | One Solid compile config, and **three vitest projects split by which Solid build they resolve**, routed by filename | `solid-babel-options.ts` · `vitest-aliases.ts` · `vitest-projects.ts` · `vitest.config.ts` | D-133 | not started | |
| C58 | `mount()` — the provider, the error boundary, and the diagnostic guard that fails at `dispose()` | `internal-test-utils/src/mount/mount.tsx` · `internal-test-utils/src/system/system.ts` | | not started | |
| C59 | A style assertion asks the **engine**, in both spellings — `getComputedStyle` and the parsed sheet | `internal-test-utils/src/stylesheet/stylesheet.ts` · `dev-stylesheet.ts` · `components/box/__tests__/box.ssr.test.tsx` | | not started | |
| C60 | axe on every browser suite, with `incomplete` failing too | `internal-test-utils/src/axe/axe.ts` | | not started | |
| C61 | `renderServer()` and the shared `*.ssr-entry.tsx` `Tree` — one subject, two environments | `internal-test-utils/src/render-server/render-server.tsx` · the 23 `components/*/__tests__/*.ssr-entry.tsx` | | not started | |
| C62 | **Hydration testing** — a Vite server inside the Vite server, and the `HYDRATION_ENTRIES` registry | `vitest-hydration-bridge.ts` · `internal-test-utils/src/hydrate-fixture/hydrate-fixture.tsx` | | not started | |
| C63 | `components.ssr.test.tsx` asserts its **own completeness** against the live barrel | `components/__tests__/components.ssr.test.tsx` | | not started | |
| C64 | A second, real Panda run standing in for a consumer — including the hashed one nothing can guess | `chakra-ui-solid/package.json` (`cssgen:consumer*`) · `components/box/__tests__/__fixtures__/consumer/` · `.../consumer-hashed-run.browser.test.tsx` | | not started | |

### §I — The gates, the build, and CI

| # | Concept | Rests in | Backs | Status | Date |
|---|---|---|---|---|---|
| C65 | **The five checks**, and what each is the only witness to | `scripts/check-{no-runtime-css,attribution,declaration-support,ssr-coverage,component-recipes}.mjs` · `scripts/lib/` · `declaration-support.config.ts` | D-110 · D-178 | not started | |
| C66 | The publish shape — JSX-preserved source under the `solid` condition, one entry per subpath | `tsdown.config.base.ts` · `chakra-ui-solid/package.json` (`chakraUiSolid.entries`) | | not started | |
| C67 | Attribution — four obligations, and the `comments.legal` pin that carries them into `dist/` | `attribution.config.ts` · `scripts/check-attribution.mjs` · `tsdown.config.base.ts` · `NOTICE.md` | D-122 · D-148 | not started | |
| C68 | The mechanical half is a linter's job — Biome's promoted rules, its overrides, and the commit-msg hook | `biome.jsonc` · `.githooks/commit-msg` · `.github/workflows/ci.yml` | | not started | |

### §J — The docs site (L7)

| # | Concept | Rests in | Backs | Status | Date |
|---|---|---|---|---|---|
| C69 | The docs app is a **consumer**, not an in-repo app — dev aliases to `src`, build resolves `dist` | `apps/docs/vite.config.ts` · `apps/docs/tsconfig.json` · `apps/docs/panda.config.ts` · `apps/docs/src/config.ts` | D-01 | not started | |
| C70 | Nothing generated is committed; a Turbo task graph rebuilds it, with inputs reaching outside the package | `apps/docs/turbo.json` · `scripts/generate-route-tree.mjs` · `.gitignore` | D-125 | not started | |
| C71 | The MDX chain in a fixed plugin order, and the provider that maps every intrinsic tag | `apps/docs/vite.config.ts` · `apps/docs/src/mdx-components.tsx` · `apps/docs/src/components/mdx/prose.ts` | | not started | |
| C72 | One splat route; the content glob is the route map | `apps/docs/src/routes/docs.$.tsx` · `apps/docs/src/lib/site-map.ts` | | not started | |
| C73 | **Two sources of truth** — the register decides order, the glob decides existence | `apps/docs/src/lib/docs-config.ts` · `apps/docs/src/lib/site-map.ts` · `apps/docs/src/components/layout/` | D-140 · D-141 · D-147 · D-02 | not started | |
| C74 | An example is **one real file**, addressed by basename, shown three ways | `apps/docs/src/components/mdx/example.tsx` · `apps/docs/highlight-plugin.ts` · `apps/docs/src/examples/` | D-133 | not started | |
| C75 | Props tables are read out of the library's own TypeScript, never hand-written | `scripts/generate-props-tables.mjs` · `apps/docs/src/components/mdx/props-table.tsx` | | not started | |
| C76 | Colour mode — a pre-paint script and a module-level signal, and **no provider** | `apps/docs/src/lib/color-mode.ts` · `apps/docs/src/routes/__root.tsx` | D-113 | not started | |
| C77 | Full-document prerender, crawling its own links | `apps/docs/vite.config.ts` · `apps/docs/turbo.json` | | not started | |

## How L0 read the tree

Six parallel reading passes over the **source**, one per layer of
[progress.md](../progress.md)'s table, plus a direct read of the spine (`core/src/factory`,
`render-styled`, `render`, `render-strategy`, `recipe`, `system`, `utils`, `internal`). The corpus
was not read. Every `D-nn` above was verified to be cited from a **code comment** — there are 15
distinct ids across 24 sites, and none of them is in `packages/core/src` outside one test.

What the pass turned up that is not a concept is in
[l0-findings.md](../notes/l0-findings.md) — 30 items, none fixed, each one its own `feat/<name>`
if it is ever taken up. The measurements that cost time are rows in
[verified-facts.md](../notes/verified-facts.md).

## Where the detail goes

One line here. A concept that needs more than a line gets its own file, `cNN-short-slug.md`, and the
row links to it — diagrams, tables and snippets, never long prose.
