# The inert and focus-restore gaps are inherited, not fixed locally

Chakra's and Ark's React sources contain no `inert` handling and no focus handling of their own: an open modal leaves the background keyboard-reachable, and a non-modal dialog does not restore focus on Escape, because both forward the underlying machine unchanged. We do the same. `createHideOutside` and `createFocusRestore` (carried from hope-ui) were dropped for it.

Accessibility behaviour comes from the underlying machine and stops there; making ours more accessible than Chakra's is itself a divergence under the port rule ([0050](0050-port-rule-observable-difference.md)). Any fix belongs upstream, where it also reaches Chakra.

The accessibility checks therefore see the inherited gap as baseline: allow it per call with a reason ([0001](0001-axe-incomplete-policy.md)), not globally.
