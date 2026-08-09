#!/usr/bin/env node

// check:no-cij-manifest — no CSS-in-JS engine anywhere in the INSTALLED closure.
//
// This is the §0 rule proper (`testing.md` §5.1; `CLAUDE.md` §0). It reads the installed tree
// rather than `package.json` alone, because a transitive edge is the one nobody adds deliberately
// — and it cross-checks the lockfile, which sees packages `pnpm ls` prunes.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findCijEngines,
  flattenPnpmTree,
  formatCijEngines,
  parseLockfilePackages,
} from "./lib/no-cij-manifest.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

let tree;
try {
  tree = JSON.parse(
    execFileSync("pnpm", ["ls", "--json", "--depth", "Infinity", "--recursive"], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    }),
  );
} catch (error) {
  console.error(
    "check:no-cij-manifest — could not read the installed closure. This check is only meaningful " +
      "against an installed tree; run `pnpm install` first.\n" +
      `  ${error.message}`,
  );
  process.exit(1);
}

const installed = flattenPnpmTree(tree);
const lockfile = parseLockfilePackages(readFileSync(join(repoRoot, "pnpm-lock.yaml"), "utf8"));

// An empty closure is not a pass: it means `pnpm ls` returned a tree this script did not
// understand, and a check that reports "0 packages, all clean" is the file-existence failure
// `definition-of-done.md` §0 exists to prevent.
if (installed.length === 0 || lockfile.length === 0) {
  console.error(
    "check:no-cij-manifest — read an EMPTY closure " +
      `(pnpm ls: ${installed.length} packages, lockfile: ${lockfile.length}). That is a broken ` +
      "check reporting success, not a clean tree.",
  );
  process.exit(1);
}

const found = [
  ...findCijEngines(installed, "pnpm ls"),
  ...findCijEngines(lockfile, "pnpm-lock.yaml"),
];

if (found.length > 0) {
  console.error(
    `check:no-cij-manifest — ${found.length} CSS-in-JS engine(s) in the dependency closure:\n\n` +
      `${formatCijEngines(found)}\n\n` +
      "This is a STOP, not a workaround (`zag-solid-adapter.md` §5.4). A runtime styling engine " +
      "makes build-time extraction impossible and takes the distribution model with it, so there " +
      "is no local mitigation: drop the dependency, or do not ship the component that needs it, " +
      "and file upstream.\n",
  );
  process.exit(1);
}

console.log(
  `check:no-cij-manifest — no CSS-in-JS engine in the installed closure: ${installed.length} ` +
    `packages via pnpm ls, ${lockfile.length} lockfile entries cross-checked.`,
);
