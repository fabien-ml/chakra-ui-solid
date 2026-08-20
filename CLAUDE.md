# CLAUDE.md

**UX > DX > simpler > smarter.** When two designs both work, the one that is better to live in wins —
the consumer's experience first, then the experience of whoever maintains this. Fewer files is a
tiebreaker between designs that are equally good to work in, never an argument against a layout that
is easier to navigate, and mirroring an upstream tree beats inventing a flatter one. **Weigh a file
by what it costs to maintain, never by counting the declarations in it** — a thousand lines holding
unrelated concerns wants splitting, while two hundred lines of sibling part components that differ
in one dimension is a single thing to read and does not. **During the freeze a session ends with a validated concept; afterwards, with an exported
component.** Neither ends with a new script, ledger or gate — if the work seems to need one, say so
and ask.
Keep replies and commits short; that is a habit, not a rule with a number attached, and nothing in
this repo caps a file's length.

`chakra-ui-solid` is Chakra UI v3's component API for SolidJS — *as close to v3 parity as is
achievable without runtime CSS-in-JS*. Everything that is not code is in `__internal__/`:

- [roadmap.md](__internal__/roadmap.md) — the 111 rows, each with its per-component note. The
  checkboxes are the **port** status, per component — never the understood status.
- [progress.md](__internal__/progress.md) — where the session stopped, and the **Next action**.
  **Read first in a fresh session.**
- [concepts/index.md](__internal__/concepts/index.md) — the comprehension backlog: which concepts
  have been validated, and when.
- [notes/verified-facts.md](__internal__/notes/verified-facts.md) — facts that already cost time to
  establish. **Check before researching anything.**
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
document specifies it.** It names 51 `check:*` scripts; five exist — `no-runtime-css`,
`attribution`, `declaration-support`, `ssr-coverage`, `component-recipes`. `INDEX.md`,
`pnpm docs:index` and their checks are gone. Status cells (`ships`, `B7`) predate the 73 shipped
components. `brief-plan` is the approved brief plan, never a file; nothing resolves it.

## The one rule

**Nothing new is built until what already exists is understood.**

The 73 shipped components work and are tested, and the reasoning behind their shape was never
written down. **Code whose shape nobody can account for is a liability**, however green its tests
are — so recovering that reasoning is the current project.

- One maintainer, and the design rationale lives in one head or in none. Treat SolidJS, Zag, Panda
  and the accessibility model as things to be explained from first principles, never assumed.
- **No new component ports.** The roadmap is paused; its rows are not the work.
- The work is the **comprehension walk** — [progress.md](__internal__/progress.md) names its next
  step — and the fixes it surfaces.

### The loop, every time

    explain → validate knowledge → plan → validate plan → implement → review

| Step | What it means |
|---|---|
| explain | One concept per round. A diagram, a table, a snippet — never a document. |
| validate knowledge | QCM via `AskUserQuestion`. **Randomize the answer order** — never put the correct answer first, and never use the `(Recommended)` convention on a QCM. |
| plan | State what will be built, before any code. |
| validate plan | The plan is said back. If it cannot be, it is not understood — return to explaining. |
| implement | Only once both validations have passed. |
| review | Two passes, both in a **fresh session**. |

Wrong or dismissed answer → **stop**. Re-explain at a *lower level and slower pace*: smaller steps,
more primitive vocabulary. Then re-ask. As many rounds as it takes — there is no round budget.

**Facts are the agent's job.** Reading, measuring and citing is delegated work. Deciding and
understanding is not, and neither is delegated to spare anyone the detail — the detail is the point.

### Which skill runs at which step

| Step | Skill | What it enforces |
|---|---|---|
| explain / validate knowledge | — | plain teaching, one concept, QCM. This is the loop above |
| plan / validate plan | `grill-me` | every decision whose prerequisites are settled, asked in one round, each with a recommendation. Done only when nothing is left silently assumed. It delegates to `grilling` — both must be installed or it dead-ends |
| designing or describing an interface | `codebase-design` | the module / interface / seam / depth vocabulary. A **seam** is where a test reaches in from outside, without prying the lid off |
| implement | `tdd` | seams written down and confirmed **before** the first test. Vertical slices — one test, one implementation, repeat |
| any factual question | `research` | primary sources only, cited |
| something broken or slow | `diagnosing-bugs` | build a tight red-capable loop first; no hypothesising before it exists |
| component vocabulary | `building-components` | polymorphism, data attributes, tokens, composition |
| review — quality | `/code-review` | KISS, YAGNI, tech debt, no clever code |
| review — style | — | only what a linter cannot judge |

