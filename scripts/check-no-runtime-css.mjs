#!/usr/bin/env node

// check:no-runtime-css — the one rule this library is built on, at its three boundaries.
//
//   A. No CSS-in-JS engine anywhere in the INSTALLED dependency closure. Judges what a dependency
//      *is*. A transitive edge is the one nobody adds deliberately, so this reads the installed
//      tree and cross-checks the lockfile, which sees packages `pnpm ls` prunes.
//   B. None of OUR source writes a stylesheet at runtime. Judges what our code *does*.
//   C. No published package exposes a `.css` file, through `exports`, `files`, or `style`.
//
// The three stay separate assertions in one file. Merging B into A would flag an audited inline
// `style` attribute as a styling engine; merging A into B would miss the dependency that ships one.
//
// Allowed, and routinely needed: the DOM `style` attribute (Zag's `normalizeProps` emits `style`
// objects for floating positioning, slider thumbs, progress fills), inline CSS custom properties,
// and Panda's `css`/`cva`/`sva`/`cx`, which only compute strings.

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
import { formatRuntimeSheetHits, scanForRuntimeSheets } from "./lib/no-runtime-sheet.mjs";
import { flattenExports, listPublishedPackages } from "./lib/published-packages.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const fail = (message) => {
  console.error(`check:no-runtime-css — ${message}\n`);
  process.exit(1);
};

// A — what a dependency IS.

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
  fail(
    "could not read the installed closure. This assertion is only meaningful against an installed " +
      `tree; run \`pnpm install\` first.\n  ${error.message}`,
  );
}

const installed = flattenPnpmTree(tree);
const lockfile = parseLockfilePackages(readFileSync(join(repoRoot, "pnpm-lock.yaml"), "utf8"));

// An empty closure is not a pass: it means `pnpm ls` returned a tree this script did not
// understand, and a check reporting "0 packages, all clean" is worse than no check.
if (installed.length === 0 || lockfile.length === 0) {
  fail(
    `read an EMPTY closure (pnpm ls: ${installed.length} packages, lockfile: ${lockfile.length}). ` +
      "That is a broken check reporting success, not a clean tree.",
  );
}

const engines = [
  ...findCijEngines(installed, "pnpm ls"),
  ...findCijEngines(lockfile, "pnpm-lock.yaml"),
];

if (engines.length > 0) {
  fail(
    `${engines.length} CSS-in-JS engine(s) in the dependency closure:\n\n${formatCijEngines(engines)}\n\n` +
      "This is a STOP, not a workaround. A runtime styling engine makes build-time extraction " +
      "impossible and takes the distribution model with it, so there is no local mitigation: drop " +
      "the dependency, or do not ship the component that needs it.",
  );
}

// B — what our own code DOES.

const { scanned, hits } = scanForRuntimeSheets(repoRoot);

if (hits.length > 0) {
  fail(
    `${hits.length} runtime-stylesheet use(s) in our own source:\n\n${formatRuntimeSheetHits(hits)}\n\n` +
      "There is no allow-list here. A dynamic value goes through a custom property — " +
      '`style={{ "--w": w }}` with `w="var(--w)"` — not through a rule written at runtime.',
  );
}

// C — what we publish.

const cssExposures = [];

for (const { name, manifest } of listPublishedPackages(repoRoot)) {
  for (const { subpath, target } of flattenExports(manifest.exports ?? {})) {
    if (target.endsWith(".css")) {
      cssExposures.push(`  ${name}\n      \`${subpath}\` resolves to \`${target}\``);
    }
  }
  for (const listed of manifest.files ?? []) {
    if (listed.endsWith(".css")) {
      cssExposures.push(`  ${name}\n      \`files\` ships \`${listed}\``);
    }
  }
  if (typeof manifest.style === "string") {
    cssExposures.push(`  ${name}\n      has a \`style\` field (\`${manifest.style}\`)`);
  }
}

if (cssExposures.length > 0) {
  fail(
    `${cssExposures.length} published package(s) expose CSS:\n\n${cssExposures.join("\n")}\n\n` +
      "This library publishes zero CSS. A prebuilt sheet cannot carry a consumer's own style props " +
      "or their theming, so it would create a second, half-functional support tier.",
  );
}

console.log(
  `check:no-runtime-css — no CSS-in-JS engine across ${installed.length} installed packages ` +
    `(${lockfile.length} lockfile entries cross-checked); no runtime stylesheet in ${scanned.length} ` +
    "source file(s); no published package exposes CSS.",
);
