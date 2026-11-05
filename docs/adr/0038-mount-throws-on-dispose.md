# `mount()` throws Solid diagnostics on `dispose()`, not from `console.warn`

The test helper `mount()` watches `console.warn` and `console.error` for the Solid 2.0 dev diagnostics `STRICT_READ_UNTRACKED` and `REACTIVE_WRITE_IN_OWNED_SCOPE`. It records them, swallows the printed line, and throws a summary of everything recorded when the test calls `dispose()`. A diagnostic is a defect in the component, never a missing wrapper in the test.

**Why not throw on sight:** the warning fires inside whatever stack Solid is in (a render body, an effect flush, an effect cleanup). Solid catches an effect's throw and, after a second failure, halts reactivity globally, which poisons every later test in the file. `dispose()` is a checkpoint the test owns, outside any reactive flush.

**Why it is a gate at all:** Solid 1.x has neither diagnostic, so a library ported from React or tested against Solid 1 cannot see them. `STRICT_READ_UNTRACKED` is the only signal for a ref read on an activation edge without tracking: the part silently never reacts. Swallowing the matched line keeps `grep -c STRICT_READ_UNTRACKED` over the browser run honest at zero. A deliberate untracked read is spelled `untrack(...)`.

The helper ships when the first component renders through it. Added earlier it would be unexercised, since with nothing rendering there is nothing to diagnose.
