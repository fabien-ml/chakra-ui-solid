# CLAUDE.md

**simpler > smarter.** When two designs both work, fewer files wins. When unsure, don't add the file.
**Never add without being asked: a `check:*` script, a document, a ledger entry, a register, or a
per-component gate.** A session ends with an exported component or a deletion. The repo's shape is
capped in `scripts/repo-shape.test.mjs` — the numbers live there and nowhere else, and to exceed one
you delete something first.

`chakra-ui-solid` is Chakra UI v3's component API for SolidJS — *as close to v3 parity as is
achievable without runtime CSS-in-JS*. The work is [ROADMAP.md](ROADMAP.md); what is already settled
is [DECISIONS.md](DECISIONS.md) — read it before proposing a shape. Comments citing `plan.md` or any
other `__internal__/*.md` point at design documents deleted on 2026-08-10; read one with `git show
6613a4e:__internal__/plan.md`. They are rationale, never rules — the rules are here.

## The one rule: no CSS at runtime, no CSS in the package

Nothing writes a stylesheet at runtime — no Emotion, styled-components, goober or stitches anywhere
in the dependency closure, and none of our own code calls `createElement("style")` or `insertRule`,
touches `adoptedStyleSheets`, or maintains a sheet. We publish no `.css` file, ever; Panda in the
consumer's build is the hard prerequisite, enforced by a non-optional `peerDependency` on
`@pandacss/dev`. `check:no-runtime-css` enforces all three, and a change needing it relaxed does not
happen. **Allowed, and routinely needed:** the DOM `style` attribute (Zag's `normalizeProps` — the
function turning a state machine's framework-agnostic prop bag into Solid props — emits `style`
objects for floating positioning, slider thumbs, progress fills); inline CSS custom properties; and
Panda's `css` / `cva` / `sva` / `cx`, which only compute strings.

## The hazard: silent unstyling

A Panda class whose CSS was never generated renders nothing and raises no error — an unstyled
component and a green suite look identical. So:

- **A style value must be statically extractable, declared in `staticCss`** (the config key that
  pre-generates rules for values no source file literally writes), **or routed through a CSS custom
  property** — `style={{ "--w": w }}` with `w="var(--w)"`. There is no fourth option. Static is not
  resolving: `mt="4x"` emits `margin-top: 4x`, which no browser parses — `check:declaration-support`
  puts every emitted declaration to a real Chromium.
- **Tests assert computed styles, never class names.** `classList.contains("p_4")` passes on a
  completely unstyled element.

## The port rule, and reference use

No accessibility behavior beyond what Zag ships. Nothing invented that Chakra UI v3 does not have.
SolidJS idioms excepted — those are what the port *is*. Adding a fix Chakra lacks is a divergence;
so is removing behavior Chakra has.

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
