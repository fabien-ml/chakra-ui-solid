# STRICT_READ_UNTRACKED

Solid 2.0 labels certain phases strict-read (component render bodies, `<For>` callbacks, an effect's second callback) and reports untracked reads in them. Solid 1.x has no such phase, so a suite written against it cannot see these. `mount()` fails a test on one.

## What it catches

- **The ref race.** A primitive that reads a conditionally rendered element's ref on the activating edge, untracked, sees `undefined` forever: Escape, outside-click and the focus trap silently stop working in the component, never in the primitive's own tests.
- **A render body reading props directly**, outside a getter or memo.
- **A machine `watch` reading props directly** instead of through a tracked dependency.

## Fix

Move the read into a tracked position. Where the untracked read is deliberate, spell it `untrack(...)`, which suppresses the warning at its source. Anything still emitting a warning is an unreviewed read. Never silence it.
