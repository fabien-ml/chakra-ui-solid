# Style props are Panda-shaped; Chakra names are aliased only under three conditions

The style-prop vocabulary is whatever the generated `isCssProperty` says. A Chakra shorthand is aliased into the preset's `utilities.extend` only if it is one of Chakra's shorthands, is absent from the generated vocabulary, and is expressible as a Panda utility without colliding with one of different meaning. Anything failing the third test is a recorded divergence, not an alias.

**Rejected: reproducing Chakra's full utility table.** It is a data table from an Emotion runtime (expression-tier, so it would owe attribution and be maintained against every Chakra release); it would override utilities the preset defines; most of it is already Panda's; and every added utility widens the prop surface the factory and the types must agree on.

An unresolvable token emits its own name and fails silently, so alias tests assert computed styles.
