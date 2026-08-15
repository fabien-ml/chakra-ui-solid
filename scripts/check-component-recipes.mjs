#!/usr/bin/env node

// check:component-recipes — that the committed component→recipe manifest still describes the
// source it was derived from.
//
// The manifest decides which recipe bodies reach a consumer's stylesheet, so every way it can go
// stale is silent and one-directional: a component that starts importing a recipe renders unstyled
// in an app that imports only that component, and nothing in a build, a type-check or a test can
// see it — `classList.contains("button--size_md")` passes on an element with no rule behind it.
//
// The check is the generator run again, in memory, against the same source tree. There is no second
// implementation to keep in step: if the two texts differ, the tree moved and the artifact did not.

import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  collect,
  componentRecipesPath,
  renderComponentRecipesModule,
} from "./generate-component-recipes.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const asRepoPath = (path) => relative(repoRoot, path);

const expected = renderComponentRecipesModule();

let committed;
try {
  committed = readFileSync(componentRecipesPath, "utf8");
} catch {
  console.error(
    `check:component-recipes — ${asRepoPath(componentRecipesPath)} is missing. ` +
      "Run `node scripts/generate-component-recipes.mjs`.\n",
  );
  process.exit(1);
}

if (committed !== expected) {
  const committedLines = committed.split("\n");
  const expectedLines = expected.split("\n");
  const at = expectedLines.findIndex((line, index) => line !== committedLines[index]);

  console.error(
    `check:component-recipes — ${asRepoPath(componentRecipesPath)} is stale: a component's ` +
      "imports changed and the manifest was not regenerated. Every recipe missing from it is CSS " +
      "the consumer never receives, with no error anywhere.\n" +
      `  first difference, line ${at + 1}:\n` +
      `    committed: ${committedLines[at] ?? "<end of file>"}\n` +
      `    derived:   ${expectedLines[at] ?? "<end of file>"}\n` +
      "  Run `node scripts/generate-component-recipes.mjs`.\n",
  );
  process.exit(1);
}

const { componentRecipes, exportRecipes } = collect();

console.log(
  `check:component-recipes — ${asRepoPath(componentRecipesPath)} matches the import graph: ` +
    `${Object.keys(componentRecipes).length} entries and ${Object.keys(exportRecipes).length} ` +
    `exported names reach ${componentRecipes["."].length} recipes between them.`,
);
