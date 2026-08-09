#!/usr/bin/env node
// check:doc-index — `__internal__/INDEX.md` still describes the documents (`testing.md` §8).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  countSections,
  findIndexDrift,
  formatIndexDrift,
  INDEX_FILENAME,
  readIndexableDocuments,
  renderIndex,
} from "./lib/doc-index.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const internalDirectory = join(repoRoot, "__internal__");
const indexPath = join(internalDirectory, INDEX_FILENAME);

if (!existsSync(indexPath)) {
  console.error(
    `check:doc-index — __internal__/${INDEX_FILENAME} does not exist. Run 'pnpm docs:index'.`,
  );
  process.exit(1);
}

const documents = readIndexableDocuments(internalDirectory);
const drift = findIndexDrift(readFileSync(indexPath, "utf8"), renderIndex(documents));

if (drift.total > 0) {
  console.error(
    `check:doc-index — the index no longer describes the documents. A stale row sends a reader ` +
      `to the wrong line range, which is worse than no index: they read the neighbouring section ` +
      `and cite it as the one they were pointed at. Run 'pnpm docs:index' and commit the result.` +
      `\n\n${formatIndexDrift(drift)}\n`,
  );
  process.exit(1);
}

console.log(
  `check:doc-index — ${documents.length} documents, ${countSections(documents)} sections, ` +
    `index is current.`,
);
