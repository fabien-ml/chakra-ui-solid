# Throwing in a reactive scope halts Solid

An uncaught throw inside a Solid 2.0 memo (including a `<For>` `each` accessor) does not only fail that subtree. Solid logs `[REACTIVITY_HALTED]` and **every later render on the page silently no-ops**. Solid also catches an effect's throw and, after a second failure, halts reactivity module-wide, which poisons every later test in the file.

React re-runs a component body, so a `throw` there is a render error an error boundary contains. Solid runs the body once, so the tempting place for a guard that should re-check, the reactive accessor, is the placement that poisons the graph.

## Where guards go

In the **component body**. Spell the prop read `untrack(() => props.x)`, or `mount()` fails the test with `STRICT_READ_UNTRACKED`, correctly. A value that becomes invalid after mount then will not throw; say so in a comment and pin it with a test.

## Measured cases

- `ColorSwatchMix`'s over-four guard thrown from `<For>` reads: the two tests after it failed with empty containers.
- A recipe-key throw is raised once untracked at construction and once in the memo; the construction-time throw is the one that matters.
- A throw in a Storybook accessor leaves every story rendering nothing.

Related: [STRICT_READ_UNTRACKED](strict-read-untracked.md).