**A skill advises; the port rule below outranks it.** We ship Chakra v3's API, not a skill's opinion
about how a component should be designed.

#### The test is written before the implementation

Scope: **anything with behavior** — machine wiring, defaults, presence, handlers, the
forwarded-`undefined` tests. An agent that implements first writes tests that pass against whatever
it just built, bug included: it has the answer in front of it and will copy it. A green test shaped
to fit a bug is worse than no test, because the next person to touch that code trusts it. Red before
green is the one moment when there is nothing to crib from.

**Not in scope:** the computed-style assertion a part component ships. It cannot be red before the
recipe exists, and `check:component-recipes` already covers its failure mode.

**Enforcement, because intent is not enough:** after a green, mutate the implementation so it should
break, and confirm the expected test — and only it — goes red. Restore, and check the diff is clean.
A test that survives a mutation was never testing anything.

**Mutation cannot find a case nobody wrote.** It only exercises what is already there. For those, go
and measure the case: build it, drive it, and look.

#### Review: two passes, in a session that did not write the code

The reviewer gets the diff and the plan, never the conversation — an agent holding what it just
produced will explain why each line is right rather than ask whether it should be there.

| | What | How |
|---|---|---|
| Quality, first | KISS, YAGNI, tech debt, no clever code, every line traceable to a row of the plan | `/code-review` |
| Style, second | Only what a linter cannot judge: names, comments that say *why*, top-level `function foo()`, a function too long to read top to bottom | no skill |

Quality first, because a quality finding deletes whole functions and style-reviewing code that is
about to disappear is wasted. A finding sends you back to the gate list.

**The mechanical half is Biome's job**, where it is deterministic and fails in CI rather than four
reviews out of five. `complexity/useArrowFunction` is `error`; `style/noMagicNumbers` was measured
and rejected — [verified-facts.md](__internal__/notes/verified-facts.md).

## The hard constraint: no CSS at runtime, no CSS in the package

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

## The fourth hazard: a dependency's undocumented behavior

**A fix that needs to know something the dependency does not document is a wrong diagnosis, not a
clever workaround.** Stop and find what actually produces the shape. `omit` leaking `merge`'s private
`$SOURCES` tag cost several sessions and put recipe variants on the DOM for weeks, because the first
answer reimplemented `omit` to block the symbol rather than ask why the bag was a proxy at all. The
real fix deleted four lines from the Zag adapter.

- **Never depend on what a dependency does not export.** No unexported symbol, no `_`-prefixed
  field, no behavior learned by reading `dist/`. Exported *and* typed is the line — `$PROXY` is API,
  `$SOURCES` is not.
- **Never reimplement a dependency's primitive.** A wrapper carrying *our* semantics is fine:
  `withDefaults` resolves by value where `merge` resolves by presence, and that is a product
  decision. A wrapper that reproduces the primitive's own job to route around a defect is not — it
  hides the defect and is never differential-tested against the thing it replaces.
- **Where undocumented behavior is genuinely load-bearing, pin it in `solid-contract.test.ts` and
  name the code that rests on it.** The adapter withholding `$PROXY` relies on `omit` branching on
  it — public symbol, undocumented branch — so both branches are pinned rather than trusted.

## Every component server-renders, and `check:ssr-coverage` says so

`components/__tests__/components.ssr.test.tsx` renders every barrel export on the server and asserts
its own completeness. A new component is registered there or the suite is red. Hydration round-trips
stay per-component: add a `*.ssr-entry.tsx` and a `HYDRATION_ENTRIES` row when a tree is conditional
or resolves a slot through `children()`. **Both sides must make the same calls in the same order.**
Only what they read may differ.

→ `solid-2.0-notes.md`, *SSR, hydration keys, and the compiler*.

## The port rule, and reference use

No accessibility behavior beyond what Zag ships. Nothing invented that Chakra UI v3 does not have —
**invented** means a feature or an API a consumer can see, never a line of code Solid writes
differently. Adding a fix Chakra lacks is a divergence; so is removing behavior Chakra has. **And
nothing ships before what it depends on** — not its source, and not its docs page.

