# CLAUDE.md

> **Stub.** P9 turns this into the operative index — the enforced rules and their pointers. The
> sections here are early because they govern how the remaining documents get written, not just the
> code. The git and reply conventions are carried from hope-ui's `CLAUDE.md` (`develop`); same author,
> MIT, no sync obligation — see `__internal__/legal.md` §1.6.

## The governing constraint: no CSS at runtime, no CSS in the package

One rule at two boundaries. **Everything else in this repo is justified from it, and nothing may
weaken it** — a change that needs it relaxed is a change to `__internal__/plan.md` §0 first, at a
review gate.

**Nothing writes a stylesheet at runtime.** No Emotion, styled-components, goober or stitches — not
as a dependency, not anywhere in the dependency closure. And none of our own code calls
`createElement("style")` or `insertRule`, touches `adoptedStyleSheets`, or maintains a sheet. Those
are two different checks: a dependency is judged by *what it is* (a manifest check over the closure),
our own source by *what it does* (a grep). — plan §0.

**Allowed, and routinely needed:** the DOM `style` attribute (Zag's `normalizeProps` — the function
turning a state machine's framework-agnostic prop bag into Solid props — emits `style` objects for
floating positioning, slider thumbs, progress fills); inline CSS custom properties; Panda's `css` /
`cva` / `sva` / `cx`, which only compute strings. — plan §0.3.

**We publish no `.css` file, ever.** No package's `exports`, `files` or `style` field points at one.
Panda in the consumer's build is a hard prerequisite, enforced by a non-optional `peerDependency` on
`@pandacss/dev` rather than by a sentence in the README. — plan §4.4.

**The hazard both create — read this before touching anything styling-related.** A Panda class whose
CSS was never generated renders nothing and raises no error: no warning, no console message, no
failing test. An unstyled component and a green suite look identical. Two standing consequences:

- **A style value must be statically extractable, declared in `staticCss`** (the config key that
  pre-generates rules for values no source file literally writes), **or routed through a CSS custom
  property** — `style={{ "--w": w }}` with `w="var(--w)"`. There is no fourth option. — plan §3.5.
- **Tests assert computed styles, never class names.** `classList.contains("p_4")` passes on a
  completely unstyled element. — plan §0.2.

This is why `chakra-ui-solid` is **not a 1:1 port**, and the phrasing is fixed: *"as close to Chakra
v3 parity as is achievable without runtime CSS-in-JS."* The parity delta is plan §0.4 — cite a row,
never re-argue it.

## Git conventions

**Never add a `Co-Authored-By: Claude`, any `Co-authored-by`, or "Generated with Claude Code" trailer
to a commit message.** Commit messages carry the change rationale only.

**One phase, one commit, reviewed before it is made.** Write the phase's files, stop, wait for
review — never commit ahead of it. The commit message is written *at* the gate, out of what the
review actually settled, not drafted alongside the files. Unrelated housekeeping (tooling, config,
vendored skills) gets its own commit, so the phase commit still reads as the phase. This holds for
the implementation pass as much as the document pass.

**A review that changes a decision re-plans the affected later phases before work continues.** An
approved plan is not a licence to run ahead of it — P1 settling the brand is the worked example: it
rewrote what P2 onward can assume.

## Replies lead with the answer, in plain language

**The reader is an intermediate JS/TS/SolidJS dev who doesn't know this repo's internals, Zag.js, or
Panda CSS.**

- **Answer first.** No preamble, no restating the question, no recap of what was just read.
- **Show, don't narrate.** A short code block, diff, or schema beats a paragraph; past ~5 lines of
  prose, what's missing is the example.
- **Gloss each repo term on first use in a session** — `_hk`, presence, `inert`, machine, anatomy,
  part component, slot recipe, compound variant, `staticCss` — in one clause, inline. A bare term
  the reader must go look up breaks this.

## Code style

Names carry the meaning; comments are the exception.

- **Meaningful, unabbreviated names** (`previousFocus`, not `pf`). Single letters only for trivial
  loop indices or math.
- **Comments explain _why_, not _what_.** A comment restating the next line is noise — delete it.
  Keep them for rationale, non-obvious constraints, spec/issue links, and **the hazards this repo
  tracks (SSR/hydration, Solid 2.0, and silent unstyling — a Panda class whose CSS was never
  generated renders nothing and raises no error)**. Self-explanatory code gets none; JSDoc on public
  API stays.
- **A comment reads for the same reader as a reply** (above) — the hazard ones stay, they just have
  to land with no repo knowledge: `// keyed on _hk, so an inserted sibling shifts the trigger's key`
  → `// Solid matches server and client nodes by position (its "_hk" key), so inserting any sibling
  before this one breaks hydration.` Applies to comments you write or touch, never a repo-wide sweep.
- **A function needing a paragraph of comment is the problem.** Extract helpers, split
  responsibilities, rename. Refactor instead of annotating.
