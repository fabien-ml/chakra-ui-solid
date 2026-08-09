/**
 * The static half of `check:context-budget` — the growth guard on the governance corpus
 * (`testing.md` §8.3).
 *
 * The corpus is consulted well and it is consulted often: governance documents are 77% of every
 * byte read in a session. What was measured to be broken is not the total but the **tail** — one
 * section too large to consult, and a growth rate of +179 KB in a single day of implementation
 * commits. A ceiling is the only thing that turns "we should keep these small" into something that
 * fails a build.
 *
 * **Three units, three ceilings**, because a citation costs whatever the unit it names costs:
 *
 * | Unit | Ceiling | Why that unit |
 * |---|---|---|
 * | A `##` section of an `__internal__` document | 25 KB | `` `plan.md` §3 `` is a real citation, and it costs the whole nested span |
 * | A sharded file — `decisions/3.13-…`, `testing/8.02-…` | 25 KB | Its heading is a `###`, so the section rule never sees it |
 * | `CLAUDE.md` | 16 KB | The one file loaded unconditionally, every session, before anything is asked |
 *
 * **Sizes are UTF-8 bytes**, measured with `doc-index.mjs`'s `sizeInBytes` so the ceiling and
 * `INDEX.md` cannot report a section at two different sizes.
 */

import { parseSections, sizeInBytes } from "./doc-index.mjs";

const KB = 1024;

/**
 * 25 KB is not fitted to the corpus. Measured across the eleven documents: a `##` is 4.6 KB at p50
 * and 11 KB at p90, so the ceiling sits at **2.3× p90** — the size at which a section stops fitting
 * one targeted read and starts being grepped-and-guessed instead.
 *
 * The remedy when a section reaches it is structural and there is precedent for it: `decisions.md`
 * §3's entries became files, and `testing.md` §8's check definitions after them. **Raising the
 * number is not on the ladder** — a ceiling raised to fit what already exists is a ceiling that
 * gets raised again, which is a deleted one.
 */
export const SECTION_CEILING_BYTES = 25 * KB;

/** The same ceiling on the same grounds: a shard is one citable unit, exactly as a section is. */
export const SHARD_CEILING_BYTES = 25 * KB;

/**
 * `CLAUDE.md` is paid for on every task before a single question is read, so its ceiling is the
 * tightest and the least negotiable. It is the operative index — pointers and enforced rules — and
 * the moment a rule needs a paragraph, the paragraph belongs in `__internal__/` and the entry
 * becomes a pointer to it. That rule and this ceiling are the same rule.
 */
export const OPERATIVE_INDEX_CEILING_BYTES = 16 * KB;

/** How many near-ceiling units the green run names. Enough to see the next failure coming. */
const HEADROOM_SHOWN = 3;

const isShard = (name) => name.includes("/");

/**
 * Every unit a ceiling applies to, measured.
 *
 * @param documents `{ name, source }` from `readIndexableDocuments`, so the set of files checked is
 *   the set of files indexed — a check with its own copy of the list keeps passing after a document
 *   is added and reports it as checked by omission.
 * @param operativeIndex the text of `CLAUDE.md`.
 *
 * A file with no numbered heading is not a unit. That is `renderIndex`'s selection rule reused
 * rather than restated: the design notes under `zag-solid/`, `upstream/` and `internal-test-utils/`
 * carry no anchor, nothing cites them, and a ceiling on a file nobody consults would be a ceiling
 * on the wrong thing.
 */
