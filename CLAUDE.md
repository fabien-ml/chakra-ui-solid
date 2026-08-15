# CLAUDE.md

**UX > DX > simpler > smarter.** When two designs both work, the one that is better to live in wins —
the consumer's experience first, then the experience of whoever maintains this. Fewer files is a
tiebreaker between designs that are equally good to work in, never an argument against a layout that
is easier to navigate: one declaration per file beats one file holding all of them, and mirroring an
upstream tree beats inventing a flatter one. A session ends with an exported component, not with a
new script, document, ledger or gate — if the work seems to need one, say so and ask. Keep replies
and commits short; that is a habit, not a rule with a number attached, and nothing in this repo caps
a file's length.

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
- **Two defaults live elsewhere**: a recipe variant in `defaultVariants`, and a JSX-valued slot
  resolved inside `children()` — read the prop into a local and test it `!== undefined`, never with
  `??`, which swallows `null` where Chakra's own defaults do not, so `spinner={null}` renders
  nothing rather than the default. **A style prop as a JSX attribute before the spread is not a
  third** — the compiled spread is a presence merge, so a forwarded `undefined` deletes it exactly
  as it deletes `<Button type="button" {...props} />`. It is only how a value stays statically
  extractable: a real style-prop default is `withDefaults` **plus** a `staticCss.css` row in
  `packages/panda-preset/src/preset.ts`, or it ships silently unstyled.
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

**Parity is what a consumer observes, not how React arrives at it.** React redraws on any render;
Solid redraws what a signal invalidated. Three cases fall out, and only the middle one is settled by
"Chakra does it too":

- **Ours is observably worse than the React version's.** Popover shipped a dangling
  `aria-describedby` that chakra-ui.com does not, because Zag's correction notifies no signal and
  React's incidental re-renders hide it. **Fixing that is the port working** — no argument owed, no
  permission, no divergence. Never cite this rule to justify shipping it; measure both sides first,
  in a browser if that is what it takes.
- **Both are wrong the same way.** Ship it. A dialog leaving the page behind it reachable is
  Chakra's behavior, and someone arriving from the React version is owed what they know, warts
  included. Record it as *expected*, never *tolerated*, and say nothing on the docs page.
- **Chakra has a capability Solid cannot express the same way.** Weigh what the capability is worth
  before deciding. `asChild` is load-bearing, so it became `render`; a React-19-only escape hatch is
  not, so it is omitted and its absence stated on the page. **"It does not port" is never the whole
  answer for something consumers rely on** — find the Solid-native expression of it.

A divergence that does land is recorded in `__internal__/`, never on a docs page.

**`__reference-impl__` is what a row *is*; the roadmap only says that it exists.** A note under an
unchecked row is a **prediction written before that component's code was read**, and all four
component rows ported so far have found theirs wrong — expect it and budget for it rather than
reporting it as a finding. A note under a **checked** row was verified against the reference when it
shipped and can be read as fact. Open the counterpart under
`__reference-impl__/chakra-ui/packages/react/src/` before planning a row, grep its real consumers,
and correct the note in the same commit as the code — **including every *other* row's note the same
measurement settles**, which is how `radio-group` kept a wrong one through two ports that had
already answered it. `roadmap.md` §*Reading a row* carries the detail.

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
