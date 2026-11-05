# A missing recipe key throws instead of rendering unstyled

Our recipe lookup throws when the consumer's system has no recipe for a component's key, and the message names the key and the config change that fixes it. The React version falls back to an empty `cva({})`, so a recipe deleted from a consumer's config yields an element with no theme class and no error. That is silent unstyling, the failure this project's design exists to remove. The keys are ours, one per component, so a system missing one is a system that component cannot be styled by.

This is a landed divergence, recorded here and not on the docs page ([0007](0007-divergences-recorded-docs-silent.md)).
