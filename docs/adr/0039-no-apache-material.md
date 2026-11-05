# No Apache-2.0 material is copied, and `LICENSE-APACHE` is absent on purpose

The dependency graph and every copied or derived file are MIT. `@react-aria` derivatives (hide-outside, dismissable, press, scroll-into-view, i18n) from the earlier Solid library were considered and not carried, because the port rule ([0050](0050-port-rule-observable-difference.md)) forbids accessibility behaviour that the upstream library does not have. NOTICE.md keeps an empty Adobe section as a guard so the question is visible.

**What would reopen it:** a decision to close an accessibility gap in our own layer. That is a scope decision before it is a licensing one. If taken, the Apache license text must be added to the repo and to the owning package's `files`, and every derived file header needs the Apache-2.0 section 4(b) "this file has been modified from the original" line, which MIT does not require.
