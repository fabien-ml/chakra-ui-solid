# Nothing generated is committed

Generated output (the dev stylesheet, generated route trees, docs data) is rebuilt by the Turbo task graph and ignored by git.

**The hazard:** a Turbo task's default inputs are its own package. A task that scans sources in other packages must declare them in `inputs`, or Turbo returns a cache hit with a stale result: `pnpm cssgen` printed `FULL TURBO`, the stylesheet stayed byte-identical, a newly added style prop had no rule, and the element rendered unstyled. Both directions are silent (a deleted value keeps its rule). Declare the cross-package globs per task, not in `globalDependencies`, which invalidates every task on any edit and hides which task depends on what. The globs must stay in step with the Panda `include` list.
