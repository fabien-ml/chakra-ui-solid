#!/usr/bin/env node
// docs:index — regenerate `__internal__/INDEX.md` (`testing.md` §8, DoD rule 1.11).

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  countSections,
  INDEX_FILENAME,
  readIndexableDocuments,
  renderIndex,
} from "./lib/doc-index.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const internalDirectory = join(repoRoot, "__internal__");

const documents = readIndexableDocuments(internalDirectory);
const index = renderIndex(documents);

writeFileSync(join(internalDirectory, INDEX_FILENAME), index);

console.log(
  `docs:index — ${documents.length} documents, ${countSections(documents)} sections, ` +
    `${(index.length / 1024).toFixed(1)} KB written to __internal__/${INDEX_FILENAME}.`,
);
