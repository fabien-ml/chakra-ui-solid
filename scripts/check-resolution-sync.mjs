#!/usr/bin/env node
// check:resolution-sync — the dev-time resolution files agree (`plan.md` §9, DoD rule 4.10).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  findResolutionDrift,
  formatResolutionDrift,
  fromTsconfigPaths,
  fromViteAliases,
} from "./lib/resolution-sync.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

// `tsconfig.base.json` carries `//` comments, so it is JSONC rather than JSON. TypeScript's own
// parser is already a devDependency and is the one that reads this file for real.
const tsconfigPath = join(repoRoot, "tsconfig.base.json");
const parsed = ts.parseConfigFileTextToJson(tsconfigPath, readFileSync(tsconfigPath, "utf8"));
if (parsed.error !== undefined) {
  console.error(`check:resolution-sync — tsconfig.base.json is not parseable as JSONC.`);
  process.exit(1);
}

const { chakraSolidAlias } = await import(join(repoRoot, "vitest-aliases.ts"));

const sources = [
  {
    name: "tsconfig.base.json#paths",
    entries: fromTsconfigPaths(parsed.config.compilerOptions?.paths, repoRoot),
  },
  {
    name: "vitest-aliases.ts#chakraSolidAlias",
    entries: fromViteAliases(chakraSolidAlias, repoRoot),
  },
];

// The docs app arrives at step 8. Until then it is absent rather than empty, and a check that
// counted an absent file as "agrees, with nothing" would be reporting a third opinion it never
// read.
const docsViteConfig = join(repoRoot, "apps/docs/vite.config.ts");
const docsPresent = existsSync(docsViteConfig);
if (docsPresent) {
  const { chakraSolidAlias: docsAlias } = await import(docsViteConfig);
  sources.push({ name: "apps/docs/vite.config.ts", entries: fromViteAliases(docsAlias, repoRoot) });
}

const drift = findResolutionDrift(sources);

if (drift.length > 0) {
  console.error(
    `check:resolution-sync — ${drift.length} workspace resolution(s) are not declared in every ` +
      `file. A package that resolves to a stale sibling dist/ still builds and still passes:\n\n` +
      `${formatResolutionDrift(drift)}\n`,
  );
  process.exit(1);
}

const total = sources[0].entries.length;
console.log(
  `check:resolution-sync — ${total} workspace resolution(s) agree across ${sources.length} file(s): ` +
    `${sources.map((source) => source.name).join(", ")}.` +
    // `apps/docs` joined at step 3b, not step 8 (D-133), and it is a standing consumer instance
    // from there on — so its absence is a broken checkout rather than a schedule.
    (docsPresent
      ? ""
      : " (apps/docs is MISSING — it has been part of the workspace since step 3b.)"),
);
