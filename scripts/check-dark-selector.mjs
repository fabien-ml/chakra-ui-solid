#!/usr/bin/env node

// check:dark-selector — the colour-mode selector a consumer has to put on `<html>` is the one the
// generated stylesheet actually keys its colours off (`testing.md` §8; assumption P3-F).
//
// This library ships **no** colour-mode provider, hook or toggle — Chakra ships none either, only a
// CLI snippet over `next-themes` installed into the consumer's app. So the selector *is* our whole
// colour-mode contract, and the one line the docs tell a consumer to write.
//
// It is a harder requirement than "dark mode works". The preset gives its semantic colours **no
// base value**: `--colors-bg-panel` and its siblings are declared only inside `.light { … }` and
// `.dark { … }`. A page carrying neither class has no colours at all — every semantic token
// resolves to an undefined custom property and computes to `transparent`, with no error anywhere.
// The computed-colour half of this assertion lives in the browser suite, which toggles the class
// and reads both values.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readGeneratedStylesheet } from "./lib/generated-css.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readGeneratedStylesheet(repoRoot, "check:dark-selector");

/** What the docs tell a consumer to write, and what every other assertion here is measured against. */
const DOCUMENTED = { light: ".light", dark: ".dark" };

const problems = [];

for (const [mode, selector] of Object.entries(DOCUMENTED)) {
  // The token block: `.dark { --colors-bg: … }`. Anchored to a declaration so a stray `.dark`
  // inside some recipe's own rule cannot satisfy it.
  const tokenBlock = new RegExp(`\\${selector}\\s*\\{[^}]*--colors-`);
  if (!tokenBlock.test(css)) {
    problems.push(
      `no \`${selector} { --colors-… }\` block — the semantic colour tokens for ${mode} mode are ` +
        "not keyed off the selector the docs name",
    );
  }
}

// A semantic colour must be reachable in each mode and unreachable outside both. `bg.panel` stands
// in for the ~100 semantic colours, which are emitted as one block per mode.
const probe = "--colors-bg-panel";
const definitions = [...css.matchAll(new RegExp(`([^{};\\n]+)\\{[^}]*${probe}:`, "g"))];
const scopes = definitions.map((match) => match[1].trim().split(/\s+/).pop());

if (!scopes.includes(DOCUMENTED.light) || !scopes.includes(DOCUMENTED.dark)) {
  problems.push(
    `\`${probe}\` is defined in {${scopes.join(", ")}} rather than in both ${DOCUMENTED.light} ` +
      `and ${DOCUMENTED.dark}`,
  );
}

if (problems.length > 0) {
  console.error(
    "check:dark-selector — the colour-mode contract and the generated stylesheet disagree:\n\n" +
      `${problems.map((problem) => `  - ${problem}`).join("\n")}\n\n` +
      "Either the base preset changed its `_dark`/`_light` condition, or the docs are telling " +
      "consumers to write a class that keys nothing. Both are silent for a consumer: the page " +
      "renders, with no colours.",
  );
  process.exit(1);
}

console.log(
  `check:dark-selector — semantic colours are keyed off \`${DOCUMENTED.light}\` and ` +
    `\`${DOCUMENTED.dark}\`, which is the class the docs put on \`<html>\`.`,
);
