#!/usr/bin/env node

// check:package-files — every published package's `files` carries LICENSE and NOTICE.md, and
// every file an `@license` header promises is actually in it (`testing.md` §9, DoD 4.8).
//
// The default `files` field ships `dist` and nothing else, which makes the header's "distributed
// with this package as LICENSE" clause the easiest promise in the repo to break (`legal.md` §2.5).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findPackageFilesProblems } from "./lib/attribution.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { attributions } = await import(join(repoRoot, "attribution.config.ts"));

// Every file named in a `@license` header's "distributed with this package as …" clause.
const promisedFilePattern = /distributed with this package\s*\n?\s*\*?\s*as ([A-Za-z0-9._-]+)/g;

const packages = [];
for (const entry of readdirSync(join(repoRoot, "packages"), { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }
  const directory = join(repoRoot, "packages", entry.name);
  const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
  // A private package is never published, so it owes a consumer nothing.
  if (manifest.private === true) {
    continue;
  }

  const promised = new Set();
  for (const attribution of attributions.filter((item) => item.package === entry.name)) {
    const contents = readFileSync(join(repoRoot, attribution.file), "utf8");
    for (const match of contents.slice(0, 1200).matchAll(promisedFilePattern)) {
      promised.add(match[1]);
    }
  }

  packages.push({
    name: manifest.name,
    directory: `packages/${entry.name}`,
    files: manifest.files ?? [],
    promisedFiles: [...promised],
  });
}

const failures = findPackageFilesProblems(packages);

// `files` naming a file that is not on disk ships an empty promise just as effectively.
for (const { name, directory, files } of packages) {
  for (const required of ["LICENSE", "NOTICE.md"]) {
    if (files.includes(required) && !existsSync(join(repoRoot, directory, required))) {
      failures.push({
        package: name,
        reason: `\`files\` lists \`${required}\`, but ${directory}/${required} does not exist`,
      });
    }
  }
}

if (failures.length > 0) {
  console.error(
    `check:package-files — ${failures.length} packaging problem(s):\n\n` +
      `${failures.map(({ package: name, reason }) => `  ${name}\n      ${reason}`).join("\n")}\n`,
  );
  process.exit(1);
}

console.log(
  `check:package-files — ${packages.length} published package(s) ship LICENSE and NOTICE.md, and ` +
    "every file an `@license` header promises is in `files`.",
);
