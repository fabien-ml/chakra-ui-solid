# Coding standards

Judgement calls a reviewer applies to a diff. Anything a linter, a type check or a CI script can decide is not here; it lives in `biome.jsonc` or a check, and review skips it. Each rule is one line, then one line of why. Terms are defined in `GLOSSARY.md`.

## Design and porting

- **Break ties with UX, then DX, then simpler, then smarter.** The consumer's experience outranks the maintainer's, and both outrank cleverness.
  Why: a design argued on cleverness is the one nobody can review.
- **Mirror the upstream tree; fewer files only breaks a tie between layouts equally easy to navigate.** Package layout follows `packages/react/src`. It never argues against the layout that is easier to find your way in.
  Why: a reader who knows the React version should find a part where they expect it.
- **Weigh a file by what it costs to maintain, not by its declaration count.** A thousand lines of unrelated concerns wants splitting; two hundred lines of sibling parts differing in one dimension is one thing to read. Do not argue a line count back.
  Why: the point was one thing to read, and a count says nothing about that.
- **Ours observably worse than the React version: fix it, no argument owed.** Measure both sides first, in a browser if that is what it takes.
  Why: fixing a defect is the port working, not a divergence.
- **Both wrong the same way: ship it.** Record it as expected; the docs page says nothing.
  Why: someone arriving from the React version is owed what they know, warts included.
- **A capability Solid cannot express the same way: weigh its worth, then find the Solid-native expression.** "It does not port" is never the whole answer (`asChild` became `render`).
  Why: dropping a capability is a divergence and needs a reason. See [`docs/adr/0050-port-rule-observable-difference.md`](docs/adr/0050-port-rule-observable-difference.md) and [`docs/adr/0059-render-prop-over-as-child.md`](docs/adr/0059-render-prop-over-as-child.md).
- **Same feature through a different Solid mechanism owes no argument; a React-shaped answer that is worse to use or to run is a defect.** A signal for a re-render, `createX` for `useX`, `<For>` for a map.
  Why: much of a React component answers a question Solid never asks, and copying it lands the same names on a worse component.
- **Chakra and Ark decide whether a behaviour exists; hope-ui shows how it is written in Solid 2.**
  Why: each source is authoritative on one question and misleading on the other.
- **Open the reference implementation before planning or reviewing a row.** A roadmap line or a summary says a thing exists, never what is in it; a spec saying "copy this" cannot be carried out without reading the thing.
  Why: a summary of a component is a prediction, and plans built on one drift from what upstream ships.
- **Reading a reference for reasoning, API shape or ARIA pattern owes nothing; reproducing its expression makes a derivative.** The test: could someone diff the two files and see the same structure and sequence? A one-word token value is not expression. Ark is what, never how.
  Why: a derivative owes attribution, and a file copied by accident owes it too. See [`docs/licensing/derivative-obligations.md`](docs/licensing/derivative-obligations.md).
- **Change to `packages/core` or `packages/panda-preset` shared code: list every caller, state its behaviour before and after, and give each unchanged caller a test that goes red if it changes.** Any caller whose behaviour changes gets its own decision.
  Why: a change a second component merely inherits is a change it never chose.
- **A consuming component's tests not moving after a shared-code change is the alarm, not the all-clear.**
  Why: zero changed files and a green suite means "that suite cannot see this".
- **When generalising a rule, add an exception before widening it, and never let one list answer two questions.** An exception is almost always the smaller, truer change.
  Why: a reshaped rule silently changes the answer for every caller that did not ask for it.
- **Depend only on what a dependency exports and types.** `$PROXY` is API; `$SOURCES`, a `_`-prefixed field and anything learned by reading `dist/` are not.
  Why: undocumented behaviour moves without a changelog entry.
- **A fix that needs undocumented dependency behaviour is a wrong diagnosis; find what actually produces the shape.** A wrapper carries our semantics and must not redo the primitive's job to hide a defect.
  Why: a workaround that reproduces the primitive hides the defect from the next reader.
- **State a component exposes goes in a `data-*` attribute written before the spread, so a consumer can override it.**
  Why: after the spread it wins over the consumer, who then cannot restyle on their own state.
- **A structural fact (first child, has a sibling) is a CSS selector; only a marker fact becomes a context.**
  Why: a context for position adds a provider and a render per part for something CSS already knows. See [`docs/adr/0052-positional-child-facts-are-selectors.md`](docs/adr/0052-positional-child-facts-are-selectors.md).

## Solid props, slots and reactivity

