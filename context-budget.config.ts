/**
 * The register of files permitted over `check:context-budget`'s 25 KB ceiling — one row per
 * exception, each with the reason it exists and the condition that deletes it (`testing.md` §8.3;
 * `definition-of-done.md` rule 1.13).
 *
 * **This file is the single place an exception is declared**, and it is a config file rather than a
 * table in a document for one reason: it has a machine reader today. The two registers it is
 * modelled on — the axe allowances (`definition-of-done.md` §5) and the coverage allow-list (§6) —
 * are prose because their checks do not exist yet and a person is the only reader. The precedent
 * for a register a script reads is `attribution.config.ts`: checked in, typed, with the rule stated
 * once beside the data. A hand-parsed markdown table would put a second grammar between the rule
 * and its enforcement, and a malformed row would be skipped rather than reported.
 *
 * **`BudgetAllowance` below is documentation, not enforcement**, and the difference matters here:
 * the root `tsconfig.json` sets `"files": []`, so no `tsc` pass in this repo reads a root config
 * file — this one or `attribution.config.ts`. A row missing `ceilingBytes` would compare against
 * `undefined`, be false, and grant its file unlimited growth in silence. **The check validates every
 * row's shape at runtime** for exactly that reason (`testing.md` §8.3.1).
 *
 * **A row that stops being needed fails the check.** If the file has come back under the ceiling,
 * or is gone, or has grown past the size its row was granted at, `check:context-budget` fails and
 * the fix is to delete or re-measure the row. An exception nobody re-derives is a permanent hole in
 * the rule it excepts.
 *
 * **What must not be added:** a row for a section, or for a shard that could simply be split. The
 * ceiling exists because the corpus grew 179 KB in one day of implementation commits; an allow-list
 * that absorbs ordinary growth is the ceiling deleted with extra steps. The one row below is a
 * **closed** record of a step that has shipped, which is the only shape of exception that is not
 * also a deferral.
 */

export interface BudgetAllowance {
  /** Path relative to `__internal__`, exactly as `INDEX.md` writes it. */
  file: string;
  /**
   * The size this exception was granted at, in bytes. Growth past it fails: a row is an exception
   * at a measured size, not a licence to keep growing.
   */
  ceilingBytes: number;
  /** Why the file is over the ceiling, in one clause. */
  reason: string;
  /** What has to become true for the row to be deleted. */
  expiresWhen: string;
}

export const budgetAllowances: BudgetAllowance[] = [
  {
    file: "decisions/3.14-s3b-visual-surfaces.md",
    // Measured at 60.7 KB when the row was granted, rounded up to the next KB with one KB of edit
    // room — enough for a citation repair, not for a new subsection.
    ceilingBytes: 62 * 1024,
    reason:
      "34 decisions in one step, D-128 … D-161 — Storybook demoted, the docs site reworked " +
      "against the open reference, and Chakra's docs prose re-measured. It is a closed record of " +
      "a step that shipped, so it is read whole or not at all, and splitting it would put one " +
      "step's decisions behind two anchors",
    expiresWhen:
      "the entry is split, which is only worth doing if something starts citing its parts " +
      "separately — no citation does today",
  },
];
