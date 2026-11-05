# The port rule: only a consumer-observable difference is a divergence

A feature Chakra v3 lacks that we add is invented; one it has that we drop is removed; both are divergences. A line of code Solid writes differently is neither. Accessibility behaviour comes from the layer Chakra is built on and stops there, and nothing ships before what it depends on. The rule outranks every other rule in the repo.

**Why no accessibility beyond upstream:** Chakra v3 adds no behaviour of its own over its headless layer. Holding an earlier library's higher accessibility bar would make this port more accessible than the library it ports, which is itself a divergence even pointing the pleasant way. Adding a fix upstream lacks is a divergence. Case-by-case exceptions were rejected because the exception mechanism is what makes a scope rule unfalsifiable. Gaps are fixed upstream where they also help Chakra.

Landed divergences are recorded ([0007](0007-divergences-recorded-docs-silent.md)).