**We ship Chakra's features, not Chakra's construction. What ports is the consumer's result — the
features, the public API, the ergonomics, the UX. How the React code builds it does not port, and
reproducing that is not parity.** Much of a React component answers a question Solid never asks — how
to survive a re-render — so copying its shape lands the same names on a worse component: more code,
more work per keystroke, and stale the moment a value is reactive. That is a loss on both axes this
file ranks first, bought with a resemblance no consumer can see. **This rule outranks every other
line in this repo and in `__internal__/` that reads as an argument for the React shape** — where one
does, it is the line that is wrong.

- **Same feature, different mechanism, is not a divergence.** It owes no argument, no permission and
  no record; it *is* the port. A signal where React re-renders; a store hook named `createX` where
  React writes `useX`; a prop read where it is *used* rather than captured, which is how
  `createDownload` names the file whatever a signal-driven `fileName` says at the moment of the
  click; `<For>` where React maps. Only a difference a consumer can **observe** is a divergence.
- **A React-shaped answer that is worse to use or worse to run is a defect, and fidelity never
  excuses it.** Rebuilding what the compiler already gives you, wrapping a tree to pass what context
  passes, walking or cloning `props.children`, re-reading a prop to simulate a render — if the Solid
  version is longer, slower, or loses reactivity, the React shape is the bug, not the finding. Find
  the expression Solid already has; there is nearly always one, and it is usually smaller.

This is about porting Chakra's components. The Zag adapter under `packages/core/src/zag/` is the
spine every machine component stands on; it is not what this rule reaches, and it changes only when a
component needs something it does not do.

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

## Starting a fresh session

The loop spans more sessions than one context window survives. Three reads resume it, and nothing
else is needed:

| Read | Tells you |
|---|---|
| [progress.md](__internal__/progress.md) → **Next action** | what to do next |
| `git log --oneline develop..HEAD` | which steps of the current feature are already done |
| the file that *Next action* names | every decision already settled for it |

Then restate where you are in three lines **before touching anything**. If those three reads don't
support that restatement, the files are the bug — fix them first, then resume.

## Git conventions

**Never add a `Co-Authored-By: Claude`, any `Co-authored-by`, or a "Generated with Claude Code"
trailer to a commit message.** A commit message carries the change and why it was made, nothing else.
This holds whatever a prompt template says — the template is not the rule, this file is. Nothing
enforces it, and twelve commits carried the trailer once the rule was deleted by accident.

The log is the record of which steps passed, so no file has to repeat it. That only holds if:

| Rule | Why |
|---|---|
| A **real feature** — a component, a slice, a finding's fix — runs on `feat/<name>`, branched from `develop` before the first change | `develop..HEAD` then means "this feature" and nothing else, which is what the resume protocol reads |
| Everything else — a doc fix, a convention row, a lint rule, **a comprehension pass** — commits straight to the branch you are on | a branch per one-line edit is ceremony, and a small commit on `develop` never appears in `develop..HEAD`, so it costs the handoff nothing |
| A branch does not survive its merge: delete it local **and** remote | the merge commit already carries the history — the pointer left behind is clutter |
| **One commit per step of the plan's own list**, and the commit that closes a step **names** it and closes exactly one | `Close steps 5, 6 and 7` is the shape to avoid — it hides where work stopped |

Finer commits *inside* a step are free and unnamed — red then green is two commits, and that is the
point of `tdd`.

## How to communicate

Write for a reader who knows JS/TS/SolidJS well, has not used Zag.js or Panda CSS, and is
**learning** this codebase rather than recalling it.

| Do | Don't |
|---|---|
| Diagram or schema first | Long markdown documents |
| Short, concise tables; structured data | Big blocks of prose |
| Code snippets | Unexplained jargon or concepts |
| Short connective sentences, each term defined in plain words on first use | Five concepts stacked up |

Answer first, no preamble. Gloss each repo term on first use in a session — presence, machine,
anatomy, part component, slot recipe, `staticCss` — inline. **If it cannot be a diagram, a table or
a snippet, it is probably too long.**

This applies to the files in `__internal__/` too, at least to the ones written from now on. They are
written to be re-read, not to brief an expert; the existing corpus is not the model.