- **A defaulted JSX slot is resolved once inside `children()` and tested `!== undefined`, never `??`.** `??` swallows `null`, where Chakra renders nothing for `spinner={null}`.
  Why: the default must yield only to an absent value. See [`docs/solid/double-read-children.md`](docs/solid/double-read-children.md).
- **Default a glyph through a getter or a `children()` test, not a `withDefaults` entry, and never at module scope.**
  Why: a `withDefaults` entry builds the node on every render, and module-scope JSX renders at import time and 500s the server. See [`docs/ssr/module-level-jsx-breaks-ssr.md`](docs/ssr/module-level-jsx-breaks-ssr.md).
- **Do not default `disabled` on a field-like root that inherits it from a fieldset.**
  Why: a `withDefaults` default of `false` is present, so it deletes the inherited value.
- **Where context is late-bound, use a lazy `merge` rather than `withDefaults`.**
  Why: `withDefaults` reads `Object.keys` once and cannot express a key that appears later. See [`docs/solid/merge-resolves-by-presence.md`](docs/solid/merge-resolves-by-presence.md).
- **Resolve a slot with `children()` only when a component-valued prop is read more than once in a render.** A slot read once, read twice in the body only, or written directly as a child needs none.
  Why: a reflexive `children()` adds a memo and moves the hydration key; a missing one builds the node twice. See [`docs/solid/double-read-children.md`](docs/solid/double-read-children.md).
- **After `withDefaults`, read only `merged`.** The parameter stays `props`, so a diff shows which object each read goes to. `omit(props, …)` drops every default; `omit(merged, …)` keeps them.
  Why: `merged` copies nothing, so a raw `props` read of a defaulted key gives `undefined`. See [`docs/adr/0066-with-defaults-resolves-by-value.md`](docs/adr/0066-with-defaults-resolves-by-value.md).
- **Computed props placed last in a merge must not erase a consumer's value; write `props[x] ?? computed`.** Only component-owned state (`aria-modal`, `data-state`) may overwrite.
  Why: last-wins turns every derived default into an override.
- **Validation guards sit in the component body inside `untrack`, with no `console.error`.** A value that becomes invalid after mount will not throw; comment that and pin it with a test.
  Why: a throw inside a memo halts every later render on the page. See [`docs/solid/throwing-in-reactive-scope-halts.md`](docs/solid/throwing-in-reactive-scope-halts.md).
- **`createX` creates state, an owner or a machine; `useX` only reads ambient context.** The store hook is `create<Component>`.
  Why: the prefix tells the caller whether a call allocates or merely looks up.
- **Put the `isServer` guard inside the callback, never around the registration.** Both sides must make the same calls in the same order.
  Why: a guard around `createRenderEffect` shifted hydration keys and left a group unhydratable. See [`docs/ssr/hydration-keys-are-positional.md`](docs/ssr/hydration-keys-are-positional.md).
- **Do not silence `STRICT_READ_UNTRACKED` with a redundant `untrack` or by wrapping construction in `For`; fix the read.** Every `props.value` read sits in a memo or a getter, and an item context built in a `For` callback is a real defect when it fires.
  Why: a blanket suppression hides the diagnostic the day a component really reads a prop untracked. See [`docs/solid/strict-read-untracked.md`](docs/solid/strict-read-untracked.md).

## Comments

- **A comment says what the code does not: the why, a constraint, a trap, a link to the measurement.** A comment that restates what the code already says is removed.
  Why: a restating comment drifts from the code it repeats, and the reader trusts the wrong one.
- **A comment is short.** One or two lines; a block of prose above a function is a doc file in `docs/<subject>/` with a one-line pointer to it.
  Why: a long comment goes unread, then unmaintained.
- **JSDoc is short too: one sentence of what it is, then at most one minimal example.** No toolchain rationale, no history, no restated parameter types.
  Why: JSDoc is what a consumer reads on hover, in a tooltip a few lines tall.

## Styling

- **The custom-property route cannot carry a responsive value; narrow such props to `PlainCssValue`.**
  Why: a responsive spelling should be a type error, not a silent no-op. See [`docs/panda/custom-property-route.md`](docs/panda/custom-property-route.md).
- **Never name a component prop after a CSS property (`direction`, `page`, `filter`, `content`, `order`); rename it.**
  Why: Panda extracts style props from any capitalized JSX component, so the prop is read as CSS and silently dropped.

## Testing and evidence

- **A measurement beats a prediction, and the later phase beats the earlier when two sources disagree.**
  Why: a prediction is never wrong until somebody runs it.
