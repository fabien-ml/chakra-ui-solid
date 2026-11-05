# Judge every emitted declaration with `CSS.supports` in a real browser

A style value being statically extractable does not make it valid: `<Box mt="4x" />` and `<Box bg="bg.pannel" />` extract cleanly, emit `margin-top: 4x`, and no browser parses it. The class is generated, the element wears it, the property is never set, and every other check stays green.

So a check reads every generated stylesheet (the package's and the docs app's), takes each distinct `property: value` pair, and asks `CSS.supports(property, value)` in real Chromium driven by Playwright from a Node script. Extraction, deduplication and the allowance list are pure and unit-tested; only the oracle needs the browser. The check also carries a canary that fails if `CSS.supports` stops discriminating.

A declaration we do not author (Panda's preflight, a recipe body inside the preset) is not fixed by editing a value: it is a row in an allowance register, scoped **per selector** (one bad value such as `transitionDuration: "normal"` can reach several recipes, and an upstream bump repairs them one at a time), carrying the reason and what deletes it. A row that matches nothing fails the check.

## Considered options

- **A browser-project test.** Rejected: the subject is two files on disk, one built by another package's Panda run, which the browser project does not resolve. A failure there would also read as a component regression.
- **A Node CSS parser (css-tree).** Rejected: it is a second implementation of the value grammar and answers "does the spec syntax admit this?", not "does the browser accept this?". Asking the engine returned the same verdict as parsing into a `CSSStyleSheet`, which drops rejected values.
- **A token-union check** (compare values to the registered token keys). Prototyped and rejected: only false positives, since utilities accept raw CSS beside tokens (`w="50%"` fails it, `mt="4x"` passes).