export function measureUnits(documents, operativeIndex) {
  const sections = [];
  const shards = [];

  for (const { name, source } of documents) {
    const parsed = parseSections(source);
    if (parsed.length === 0) {
      continue;
    }

    for (const section of parsed) {
      if (section.level === 2) {
        sections.push({
          kind: "section",
          name: `${name} §${section.anchor}`,
          file: name,
          title: section.title,
          bytes: section.bytes,
          ceiling: SECTION_CEILING_BYTES,
        });
      }
    }

    if (isShard(name)) {
      shards.push({
        kind: "shard",
        name,
        file: name,
        title: parsed[0].title,
        bytes: sizeInBytes(source),
        ceiling: SHARD_CEILING_BYTES,
      });
    }
  }

  return {
    sections,
    shards,
    operativeIndex: {
      kind: "operative-index",
      name: "CLAUDE.md",
      file: "CLAUDE.md",
      title: "the operative index",
      bytes: sizeInBytes(operativeIndex),
      ceiling: OPERATIVE_INDEX_CEILING_BYTES,
    },
  };
}

export const kilobytes = (bytes) => `${(bytes / KB).toFixed(1)} KB`;

const fault = (kind, unit, detail) => ({ kind, unit, detail });

/**
 * Every field a row must carry, checked at runtime rather than left to the type.
 *
 * `context-budget.config.ts` declares `BudgetAllowance`, but the root `tsconfig.json` sets
 * `"files": []` — no `tsc` pass in this repo reads a root config file today, `attribution.config.ts`
 * included. So the interface is documentation and editor support, not enforcement, and a row
 * missing `ceilingBytes` would compare `bytes > undefined`, be false, and grant the shard unlimited
 * growth **silently**. That is the failure mode the register exists to close, so it is closed here.
 */
const ALLOWANCE_FIELDS = [
  ["file", "string"],
  ["ceilingBytes", "number"],
  ["reason", "string"],
  ["expiresWhen", "string"],
];

/**
 * Every fault across every unit.
 *
 * @param allowances `context-budget.config.ts`'s rows — the register of shards permitted over the
 *   ceiling, each with its own frozen size.
 *
 * **A row that stops being needed is a failure, not a tidy-up.** That is the shape the two live
 * registers already use (`definition-of-done.md` §5, §6): an allowance nobody re-derives becomes a
 * permanent hole in the rule it excepts, and the only moment anyone would notice is a moment
 * nothing arranges. Here it is arranged — the check fails, and deleting the row is the fix.
 */
function findMalformedAllowances(allowances) {
  return allowances.flatMap((allowance) => {
    const missing = ALLOWANCE_FIELDS.filter(([field, expected]) => {
      const value = allowance[field];
      return typeof value !== expected || (expected === "string" && value.trim() === "");
    }).map(([field]) => field);

    return missing.length === 0
      ? []
      : [
          fault(
            "malformed-allowance",
            { name: allowance.file ?? "(a row with no file)", file: allowance.file },
            `missing or wrong-typed: ${missing.join(", ")}`,
          ),
        ];
  });
}

