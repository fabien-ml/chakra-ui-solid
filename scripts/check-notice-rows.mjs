#!/usr/bin/env node

// check:notice-rows — every registry entry has a row in the root NOTICE.md AND in its own
// package's, and no row exists without an entry (`testing.md` §9, DoD 4.7).
//
// The root file is the audit surface. The package file is the one that travels in the npm tarball
// and the only one a consumer who never visits the repository will see (`legal.md` §2.4).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findNoticeRowProblems, findOrphanNoticeRows } from "./lib/attribution.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { attributions } = await import(join(repoRoot, "attribution.config.ts"));

const rootNotice = readFileSync(join(repoRoot, "NOTICE.md"), "utf8");

const packageNotices = new Map();
for (const packageName of new Set(attributions.map((entry) => entry.package))) {
  const noticePath = join(repoRoot, "packages", packageName, "NOTICE.md");
  if (existsSync(noticePath)) {
    packageNotices.set(packageName, readFileSync(noticePath, "utf8"));
  }
}

const missing = findNoticeRowProblems(attributions, rootNotice, packageNotices);

// A row in the root's table is a backticked repo-relative path in the first column; a package
// row is a `src/…` path. Both directions matter: a stale row claims a derivation that is not
// there, which is how a deleted derivative leaves a false statement behind.
const orphans = [
  ...findOrphanNoticeRows(attributions, rootNotice, "NOTICE.md", /^\| `(packages\/[^`]+)` \|/gm),
  ...[...packageNotices].flatMap(([packageName, contents]) =>
    findOrphanNoticeRows(
      attributions,
      contents,
      `packages/${packageName}/NOTICE.md`,
      /^\| `(src\/[^`]+)` \|/gm,
    ),
  ),
];

const failures = [
  ...missing.map(({ entry, file, reason }) => `  ${file}\n      ${reason} (from ${entry.file})`),
  ...orphans.map(({ file, reason }) => `  ${file}\n      ${reason}`),
];

if (failures.length > 0) {
  console.error(
    `check:notice-rows — ${failures.length} NOTICE.md problem(s):\n\n${failures.join("\n")}\n\n` +
      "A missing row is the obligation itself; a stale row is a claim we no longer make.\n",
  );
  process.exit(1);
}

console.log(
  `check:notice-rows — ${attributions.length} derivative file(s), each with a row in NOTICE.md and ` +
    `in ${packageNotices.size} package NOTICE.md file(s); no orphan rows.`,
);
