#!/usr/bin/env node

// check:preflight-hidden — the emitted stylesheet carries a `[hidden]` rule that beats a recipe's
// own `display` (`testing.md` §8; assumption P3-E).
//
// **It asserts the outcome, not the source**, and that is the point: the rule may come from Panda's
// own `preflight: true` or from a `globalCss` line in our preset, and the check is correct either
// way. What it is not allowed to do is pass when neither supplies it.
//
// What a failure means: Zag emits `hidden` on parts it considers closed, `[hidden] { display: none }`
// is only a UA rule, and any explicit `display` beats it — while a slot recipe sets `display` on
// most slots. Without an `!important` rule a closed dialog leaves a full-viewport backdrop over the
// page and a listbox's check glyph is visible on every row. hope-ui hit both, on two machines, one
// component apart (`prior-art.md` §5.1).

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readGeneratedStylesheet } from "./lib/generated-css.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readGeneratedStylesheet(repoRoot, "check:preflight-hidden");

// The selector Chakra's own preflight uses. `[hidden='until-found']` is excluded because that value
// means "hidden, but findable by the browser's find-in-page", which reveals the element itself.
const rule = /\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/;

if (!rule.test(css)) {
  const anyHiddenRule = /\[hidden\][^{]*\{/.test(css);
  console.error(
    "check:preflight-hidden — the generated stylesheet has no `[hidden] { display: none " +
      "!important }` rule.\n\n" +
      (anyHiddenRule
        ? "There IS a `[hidden]` rule, but without `!important` — which a recipe's own `display` " +
          "beats, so it does not solve the problem.\n\n"
        : "") +
      "A part the machine marks `hidden` will stay painted wherever its recipe slot sets a " +
      "`display`: a closed dialog leaves a full-viewport backdrop over the page. Either Panda's " +
      "`preflight: true` supplies this rule or `@chakra-ui-solid/preset` adds one `globalCss` " +
      "line carrying Chakra's verbatim; this check does not care which, only that one of them did.",
  );
  process.exit(1);
}

console.log(
  "check:preflight-hidden — `[hidden]` beats a recipe's `display` in the generated stylesheet.",
);
