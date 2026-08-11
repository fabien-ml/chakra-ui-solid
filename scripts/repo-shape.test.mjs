/**
 * The caps that keep this repo humanly manageable.
 *
 * simpler > smarter. This repo's failure mode is not a bug — it is apparatus: a check for every
 * hazard, a document for every check, an index for every document. Each addition was individually
 * defensible and the total made the port impossible to get to.
 *
 * **The numbers live here and nowhere else.** A copy in prose is a copy that goes stale. Nothing
 * below is blocked — it is priced: to exceed a cap, delete something first.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const tracked = (pattern) =>
  execFileSync("git", ["ls-files", pattern], { cwd: repoRoot, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);

it("has at most 3 check scripts", () => {
  // Every one of them has to earn its place against the same question: what silent, green failure
  // does this catch that nothing else does? Three answers survive — the §0 constraint, the
  // attribution obligations, and whether the emitted CSS says anything a browser understands.
  const checks = readdirSync(join(repoRoot, "scripts")).filter((name) => name.startsWith("check-"));
  expect(checks, `${checks.join(", ")} — delete one before adding one`).toHaveLength(3);
});

it("has at most 3 CI jobs", () => {
  const workflow = readFileSync(join(repoRoot, ".github/workflows/ci.yml"), "utf8");
  // Everything after `jobs:` — the `on:` block above it has 2-space keys of its own.
  const jobsBlock = workflow.slice(workflow.indexOf("\njobs:"));
  const jobs = [...jobsBlock.matchAll(/^ {2}([a-z][a-z0-9-]*):$/gm)].map((match) => match[1]);
  expect(jobs, `${jobs.join(", ")} — a fourth job needs one of these to go`).toHaveLength(3);
});

/** Lines as `wc -l` counts them — a trailing newline ends the last line, it does not start a new one. */
const lineCount = (path) => readFileSync(path, "utf8").trimEnd().split("\n").length;

it("keeps its prose under 300 lines", () => {
  // Three exclusions. `NOTICE.md` is a legal obligation whose length is set by what we derive from.
  // `.agents/skills/` is vendored third-party reference nobody here maintains. `DECISIONS.md` has a
  // cap of its own below — the target of this one is *process* prose (plans, ledgers, indexes), and
  // capping findings alongside it is what made a hard-won trap compete with a status update.
  const files = tracked("*.md").filter(
    (file) =>
      !file.startsWith("apps/docs/") &&
      !file.startsWith(".agents/") &&
      !file.endsWith("NOTICE.md") &&
      file !== "DECISIONS.md",
  );
  const total = files.reduce((sum, file) => sum + lineCount(join(repoRoot, file)), 0);
  expect(total, `${files.join(", ")} — write code instead`).toBeLessThanOrEqual(300);
});

it("keeps DECISIONS.md under 400 lines", () => {
  // The one file that is allowed to grow, because what it holds cannot be re-derived from the code:
  // settled shapes, and traps that were measured rather than reasoned about. It still has a ceiling
  // — past 400 it has stopped being findings and started being a design document again.
  expect(lineCount(join(repoRoot, "DECISIONS.md"))).toBeLessThanOrEqual(400);
});

it("keeps CLAUDE.md under 60 lines", () => {
  // It is read at the start of every session. Past a page it stops being an index of rules and
  // starts being the reason a task turns into plumbing.
  expect(lineCount(join(repoRoot, "CLAUDE.md"))).toBeLessThanOrEqual(60);
});

it("has no `__internal__/` directory", () => {
  // 15,265 lines of it were deleted on 2026-08-10. What survived is CLAUDE.md and ROADMAP.md.
  expect(existsSync(join(repoRoot, "__internal__"))).toBe(false);
});

it("keeps every component to 3 source files", () => {
  // `name.tsx`, `index.ts`, and at most one more. Tests and fixtures are not counted — the cap is
  // on ceremony, not on coverage.
  const oversized = tracked("packages/chakra-ui-solid/src/components/*")
    .filter((file) => /\.tsx?$/.test(file))
    .filter((file) => !file.includes("__tests__") && !file.includes("__fixtures__"))
    .reduce((byComponent, file) => {
      const component = file.split("/")[4];
      byComponent.set(component, (byComponent.get(component) ?? 0) + 1);
      return byComponent;
    }, new Map());

  for (const [component, count] of oversized) {
    expect(
      count,
      `packages/chakra-ui-solid/src/components/${component} has ${count} source files`,
    ).toBeLessThanOrEqual(3);
  }
});
