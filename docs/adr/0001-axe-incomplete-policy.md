# Axe `incomplete` results fail the test

`expectNoA11yViolations` runs axe-core on a mounted container and fails on `violations` and on `incomplete` results (rules axe ran but could not decide). The helper used to drop `incomplete` silently; measured across the whole browser run, there were zero, so failing on them cost nothing and catches the next one.

A rule axe genuinely cannot judge in a headless test (usually `color-contrast` over a transparent backdrop) is allowed per call with `allowIncomplete: ["<rule>"]` and a comment giving the reason. Never globally: an accepted `incomplete` is a documented gap a reviewer can see, not a passing check.

Every component's browser test calls `expectNoA11yViolations` at least once, so a baseline accessibility check exists for each component.
