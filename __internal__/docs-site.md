# The docs site — the app and the information architecture

**Status:** written at P8, 2026-08-09. The docs app (TanStack Start on the beta 2.x line, prerendered
to static output on Cloudflare Pages), the site's structure, the machinery every page shares
(examples, props tables, token pages, the playground, `llms.txt`), the copyright and trademark
boundaries, and the build gate that makes a docs page a deliverable rather than a file.

**What this document is.** The *app* and the *IA*. Which routes exist, in what order, on what stack,
built and deployed how, and what CI asserts about the result.

**What it is not.** The page specs. What a page contains — its frame, its section order, what each
section must show and which settled decision it renders — is `docs-plan.md`, and §0 below draws that
line so no page is specced twice. It is also not the evidence (`prior-art.md`), the architecture
(`plan.md`), the component pattern (`component-blueprint.md`), the inventory (`roadmap.md`), the
apparatus (`testing.md`) or the bar (`definition-of-done.md`). All six are cited by section, never
restated, and the licensing mechanism is `CLAUDE.md`'s five obligations.

**Vocabulary, once.** **Static extraction** is Panda's build-time scan of source files, which
generates exactly the CSS the values it finds name. **`staticCss`** is the Panda config key that
pre-generates CSS for values no source file literally writes. A **recipe** is a named style
definition with **variants**; a **slot recipe** is the multi-part version, one style block per named
**slot**. A **machine** is a `@zag-js/*` state machine; its **anatomy** is its list of named parts,
each of which becomes a **part component** (`Dialog.Trigger`). **Prerender** here means
full-document server rendering of every route into static HTML at build time — not SPA mode, which
emits a client-hydrated shell. **Silent unstyling** is this project's central hazard: a Panda class
whose CSS was never generated renders nothing and raises no error (`CLAUDE.md`; `plan.md` §0.2).

