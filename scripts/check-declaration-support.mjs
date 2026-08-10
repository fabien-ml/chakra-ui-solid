#!/usr/bin/env node

// check:declaration-support — does the CSS Panda emitted say anything the browser understands?
// (`testing.md` §8.4).
//
// `check:style-contract` rule 1 asks whether a style-prop value is statically extractable. Both of
// these pass it:
//
//   <Box mt="4x" />          static, extractable, and not a spacing token
//   <Box bg="bg.pannel" />   static, extractable, and a typo
//
// Panda emits the raw value when a token does not resolve, so the sheet gets `margin-top: 4x` and
// `background: bg.pannel`. The class is generated, the element wears it, and nothing is applied.
//
// **The oracle is the engine, not a parser.** Every distinct declaration in both generated
// stylesheets is put to `CSS.supports(property, value)` inside real Chromium, driven from here
// through Playwright — the same browser the `test` project's leg already installs. A Node CSS
// parser would be a second implementation of the value grammar, and this repo measures its
// dependencies rather than reasoning about them (`prior-art.md` §8.1; `decisions.md` **D-178**).

import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  applyAllowances,
  distinctPairs,
  extractDeclarations,
  findMalformedAllowances,
  formatRejections,
  formatUnusedAllowances,
  partitionForProbe,
} from "./lib/declaration-support.mjs";
import {
  docsStylesheetPath,
  generatedStylesheetPath,
  readStylesheet,
} from "./lib/generated-css.mjs";

const CHECK = "check:declaration-support";
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const { declarationAllowances } = await import(join(repoRoot, "declaration-support.config.ts"));

const malformed = findMalformedAllowances(declarationAllowances);
if (malformed.length > 0) {
  console.error(
    `${CHECK} — ${malformed.length} malformed row(s) in \`declaration-support.config.ts\`. A row ` +
      "missing a field matches nothing, reads as stale, and gets deleted instead of repaired.\n\n" +
      `${malformed.map(({ position, field }) => `  row ${position + 1} — \`${field}\` is missing or empty`).join("\n")}\n`,
  );
  process.exit(1);
}

// Two Panda runs on purpose: ours over `packages/{system,components}/src`, the docs app's over its
// own source as a consumer's build would (`apps/docs/panda.config.ts`).
const sheets = [generatedStylesheetPath(repoRoot), docsStylesheetPath(repoRoot)].map((path) => ({
  path,
  label: relative(repoRoot, path),
  css: readStylesheet(path, CHECK),
}));

const declarations = [];
const skipped = { customProperty: 0, descriptor: 0 };
const emptySheets = [];

for (const sheet of sheets) {
  const found = extractDeclarations(sheet.css);
  if (found.length === 0) {
    emptySheets.push(sheet.label);
    continue;
  }
  const partition = partitionForProbe(found);
  skipped.customProperty += partition.skipped.customProperty;
  skipped.descriptor += partition.skipped.descriptor;
  declarations.push(
    ...partition.probeable.map((declaration) => ({ ...declaration, sheet: sheet.label })),
  );
}

// A check with nothing to check looks exactly like a check that passed.
if (emptySheets.length > 0) {
  console.error(
    `${CHECK} — ${emptySheets.map((label) => `\`${label}\``).join(" and ")} parsed to zero ` +
      "declarations. Either the sheet is empty or the scanner stopped finding them; both would " +
      "have reported this check as green over nothing.\n",
  );
  process.exit(1);
}

const pairs = distinctPairs(declarations);

const browser = await launchChromium();
const page = await browser.newPage();

// The canary: if the oracle stopped discriminating, every pair would come back accepted and the
// check would pass over a broken sheet. `check:css-coverage`'s configuration canary is the same
// idea (`testing.md` §3.5).
const canary = await page.evaluate(() => ({
  known: CSS.supports("color", "red"),
  invented: CSS.supports("margin-top", "4x"),
}));
if (canary.known !== true || canary.invented !== false) {
  await browser.close();
  console.error(
    `${CHECK} — the oracle failed its own canary: \`CSS.supports("color", "red")\` returned ` +
      `${canary.known} and \`CSS.supports("margin-top", "4x")\` returned ${canary.invented}. ` +
      "Every answer below it would be meaningless, so nothing was judged.\n",
  );
  process.exit(1);
}

const accepted = await page.evaluate(
  (list) => list.map(([property, value]) => CSS.supports(property, value)),
  pairs.map((pair) => [pair.property, pair.value]),
);
const chromiumVersion = browser.version();
await browser.close();

const rejections = pairs.flatMap((pair, position) => (accepted[position] ? [] : pair.sites));
const { unallowed, used, unused } = applyAllowances(rejections, declarationAllowances);

if (unallowed.length > 0) {
  console.error(
    `${CHECK} — ${unallowed.length} declaration(s) Chromium ${chromiumVersion} will not parse.\n\n` +
      "A declaration the engine rejects is a declaration that does not exist at render time: the " +
      "rule is emitted, the class name matches, the element wears it, and the property is never " +
      "set. Nothing warns, and a class-name assertion still passes.\n\n" +
      `${formatRejections(unallowed)}\n\n` +
      "An atomic class name spells out what produced it — `.direction_Previous` is a style prop " +
      '`direction="Previous"` — so the selector above is where to grep. The repair is the value: ' +
      "a real token, a literal the property accepts, or a `var(--…)` fed by inline `style` " +
      "(`plan.md` §3.5). If the declaration comes from a recipe body we do not own, it belongs in " +
      "`declaration-support.config.ts` with the reason and what deletes the row.",
  );
  process.exit(1);
}

if (unused.length > 0) {
  console.error(
    `${CHECK} — ${unused.length} selector(s) in \`declaration-support.config.ts\` matched ` +
      "nothing.\n\n" +
      "The declaration each one forgives is no longer in the sheet, so the exception is now a hole " +
      "in the rule it excepts. Delete the row — an upstream repair nobody notices is one nobody " +
      "can act on.\n\n" +
      `${formatUnusedAllowances(unused)}\n`,
  );
  process.exit(1);
}

console.log(
  `${CHECK} — ${declarations.length} declaration(s) across ${sheets.length} stylesheet(s), ` +
    `${pairs.length} distinct property/value pair(s), all accepted by Chromium ${chromiumVersion}. ` +
    `${used} allowance selector(s) used, 0 unused. Skipped ${skipped.customProperty} custom ` +
    `property declaration(s) and ${skipped.descriptor} at-rule descriptor(s), which the oracle ` +
    "cannot judge.",
);

async function launchChromium() {
  try {
    return await chromium.launch();
  } catch (error) {
    console.error(
      `${CHECK} — Chromium would not launch, so nothing was judged. Playwright's browser is the ` +
        "oracle here; there is no fallback that answers the same question.\n\n" +
        "Install it with `pnpm exec playwright install --only-shell chromium`.\n\n" +
        `${error?.message ?? error}`,
    );
    process.exit(1);
  }
}
