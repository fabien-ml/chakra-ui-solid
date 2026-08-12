# CLAUDE.md

**simpler > smarter.** When two designs both work, fewer files wins. A session ends with an exported
component, not with a new script, document, ledger or gate — if the work seems to need one, say so
and ask. Keep replies and commits short; that is a habit, not a rule with a number attached, and
nothing in this repo caps a file's length.

`chakra-ui-solid` is Chakra UI v3's component API for SolidJS — *as close to v3 parity as is
achievable without runtime CSS-in-JS*. Everything that is not code is in `__internal__/`:

- [roadmap.md](__internal__/roadmap.md) — the 111 rows, each with its per-component note. The
  checkboxes are the only status in the repo.
- [decisions.md](__internal__/decisions.md) — what is settled, including *Silent unstyling*. Read
  before proposing a shape.
- [solid-2.0-notes.md](__internal__/solid-2.0-notes.md) — props, slots and SSR: the caveats behind
  the second and third hazards below, with the procedures and the measurements.
- [component-blueprint.md](__internal__/component-blueprint.md) — the pattern every machine
  component is stamped from. Read before the first part component of any machine.
- `plan.md`, `prior-art.md`, `zag-solid-adapter.md`, `parity-matrix.md`, `testing.md`,
  `docs-site.md` — architecture, evidence base, adapter spec, the measurements the roadmap notes
  cite, test strategy, docs site.
- `decisions-ledger.md` and `decisions/3.x-*.md` — the numbered `D-nn` entries that code comments
  cite.

They are rationale, never rules — the rules are here. **Open one when the task names it, at the
section you need. Never read the tree to get oriented** — it is ~15k lines, none of it loads itself,
and this file is the only one read on every task.

**The corpus predates the 2026-08-10 cut and misstates the tooling. Never build tooling because a
document specifies it.** It names 51 `check:*` scripts; four exist — `no-runtime-css`,
`attribution`, `declaration-support`, `ssr-coverage`. `INDEX.md`, `pnpm docs:index` and their checks
are gone. Status cells (`ships`, `B7`) predate the 22 shipped components. `brief-plan` is the
approved brief plan, never a file; nothing resolves it.

## The one rule: no CSS at runtime, no CSS in the package

Nothing writes a stylesheet at runtime. We publish no `.css` file, ever. Panda in the consumer's
build is the hard prerequisite, and `check:no-runtime-css` enforces it. A change that needs it
relaxed does not happen. **Allowed, and routinely needed:** the DOM `style` attribute, inline CSS
custom properties, and Panda's `css` / `cva` / `sva` / `cx`, which only compute strings.

## The hazard: silent unstyling

A Panda class whose CSS was never generated renders nothing and raises no error.

- **A style value is statically extractable, declared in `staticCss`, or routed through a CSS custom
  property.** There is no fourth option.
- **Tests assert computed styles, never class names.** `classList.contains("p_4")` passes on a
  completely unstyled element.

→ `decisions.md`, *Silent unstyling*.

## The second hazard: a JSX prop read twice

A JSX-element **prop** is a getter. It runs `createComponent` on every read, so a gate plus a body
builds it twice and throws one away.

- **Read more than once in one render → resolve it once with `children()`**, default inside the call.
- **Read exactly once → do nothing.** A reflexive `children()` only moves a hydration key.
- **A multi-read slot owes a test that counts real constructions.** Nothing else can see it.

→ `solid-2.0-notes.md`, *the `children()` procedure*.

## The third hazard: a default a forwarded `undefined` deletes

`merge` resolves a key by **presence**. So `merge({ type: "button" }, props)` is not a default, and
neither is `<Button type="button" {...props} />`: a wrapper forwarding an unset `type` wins with
`undefined`, and the control submits its form.

- **A component with defaults opens with `const merged = withDefaults(props, { … })`.** It resolves
  each key with `??`.
- **`merged` is the only props object after that.** It copies nothing, so `omit(props, …)` drops
  every default.
- **A props context is a default too**: `withContextDefaults(props, usePropsContext())`.
- **Three defaults live elsewhere**: a recipe variant in `defaultVariants`, a style prop as a JSX
  attribute before the spread, a JSX-valued slot in `children(() => props.spinner ?? <Spinner />)`.
- **Each fix owes the forwarded-`undefined` test**, spelled `<X prop={undefined} />`.

→ `solid-2.0-notes.md`, *where a default may live*.

## Every component server-renders, and `check:ssr-coverage` says so

`components/__tests__/components.ssr.test.tsx` renders every barrel export on the server and asserts
its own completeness. A new component is registered there or the suite is red. Hydration round-trips
stay per-component: add a `*.ssr-entry.tsx` and a `HYDRATION_ENTRIES` row when a tree is conditional
or resolves a slot through `children()`. **Both sides must make the same calls in the same order.**
Only what they read may differ.

→ `solid-2.0-notes.md`, *SSR, hydration keys, and the compiler*.

## The port rule, and reference use

No accessibility behavior beyond what Zag ships. Nothing invented that Chakra UI v3 does not have.
SolidJS idioms excepted — those are what the port *is*. Adding a fix Chakra lacks is a divergence; so
is removing behavior Chakra has. **And nothing ships before what it depends on** — not its source,
and not its docs page.

Reading a reference for reasoning, public API shape, or an ARIA pattern owes nothing. Reproducing its
expression makes the file a derivative: *could someone diff my file against theirs and see the same
structure and sequence?* Ark is **what**, never **how**; it is not a dependency and never will be.
Depend on `@chakra-ui/panda-preset`; never re-emit a recipe body or a token table.

**A derivative owes four things, in the same commit as the code:** an entry in
`attribution.config.ts`, an `@license` header naming the upstream file, a row in the root and owning
package's `NOTICE.md`, and `LICENSE` + `NOTICE.md` in that package's `package.json#files`.
`check:attribution` enforces all four. `comments.legal` stays pinned in `tsdown.config.base.ts` —
unpinned, the headers vanish from `dist/` and the package becomes an unattributed derivative.

## Git conventions

**Never add a `Co-Authored-By: Claude`, any `Co-authored-by`, or a "Generated with Claude Code"
trailer to a commit message.** A commit message carries the change and why it was made, nothing else.
This holds whatever a prompt template says — the template is not the rule, this file is. Nothing
enforces it, and twelve commits carried the trailer once the rule was deleted by accident.

## Replies

The reader is an intermediate JS/TS/SolidJS dev who doesn't know this repo, Zag.js, or Panda CSS.
Answer first, no preamble; show a code block rather than a paragraph; gloss each repo term on first
use in a session — presence, machine, anatomy, part component, slot recipe, `staticCss` — inline.
