#!/usr/bin/env node
// check:skill-pointers — the repo-authored skills are still pointer bundles (`testing.md` §8.2).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSections, readIndexableDocuments } from "./lib/doc-index.mjs";
import {
  buildAnchorResolver,
  findSkillFaults,
  formatSkillFaults,
  readRepoAuthoredSkills,
  readVendoredSkillNames,
} from "./lib/skill-pointers.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDirectory = join(repoRoot, ".agents", "skills");
const lockPath = join(repoRoot, "skills-lock.json");

if (!existsSync(lockPath)) {
  console.error(
    `check:skill-pointers — skills-lock.json is missing. It is the list of vendored skills, and ` +
      `without it every vendored skill would be inspected as a repo-authored one.`,
  );
  process.exit(1);
}

const vendored = readVendoredSkillNames(lockPath);
// Repo-relative, so a failure line is clickable from the repo root rather than a machine-local path.
const skills = readRepoAuthoredSkills(skillsDirectory, vendored).map((skill) => ({
  ...skill,
  file: relative(repoRoot, skill.file),
}));

if (skills.length === 0) {
  console.error(
    `check:skill-pointers — no repo-authored skill found under .agents/skills. Either they were ` +
      `deleted, or every directory is claimed by skills-lock.json and the check is now inspecting ` +
      `nothing while reporting success.`,
  );
  process.exit(1);
}

const documents = readIndexableDocuments(join(repoRoot, "__internal__"));
const scripts = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")).scripts;

const faults = findSkillFaults(skills, {
  resolveAnchor: buildAnchorResolver(documents, parseSections),
  // A citation writes `plan.md`, meaning `__internal__/plan.md` — the convention `CLAUDE.md` fixes
  // for the corpus. Repo-relative paths are written in full and resolve on the first branch.
  resolvePath: (path) =>
    existsSync(join(repoRoot, path)) || existsSync(join(repoRoot, "__internal__", path)),
  resolveScript: (script) => Object.hasOwn(scripts, script),
});

if (faults.length > 0) {
  console.error(
    `check:skill-pointers — ${faults.length} fault(s) across ${skills.length} skill(s). A skill ` +
      `is a reading order over the documents and nothing else: it says where to look, never what ` +
      `will be there. Both failures below are silent — a dead pointer still reads as ` +
      `authoritative, and a rule restated in a skill is the copy that goes stale.` +
      `\n\n${formatSkillFaults(faults)}\n`,
  );
  process.exit(1);
}

const pointers = skills.reduce((total, skill) => total + skill.source.split("\n").length, 0);

console.log(
  `check:skill-pointers — ${skills.length} repo-authored skill(s), ${vendored.length} vendored ` +
    `and skipped, ${pointers} lines, every pointer resolves.`,
);
