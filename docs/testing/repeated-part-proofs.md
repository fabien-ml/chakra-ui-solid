# Proofs a repeated part owes

A repeated part (one machine driving N items, such as `RadioGroup.Item`) is proved by five tests. Each asserts a mechanism, not an outcome.

| Proof | Asserts |
|---|---|
| context once per item | each item builds its context exactly once |
| round-trip | the machine's prop getters accept the unmodified item bag |
| no untracked read | `mount()` raises no `STRICT_READ_UNTRACKED` |
| hydration keys | N items allocate the same keys on server and client, via a round-trip with a non-trivial list |
| class map once | the slot class map resolves once on the Root, counted by a spy |

## How to discharge them

- Capture the real getter arguments by wrapping the Root's getters on an owned machine.
- Dispose inside the test body, so the `mount()` console guard raising `STRICT_READ_UNTRACKED` is itself the assertion.
- Compare class strings across items, plus the computed box.
- A miscounted node (an extra node in the checked item) puts every later node on the wrong marker, which is what the hydration proof exists to find.
