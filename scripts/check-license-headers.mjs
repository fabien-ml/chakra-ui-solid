#!/usr/bin/env node

// check:license-headers — every registry entry carries its `@license` header, the header survives
// to `dist/`, and `comments.legal` is still pinned with its comment (`testing.md` §9, DoD 4.6).
//
// Pass `--dist` to include the built-output half. Without a build there is nothing to read, so the
// `verify` job runs the source half on every push and the `dist` job runs both. Entries with no
// owning package have no `dist/` at all and are skipped there, never here.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkCommentsLegalPinned,
  checkLicenseHeader,
  findMissingDistHeaders,
} from "./lib/attribution.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { attributions } = await import(join(repoRoot, "attribution.config.ts"));
const checkDist = process.argv.includes("--dist");

const failures = [];

if (attributions.length === 0) {
  console.error(
    "check:license-headers — the registry is EMPTY. That is a broken check reporting success: " +
      "`attribution.config.ts` must declare every expression-tier derivative.",
  );
  process.exit(1);
}

for (const entry of attributions) {
  const absolute = join(repoRoot, entry.file);
  if (!existsSync(absolute)) {
    failures.push(`  ${entry.file}\n      declared in attribution.config.ts, but does not exist`);
    continue;
  }
  const problems = checkLicenseHeader(entry, readFileSync(absolute, "utf8"));
  if (problems.length > 0) {
    failures.push(`  ${entry.file}\n${problems.map((p) => `      ${p}`).join("\n")}`);
  }
}

for (const problem of checkCommentsLegalPinned(
  readFileSync(join(repoRoot, "tsdown.config.base.ts"), "utf8"),
)) {
  failures.push(`  tsdown.config.base.ts\n      ${problem}`);
}

if (checkDist) {
  const readDistFiles = (entry) => {
    const distDir = join(repoRoot, "packages", entry.package, "dist");
    const files = [];
    const walk = (directory) => {
      for (const item of readdirSync(directory, { withFileTypes: true })) {
        const absolute = join(directory, item.name);
        if (item.isDirectory()) {
          walk(absolute);
        } else if (/\.(jsx|js|mjs)$/.test(item.name)) {
          files.push({
            file: relative(repoRoot, absolute).split(sep).join("/"),
            contents: readFileSync(absolute, "utf8"),
          });
        }
      }
    };
    if (existsSync(distDir)) {
      walk(distDir);
    }
    return files;
  };

  for (const { entry, reason } of findMissingDistHeaders(attributions, readDistFiles)) {
    failures.push(`  ${entry.file} → packages/${entry.package}/dist/\n      ${reason}`);
  }
}

if (failures.length > 0) {
  console.error(
    `check:license-headers — ${failures.length} attribution failure(s):\n\n${failures.join("\n")}\n\n` +
      "Every one of these is silent and green without this check: the published package becomes " +
      "an unattributed derivative of the project we are porting (`legal.md` §2.3).\n",
  );
  process.exit(1);
}

console.log(
  `check:license-headers — ${attributions.length} derivative file(s) carry an \`@license\` header ` +
    `naming their upstream file; \`comments.legal\` pinned with its comment` +
    (checkDist
      ? "; every header present in `dist/`."
      : " (source only — pass --dist after a build)."),
);
