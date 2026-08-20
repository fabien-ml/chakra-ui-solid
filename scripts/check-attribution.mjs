#!/usr/bin/env node

// check:attribution — the obligations a derivative file carries, all three of them.
//
//   A. Every entry in `attribution.config.ts` has an `@license` header naming its upstream file,
//      and `comments.legal` is still pinned in `tsdown.config.base.ts`. Pass `--dist` after a build
//      to also assert the header survived into `dist/` — rolldown strips every unmarked block
//      comment, so an untagged header vanishes from the tarball with a green build.
//   B. Every entry has a row in the root `NOTICE.md` and in its package's, and no row exists
//      without an entry. Both directions: a missing row is the obligation itself, a stale row is a
//      claim we no longer make.
//   C. Every published package's `files` carries LICENSE and NOTICE.md, plus any file a header
//      promises. The default `files` ships `dist` and nothing else, which makes the header's
//      "distributed with this package as LICENSE" clause the easiest promise here to break.
//
// Every one of these fails silently and green without this check: the published package becomes an
// unattributed derivative of the project we are porting.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkCommentsLegalPinned,
  checkLicenseHeader,
  findMissingDistHeaders,
  findNoticeRowProblems,
  findOrphanNoticeRows,
  findPackageFilesProblems,
  LICENSE_HEADER_WINDOW,
} from "./lib/attribution.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { attributions, noticeOnlyPaths } = await import(join(repoRoot, "attribution.config.ts"));
const checkDist = process.argv.includes("--dist");

if (attributions.length === 0) {
  console.error(
    "check:attribution — the registry is EMPTY. That is a broken check reporting success: " +
      "`attribution.config.ts` must declare every expression-tier derivative.\n",
  );
  process.exit(1);
}

const failures = [];

// A — headers.

for (const entry of attributions) {
  const absolute = join(repoRoot, entry.file);
  if (!existsSync(absolute)) {
    failures.push(`  ${entry.file}\n      declared in attribution.config.ts, but does not exist`);
    continue;
  }
  const problems = checkLicenseHeader(entry, readFileSync(absolute, "utf8"));
  if (problems.length > 0) {
    failures.push(`  ${entry.file}\n${problems.map((problem) => `      ${problem}`).join("\n")}`);
  }
}

for (const problem of checkCommentsLegalPinned(
  readFileSync(join(repoRoot, "tsdown.config.base.ts"), "utf8"),
)) {
  failures.push(`  tsdown.config.base.ts\n      ${problem}`);
}

if (checkDist) {
  const readDistFiles = (entry) => {
    const distDirectory = join(repoRoot, "packages", entry.package, "dist");
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
    if (existsSync(distDirectory)) {
      walk(distDirectory);
    }
    return files;
  };

  for (const { entry, reason } of findMissingDistHeaders(attributions, readDistFiles)) {
    failures.push(`  ${entry.file} → packages/${entry.package}/dist/\n      ${reason}`);
  }
}

// B — NOTICE rows, both directions.

const rootNotice = readFileSync(join(repoRoot, "NOTICE.md"), "utf8");
const packageNotices = new Map();

for (const packageName of new Set(
  attributions.map((entry) => entry.package).filter((name) => name !== null),
)) {
  const noticePath = join(repoRoot, "packages", packageName, "NOTICE.md");
  if (existsSync(noticePath)) {
    packageNotices.set(packageName, readFileSync(noticePath, "utf8"));
  }
}

for (const { entry, file, reason } of findNoticeRowProblems(
  attributions,
  rootNotice,
  packageNotices,
)) {
  failures.push(`  ${file}\n      ${reason} (from ${entry.file})`);
}

// The root scan reads `apps/` as well as `packages/`, which is only possible because every row that
// cannot carry an `@license` header — a directory, a binary, another project's mark — is declared
// in `noticeOnlyPaths`.
const orphans = [
  ...findOrphanNoticeRows(
    attributions,
    rootNotice,
    "NOTICE.md",
    /^\| `((?:packages|apps)\/[^`]+)` \|/gm,
    noticeOnlyPaths,
  ),
  ...[...packageNotices].flatMap(([packageName, contents]) =>
    findOrphanNoticeRows(
      attributions,
      contents,
      `packages/${packageName}/NOTICE.md`,
      /^\| `(src\/[^`]+)` \|/gm,
    ),
  ),
];

for (const { file, reason } of orphans) {
  failures.push(`  ${file}\n      ${reason}`);
}

// The same assertion in the other direction for `noticeOnlyPaths`: a declared path whose row was
// deleted is the obligation going missing, and the orphan scan cannot see it.
for (const { path } of noticeOnlyPaths.filter(({ path }) => !rootNotice.includes(path))) {
  failures.push(`  NOTICE.md\n      no row for \`${path}\`, declared in noticeOnlyPaths`);
}

// C — what the tarball actually ships.

const promisedFilePattern = /distributed with this package\s*\n?\s*\*?\s*as ([A-Za-z0-9._-]+)/g;
const publishedPackages = [];

for (const item of readdirSync(join(repoRoot, "packages"), { withFileTypes: true })) {
  if (!item.isDirectory()) {
    continue;
  }
  const directory = join(repoRoot, "packages", item.name);
  const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
  if (manifest.private === true) {
    continue;
  }

  const promised = new Set();
  for (const attribution of attributions.filter((entry) => entry.package === item.name)) {
    const contents = readFileSync(join(repoRoot, attribution.file), "utf8");
    for (const match of contents.slice(0, LICENSE_HEADER_WINDOW).matchAll(promisedFilePattern)) {
      promised.add(match[1]);
    }
  }

  publishedPackages.push({
    name: manifest.name,
    directory: `packages/${item.name}`,
    files: manifest.files ?? [],
    promisedFiles: [...promised],
  });
}

const packagingProblems = findPackageFilesProblems(publishedPackages);

// `files` naming a file that is not on disk ships an empty promise just as effectively.
for (const { name, directory, files } of publishedPackages) {
  for (const required of ["LICENSE", "NOTICE.md"]) {
    if (files.includes(required) && !existsSync(join(repoRoot, directory, required))) {
      packagingProblems.push({
        package: name,
        reason: `\`files\` lists \`${required}\`, but ${directory}/${required} does not exist`,
      });
    }
  }
}

for (const { package: name, reason } of packagingProblems) {
  failures.push(`  ${name}\n      ${reason}`);
}

if (failures.length > 0) {
  console.error(
    `check:attribution — ${failures.length} attribution failure(s):\n\n${failures.join("\n")}\n`,
  );
  process.exit(1);
}

console.log(
  `check:attribution — ${attributions.length} derivative file(s) carry an \`@license\` header and a ` +
    `row in NOTICE.md and in ${packageNotices.size} package NOTICE.md file(s); ` +
    `${noticeOnlyPaths.length} notice-only path(s), no orphan rows; ${publishedPackages.length} ` +
    "published package(s) ship LICENSE and NOTICE.md" +
    (checkDist
      ? "; every header present in `dist/`."
      : " (source only — pass --dist after a build)."),
);
