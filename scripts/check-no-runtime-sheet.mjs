#!/usr/bin/env node

// check:no-runtime-sheet — none of OUR source writes a stylesheet at runtime.
//
// The second of the two §0 checks, and never merged with the first: this one is scoped to
// `packages/*/src/**` and `apps/docs/src/**` and judges our code by what it *does*, where
// `check:no-cij-manifest` judges the whole closure by what a dependency *is* (`testing.md` §5).

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatRuntimeSheetHits, scanForRuntimeSheets } from "./lib/no-runtime-sheet.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { scanned, hits } = scanForRuntimeSheets(repoRoot);

if (hits.length > 0) {
  console.error(
    `check:no-runtime-sheet — ${hits.length} runtime-stylesheet use(s) in our own source:\n\n` +
      `${formatRuntimeSheetHits(hits)}\n\n` +
      "There is no allow-list here. Everything a component needs is available without a sheet: " +
      "the DOM `style` attribute, inline CSS custom properties, and Panda's `css`/`cva`/`sva`/`cx`, " +
      "which only compute strings (`plan.md` §0.3). A dynamic value goes through a custom property " +
      '— `style={{ "--w": w }}` with `w="var(--w)"` — not through a rule written at runtime.\n',
  );
  process.exit(1);
}

console.log(
  `check:no-runtime-sheet — ${scanned.length} source file(s) scanned, no runtime stylesheet.`,
);
