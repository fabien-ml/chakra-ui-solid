#!/usr/bin/env node

// check:context-budget — the governance corpus is still consultable, and still small enough to be
// (`testing.md` §8.3, DoD rule 1.13).
//
// Pass `--sessions` for the transcript half: a local diagnostic that re-measures what a task
// actually spends on the documents before it produces anything. It reads `~/.claude/projects/`,
// which is machine-local and not in the repo, so **it never runs in CI** — it is a convention with
// a runnable aid (`definition-of-done.md` §7.9), not a gate.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findBudgetFaults,
  findTightestUnits,
  formatBudgetFaults,
  formatTightestUnits,
  kilobytes,
  measureUnits,
} from "./lib/context-budget.mjs";
import { readIndexableDocuments } from "./lib/doc-index.mjs";
import { measureSession, summariseSessions } from "./lib/session-budget.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const argument = (name) => {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
};

/**
 * The figure the plan set out from, and the figure it aimed at.
 *
 * The 137 KB is printed as a **quotation, not a baseline**: it is not reproducible from the
 * transcripts on disk under the definition the plan states, and the two windows measured below
 * bracket it rather than confirm it (`testing.md` §8.3, blind spot 1).
 */
const PLAN_QUOTED_MEDIAN_BYTES = 137 * 1024;
const TARGET_MEDIAN_BYTES = 60 * 1024;

async function checkStaticBudget() {
  const { budgetAllowances } = await import(join(repoRoot, "context-budget.config.ts"));

  const units = measureUnits(
    readIndexableDocuments(join(repoRoot, "__internal__")),
    readFileSync(join(repoRoot, "CLAUDE.md"), "utf8"),
  );
  const faults = findBudgetFaults(units, budgetAllowances);

  if (faults.length > 0) {
    console.error(
      `check:context-budget — ${faults.length} unit(s) over budget. The corpus is consulted on ` +
        `every task and it grew 179 KB in one day of implementation commits; a ceiling is what ` +
        `turns that from a thing to be careful about into a thing that fails. The remedy is ` +
        `always structural — shard the unit — and never a larger number.` +
        `\n\n${formatBudgetFaults(faults)}\n`,
    );
    process.exit(1);
  }

  console.log(
    `check:context-budget — ${units.sections.length} sections, ${units.shards.length} shards, ` +
      `CLAUDE.md at ${kilobytes(units.operativeIndex.bytes)}, ` +
      `${budgetAllowances.length} allow-listed. Tightest three:\n` +
      formatTightestUnits(findTightestUnits(units, budgetAllowances)),
  );
}

/** `/Users/x/Workspace/repo` → `-Users-x-Workspace-repo`, the name a project directory is given. */
const projectSlug = (path) => path.replace(/[/.]/g, "-");

function reportSessions() {
  const directory =
    argument("transcripts") ??
    join(process.env.HOME ?? "", ".claude", "projects", projectSlug(repoRoot));

  if (!existsSync(directory)) {
    console.error(
      `check:context-budget --sessions — no transcript directory at ${directory}. This half ` +
        `reads machine-local session logs; it has nothing to measure here, and reporting a ` +
        `median over zero sessions would be worse than reporting nothing. Pass ` +
        `--transcripts=<dir> to point it elsewhere.`,
    );
    process.exit(1);
  }

  const files = readdirSync(directory).filter((name) => name.endsWith(".jsonl"));
  if (files.length === 0) {
    console.error(`check:context-budget --sessions — ${directory} holds no .jsonl transcript.`);
    process.exit(1);
  }

  const report = summariseSessions(
    files.map((name) => measureSession(readFileSync(join(directory, name), "utf8"))),
  );

  const share = (part, whole) => (whole === 0 ? "n/a" : `${Math.round((part / whole) * 100)}%`);
  const tokens = (bytes) => `≈${Math.round(bytes / 4 / 1000)}k tok`;
  const sized = (bytes) => `${kilobytes(bytes)} ${tokens(bytes)}`;
  const median = report.medianBeforeFirstEdit ?? 0;

  const lines = [
    "check:context-budget --sessions — LOCAL DIAGNOSTIC, not a gate.",
    "",
    `  transcripts read                       ${report.sessions}`,
    `  — of which reached an Edit or Write    ${report.sessionsWithAnEdit}  <- the median's n`,
    "",
    "  MEDIAN bytes read before the first edit",
    `      governance docs only   ${sized(median)}   <- the frozen definition`,
    `      every .md read         ${sized(report.medianMarkdownBeforeFirstEdit ?? 0)}   <- the wider window`,
    `      target                 ${sized(TARGET_MEDIAN_BYTES)}`,
    `      worst two              ${report.worstBeforeFirstEdit.map(kilobytes).join(" / ") || "n/a"}`,
    "",
    `  The plan quotes ${sized(PLAN_QUOTED_MEDIAN_BYTES)} over 23 transcripts. This script does not`,
    "  reproduce it under the definition the plan gives, and the two windows above bracket",
    "  it rather than confirm it. It is a QUOTED figure, not a baseline to subtract from.",
    "",
    `  Read bytes, all files                  ${kilobytes(report.allReadBytes)}`,
    `  — of which governance docs             ${kilobytes(report.governanceBytes)} = ${share(report.governanceBytes, report.allReadBytes)}`,
    `  governance reads using offset/limit    ${report.scopedGovernanceReads} / ${report.governanceReads} = ${share(report.scopedGovernanceReads, report.governanceReads)}`,
    `  skill reads, counted separately        ${kilobytes(report.skillBytes)}`,
    report.malformedLines > 0
      ? `  unparseable transcript lines           ${report.malformedLines}`
      : null,
    "",
    `  A median over ${report.sessionsWithAnEdit} sessions cannot attribute the change to any one of the four`,
    "  steps, and most of these transcripts predate them. Read it as one number with its n.",
  ];

  console.log(lines.filter((line) => line !== null).join("\n"));
}

if (process.argv.includes("--sessions")) {
  reportSessions();
} else {
  await checkStaticBudget();
}
