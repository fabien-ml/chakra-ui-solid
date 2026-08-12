# CLAUDE.md

**simpler > smarter.** When two designs both work, fewer files wins. A session ends with an exported
component, not with a new script, document, ledger or gate — if the work seems to need one, say so
and ask. Keep replies and commits short; that is a habit, not a rule with a number attached, and
nothing in this repo caps a file's length.

`chakra-ui-solid` is Chakra UI v3's component API for SolidJS — *as close to v3 parity as is
achievable without runtime CSS-in-JS*. Everything that is not code is in `__internal__/`:

- [roadmap.md](__internal__/roadmap.md) — the 111 rows, each with its per-component note. The
  checkboxes are the only status in the repo.
- [decisions.md](__internal__/decisions.md) — what is settled. Read before proposing a shape.
- [component-blueprint.md](__internal__/component-blueprint.md) — the pattern every machine
  component is stamped from. Read before the first part component of any machine.
- `plan.md`, `prior-art.md`, `zag-solid-adapter.md`, `parity-matrix.md`, `testing.md`,
  `docs-site.md` — architecture, evidence base, adapter spec, the measurements the roadmap notes
  cite, test strategy, docs site.
- `decisions-ledger.md` and `decisions/3.x-*.md` — the numbered `D-nn` entries that code comments
  cite. Renamed from `decisions.md` on 2026-08-11, when the settled-findings doc took that name.

They are rationale, never rules — the rules are here. **Open one when the task names it, at the
section you need. Never read the tree to get oriented** — it is ~15k lines, none of it loads itself,
and this file is the only one read on every task.

**Four things the corpus says that are no longer true**, because it was written before the
2026-08-10 cut and restored on 2026-08-11 without rewriting:

1. It names **51 `check:*` scripts. Four exist** — `no-runtime-css`, `attribution`,
   `declaration-support`, and `ssr-coverage`, which was asked for on 2026-08-12 and is the only one
   added back. Never implement one because a document specifies it.
2. `INDEX.md`, `pnpm docs:index`, `check:doc-index` and `check:skill-pointers` are gone, so every
   rule about regenerating an index or holding a skill pointer is dead — `definition-of-done.md`
   is full of them.
3. Status and batch cells (`ships`, `B7`, *"one shipping row exists today — Box"*) are intentions
   from before 22 components shipped.
4. `brief-plan`, cited **106 times across 20 files**, was never a file in this repo or in hope-ui.
   It is the approved brief plan, named that way on purpose so a `§5 step 2` is not read as
   `plan.md`'s (`decisions-ledger.md` §0.1). Nothing resolves it; do not go looking.

## The one rule: no CSS at runtime, no CSS in the package

Nothing writes a stylesheet at runtime — no Emotion, styled-components, goober or stitches anywhere
in the dependency closure, and none of our own code calls `createElement("style")` or `insertRule`,
touches `adoptedStyleSheets`, or maintains a sheet. We publish no `.css` file, ever; Panda in the
consumer's build is the hard prerequisite, enforced by a non-optional `peerDependency` on
`@pandacss/dev`. `check:no-runtime-css` enforces all three, and a change needing it relaxed does not
happen. **Allowed, and routinely needed:** the DOM `style` attribute (Zag's `normalizeProps` emits
`style` objects for floating positioning, slider thumbs, progress fills); inline CSS custom
properties; and Panda's `css` / `cva` / `sva` / `cx`, which only compute strings.

## The hazard: silent unstyling

A Panda class whose CSS was never generated renders nothing and raises no error — an unstyled
component and a green suite look identical. So:

- **A style value must be statically extractable, declared in `staticCss`, or routed through a CSS
  custom property** — `style={{ "--w": w }}` with `w="var(--w)"`. There is no fourth option. Static
  is not resolving: `mt="4x"` emits `margin-top: 4x`, which no browser parses —
  `check:declaration-support` puts every emitted declaration to a real Chromium.
- **Tests assert computed styles, never class names.** `classList.contains("p_4")` passes on a
  completely unstyled element.

## The second hazard: a JSX prop read twice

