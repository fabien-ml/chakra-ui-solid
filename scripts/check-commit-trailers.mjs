#!/usr/bin/env node
// check:commit-trailers — no commit message carries a Co-Authored-By or "Generated with" trailer.
//
// Default range is the whole history, which is exact and, at this repo's size, instant. Pass a
// rev-range to narrow it: `node scripts/check-commit-trailers.mjs origin/main..HEAD`.

import { execFileSync } from "node:child_process";
import {
  findCommitsWithBannedTrailers,
  formatOffendingCommits,
  parseGitLog,
} from "./lib/commit-trailers.mjs";

const range = process.argv[2];
const output = execFileSync(
  "git",
  ["log", "-z", "--format=%H%n%B", ...(range === undefined ? [] : [range])],
  { encoding: "utf8" },
);

const commits = parseGitLog(output);
const offenders = findCommitsWithBannedTrailers(commits);

if (offenders.length > 0) {
  console.error(
    `check:commit-trailers — ${offenders.length} commit(s) carry a banned trailer. Commit ` +
      `messages carry the change rationale only:\n\n${formatOffendingCommits(offenders)}\n`,
  );
  process.exit(1);
}

console.log(
  `check:commit-trailers — ${commits.length} commit(s) checked${range === undefined ? "" : ` in ${range}`}, none carry a banned trailer.`,
);
