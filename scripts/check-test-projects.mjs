#!/usr/bin/env node

// check:test-projects — every test file resolves to exactly one Vitest project.
//
// The globs come from `vitest-projects.ts`, the same module `vitest.config.ts` builds its projects
// from. A check carrying its own copy would go on passing after the config changed, which is the
// failure it exists to prevent.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findMisroutedTestFiles,
  formatMisroutedTestFiles,
  isTestLikeFile,
  listPackageSourceFiles,
} from "./lib/test-projects.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { testProjects } = await import(join(repoRoot, "vitest-projects.ts"));

const candidates = listPackageSourceFiles(repoRoot).filter(isTestLikeFile);
const misrouted = findMisroutedTestFiles(candidates, testProjects);

if (misrouted.length > 0) {
  console.error(
    `check:test-projects — ${misrouted.length} of ${candidates.length} test files do not resolve ` +
      `to exactly one Vitest project:\n\n${formatMisroutedTestFiles(misrouted)}\n`,
  );
  process.exit(1);
}

console.log(
  `check:test-projects — ${candidates.length} test files, each resolving to exactly one project ` +
    `(${testProjects.map((project) => project.name).join(", ")}).`,
);