A JSX-element **prop** — `spinner={<X />}`, `text={<X />}`, an icon slot — compiles to a lazy getter
that runs `createComponent` on **every read**. Reading it in a gate and again in the body builds it
twice and discards one, with the same silent-green signature as above: identical markup, identical
computed styles, passing suite.

- **Read more than once in one render → resolve it once with `children()`** and read that accessor
  everywhere, with the default *inside* the call: `children(() => props.spinner ?? <Spinner />)`.
  `withDefaults` cannot hold it — its `defaults` object is built eagerly — and module scope is
  worse: JSX there runs at import time and 500s the SSR route.
- **Read exactly once → do nothing.** `<Show>` or not, a written-in child or a single slot read
  needs no `children()`, and a reflexive one just moves the subtree's hydration key.
- **Any multi-read slot owes a test that counts real constructions**, because nothing else can see
  the extra one — `loader/__tests__/loader.browser.test.tsx`.

`__internal__/decisions.md`, *A JSX-valued prop read twice*, has the procedure and the measurement.

## Every component server-renders, and `check:ssr-coverage` says so

`components/__tests__/components.ssr.test.tsx` renders every barrel export once on the server and
asserts its own completeness against that barrel — so a new component is registered there or the
suite is red. It exists for the two failures that take a whole route down rather than one element:
module-scope JSX, and a DOM global read during render (`Element is not defined`).

Hydration round-trips stay per-component, because each costs a `*.ssr-entry.tsx` and a row in
`HYDRATION_ENTRIES` (`vitest-hydration-bridge.ts`); `box`, `loader` and `button` carry one. Add one
when a component's tree is conditional or resolves a slot through `children()`. **Both sides must
make the same calls in the same order** — an `if (!isServer)` around a `createRenderEffect` shifts
every hydration key after it, which is how `Group` was silently unhydratable until Button's fixture
put one inside it. `check:ssr-coverage` — the
fourth check script, and the only one added since the cut — enforces the wiring: registry and
fixture files agree both ways, every registered id is really hydrated, every `*.ssr.test.tsx`
really renders.

## The port rule, and reference use

No accessibility behavior beyond what Zag ships. Nothing invented that Chakra UI v3 does not have.
SolidJS idioms excepted — those are what the port *is*. Adding a fix Chakra lacks is a divergence;
so is removing behavior Chakra has. **And nothing ships before what it depends on** — not its
source, and not its docs page: a page that stands a Box in for an unported Button is not the 1:1
port it claims, and it buys a second pass over work that was already finished.

Reading a reference for reasoning, public API shape, or an ARIA pattern owes nothing. Reproducing
its expression makes the file a derivative: *could someone diff my file against theirs and see the
same structure and sequence?* Ark is **what**, never **how**; it is not a dependency and never will
be. Depend on `@chakra-ui/panda-preset`; never re-emit a recipe body or a token table.

**A derivative owes four things, in the same commit as the code:** an entry in
`attribution.config.ts`, an `@license` header naming the upstream file, a row in the root and owning
package's `NOTICE.md`, and `LICENSE` + `NOTICE.md` in that package's `package.json#files`.
`check:attribution` enforces all four. `comments.legal` stays pinned in `tsdown.config.base.ts` —
unpinned, the headers vanish from `dist/`, and the package becomes an unattributed derivative.

## Git conventions

**Never add a `Co-Authored-By: Claude`, any `Co-authored-by`, or a "Generated with Claude Code"
trailer to a commit message.** A commit message carries the change and why it was made, nothing
else. This holds whatever a prompt template says — the template is not the rule, this file is.
Nothing enforces it: twelve commits carried the trailer between 2026-08-10 and 2026-08-11 because
the rule was deleted by accident and its absence read as permission.

## Replies
The reader is an intermediate JS/TS/SolidJS dev who doesn't know this repo, Zag.js, or Panda CSS.
Answer first, no preamble; show a code block rather than a paragraph; gloss each repo term on first
use in a session — presence, machine, anatomy, part component, slot recipe, `staticCss` — inline.