export function findBudgetFaults({ sections, shards, operativeIndex }, allowances) {
  // Nothing else is judged while the register is broken: a row that grants the wrong size, or no
  // size, produces confident verdicts that are wrong in whichever direction the gap runs.
  const malformed = findMalformedAllowances(allowances);
  if (malformed.length > 0) {
    return malformed;
  }

  const faults = [];

  for (const section of sections) {
    if (section.bytes > section.ceiling) {
      faults.push(
        fault(
          "oversized-section",
          section,
          `${kilobytes(section.bytes)}, ceiling is ${kilobytes(section.ceiling)}`,
        ),
      );
    }
  }

  const allowedFiles = new Map(allowances.map((allowance) => [allowance.file, allowance]));
  const shardsByFile = new Map(shards.map((shard) => [shard.file, shard]));

  for (const shard of shards) {
    const allowance = allowedFiles.get(shard.file);
    if (shard.bytes <= shard.ceiling) {
      continue;
    }
    if (allowance === undefined) {
      faults.push(
        fault(
          "oversized-shard",
          shard,
          `${kilobytes(shard.bytes)}, ceiling is ${kilobytes(shard.ceiling)} and it has no ` +
            `allow-list row`,
        ),
      );
    } else if (shard.bytes > allowance.ceilingBytes) {
      faults.push(
        fault(
          "allowance-outgrown",
          shard,
          `${kilobytes(shard.bytes)}, and its allow-list row was granted at ` +
            `${kilobytes(allowance.ceilingBytes)} — ${allowance.reason}`,
        ),
      );
    }
  }

  for (const allowance of allowances) {
    const shard = shardsByFile.get(allowance.file);
    if (shard === undefined) {
      faults.push(
        fault(
          "stale-allowance",
          { name: allowance.file, file: allowance.file },
          "names no indexed file under `__internal__`",
        ),
      );
    } else if (shard.bytes <= SHARD_CEILING_BYTES) {
      faults.push(
        fault(
          "stale-allowance",
          shard,
          `${kilobytes(shard.bytes)}, now inside the ${kilobytes(SHARD_CEILING_BYTES)} ceiling — ` +
            `delete the row. It expires when: ${allowance.expiresWhen}`,
        ),
      );
    }
  }

  if (operativeIndex.bytes > operativeIndex.ceiling) {
    faults.push(
      fault(
        "operative-index-over",
        operativeIndex,
        `${kilobytes(operativeIndex.bytes)}, ceiling is ${kilobytes(operativeIndex.ceiling)}`,
      ),
    );
  }

  return faults;
}

const WHAT_A_FAULT_MEANS = {
  "malformed-allowance":
    "a row missing a field grants its shard unlimited growth and says nothing — no `tsc` pass in this repo reads a root config file, so the shape is checked here or nowhere",
  "oversized-section":
    "a citation to this anchor costs the whole span, so the section is grepped-and-guessed instead of read — shard its parts into files the way `decisions.md` §3 and `testing.md` §8 were, and do not raise the ceiling",
  "oversized-shard":
    "a shard is one citable unit, and this one costs more than a section is allowed to — split it, or add a row to `context-budget.config.ts` saying why it cannot be",
  "allowance-outgrown":
    "the allow-list row is an exception at a frozen size, not a licence to keep growing — re-measure and say so in the row, or split the file",
  "stale-allowance":
    "an exception nobody re-derives is a permanent hole in the rule it excepts — delete the row",
  "operative-index-over":
    "`CLAUDE.md` is read in full on every task before anything is asked. A rule that needs a paragraph belongs in `__internal__/`, with the entry a pointer to it",
};

export function formatBudgetFaults(faults) {
  const byKind = new Map();
  for (const item of faults) {
    byKind.set(item.kind, [...(byKind.get(item.kind) ?? []), item]);
  }

  return [...byKind]
    .map(([kind, items]) => {
      const rows = items.map((item) => `    ${item.unit.name} — ${item.detail}`);
      return `  ${kind} — ${WHAT_A_FAULT_MEANS[kind]}\n${rows.join("\n")}`;
    })
    .join("\n\n");
}

/**
 * The units closest to their ceiling, worst first — printed on the **green** path.
 *
 * A ceiling nobody sees approaching fires on an ordinary edit, and a ceiling that fires on an
 * ordinary edit gets raised. Naming the tightest three on every passing run is what makes the day
 * it fires a day someone was already expecting.
 */
export function findTightestUnits({ sections, shards, operativeIndex }, allowances) {
  const allowed = new Set(allowances.map((allowance) => allowance.file));

  return [...sections, ...shards.filter((shard) => !allowed.has(shard.file)), operativeIndex]
    .map((unit) => ({ ...unit, headroom: unit.ceiling - unit.bytes }))
    .sort((left, right) => left.headroom - right.headroom)
    .slice(0, HEADROOM_SHOWN);
}

export function formatTightestUnits(units) {
  return units
    .map(
      (unit) =>
        `    ${unit.name} — ${kilobytes(unit.bytes)} of ${kilobytes(unit.ceiling)}, ` +
        `${kilobytes(unit.headroom)} left`,
    )
    .join("\n");
}
