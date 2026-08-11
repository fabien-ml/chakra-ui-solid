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

1. It names **51 `check:*` scripts. Three exist** — `no-runtime-css`, `attribution`,
   `declaration-support`. Never implement one because a document specifies it.
2. `INDEX.md`, `pnpm docs:index`, `check:doc-index` and `check:skill-pointers` are gone, so every
   rule about regenerating an index or holding a skill pointer is dead — `definition-of-done.md`
   is full of them.
3. Status and batch cells (`ships`, `B7`, *"one shipping row exists today — Box"*) are intentions
   from before 22 components shipped.
4. `brief-plan`, cited 22 times, was never a file in this repo or in hope-ui.

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

## Replies
The reader is an intermediate JS/TS/SolidJS dev who doesn't know this repo, Zag.js, or Panda CSS.
Answer first, no preamble; show a code block rather than a paragraph; gloss each repo term on first
use in a session — presence, machine, anatomy, part component, slot recipe, `staticCss` — inline.
