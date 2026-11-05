# Hydration assertions miss a diverging client model

Hydration reuses the server's DOM by design. If the client computes different content for a structurally identical tree (a locale detected only on the client), the old content stays on screen: no warning, no replaced node, nothing for a node-reuse or structure assertion to catch.

Only an assertion on rendered content, or on behavior after hydration, finds it. A hydration round-trip that passes proves the keys line up, not that the content agrees.