**One citation convention, because it costs a reader ten minutes to work out.** The earlier documents
wrote `plan.md` for two different files: `__internal__/plan.md` (P3's architecture) for §0–§13, and
the approved brief plan for `§4.1 doc N`, `§5 step N` and `§8 assumption N`, which the architecture
document has no such sections for. **P9 named it and applied it:** `plan.md` is always
`__internal__/plan.md`; the brief plan is always `` `brief-plan` `` (`CLAUDE.md` § Citing the two
plans). Every citation in this document follows it.

**Settled earlier, not reopened here.** The brand, the repository name and the docs-site naming
(`decisions-ledger.md` D-01, D-02); the **port rule** (`prior-art.md` §8.2); Zag `1.43.0`; Solid
`2.0.0-rc.0`; TanStack Start's **2.x prerelease** line; `plan.md` §0's constraint at both boundaries;
**zero published CSS with Panda a hard prerequisite** (`plan.md` §4.4); the a11y kernel; the batch
order (`roadmap.md` §9); P3's Q2/Q4, P4's Q6, P5's Q7, P7's enforcement design.

---

## 0. The division of labour with `docs-plan.md`

Two documents, one rule each, and they do not overlap:

| | `docs-site.md` (this file) | `docs-plan.md` |
|---|---|---|
| Answers | **What exists, on what stack, and how do we know it works?** | **What does this page say, in what order, and which settled decision does it render?** |
| Contains | The stack and its config; the route map and nav order; the machinery pages share; the copyright/trademark flag list; the build gate; the site-wide never-say list | One spec per page: the frame, the section order, what each section must show, the citation behind each claim |
| Registers | The route map (§2.1) — the only list of which pages exist | The extraction catalogue's fixture contract (§1.4) and the component-page template (§8) |
| Never contains | A section order, or the wording of a page | A route, a build step, a CI check, or a deploy decision |

**The one deliberate seam.** Every row of the route map (§2.1) names its spec — a `docs-plan.md`
section, the component template, or *generated*. That pointer is the only thing written in both
files, and it is a cross-reference, not a duplicate. **No page is specced twice**, and §2.1's
`Spec` column is how that stays true: a page with no spec pointer is a page nobody has written down,
and a spec with no route is a page nobody can reach.

**Where a page spec and its source document disagree, the source document wins** — `docs-plan.md`'s
own rule, unchanged. Where this document and `docs-plan.md` disagree about whether a page exists,
this one wins, because the route map is the inventory.

---

## 1. The app

### 1.1 The stack, and the second job it has to do

`apps/docs`, TanStack Start on the **2.x prerelease** line — `@tanstack/solid-start@2.0.0-rc.0` and
`@tanstack/solid-router@2.0.0-rc.0`, both peering `solid-js: ">=2.0.0-0 <3.0.0"` (`plan.md` §3.2's
finding; the package graph entry is `plan.md` §5.1). It is the one line that runs against
SolidJS 2.0 at all, and `../hope-ui/apps/docs` runs it today.

**The docs app is a consumer, and that is load-bearing rather than incidental.** It installs our
published packages, writes its own `panda.config.ts` from `defineChakraConfig()`, and runs its own Panda
build — the shape `plan.md` §3.4 documents, not a privileged in-repo shortcut. Three consequences,
all of which cost something if forgotten:

1. **It is a standing instance of the step-4 gate.** The throwaway consumer of `plan.md` §1's gate
   exists for one test run and is then deleted; the docs app runs the same wiring on every push,
   forever. Running `check:css-coverage` against *its* generated sheet (§6.1) is the cheapest
   permanent version of the check that matters most.
2. **A docs example is a consumer test.** Examples import by package name and, in `build` mode,
   resolve through `exports` → `dist` under the `"solid"` condition — the real consumer path
   (§1.3). The docs' examples are the largest body of consumer-shaped code this repo will ever have.
3. **If the docs app takes a shortcut, the docs prove nothing.** Importing the repo's dev stylesheet,
   aliasing `@chakra-ui-solid/*` to `src` in the production build, or hand-writing the Panda knobs
   `defineChakraConfig()` owns each turn the site from evidence into decoration. `check:docs-consumer-config`
   (§6.1) is what keeps that from happening quietly.

### 1.2 The config, and the four knobs that are not preferences

The docs app's Vite config carries four things that follow from decisions made elsewhere. Each is
here because getting it wrong produces a failure whose message names the wrong cause.

| Knob | Value | Why it is not optional |
|---|---|---|
| `ssr.noExternal` | `[/^@chakra-ui-solid\//, /^chakra-ui-solid$/]` — the second pattern is not optional, since the main package is the unscoped one | We ship **JSX-preserved `.jsx`** under the `"solid"` export condition, with no `"import"`/`"default"` fallback (`plan.md` §8). Node cannot import raw JSX, so the prerender pass must inline and compile our packages rather than externalize them. Externalized, every route fails at build with a syntax error pointing at *our* `dist`, which reads as a broken package rather than a missing config line |
| `optimizeDeps.exclude` | our packages | The client build's dependency pre-bundler compiles JSX **as React**. A pre-bundled `chakra-ui-solid` produces a runtime that is not Solid, and the symptom is a component that renders nothing |
| `plugins` order | `mdx()` with `enforce: "pre"`, **before** `vite-plugin-solid` | MDX must emit JSX (`jsx: true`) for the Solid compiler to compile; compiled the other way round we get MDX's hyperscript shim and lose the real Solid runtime (§1.5) |
| `tanstackStart({ prerender })` | enabled, `crawlLinks`, `failOnError` | §1.6. `failOnError` is the difference between a broken route and a silently missing page |

The first two are the same fact twice — **shipping source rather than compiled output moves work into
the consumer's build**, which is `plan.md` §8's deliberate trade and the docs app is its first
victim-or-proof. hope-ui's docs app carries both settings with the same rationale in a comment, which
is the closest thing to a measurement available before a package exists.

### 1.3 Dev resolves to `src`, build resolves to `dist`

In `dev`, `@chakra-ui-solid/*` aliases to `packages/*/src` so the library hot-reloads while the docs
are being written. In `build`, those aliases are **omitted**, so resolution falls through
`node_modules` → package `exports` → `dist` under the `"solid"` condition. That split is what makes
§1.1 item 2 true: the deployed site is built the way a consumer builds.

The docs app's alias table is the third of the three files `plan.md` §9 keeps as one unit, and
`check:resolution-sync` already asserts they agree. Nothing new is needed here — it is named so that
adding the alias in the wrong branch reads as a violation of an existing check rather than a local
choice.

### 1.4 MDX, and why the highlighter runs at build time

Content is MDX: `@mdx-js/rollup` with `jsx: true` and a `providerImportSource` supplying Solid
components for intrinsic tags. Syntax highlighting is **Shiki at build time** through
`rehype-pretty-code`, baked into the compiled module. Headings get ids, and the table of contents is
extracted into a module export rather than computed in the browser.

Two reasons, and the second is the one that belongs to this project:

- A client-side highlighter ships a highlighter to every reader for content that never changes.
- **A client-side highlighter is a stylesheet injector.** Most of them create a `<style>` element on
  first render. That is precisely what `plan.md` §0 forbids of our own code, and the docs site is the
  most visible place in the project for it to appear — a reader who finds one there reasonably
  concludes the rule is negotiable. The scope gap this exposes is real and is §8's first row:
  `check:no-runtime-sheet` greps `packages/*/src/**` (`testing.md` §5.2) and **does not see
  `apps/docs/src`**.

One measured wrinkle, carried rather than rediscovered: `vite-plugin-solid`'s native JSX backend
picks its parser dialect from the file extension and does not recognise `.mdx`, so the docs app pins
`compiler: "babel"` for its own build. It is a workaround with a stated expiry — the day the JSX pass
uses the same normalized filename as its siblings — and it affects only this app, so the library's
own tests and Storybook keep the native backend a consumer gets by default.

### 1.5 Prerender: static output, not SPA mode

```ts
tanstackStart({ prerender: { enabled: true, crawlLinks: true, failOnError: true } })
```

**Full-document SSR of every route into static HTML.** Not SPA mode, which prerenders a
client-hydrated shell: the prose would be absent from the HTML, which costs search indexing, costs
readers on slow connections the entire content of the page, and — specific to us — makes the site
stop being evidence that our packages server-render at all.

The output is `dist/client`, a static tree with one `index.html` per route, plus `dist/server`.
**Cloudflare Pages serves `dist/client` alone**, and the gate in §7.1 is what proves it can.

### 1.6 Cloudflare Pages — the setup, in order

1. **Name the Pages project `chakra-ui-solid`.** Cloudflare derives the subdomain from the project
   name, so this is what produces `chakra-ui-solid.pages.dev`. It is first-come and it is the one
   naming decision `decisions-ledger.md` §6 item 2 leaves open, assigned here, to be done **at setup** rather
   than at first deploy.
2. **No custom domain** (`decisions-ledger.md` D-01). `chakra-ui-solid.dev` / `.com` are deliberately
   not bought; a custom domain is a swap, not a migration, if that ever changes.
3. **Deploy `dist/client` as static assets.** No Workers runtime, no server functions, no
   `_redirects` beyond a 404 mapping to the prerendered not-found page.
4. **Preview deploys on pull requests**, production on the release branch. The preview URL is what
   §7.1's smoke test runs against, so the gate needs no production deploy to close.
5. **The site goes public before the repository does.** The repository is private (`decisions-ledger.md` D-02),
   so a public docs site is itself the trigger for `decisions-ledger.md` §6 item 1 — the maintainer message.
   `decisions-ledger.md` D-168 draws that line at *"a public docs site or public repository presented as
   usable"*, so a preview URL shared with a reviewer is not it and a launched site is.

### 1.7 Plan B — Vite SPA + `@solidjs/router`, and what makes it an exit rather than a rewrite

`plan.md` §3.2 requires Plan B to be documented with exit criteria. Both halves matter, and the
second half is a constraint on what we build **today**.

**The triggers, any one of which is sufficient:**

| # | Trigger | How it is observed |
|---|---|---|
| B1 | The prerender gate (§7.1) fails and the cause is inside `@tanstack/solid-start`, not our config | `check:prerender-complete` red with no config change that fixes it |
| B2 | A Start or Router release moves its `solid-js` peer off the 2.x range, and no pinned pair satisfies both it and the `solid-js` the catalog pins | The catalog cannot be solved; `pnpm install` fails or resolves a second Solid |
| B3 | The prerelease line stalls — **two consecutive `solid-js` 2.0 bumps the Start line does not follow**, while the docs build is broken against the newer Solid | A review call with a number attached, not a mood |

**Evaluated at the `2.0.0-rc.0` bump (2026-08-13): neither fired.** Start and Router both published
`2.0.0-rc.0` the same day Solid did, peering `>=2.0.0-0 <3.0.0`, so the catalog solved on the first
try, one `@solidjs/web` landed, and `pnpm build:docs` prerendered every route. B3's counter is back
to zero. Plan B stays parked.

**What Plan B costs, stated rather than implied:** SSR and prerender, and therefore prose in the
HTML. Search indexing, first-paint content, and — the loss that is ours alone — the docs app stops
being the only place outside the `ssr` Vitest project where the *published* packages get
server-rendered. `llms-full.txt` is unaffected, because it is generated from MDX **source** rather
than from rendered HTML (§4.5), and that is one of the reasons it is generated that way.

**What makes the exit cheap, and the standing constraint that keeps it cheap:** the MDX pipeline, the
Panda consumer config, the examples pipeline, the props-table generator, the playground and the route
structure are all framework-agnostic. The migration is the router and the entry, not the content —
**provided nothing in the content layer uses a Start-only API.** So, as a rule from day one:

> **No server functions, no server routes, no Start-specific data loading in the content layer.** The
> site is static; anything that needs a server at request time is out of scope, and the one feature
> that would want one is the free-form playground, which §4.4 defers for its own reasons.

That rule is checkable — `check:docs-no-server-fns` (§6.1) — which is what turns "Plan B is
documented" into "Plan B is reachable".

---

## 2. The information architecture

### 2.1 The route map

> **Amended at S3b, 2026-08-09**, when the app was built and the list met a reader for the first
> time. Six changes, each with a `decisions-ledger.md`
> [§3.14](decisions/3.14-s3b-visual-surfaces.md) entry: the `guides/` tier is deleted and its
> one page moves under Styling (**D-136**); `frameworks/storybook` is gone and its measured hazard
> relocated (**D-137**); the whole AI tier and the five generated `/llms*.txt` routes are
> **deferred to before first public release**, with their cost stated at §4.6 (**D-138**);
> `get-started/migration` is deferred, not dropped (**D-139**); the framework pages are **three**;
> and the component tier is **111** rows rather than 113 (**D-140**, §2.4).
>
> **The list is explicitly non-exhaustive.** A page with no reader is a candidate for the same
> treatment, and the treatment is *deferred with its cost stated*, never *quietly absent*.
>
> **Amended again at S3b part 3, 2026-08-09**, the first time this table was read beside
> `__reference-impl__/chakra-ui/apps/www/docs.config.ts` rather than from memory (**D-147**).
> Four corrections, and three of them are counts this table asserted without opening the source:
>
> - **`/docs/reference/chakra-config` becomes `/docs/theming/chakra-config`** (**D-155**). The
>   fifth tier this row invented is one `check:docs-inventory` rejects outright — its
>   `SETTLED_TIERS` is the four — so the route as written was unreachable *and* a red build.
> - **The style-prop family is 17 pages, not 18** (**D-158**). Their nav declares 16 and their
>   content directory holds 17: `divide` has a page and no nav entry. Ours takes the 17.
> - **The theming token family is 11 pages, not 12** (**D-158**), and §4.3's *"Token pages (13)"*
>   is the same error counted a third way. `tokens` and `semantic-tokens` are Concepts pages with
>   prose; the 11 rendered-from-the-preset pages are the Design Tokens group.
> - **The nav register moves into the app as a declared tree** (**D-151**), so this table stops
>   being the only place the site's order lives. It keeps the `Live` column and gains nothing
>   else: order and grouping are `apps/docs/src/lib/docs-config.ts`, existence is the content
>   tree, and obligation is `roadmap.md` §4 (**D-153**).

**A structural copy of chakra-ui.com's IA, minus the tiers whose mechanism does not exist here** —
`get-started/`, `components/`, `styling/`, `theming/`. Charts excluded (`roadmap.md` §5.7).
**Structure is not expression; a sentence is** (`CLAUDE.md`, *Reference use*) — §3 is where that line is drawn
page by page, and it is not re-derived here.

**The top bar is exactly four items: Get Started · Components · Styling · Theming.** No sponsor
button, no version dropdown, no Docs/Showcase/Blog/Guides split, no Charts. A tier renders in the
bar once it has a page (**D-141**) — the site is built incrementally and is meant to be readable at
every gate (`definition-of-done.md` rule 2.15), and a nav item pointing at an empty tier is a 404
with a promise attached.

`Spec` is the seam of §0: every row points at the `docs-plan.md` section that says what the page
contains, at the component template, or at *generated* — a page rendered from data with no prose to
spec. **`Live`** is when the page exists: `3b` shipped with the app, and the rest arrive with the
step that gives them content.

| Route | Renders | Source | Spec | Live |
|---|---|---|---|---|
| `/` | The parity sentence verbatim, the disclaimer, the Panda prerequisite | `plan.md` §0, §4.4; `docs-site.md` §3.4 | `docs-plan.md` §3 | **3b** |
| `/docs/get-started/installation` | The prerequisite above the install snippet; the consumer's `panda.config.ts` | `plan.md` §4.4, §3.4 | `docs-plan.md` §4 | **3b** |
| `/docs/get-started/build-setup` | That there is no configuration, why the plugin derives it, and the symptom table for when a toolchain gets it wrong | `plan.md` §8 | `docs-plan.md` §4 | **3b** |
| `/docs/get-started/environments/shadow-dom` | The environment context and `getRootNode` | `plan.md` §7.2; `roadmap.md` §5.1 | `docs-plan.md` §4 | step 5 |
| `/docs/get-started/environments/iframe` | Same context, the other host | `plan.md` §7.2 | `docs-plan.md` §4 | step 5 |
| `/docs/get-started/migration` | The §0.4 delta table **with its Cause column**, and P6's six per-component corrections | `plan.md` §0.4; `roadmap.md` §5, §13 row 1 | `docs-plan.md` §5 | **deferred** — the table it renders is mostly about components that do not exist yet, so it lands with B8 |
| `/docs/styling/static-extraction` | The dynamic-value contract as a consumer contract. **Moved here from `/guides/`** (D-136) | `plan.md` §3.5, §1.4, §0.2 | `docs-plan.md` §1 | step 4, behind `check:extraction-fixture` |
| `/docs/styling/overview` | Where a class comes from; the first link is the guide above | `plan.md` §3.5, §3.6 | `docs-plan.md` §7.1 | step 4 |
| `/docs/styling/styled-factory` | `renderStyled`, the `styled` factory, `render`, precedence | `component-blueprint.md` §3.4, §3.5; `prior-art.md` §2.5 | `docs-plan.md` §7.1 | step 4 |
| `/docs/styling/conditional-styles` | Panda conditions over the machine's `data-*` | `component-blueprint.md` §3.7 | `docs-plan.md` §7.1 | step 5 |
| `/docs/styling/responsive-design` | Responsive **style props** work; responsive **recipe variants** are the opt-in | `plan.md` §3.8, §1.4 | `docs-plan.md` §7.1 | step 4 |
| `/docs/styling/css-variables` | Route 3, and override path 1 | `plan.md` §3.5, §3.7; `component-blueprint.md` §5.3 | `docs-plan.md` §7.1 | step 4 |
| `/docs/styling/dark-mode` | Colour mode as **our API** — the primitive, the pre-paint script, and D-113's failure mode beside it. **Rewritten from *consumer snippet* at 3c** (D-134) | `plan.md` §7.1 | `docs-plan.md` §7.2 | **3c** |
| `/docs/styling/{focus-ring,layer-styles,text-styles,animation-styles,cascade-layers,virtual-color,color-opacity-modifier}` | Preset features, one page each | the preset | `docs-plan.md` §7.1 | step 4 |
| `/docs/styling/style-props/*` — **17** pages | The prop→CSS-property tables | our utilities + the generated `isCssProperty` | **generated** (§4.3) | step 4 |
| `/docs/theming/overview` | preset → your config → your stylesheet. No runtime system | `plan.md` §3.6, §3.7 | `docs-plan.md` §7 | step 4 |
| `/docs/theming/tokens` + **11** token pages | The token tables | the installed preset | **generated** (§4.3) | step 4 |
| `/docs/theming/semantic-tokens` | The `_dark` condition contract | `plan.md` §7.1 | `docs-plan.md` §7.2 | **3c** |
| `/docs/theming/{recipes,slot-recipes}` | The variant API is Chakra's; the resolution is a static import | `plan.md` §3.6 | `docs-plan.md` §7.3 | step 4 |
| `/docs/theming/customization/*` — 11 pages | The four override paths, one worked example each | `plan.md` §3.7 | `docs-plan.md` §7.4 | step 4 |
| `/docs/theming/customization/recipes` | Also: the two preset deltas we add | `definition-of-done.md` §6 | `docs-plan.md` §7.4 | step 6a |
| `/docs/theming/chakra-config` | Every knob `defineChakraConfig()` owns, and `responsive`'s three grains. **Moved from `/docs/reference/` at S3b part 3** (**D-155**) | `plan.md` §3.3, §3.4, §3.8 | `docs-plan.md` §6 | step 4 |
| `/docs/components/<name>` — **111 pages** | One per shipping row that is not a relocation (§2.4) | `roadmap.md` §4 | `docs-plan.md` §8 (template) | per batch |

**The nav order is this table's order at the section level and the register's within a section.**
`apps/docs/src/lib/docs-config.ts` is chakra-ui.com's tree applied to our page set — section →
group → page, with their group titles and their order — and the component tier is **grouped as
theirs is** (Layout, Typography, Buttons, Date and Time, Forms, Collections, Overlays, Disclosure,
Feedback, Data Display, Internationalization, Utilities) rather than alphabetical (**D-151**).
Alphabetical was this table's original instruction, and it was wrong for the same reason
`roadmap.md` §4's batch order is: 111 alphabetical entries is a list to scan, and their twelve
groups are a list to navigate.

**One page is deliberately outside the four sections' obvious homes**: `chakra-config` is an API
reference for a function Chakra has no analogue for — its equivalent is `createSystem`, which does
not exist here (`plan.md` §0.4). It sits in **Theming → Concepts**, next to the pages about what a
consumer writes in their config, and it is linked from the install page and the styling overview,
which is how the readers who came for it actually arrive. **It does not get a `reference/` tier of
its own** (**D-155**): the top bar is four items, and a fifth content directory fails
`check:docs-inventory` outright rather than merely looking odd.

### 2.2 What chakra-ui.com has and we do not — one reason each

> **Taken entry by entry through `docs.config.ts` at S3b part 3** (**D-152**), which is the first
> time this table was written against their register rather than against a memory of their site.
> Twelve rows were already here and stand unchanged. **Fourteen are new**, and they fall into
> four shapes: their React-framework guides, their *Concepts* group, the pages whose subject is a
> composition rather than a component, and the entries that are a **rename** rather than an
> absence. A rename is listed here too — a reader looking for their page name needs to be told
> where it went, and that is the same service as being told why it is gone.

| Their page | Why it is absent |
|---|---|
| `get-started/frameworks/*` — `next-app`, `next-pages`, `remix`, `vite`, `tanstack-router` | **The whole group is gone, and the category with it.** Theirs names one guide per React framework. A SolidJS app no longer picks a framework: SolidStart retired into `@solidjs/vite-plugin`'s start mode (2026-08-13), TanStack Start is a plugin on the same Vite, and a client-only app is that Vite with a flag off. All three want the identical configuration, which is none — measured, not asserted — so the three pages this site had collapsed into one `get-started/build-setup`. A stated divergence: upstream's own Vite card names a build tool among frameworks, which reads as a category here because it is the only one |
| `get-started/changelog` | An external link to a file in a public repository. Ours is private (`decisions-ledger.md` D-02), so the nav item would point at a 404. It reappears the day the repository is public, on the same trigger as `get-started/contributing` |
| `components/concepts/overview` | **The group is dropped, not the pages** — the four rows below say where each went. An overview page for a component tier whose index is a top-bar item is a page whose whole content is the nav |
| `components/concepts/composition` | **Relocated to `/docs/styling/styled-factory`, and per component to `### render`** (`docs-plan.md` §8.8). Their page is largely about `asChild`, which is the one thing we are certain not to have; the replacement is a prop on every part, so it is documented on every part's page |
| `components/concepts/animation` | **Relocated** to `/docs/styling/animation-styles` for the preset half and to each component's `### Presence` section for the behavior half (`docs-plan.md` §8.11). Splitting it is not a preference: the two halves have different owners here — one is the preset, one is the machine |
| `components/concepts/color-mode` | **Relocated to `/docs/styling/dark-mode`**, which is where our own primitive is documented (**D-134**) and where `roadmap.md` §4.5 already files the relocation |
| `components/close-button`, `components/icon-button` | **Documented on `/docs/components/button`.** One source folder, one page: `roadmap.md` §4.3's `button` row ships `ButtonGroup`, `IconButton` and `CloseButton`. Splitting one folder into three pages would make the component tier disagree with `check:docs-inventory`, which reads the folder |
| `components/theme` | Their `<Theme>` component scopes a colour mode or token set to a subtree at **runtime**. There is no row for it in `roadmap.md` §4 and there will not be: it is the component form of the runtime theming `plan.md` §0.4 excludes |
| `components/calendar`, `password-input`, `rich-text-editor`, `prose`, `toggle-tip`, `overlay-manager`, `link-overlay` | Already covered by the compositions row below; listed by name here because a reader searching this table searches for a page name |
| `charts/*` — the whole tier, 16 pages | Already covered by the `docs/charts/*` row below. The tier is a **top-level nav item** on their site, which is the level at which its absence is visible: our top bar is four items and theirs is five |
| `styling/chakra-factory` | Already covered below — renamed to `/docs/styling/styled-factory` |
| `theming/customization/*` — 11 pages | **Present, not absent.** Listed here only because their group is titled *Customization* and ours is the same 11 pages under the same title; no reader should conclude from this table's length that the tier is thinner |
| `get-started/cli` | There is no CLI. Chakra's installs snippets into a consumer's app; ours would be a product nobody has built. **And the one snippet it would matter for no longer needs installing** — colour mode is library API here (`plan.md` §7.1; **D-134**), which is the strongest form this row could take |
| `get-started/figma` | No design kit exists |
| `get-started/ai/mcp-server`, `get-started/ai/skills`, `get-started/ai/llms` | **We ship none of the three, for now.** `llms.txt` is not dropped — it is deferred to before first public release along with the whole AI tier (§4.6), where the cost of deferring it is stated rather than left to evaporate |
| `get-started/playground` | The playground is §4.4's, and §4.4's own constraint is why it is not a `get-started/` page: a live editor accepting arbitrary style props is impossible without a build step, so what ships is prebuilt examples plus controls over pre-generated value sets. That belongs beside the components it varies, not in a setup tier |
| `get-started/frameworks/storybook` | **Dropped as a page; the hazard it carried is not** (**D-137**). Storybook is a local playground here and contributes no gate (**D-133**), so a top-level framework page for it would be the only nav item on the site pointing at something we do not treat as a deliverable. The measured crash — Storybook 10.5 makes `HTMLElement.prototype.focus` an accessor and Zag's read of it throws `Illegal invocation` (**D-130**) — reaches any consumer running a Zag machine in Storybook, so it moves to a **section on `/docs/get-started/build-setup`**, which is where a reader configuring a Vite-based dev harness already is. (It named `frameworks/vite` until that page and its two siblings became `build-setup`; the destination is the same screen under its current name.) It lands with the first machine component (step 5), which is the first moment the hazard can actually bite a reader — **Collapsible shipped it, and the section has not been written**, so this row is an open obligation rather than a record |
| `components/server-component` | No Solid equivalent. React Server Components are a React-specific model and SolidStart has its own; there is nothing to port and nothing to warn about |
| `components/testing` | Deferred. What it would say that no other page says is *assert computed styles, never class names* — and that already appears in its highest-value position, at the end of the install page's *did it work?* section, where a reader is looking for exactly it |
| `get-started/contributing` | The repository is private (`decisions-ledger.md` D-02). The page reappears the day it is not |
| `docs/charts/*` | **Excluded on a dependency ground**, not a styling one: `@chakra-ui/charts` peer-depends on `recharts >= 3` and `react >= 18`, and there is no Solid charting substrate to bind to (`roadmap.md` §5.7). The reason belongs on the migration page, where a reader looking for charts will actually be |
| `docs/styling/chakra-factory` | **Renamed**, not dropped — `/docs/styling/styled-factory`. Naming a page after their factory uses the mark as an identifier for our own API surface, which is exactly the line `docs-site.md` §3.4 draws |
| Component pages for `for` and `show` | Excluded as Solid-native (`roadmap.md` §5.3, §5.4). The migration page maps them to `solid-js`'s own `<For>` / `<Show>` — the mapping is the deliverable, not a page |
| Their composition pages — `password-input`, `rich-text-editor`, `calendar`, `prose`, `toggle-tip`, `overlay-manager`, `link-overlay` | These document **compositions**, not library components: they live in Chakra's compositions app and are installed into a consumer's source by its CLI. Under the port rule we ship no compositions, so there is nothing to document. Whether we ever ship a compositions tier is not a docs question and is not opened here |

### 2.3 What we have and chakra-ui.com does not

- **`/docs/styling/static-extraction`** — the loudest page on the site (`brief-plan` §7 concern 2),
  and the one with no upstream analogue that transfers (`docs-plan.md` §1.1). **It lived at
  `/docs/styling/static-extraction` until S3b** and moved here with the `guides/` tier's deletion
  (**D-136**): it was that tier's only page, there is no Guides nav item, and an unreachable page is
  a worse outcome for the loudest page on the site than a relocated one.
- **`/docs/theming/chakra-config`** — §2.1. It sits in Theming's *Concepts* group rather than in a
  `reference/` tier of its own: the top bar is four items, and a fifth content directory is a
  `check:docs-inventory` failure rather than a layout choice (**D-155**).
- **Component pages Chakra does not document at all.** Chakra's docs cover a subset of its own
  components: `circle`, `square`, `span`, `strong`, `sticky`, `spacer`, `quote`, `loader`,
  `input-group`, `input-addon`, `input-element`, `focus-trap`, `format`, `toggle` and others have a
  source folder and no page. Ours ship with pages, because `roadmap.md` §4 is our inventory and a
  shipped component without a page is a component nobody can find.

### 2.4 The count trap

> **Corrected at S3b** (**D-140**), when `check:docs-inventory` was written and had to name the set
> it checks. **Our component tier holds 111 pages, not 113**, and the arithmetic is:
> `roadmap.md` §4's **116** directories → **114** shipping rows (`for` and `show` excluded) →
> **111** component pages, because the three relocations (`color-mode`, `environment`, `locale`) are
> documented where their mechanism lives rather than in the component tier. The check reads that
> rule directly: a row whose `Status` begins with `ships` owes a `/docs/components/<name>` page, a
> `relocated` row does not.
>
> **This makes §2.4's point stronger rather than weaker.** The two numbers were never comparable,
> and now they are not even equal, so nothing invites the arithmetic in the first place.

Chakra's docs directory holds **113 component pages**; our component tier holds **111**. **The
sets are different and neither count means anything about the other.** Theirs includes pages for
`for` and `show`,
pages for compositions that are not components (§2.2), and pages named for a different granularity
than the source folder — `radio` for `radio-group`, `rating` for `rating-group`,
`segmented-control` for `segment-group`, `icon-button` and `close-button` for members of the Button
family — while leaving other source folders undocumented altogether (§2.3).

Recorded because the arithmetic is inviting: **checking our page count against theirs proves
nothing**, and `check:docs-inventory` (§6.1) checks ours against `roadmap.md` §4, which is the only
list that means anything here.

---

## 3. The copyright boundary — every place upstream expression would be reproduced

> **§3.2 rows 1–3 and §3.3 are RETIRED for the content tier, S3b, 2026-08-09** (**D-148**).
> Chakra's docs are under the same single MIT grant as their code — one `LICENSE` at their repo
> root, none under `apps/www`, and `"license": "MIT"` on the root `package.json`. MIT permits
> copying their prose outright; the one condition is that the notice travels with it. **So the
> content tier copies their pages and owes one `NOTICE.md` row**, not a rewrite.
>
> What stays: **rows 4–9**, which were never about prose — generated tables stay generated, token
> tables stay rendered from the installed preset, and no screenshot of chakra-ui.com appears
> anywhere. §3.4 was named here as *unchanged*, and the block below is where that stopped being
> true.
>
> **The row was written at S3b part 3**, when the content tier first carried their prose: one
> directory-scoped entry in the root `NOTICE.md`, under the existing **Chakra UI** section —
> `apps/docs/src/content`, from `chakra-ui/chakra-ui`'s `apps/www/content/docs`, MIT, © 2019
> Chakra Systems Inc. It is deliberately **not** an `attribution.config.ts` entry: that registry
> is the expression-tier register for **code**, its three checks assert a matching `@license`
> header per file, and 111 headers is the per-file bookkeeping D-148 collapsed. `check:notice-rows`
> is unaffected — its orphan scan reads `packages/…` rows only.
>
> `CLAUDE.md`, *Reference use*'s three tiers are **unchanged for code**, which is what they were written for.

> **§3.4's *no logo, wordmark or favicon derivative* is RETIRED, and §3.3's proxy is SPENT, S4,
> 2026-08-10** (**D-173**, **D-174**). The landing page carries Chakra's bolt in three forms and
> their `favicon.ico`. Four files in the same MIT-licensed repository as their code, so the copy is
> permitted and a `NOTICE.md` row is the condition — the same reading D-148 applied to their prose,
> applied to their assets.
>
> **Trademark did not move, and the mitigations are what carry it**: the logotype reads
> `chakra-ui-solid`, none of Chakra's wordmark **lettering** is reproduced, no social card and no
> combined mark exists, and the disclaimer is verbatim above the fold on the home page and in every
> footer. §3.4 below is rewritten to state that boundary rather than the flat ban it replaced.
>
> §3.3's proxy — *no `@license` header and no `NOTICE.md` row anywhere under `apps/docs/src/**`* —
> was already retired for the content tier by D-148 and is now spent outright:
> `apps/docs/src/components/site/icons.tsx` carries a header. §3.3 below is what replaced it, and it
> is a check rather than a reading.

### 3.1 The rule, cited

`CLAUDE.md`, *Reference use*'s three tiers, unchanged: **reasoning** owes nothing, **API shape** owes nothing,
**expression** — a function's structure and sequence, a data table, its comments — owes an `@license`
header plus a row in the root `NOTICE.md` and the package's. Structure is not expression; a sentence
is. That line is not re-derived here; §3.2 applies it page-part by page-part.

### 3.2 The flag list

Every place a 1:1 structural copy would otherwise pull upstream expression across, what is written
instead, and which tier it lands in.

| # | Where it would happen | What is written instead | Tier |
|---|---|---|---|
| 1 | **A page's frontmatter `description`** and its opening sentence — Chakra's are written prose | Ours, written from the component's own behavior. The *keys* (`title`, `description`, `links`) are structure and are copied deliberately | Expression → **rewritten** |
| 2 | **Each example's explanatory sentence** — *"Use the `size` prop to change the size of the …"* appears once per example across their component tier | Ours. This is the single largest surface, roughly one sentence per example across 113 pages, and it is the one that would be easiest to paste and hardest to notice | Expression → **rewritten** |
| 3 | **Example source files.** Chakra keeps ~1 200 of them, one per documented example | Ours, written against our API — `render` not `asChild`, `ids` on the Root, no runtime `css` values. Convergence on the anatomy is expected and owes nothing; convergence on *content*, ordering and copy is the tell. §3.3 is the proxy | API shape ↔ expression → **written fresh, with a mechanical proxy** |
| 4 | **The anatomy snippet** under `## Usage` — the part tree | Copied in shape, because part names *are* the API and `CLAUDE.md`, *Reference use* puts them at the API-shape tier. Ours differs where the anatomy differs (`roadmap.md` §4's `Parts` column) | API shape → **owes nothing** |
| 5 | **The props tables** | Generated from our types and our preset (§4.2). Never transcribed from their published tables — which is also the only version that stays true | Generated → **owes nothing** |
| 6 | **The token tables** — colors, spacing, radii, shadows, typography | Rendered at build time from the **installed** `@chakra-ui/panda-preset`. That is `CLAUDE.md`, *Reference use*'s *depend, do not vendor* doing its job: we render what the dependency contains, we do not transcribe it into our source | Data, at build time → **owes nothing** |
| 7 | **Illustrations and anatomy diagrams** | Any anatomy figure is generated from the machine's `anatomy` export, or drawn fresh. Nothing is traced, recolored or re-lettered from theirs | Expression → **none reproduced** |
| 8 | **Screenshots of chakra-ui.com** | None, anywhere — including in the README, social cards and this repo's `__internal__/` | Expression → **none reproduced** |
| 9 | **The migration page quoting Chakra** | Short API signatures and prop names (API shape). Never their explanatory paragraphs. The one long quotation the site carries is `docs-site.md` §3.4's disclaimer, which is ours | API shape → **owes nothing** |
| 10 | **`llms-full.txt`** | Generated from our MDX source, so it inherits whatever the pages carry — which means a single pasted upstream paragraph is republished in a second, machine-readable form. Flagged because it multiplies rows 1 and 2 rather than adding a new one | Derived → **inherits** |
| 11 | **The docs site's own UI** — nav, search, sidebar, code-block chrome | Ours, written against our own components and preset. Looking Chakra-ish is the product working correctly; reproducing their layout *as an identity* is §3.4's question, not this section's | Trademark → §3.4 |
| 11a | **The site's icons and favicon** — the bolt in three forms, `favicon.ico` | **Theirs, copied**, under the same MIT grant as their code. Row 11 covers the UI we wrote; this row covers four files we did not. Registry entry, `@license` header and a root `NOTICE.md` row — §3.3 | Expression → **attributed** |

### 3.3 The docs app is in the registry, and what `package: null` drops

The proxy this section used to hold asserted the registry would gain **no** `apps/docs` entry. That
was a sound proxy for a policy of writing every docs file fresh, and both the policy and the proxy
are gone — D-148 retired it for prose, D-173 for the assets. What is left needs the opposite rule.

**`attribution.config.ts` covers `apps/` as well as `packages/`.** An `AttributionEntry`'s
`package` is `string | null`, and `null` says no package publishes this file. It narrows what the
entry owes; it does not excuse it:

| Obligation | `package: "zag-solid"` | `package: null` | Why |
|---|---|---|---|
| Registry entry | ✅ | ✅ | The single place a derivative is declared |
| `@license` header naming the upstream file | ✅ | ✅ | A claim about the file, not about npm |
| Row in the root `NOTICE.md` | ✅ | ✅ | The audit surface, whatever the channel |
| Row in the package's `NOTICE.md` | ✅ | — | The notice that travels in the tarball. There is no tarball |
| `LICENSE` + `NOTICE.md` in `files` | ✅ | — | Same reason |
| The header still present in `dist/` | ✅ | — | Nothing builds a `dist/` for it |

**The three dropped rows are all the same fact stated three ways: no npm consumer.** They are not a
judgement that the docs app matters less. It is *published* — to Cloudflare Pages — which is why the
first three rows are not dropped with them.

**A second list, because a directory and a binary cannot carry a header.** Six root-`NOTICE.md`
rows have no possible `@license` header: `apps/docs/src/content` (a directory, and deliberately one
row rather than 111 — D-148), `apps/docs/public/favicon.ico` (a binary), and the four framework
logos (another project's mark shown unmodified — nominative use, not our derivative at all). They
are declared in `attribution.config.ts`'s **`noticeOnlyPaths`**, each with the reason it cannot be
an entry.

Without that list the orphan scan could not read `apps/` rows at all, because every one of them
would report as a row with no entry. With it, **every row in the root table is declared in exactly
one of the two lists**, and `check:notice-rows` asserts both directions over both. The tell that this
was worth doing: widening the scan failed on its first run, on two header lines
`apps/docs/src/components/site/icons.tsx` did not have.

`check:license-headers` and `check:notice-rows` are the artefacts; `testing.md` §9 defines them.

### 3.4 Trademark — the chrome

Page titles and nav say `chakra-ui-solid`; "Chakra UI" appears in body copy where it is genuinely
the subject — the home page, the migration page — and never in the site chrome. The palette
arriving through the preset as our default *theme* is the licensed code doing its job and is not
brand use.

**The bolt and the favicon are used. The wordmark is not.** That is the line, and it is not the one
this section held before D-173. Four files come across under the same MIT grant as the rest of
Chakra's source: `BlitzIcon`, `BlitzFillIcon` and the `LogoIcon` glyph, which are a registry entry
with a header, and `favicon.ico`, which is a binary and so a `noticeOnlyPaths` row — §3.3 for both.
**A licence to copy a file is not a licence to use a mark as an identity**, so the copyright question
closing does not close this one, and four things do:

| # | What holds | Where it is, in the shipped site |
|---|---|---|
| 1 | The logotype reads **`chakra-ui-solid`**, never `chakra` alone | `site-header.tsx`, beside `LogoIcon` |
| 2 | **None of Chakra's wordmark lettering is reproduced** — the glyph travels, the set type does not | The header pairs their glyph with our name in our type |
| 3 | **No social card and no combined mark exists** — no asset anywhere pairs their mark with ours as one lockup | `apps/docs/public/` holds the icon set — `favicon.ico`, `icon.svg` and its three PNG renders, all the same glyph — the manifest, and four framework logos. Nothing else, and nothing in it sets their mark beside our name |
| 4 | The **disclaimer is verbatim** above the fold and in every footer, naming chakra-ui.com as a live link | `hero-section.tsx`; `site-footer.tsx`; the wording in `apps/docs/src/config.ts` |

**Row 4 is the one carrying the weight, and it is why it is above the fold rather than beside it.**
Under a mark-derived name, with the upstream's own glyph in the header, a reader's first question is
whether this is the official project — and the disclaimer is the only thing on the page that answers
it. The link is not a courtesy: it is what turns a disclaimer into a redirect, so a reader who wanted
chakra-ui.com leaves in one click.

**What would reopen this section**: reproducing their wordmark lettering, building a combined mark or
a social card, or any use that reads as the site's identity rather than as a link to the project it
ports. Each is a decision, not a slip — and each lands here before it lands in a commit.

One line survives from before all of this and is the reason the section exists: the §3.2 flag list is
a **copyright** control and this section is the **trademark** one, and **neither substitutes for the
other.** D-173 is the case in point — it moved four files across the copyright line and moved nothing
at all across this one.

---

## 4. The machinery every page shares

### 4.1 The examples pipeline — an example is a deliverable

**Every example is a real `.tsx` file** under `apps/docs/src/examples/<component>-<name>.tsx`,
importing by package name. The page renders the component *and* reads the file's source for the code
pane, so preview and code cannot diverge — a hand-copied snippet drifts silently, and the drift
survives every check that exists.

`prior-art.md` §8.1's fourth clause is the operative rule: *a deliverable verified by a
file-existence check is verified in name only.* ZagListbox's stories were written, typechecked,
linted and committed without being opened, and every one crashed. So:

**`check:docs-examples`** — every example file (a) typechecks under the docs app's tsconfig, (b)
imports only from subpaths that exist in `plan.md` §5.5's exports map, (c) **mounts in the `browser`
project** with no console error and a non-empty root, and (d) carries the axe run every mounting test
carries (`definition-of-done.md` rule 2.1 applies to them by construction — they are mounting tests).

(c) is the one that earns its place. It is the difference between "the example compiles" and "the
example works", and compiling is what the crashed stories all did.

### 4.2 The props table — generated from types, and what a missing one looks like

**Generated. Never hand-written.** Three inputs, merged, one JSON per component, produced at docs
build time:

| Input | What it contributes | Read from |
|---|---|---|
| **The machine's `Props` type** | Most Root props — `open`, `defaultOpen`, `onOpenChange`, `ids`, `modal`, … | `@zag-js/<machine>`'s types, resolved through our lockfile |
| **Our own part props** | Everything we add: `render`, `unstyled`, `as`, the style-prop surface, Chakra-only props | The TypeScript compiler API over `packages/chakra-ui-solid/src/components/<component>/**` |
| **The recipe's variant map** | `size`, `variant`, `colorPalette` and their literal unions, plus `defaultVariants` | The imported preset object — the same read `plan.md` §1.3 already does, and **P7-A**'s fallback path |

Two properties this buys, and one trap it does not close:

- **It cannot drift in the direction that matters.** A component gaining a prop gains a table row on
  the next build. A hand-written table would omit it, and a reader would conclude the prop does not
  exist — a failure with no error and no test.
- **The machine half would be better than Chakra's own.** Chakra fetches Ark's prop metadata from
  `ark-ui.com` at generate time; reading the type from the installed package versions the table by
  our lockfile rather than by whatever the network returned. *Prospective, not built* — see the reach
  paragraph below: this input has no implementation, and the machine props reach a table today
  because we declare them ourselves.
- **The trap: a missing table renders as an empty box, and an empty box looks intentional.** So
  `check:props-tables` asserts an entry for every part component `check:anatomy-parts` knows about
  (`testing.md` §8). No entry is a red build, not a quiet gap.

**What fails if the generator itself drifts:** the JSDoc descriptions. Types and defaults are
mechanical; the sentence beside them is prose, and it is exactly as trustworthy as any comment
(`definition-of-done.md` §7.4). Stated so nobody reads "generated" as "verified".

**Its reach, as built — one of the three inputs, and how far it walks.** The script implements **our
own part props** and nothing else: the TypeScript compiler API over
`packages/chakra-ui-solid/src/components/<component>/**`. Neither the machine's `Props` type nor the
preset is read. (Its own header numbers the three the other way round from the table above; go by the
subject, not the digit.)

The first machine component still shipped a correct Root table, because **we re-declare the machine's
props ourselves** — `CreateCollapsibleProps` writes out the nine `@zag-js/collapsible` keys a consumer
passes, the eleven in its `props.ts` minus the two the library injects from context. That makes the
machine input a **deduplication rather than a prerequisite**, and it retires P8-C3's gate as written
(§7.2): "a non-empty, correct Root props table for the first component page with a machine" now passes
whether that input exists or not. Two consequences of the walk itself, from `25c7084`:

- **`foldLocalOptions` folds the whole local heritage chain, not one link.** A single hop left
  `CollapsibleRootProps` with **0** rows — `CollapsibleRootProps` → `CollapsibleRootBaseProps` →
  `CreateCollapsibleProps`, and only the last declares anything — and left `CloseButtonProps` at
  **0** the same way, empty since it shipped. They are 9 and 6 now. `IconButtonProps` had its six
  all along, so the commit message's claim that both were empty is half wrong; what it and
  `FlexProps`, `FloatProps`, `WrapProps` lost was the *inherited* sentence, because a fold dropped
  the base's own non-local heritage (`HTMLChakraProps<"button">`, `FlexProperties`, …) along with
  the base's name. `close-button.mdx` and `icon-button.mdx` both still point at `ButtonProps`, which
  was the only table with rows; each can point at its own now.
- **`lazyMount` and `unmountOnExit` are named, never listed — and the sentence that names them is
  wrong about what they are.** They live on `RenderStrategyProps` in `packages/core`, outside the
  walked directory, so they reach a table only as an `extends` name — where `Inherited` renders them
  as *"the whole style-prop surface and the DOM attributes of the element it renders, several hundred
  names"*. They are neither. Collapsible's page demonstrates `unmountOnExit` in its **Lazy Mounted**
  example while its own table implies the prop is a DOM attribute, and `lazyMount` appears nowhere on
  the page at all. **Eleven tables inherit a named interface this way** — also `FlexProperties`,
  `FloatProperties`, `WrapProperties`, `GroupProps`, `SquareProps`, `GridProps`, `ColorSwatchProps`,
  `PropsProviderProps<…>`.

  **Widening the walk to `packages/core` is the wrong fix, and would be wrong in the Default column.**
  `RenderStrategyProps` declares `@default false` for both, but Chakra defaults them to **true** on
  six components (`dialog`, `drawer`, `tooltip`, `menu`, `action-bar`, `floating-panel` —
  `parity-matrix.md` §6.1). One shared interface cannot state a per-component default, so folding it
  would stamp a wrong `false` onto six tables. **The route is to re-declare the two props on each
  component's own props interface with its own `@default`** — the same thing we already do for the
  machine's keys rather than reading Zag's types, and for the same reason: the table has to be right
  per component, not right on average. The renderer owes the other half, splitting its sentence so a
  named interface is not described as a DOM attribute. Assigned to **Phase 4**; this is the
  discoverability failure §4.2's own trap paragraph is about, arriving as a *wrong* sentence rather
  than an empty box.

### 4.3 Generated pages — tokens and style props

Two page families have no prose to spec, which is why §2.1 marks them *generated* rather than
pointing at `docs-plan.md`:

- **Token pages** (**11**) render the installed preset's token groups — name, value, and the CSS
  custom property each compiles to. Build-time data (§3.2 row 6). *Corrected from 13 at S3b part 3*
  (**D-158**): their Design Tokens group is eleven pages, and `tokens` and `semantic-tokens` are
  Concepts pages with prose to spec rather than tables to generate.
- **Style-prop pages** (**17**) render the prop → CSS-property mapping from our utilities and the
  generated `isCssProperty`, so the list is *our* vocabulary, including the ≤95 Chakra aliases
  (`plan.md` §2.2). A hand-written list here would be wrong the first time an alias lands.
  *Corrected from 18* (**D-158**): their nav declares sixteen and their content directory holds
  seventeen — `divide` has a page and no nav entry — and ours takes the seventeen.

Both regenerate on a preset bump, which is the point: `testing.md` §11's preset-minor trigger already
fires `check:css-coverage`, and these pages change in the same PR rather than months later.

### 4.4 The playground, constrained by `plan.md` §0

**A live editor accepting arbitrary style props is impossible without a build step.** `css()` computes
class names and never injects (`plan.md` §0.1), so a value typed into a browser produces a class whose
rule was never generated: no error, no warning, no style. That is not a limitation of our playground —
it is the governing constraint, seen from the reader's side.

So v1 ships **prebuilt examples plus controls whose value sets are already generated.** Per control
type, what it can and cannot offer:

| Control | Can offer | Cannot offer | Why |
|---|---|---|---|
| **Recipe variant select** — `size`, `variant`, `colorPalette` | Every value in the recipe's variant map, switchable instantly | Any value outside the map | The preset declares `staticCss` per recipe (`plan.md` §1.2), so **all** of them are pre-generated. Switching is a class swap; nothing is built |
| **Enumerated machine prop** — `placement`, `orientation`, `dir` | Every value the machine accepts | — | The recipe styles against the machine's `data-*` (`component-blueprint.md` §3.7), so no new CSS is involved. `dir="rtl"` is free because RTL rides on logical properties (`plan.md` §7.3) |
| **Boolean machine prop** — `modal`, `closeOnEscape`, `disabled`, `readOnly` | All of them | — | Behavior, not style. Props read once at machine creation remount the example on change, which is what a consumer would also have to do — the control says so rather than hiding it |
| **Render-strategy toggle** — `lazyMount`, `unmountOnExit` | Both | `hideMode: "activity"` | Not shipped, no Solid equivalent (`component-blueprint.md` §7.3) — a `React→Solid` row, and the control's absence is the honest form of it |
| **Token picker** — a `colorPalette`, a spacing step | Members of the declared set | An arbitrary color or length | Route 2 (`plan.md` §3.5). The set is finite and pre-generated, or it is not offered |
| **Numeric / dimension input** — a width, an offset, a gap | **Only where the example author pre-wired a CSS custom property** — the control writes `style={{ "--playground-w": v }}` and the example's class reads `var(--playground-w)` | The same value as a style prop | Route 3 (`plan.md` §3.5), which is exactly what the eight CIJ-marked components already do (`roadmap.md` §3.1). It is per-example by construction: a generic numeric control cannot exist |
| **Free-form code editing** | — | Everything | §4.5 |

**The rule that keeps the playground from becoming the hazard it explains:** every control's value set
is enumerated from the same source `staticCss` is declared from, and `check:playground-values` (§6.1)
fails on a control offering a value outside it. A control that silently renders nothing would be
`plan.md` §0.2 shipped as a feature, on the page most likely to be a reader's first contact with the
constraint.

### 4.5 Free-form editing — deferred, with the options recorded

Not shipped at v1. Four routes, recorded so the question is not re-derived from scratch:

| Option | What it needs | Status |
|---|---|---|
| **a. Server-side Panda per submission** | A server at request time | **Foreclosed by the deployment** (§1.5) — static Pages assets have no runtime. Naming this is honest: it is the one capability the static choice costs |
| **b. Panda in the browser** | `@pandacss/*` running client-side | **Unmeasured, and the largest unknown.** Panda's generator is Node-oriented — config loading, `fs`, a resolver. Nobody here has tried it, and reasoning about it instead of measuring it is what `prior-art.md` §8.1 exists to prevent. If it is ever attempted, it is a probe, not a plan |
| **c. An external sandbox** — "open in StackBlitz" | A third-party frame running a real Vite build | **Works today**, costs an external dependency and a frame we do not control. The pragmatic escape hatch, and the one a reader can already reach for |
| **d. A bounded playground vocabulary** | A `staticCss` block covering a chosen cross-product — a few properties × the spacing/color scales | **The incremental path.** Converts "free-form" into a large finite menu at a stylesheet-size cost that is measurable before it is paid |

Recommended order if it is ever picked up: **d**, then **c** as the escape hatch for anything d
cannot reach. **b** only after a probe. **a** only if the deployment changes, which is a bigger
decision than a playground.

### 4.6 `llms.txt` — deferred to before first public release, with its cost stated

> **Deferred at S3b, 2026-08-09** (**D-138**), not dropped. The five `/llms*.txt` routes leave
> §2.1, `check:llms-fresh` is not written, `docs-plan.md` §4.4's `ai/llms` page goes with them, and
> §2.2's `ai/*` row becomes *we ship none of the three, for now*.
>
> **The trigger is `decisions-ledger.md` D-168's**, and it is the same moment: the first public release. That is
> not a coincidence and it is the whole reason the deferral is affordable — **the audience for
> these files does not exist until the site is public.** A generated file nobody can fetch is a
> maintenance obligation with no reader, and keeping it current through eight batches of churn
> would cost more than writing it once at the end.
>
> **What the deferral costs, stated where it is paid rather than left to evaporate.** The paragraph
> below is the argument, and it does not weaken by being postponed: the index's three lead
> sentences are the **highest-leverage prose on the site**, because an assistant that has not read
> them writes `<Box w={width}>` and the user gets silence. That is the same failure
> `/docs/styling/static-extraction` exists for, arriving through a channel that page cannot reach —
> and for as long as this is deferred, **that channel is uncovered**. Nothing else in the docs
> closes it, and no check will report it missing.

Five generated files: `/llms.txt` (the index), `/llms-full.txt`, and the split
`components` / `styling` / `theming` files for limited context windows.

**Generated from MDX source, not from rendered HTML.** Code fences stay fences, the output survives
Plan B (§1.7), and it does not depend on the prerender.

**The index leads with three sentences, and they are the highest-leverage prose on the site:** no
runtime CSS-in-JS; Panda in the consumer's build is required, not optional; a style-prop value must be
statically extractable, declared in `staticCss`, or routed through a CSS custom property. The reason
is `brief-plan` §7 concern 2 at scale — an assistant that has not read those three sentences writes
`<Box w={width}>`, and the user gets silence. That is the same failure the guide page exists for,
arriving through a channel the guide page cannot reach.

`check:llms-fresh` (§6.1) asserts regeneration is a no-op, because a stale `llms.txt` is a document
that is confidently wrong with no reader able to tell.

---

## 5. What the docs must never say

Ten claims. Each is false, each would be believed, and each has a failure mode with no error message
attached.

| # | Never | Because |
|---|---|---|
| 1 | **That Panda is optional**, or that there is a way to use this library without it | There is not. No `.css` file is published from any package, ever (`plan.md` §4.4). A reader who believes otherwise installs, runs, and sees every component render naked with nothing anywhere saying why |
| 2 | **That a prebuilt stylesheet exists**, or name any published `.css` entry point | It was rejected on three grounds and removed, not deferred (`plan.md` §4.4). `check:exports` asserts no published `package.json` exposes one, so the docs would be the last surviving trace of a tier that does not exist |
| 3 | **That a non-Panda consumer tier exists** — "CSS-variable overrides only", "default theme only" | Same decision. A half-functional tier costs more in docs and issues than it earns, and every knob added afterwards would have to be documented twice |
| 4 | **That `createSystem` works**, or that theming happens at runtime | Build-time `panda.config.ts` only (`plan.md` §0.4). This is the single most likely wrong assumption a Chakra v3 reader arrives with, which is why the migration page states it in the delta table rather than in prose |
| 5 | **That a `css` prop or style prop accepts a runtime value** | It accepts one that Panda can evaluate at the call site. Anything else is route 2 or route 3 (`plan.md` §3.5), and the failure is silence — `/docs/styling/static-extraction` is the whole page about it |
| 6 | **That `asChild` is supported** — but never that `as` is missing either | Polymorphism is `as` **and** `render`, on every component and every part, exactly as the React version has it. What is rejected is the JSX **child**: `render` is a **function**, never a JSX element, because a Solid JSX element is an already-constructed node with no `cloneElement` to apply props to, so accepting one could only mean dropping every computed prop (`component-blueprint.md` §3.5) |
| 7 | **That a consumer can run our lint rule** | `check:style-contract` runs on **our** source (`testing.md` §6.5). A consumer's route-3 mistakes are in their files, scanned by their Panda run, and no consumer-facing equivalent ships at v1. The page may say the rule exists and what it enforces; it must not tell a reader to run it |
| 8 | **That `hideMode: "activity"` exists** | React 19's `<Activity>` has no Solid equivalent and Ark's own Solid package does not ship the prop (`component-blueprint.md` §7.3). Documenting it would describe a prop that type-errors |
| 9 | **That `Portal` takes `disabled`** | Not shipped at all, in either form — and not shipping it is what makes passing it a type error rather than a silent no-op (`roadmap.md` §5.1) |
| 10 | **That a class-name check proves a style applied** | `classList.contains("p_4")` passes on a completely unstyled element (`plan.md` §0.2). Any verification step the docs give a reader — the install page's *did it work?* section especially — reads a **computed style** |

**`check:docs-forbidden-claims`** greps the content tier for the string forms of these — `asChild`,
`createSystem`, `styles.css`, `.css"` in an import, `classList.contains` in a snippet — with the
honest caveat that **it catches strings, not claims**. A page can satisfy it and still be wrong. The
list is a review contract with a tripwire, in the shape `definition-of-done.md` §7 uses for every
convention that cannot be fully mechanized.

Two allowed exceptions, so the check does not fight the pages that exist to discuss these: the
migration page names `asChild`, `createSystem` and the rest as **the thing that is absent**, and
`/docs/styling/static-extraction` shows a class-name assertion as **the thing not to write**. Both are
allow-listed by path, and the allow-list has two entries.

---

## 6. The docs build gate — a docs page is a deliverable

### 6.1 What CI asserts

One new job, `docs`, and the checks it contains. Each is a script specified here and nowhere else,
except the three marked *reused*, which are existing artefacts pointed at a second input.

**`Live`** is the step each check starts running at. Three landed at **S3b** with the app; the rest
arrive with the machinery they check, and a check with nothing to check is not written early
(`definition-of-done.md` §0).

> **None of the 25 `check:*` scripts this document names exists**, including the three the `Live`
> column marks **S3b** — they were deleted in the 2026-08-10 apparatus cut and the document was
> restored without them (`CLAUDE.md`). The real `docs` job in `.github/workflows/ci.yml` runs
> `pnpm build:docs` and nothing else, and it has no deploy step. So **S3b** in the column below
> means *the step this was designed to start at*, not *running since*. **Never write one because
> this table names it.**

| Check | Asserts | A failure means | Live |
|---|---|---|---|
| `check:docs-links` | Every internal link and heading anchor in the content tier resolves to a prerendered route and an id that exists in it | A dead link, or a heading renamed out from under a cross-reference. The site is a graph and its edges are the only navigation a reader has | step 4 |
| `check:docs-examples` | §4.1: every example typechecks, imports only real subpaths, **mounts** with no console error and a non-empty root, and runs axe | The example is a file, not a deliverable — the exact failure `prior-art.md` §8.1's fourth clause is named after | **S3b** |
| `check:extraction-fixture` | `docs-plan.md` §1.4's catalogue: each ✅ row's class is present in the fixture's generated sheet and each ❌ row's is absent, and the page's tables are regenerated from the result | A row on the loudest page in the docs became false. Prose cannot hold that claim across a Panda minor (`docs-plan.md` §1.4) | step 4, with the page |
| `check:prerender-complete` | §7.1's four assertions on `dist/client` | The static deployment is incomplete or is an SPA shell. Both look like a working `pnpm dev` | step 8 (**P8-A**) |
| `check:docs-inventory` | Every `/docs/components/*` route has a `roadmap.md` §4 row whose `Status` begins with `ships` and whose directory exists under `packages/chakra-ui-solid/src/components`, and every such component has a route. A `relocated` row owes no component page (§2.4) | A page for an unbuilt component is a promise (`roadmap.md` §9.2); a built component with no page is a component nobody finds | **S3b** |
| `check:props-tables` | §4.2: an entry for every part component `check:anatomy-parts` knows about | A missing table renders as an empty box, and an empty box looks intentional | step 4, with `check:anatomy-parts` |
| `check:playground-values` | §4.4: every control's value set is a subset of the recipe's variant map or a `staticCss`-declared set | The playground offers a value that renders nothing — `plan.md` §0.2 shipped as a feature | step 4, with the first playground |
| ~~`check:llms-fresh`~~ | **Not written** — deferred with the AI tier (§4.6, **D-138**) | — | before first public release |
| `check:docs-consumer-config` | The docs app's `panda.config.ts` is `defineChakraConfig()` plus `include`/`outdir` only, its production build carries no `src` alias for our packages and its dev build does, and nothing under `apps/docs/src` imports the repo's own dev stylesheet | §1.1. The site stops being evidence the moment it is built differently from a consumer's app | **S3b** |
| `check:docs-no-server-fns` | No server function, server route, or Start-only data API in the content tier | §1.7's exit stops being cheap, and nobody notices until B1–B3 fires | step 4 |
| `check:docs-forbidden-claims` | §5's string forms, with two path allow-list entries | Catches strings, not claims — a tripwire under a review contract | step 4 |
| **reused** — `check:css-coverage` | Runs a second time against the **docs app's own generated sheet** | The permanent instance of the step-4 gate (§1.1). A variant the docs emit that the docs' own Panda run never generated is the whole hazard, reproduced in the one place a reader will see it | **step 4** (**D-139**) |
| **reused** — `check:no-runtime-sheet` | Extended to `apps/docs/src/**` | §1.4. Its scope was `packages/*/src/**` (`testing.md` §5.2) and the docs app was invisible to it — §8 row 1, applied | **S3b** |
| **reused** — `check:resolution-sync` | Already covers the docs app's Vite alias (`plan.md` §9). Reports **5 resolutions across 3 files** from S3b | Nothing new; named so §1.3 is not re-implemented as a local rule | **S3b** |
| **reused** — `check:test-projects` | Extended to `apps/docs/src/**`, because the docs app now owns a test — the examples' mounting run | A mis-suffixed test there never runs and nothing says so, in the one place the repo validates a component the way a consumer uses it | **S3b** |

**`check:css-coverage` against the docs sheet lands at step 4, and the reason is not scheduling**
(**D-139**). The check does not exist yet — it is `testing.md` §3 and arrives with the step-4
throwaway consumer — and there is a second reason it could not mean anything here even if it did:
the docs app's Panda run reaches values *our* components name through the **buildinfo**, which
`chakra-ui-solid` does not emit until it has a recipe to declare. A coverage check with
no buildinfo to read has nothing to be wrong about. `apps/docs/panda.config.ts` already names the
path, and `apps/docs/turbo.json`'s `cssgen` inputs already declare the coupling, so the check is
the only piece still missing at step 4. §3.1 step 4 and this row now say the same thing.

The `docs` job runs on every push, after `codegen` and `cssgen`, and its deploy step runs on pull
requests (preview) and the release branch (production).

### 6.2 What it cannot assert

Stating this is half the gate's value, and every row is a failure that looks like one of §6.1's.

| Not caught | Why | What covers the part that can be covered |
|---|---|---|
| **That the prose is true** | Nothing decides it from source | Only two page regions are mechanically true: the fixture-backed catalogue (`docs-plan.md` §1.4) and the generated tables (§4.2, §4.3). Everything else is review |
| **That an example's explanation matches its code** | Two artefacts, one of which is a sentence | The code pane is read from the file (§4.1), so the *code* cannot lie. The sentence beside it can |
| **That a hand-written page is complete** | The template (`docs-plan.md` §8) is a convention; only its generated sections have a checkable shape | `check:props-tables` for the props section; review for the rest |
| **That a component looks right** | No screenshot baseline and no visual regression at v1 | Computed-style assertions in the library's own tests (`testing.md` §2). The docs add nothing here and should not pretend to |
| **That the deployed site matches the built one** | Deploy-time drift is outside the build | §7.1's smoke test proves one build reached one URL. Nothing proves the next deploy did |
| **External link liveness** | It fails for reasons that are not ours, on someone else's schedule | At most a scheduled job that reports rather than fails, in the shape `check:fork-drift` already uses (`testing.md` §9) |
| **That a consumer's build reproduces ours** | The docs app is **one** config. A consumer with `hash: true`, an extra preset, or a different `include` gets a different sheet | The dedicated checks for exactly those knobs — `check:hash-config`, `check:responsive-grain`, `check:css-coverage` in the step-4 consumer (`testing.md` §8, §3.8). Assumption **P8-D** carries the residue |
| **The docs site's own chrome, for accessibility** | Examples are mounting tests and carry axe (§4.1); the nav, sidebar and search are not tests | Nothing, at v1. Stated as a gap rather than left to be discovered |
| **That the playground's behavior controls are meaningful** | Offering `modal` on a component that ignores it is a content mistake, not a type error | Review. `check:playground-values` covers only the styling half, which is the half that fails silently |

### 6.3 Where the job sits

`testing.md` §12's CI job map does not have a `docs` row — it was written before this document
existed. Adding one is a `testing.md` edit, which is P7's document, so it is **§8 row 2**: a P9
reconciliation item, not a change made here.

---

## 7. Assumptions

### 7.1 `brief-plan` §8 assumption 6 — the runnable gate

> *"`@tanstack/solid-start@2.0.0-beta.30` prerendering to static output on Cloudflare — the Solid 2.0
> peer is verified; the prerender-to-Cloudflare path is not."*

`definition-of-done.md` §8.1 assigns the gate to P8 and calls it *"a deploy smoke test over the
prerendered output"*. Written out, it is four assertions plus a deploy, and it closes the assumption
the first time it passes in CI:

```
check:prerender-complete            # build-time, every push on the docs job
  1. every route in the generated route manifest has an index.html under dist/client
     — count equality, and the missing list printed on failure
  2. every index.html contains its page's rendered <h1> text and at least one <p>
     — this is what separates full-document SSG from an SPA shell, and an SPA shell
       is green on assertion 1 alone
  3. serving dist/client ALONE (a plain static file server, no dist/server present),
     every route returns 200 with no console error and issues no request to a path
     outside dist/client
  4. the 404 route resolves to the prerendered not-found page

check:deploy-smoke                  # on pull requests, against the preview deploy
  5. wrangler pages deploy dist/client --project-name chakra-ui-solid  (preview)
  6. HEAD every route on the preview URL: 200, correct content-type
  7. one GET, diffed against the local dist/client bytes for the same route
```

Assertions 1–4 are the ones that can fail for reasons inside our control; 5–7 are the ones assumption
6 is actually about. **Until 5–7 pass once, the assumption is open and §1.7's Plan B stays live** —
which is the practical meaning of documenting Plan B rather than merely naming it.

### 7.2 Assumptions P8 opens

Their gate rows belong in `definition-of-done.md` §8, which is P7's document — so they are stated
here with their gate and carried to P9 as §8 row 3.

| # | Assumption | Gate | Runs at |
|---|---|---|---|
| **P8-A** | `dist/client` is self-sufficient for static hosting — no route needs a server runtime | §7.1 assertions 1–4, then 5–7 | Step 8, and every docs build thereafter |
| ~~**P8-B**~~ | **Closed at S3b.** MDX compiles through `vite-plugin-solid` under Solid 2.0 with the `compiler: "babel"` pin (§1.4) | The docs build ran, six routes prerendered with their prose in the HTML, and an MDX page rendering three examples mounts them in the `browser` project | — |
| **P8-C** | **Split into three at S3b** (**D-142**), because one gate covered three subjects with three different first-existence dates. §4.2 gives the generator three inputs and P8-C asserted all of them at once against a Dialog that does not exist until step 5 | — | see below |
| **P8-C1** | The generator reads **our own part props** from the TypeScript compiler API with no running system object | **Closed at S3b**: a non-empty, correct table for `Box` — `as` and `render`, with their types and their JSDoc, read from `packages/chakra-ui-solid/src/components/box/box.tsx` | — |
| **P8-C2** | The generator reads the **recipe's variant map** with no running system object | The variant section of the first component page with a recipe. **Shares its fate with P7-A**, which needs the same map and is already dated step 4 | Step 4 |
| **P8-C3** | The generator reads a **machine's `Props` type** from `@zag-js/<machine>` through our lockfile | ~~A non-empty, correct Root props table for Dialog — the first component page with a machine~~ **This gate no longer tests the assumption.** Collapsible was the first machine page and its Root table is non-empty and correct with input 1 unbuilt, because `CreateCollapsibleProps` declares the machine's nine consumer-facing keys itself (§4.2). A gate that passes either way tests nothing — what would is a **diff** of a declared interface against `@zag-js/<machine>`'s `Props` | **Open**, and no longer blocking a component |
| **P8-D** | The docs app's Panda run is representative of a consumer's, so `check:css-coverage` against its sheet means what the step-4 run means | `check:docs-consumer-config` (§6.1) — **live from S3b**, which is the half that can pass now. The coverage half needs the check itself and the buildinfo, both step 4 (**D-139**). Note what neither proves: representativeness of one config, not of all | Step 4, every push |

---

## 8. What P8 changes — re-plan P9 against this

> **All seven were applied at P9**, each in exactly one place: row 1 → `testing.md` §5.2 · row 2 →
> `testing.md` §12 · row 3 → `definition-of-done.md` §8.3b · row 4 → `definition-of-done.md` rule
> 2.15 · row 5 → `plan.md` §4.4 · row 6 → `CLAUDE.md`'s document index · row 7 → the
> document-precedence rule in `CLAUDE.md` and `decisions-ledger.md` §7. The full log is `decisions-ledger.md` §7.

| # | The source says | P8 decides | Touches |
|---|---|---|---|
| **1** | `testing.md` §5.2: `check:no-runtime-sheet` greps **`packages/*/src/**`**, ours, tests excluded | **The scope is one path short.** `apps/docs/src` is our source too, and it is the most likely place a runtime stylesheet appears — a client-side highlighter, a theme toggle, a playground shortcut — and the most visible place for a reader to conclude the rule is negotiable (§1.4). The docs gate requires the check to cover `apps/docs/src/**`. **Not edited here**: the artefact is defined exactly once, in `testing.md` | **P9** — one path added to `testing.md` §5.2 |
| **2** | `testing.md` §12's CI job map lists its jobs, and none of them is the docs | **A `docs` job exists** (§6.1), running after `codegen` and `cssgen`, with a deploy step on PRs and the release branch. Recorded, not written, for the same reason as row 1 | **P9** — one row in `testing.md` §12 |
| **3** | `definition-of-done.md` §8's register holds every open assumption with its gate | **Four more** — P8-A…P8-D (§7.2). P8-A is the runnable form of `brief-plan` §8 assumption 6, which §8.1 already lists as *P8's script to write*; the other three are new | **P9** — four rows in `definition-of-done.md` §8 |
| **4** | `definition-of-done.md` §2's per-component rules | **A shipping component owes a docs page**, enforced by `check:docs-inventory` (§6.1) — the positive form of `roadmap.md` §9.2's *a page for an unbuilt component is a promise*. There is no rule row for it today, and the docs job is where it fires | **P9** — one row in `definition-of-done.md` §2 |
| **5** | `plan.md` §4.4's deliverable table assigns the **README first line** to **P8**: *"Requires Panda CSS in your build. Not optional — this library publishes no CSS."*, above the install snippet, before the feature list | **Carried, wording unchanged**, and it appears in three places rather than one: the README first line, the docs home (`docs-plan.md` §3), and above the install snippet on the install page (`docs-plan.md` §4). Writing the README **file** is not this pass — documents only | **P9**, and the implementation pass at step 8 |
| **6** | `brief-plan` §4.1 register lists **ten** documents, and `docs-site.md` is doc 7 | **Eleven.** `docs-plan.md` was opened between P6 and P7 and is a peer of this document, not a section of it — §0 is the split. The register has no row for it | **P9** — the document register |
| **7** | `brief-plan` §4.1 doc 7 lists *"props tables, token pages"* and the playground constraint | **All of it stands**, and three things are added it could not have known: the fixture-backed extraction catalogue as a **build gate** (§6.1), the docs app as a **standing instance of the step-4 gate** (§1.1), and `llms.txt` generated from **source** rather than rendered HTML (§4.6). Where doc 7's contents list and `roadmap.md` §5/§13, `docs-plan.md` §1 or `testing.md` §6.5 disagree, the later documents win | **P9** |

---

## 9. What P8 could not act on

| Item | Why not | What it blocks |
|---|---|---|
| **Running any of it** | No package exists, by P-pass rule. Every config shape above is read from `../hope-ui/apps/docs` at `main` or from the reference checkouts; nothing has been built, deployed or served | Nothing. §7.2's four assumptions carry the exposure |
| **Assumption 6 itself** | It needs a build and a Cloudflare account. P8 can write the gate, not run it (`definition-of-done.md` §8.1 assigns exactly that) | **P8-A**, at step 8. Plan B stays live until it closes |
| **The real prop lists** | The generator needs the packages installed and the preset resolved — the same limit `plan.md` §13, `component-blueprint.md` §14, `roadmap.md` §14 and `testing.md` §13 all hit | **P8-C**, and through it the shape of every component page's props section |
| **Panda in the browser** (§4.5 option b) | Nobody here has tried it, and reasoning about a dependency's source instead of measuring it is what produced two wrong verdicts in the prior art (`prior-art.md` §8.1) | Free-form editing, which is deferred with its options recorded and no verdict attached |
| **Chakra's docs content as a moving target** | §2.1's structural mapping is against the checkout as it stands. Their IA will change | Nothing structural — `check:parity-matrix` (`testing.md` §11) already fires on a Chakra minor and is where a new tier would surface |
| **Visual regression** | No baseline, no runner, and a screenshot suite whose failures are mostly noise is worse than none | Nothing today; §6.2 records it as a stated gap rather than an oversight |

**Rows from earlier phases that reach P8, and what P8 did with each:**

- `roadmap.md` §13 — row **1** (the six per-component corrections → the migration page,
  `docs-plan.md` §5 section 2), row **5** (`RootProvider`/`PropsProvider`/`Context` →
  `docs-plan.md` §8's template has a slot for each, omitted where the component has none), row **8**
  (docs follow the batches → `check:docs-inventory`, §6.1, and §8 row 4).
- `component-blueprint.md` §13 — row **10** (*"docs must carry `ids`"* → `docs-plan.md` §8 section 7,
  on every component page, with the desynchronization hazard stated).
- `definition-of-done.md` §10 — row **2** (D-2's answer absorbed into `docs-plan.md` §1.2 sections 4
  and 6, unchanged and not re-answered).
- `docs-plan.md` §2 — **D-1** answered (`docs-plan.md` §1.4), **D-2** absorbed.
- `decisions-ledger.md` §6 — item **2** (name the Pages project `chakra-ui-solid`, §1.6 step 1). Item **1**'s
  trigger is noted where it fires (§1.6 step 5) but is D-168's to close.
- `plan.md` §12 — row **13** (the responsive opt-in's docs home is `docs-plan.md` §6, with the
  failure it fixes staying on `docs-plan.md` §1), row **14** (the README first line, §8 row 5),
  row **5** (`defineChakraConfig` gets its own reference page, §2.1), row **9** (the Cause column, carried
  intact into `docs-plan.md` §5).

---

## 10. The P9 flags carried forward, untouched

Five rows from `definition-of-done.md` §10 that P7 recorded and deliberately did not fix. They are
reproduced here **unedited**, including the stale wording, because a flag that gets tidied on the way
past stops being a flag.

> **All five were applied at P9**, each in exactly one place, with a pointer left where a reader
> would otherwise re-derive it: row 1 → `zag-solid-adapter.md` §6.4 and §8.2 · row 3 → `plan.md` §5.2
> · row 4 → `CLAUDE.md`'s document index and `decisions-ledger.md` · row 8 → `plan.md` §0.4 · row 9 →
> `plan.md` §12 row 3. The table below stays as written — it is the record of what was carried, not a
> live queue. `decisions-ledger.md` §7 is the full reconciliation log.

| # | The source says | P7 decided | Still open for |
|---|---|---|---|
| §10 row 1 | `zag-solid-adapter.md` §6.4: *"`prior-art.md` §7 is explicit that a faithful Dialog port scores six inherited axe allowances, and the DoD has to record them as expected"* | **Three, not six, and open-state only.** §6.4's sentence is stale in its number, right in its instruction | **P9** — the reconciliation pass |
| §10 row 3 | `plan.md` §5.2: `internal-test-utils` depends on `system` | **Right about the direction, early about the date.** The edge appears at milestone 3 | **P9** |
| §10 row 4 | `brief-plan` §4.1 doc 6: *"per-file and per-component DoD"* | **Four tiers** — per file, per component, per batch, per release | **P9** |
| §10 row 8 | `roadmap.md` §13 row 1b: `plan.md` §0.4 gains a `React→Solid` row — Portal's `disabled` is absent | **Recorded, not written.** Editing `plan.md` here would put the same correction in two places | **P9** |
| §10 row 9 | `plan.md` §12 row 3: *"a **three-rung** fallback ladder (§1)"* | **Stale, and left stale on purpose.** `a8b4995` rewrote §1.5; `roadmap.md` §13 row 10 flagged it; P7 carried it forward unedited for the same reason | **P9** — the reconciliation pass |

P8 adds nothing to this list and removes nothing from it. Its own seven items are §8, where they are
P9's to reconcile alongside these.