- **Measure the dependency; do not reason about its source.** A finding of "impossible" gets a probe before a verdict, and a test premised on a defect runs in isolation before it is believed.
  Why: reading source confirms what the author expected, not what ships.
- **Do not pin a defect as a contract.** Assert that a provider renders, not that it throws.
  Why: a test that fixes a defect in place makes the fix look like a regression.
- **Assert computed styles (`getComputedStyle` in the browser, the parsed stylesheet under SSR), never class names.** Read the resolved value, pick a value the recipe actually sets, and have it survive `hash: true`. Only the unit project may assert a class string.
  Why: `classList.contains("p_4")` passes on a completely unstyled element. See [`docs/panda/silent-unstyling.md`](docs/panda/silent-unstyling.md).
- **Run axe on every browser suite, and fail on `incomplete` results too.**
  Why: an `incomplete` result is a check axe could not finish, which is exactly where a violation hides.
- **A multi-read slot owes a test that counts real constructions.** Unit tests of the store cover wiring, defaults, controlled and uncontrolled, and the forwarded `undefined` per default.
  Why: nothing else can see a node built twice and thrown away.
- **After a test goes green, mutate the implementation and confirm that test, and only it, goes red.**
  Why: a test that stays green under a mutation was never testing anything.
- **Assume a green test can prove nothing.** Assert `isTrusted` when two bugs could cancel, measure the case nobody named, and assert the mechanism rather than the outcome when they differ.
  Why: an outcome can come from something other than the code under test; a mechanism cannot. Mutation cannot find an unnamed case, so build the thing, drive it and look.
- **A rule shaped "all X except Y" needs a test on a third member of X.** "Cancel every key but Tab" is told apart from "cancel Enter and Space" by `ArrowDown`.
  Why: the two rules agree at both obvious points, and mutation only exercises cases already written.
- **Report performance as an absolute cost per operation with its consequence.** Microseconds per op, against the 16.7 ms frame budget, one-time or per-frame, and note that a dev build is pessimistic. See [`docs/testing/benchmarking.md`](docs/testing/benchmarking.md).
  Why: "48x slower" on a 0.1 µs baseline is noise.
- **A deliverable verified only by its file existing is verified in name only.** Open the story or the docs example.
  Why: every story once written, typechecked, linted and committed without being opened crashed.
- **Locate a part in a test through a data probe the fixture adds, not a slot class.** See [`docs/testing/repeated-part-proofs.md`](docs/testing/repeated-part-proofs.md).
  Why: a slot class is not a handle tests may assert on.
- **No network fetch and no `img` with an unreachable source in a mounting test; use a decorative surface.**
  Why: the fetch flakes and the image is an axe finding.
- **An allow-list lives in a TS config file with a machine reader, not a markdown table.**
  Why: a markdown table is a second grammar, and a malformed row is skipped rather than reported.
- **A canary that catches nothing looks identical to a canary with nothing to catch; prove it with a deliberate failure.** Throw a render, log `console.error`, render `null`.
  Why: a check that has never gone red has never been shown to work.
- **Prove a check in both directions: green on the corpus, and red on deliberate breakages.**
  Why: a check proven in one direction is half a check.
- **Check the outcome, not the supplier.** A check that asserts the result keeps holding whichever side provides the rule. A CI job that echoes a statement nobody verified is a false green.
  Why: a green tick for work no machine performed is worse than no tick.
- **Measure bundle growth per batch of components, not per component.**
  Why: shared machine packages make a per-component figure an arithmetic error.

## Docs and user-facing text

- **A component's JSDoc is end-user documentation: what it is and what it renders.** Toolchain rationale goes beside the mechanism, not above the export.
  Why: the JSDoc is what a consumer sees on hover.
- **Docs and consumer JSDoc state present behaviour, never pre-release history.**
  Why: what consumers had before this existed describes a past that never shipped. Internal why-comments are fine.
- **Docs do not argue performance for static styling.** Dynamic values are silent here, not slow.
  Why: Chakra's "dynamic is slow" argument does not transfer, and a reader adopting for speed will leave when the profile is flat. See [`docs/adr/0013-docs-forbidden-claims.md`](docs/adr/0013-docs-forbidden-claims.md).
- **Do not warn about a safe operation.**
  Why: a warning readers learn to skip is skipped when it matters.
- **A docs example ships the required cast rather than hiding it.**
  Why: an example that hides a required cast teaches the wrong thing.
