import { describe, expect, it } from "vitest";
import {
  findBudgetFaults,
  findTightestUnits,
  formatBudgetFaults,
  kilobytes,
  measureUnits,
  OPERATIVE_INDEX_CEILING_BYTES,
  SECTION_CEILING_BYTES,
  SHARD_CEILING_BYTES,
} from "../context-budget.mjs";

const lines = (...rows) => rows.join("\n");

/** A section of a stated size — `padding` is plain ASCII, so its length is its byte count. */
const section = (anchor, title, bytes) =>
  lines(`## ${anchor}. ${title}`, "", "x".repeat(Math.max(0, bytes)), "");

const document = (name, source) => ({ name, source });

const allowance = (file, ceilingBytes) => ({
  file,
  ceilingBytes,
  reason: "a closed record of a step that shipped",
  expiresWhen: "something starts citing its parts separately",
});

const kinds = (faults) => faults.map((fault) => fault.kind);

describe("check:context-budget", () => {
  describe("measureUnits", () => {
    it("measures `##` sections and skips a file with no numbered heading", () => {
      const units = measureUnits(
        [
          document("plan.md", section(1, "First", 100) + section(2, "Second", 200)),
          document("zag-solid/notes.md", "# Some design notes\n\nNo numbered heading here.\n"),
        ],
        "",
      );

      expect(units.sections.map((unit) => unit.name)).toEqual(["plan.md §1", "plan.md §2"]);
      expect(units.sections[1].bytes).toBeGreaterThan(units.sections[0].bytes);
      expect(units.shards).toEqual([]);
    });

    it("counts a file under a subdirectory as a shard, measured whole", () => {
      const source = lines("### 3.14 S3b", "", "y".repeat(500), "");
      const units = measureUnits([document("decisions/3.14-s3b.md", source)], "");

      expect(units.shards).toHaveLength(1);
      expect(units.shards[0].name).toBe("decisions/3.14-s3b.md");
      expect(units.shards[0].bytes).toBe(Buffer.byteLength(source));
      // Its heading is a `###`, so the section rule never sees it — which is why shards have a
      // ceiling of their own rather than riding on the section one.
      expect(units.sections).toEqual([]);
    });

    it("measures in UTF-8 bytes, not JavaScript string length", () => {
      const units = measureUnits([], "— § ≈");

      expect(units.operativeIndex.bytes).toBe(Buffer.byteLength("— § ≈"));
      expect(units.operativeIndex.bytes).toBeGreaterThan("— § ≈".length);
    });
  });

  describe("findBudgetFaults", () => {
    it("passes a corpus inside every ceiling", () => {
      const units = measureUnits(
        [document("plan.md", section(1, "Small", 4000))],
        "x".repeat(1000),
      );

      expect(findBudgetFaults(units, [])).toEqual([]);
    });

    it("fails a `##` section over the ceiling", () => {
      const units = measureUnits(
        [document("legal.md", section(3, "Trademark", SECTION_CEILING_BYTES + 1))],
        "",
      );
      const faults = findBudgetFaults(units, []);

      expect(kinds(faults)).toEqual(["oversized-section"]);
      expect(faults[0].unit.name).toBe("legal.md §3");
    });

    it("fails a shard over the ceiling with no allow-list row", () => {
      const units = measureUnits(
        [document("decisions/3.14-s3b.md", `### 3.14 S3b\n${"y".repeat(SHARD_CEILING_BYTES)}`)],
        "",
      );
      const faults = findBudgetFaults(units, []);

      expect(kinds(faults)).toEqual(["oversized-shard"]);
      expect(faults[0].detail).toContain("no allow-list row");
    });

    it("passes that same shard once it has a row", () => {
      const units = measureUnits(
        [document("decisions/3.14-s3b.md", `### 3.14 S3b\n${"y".repeat(SHARD_CEILING_BYTES)}`)],
        "",
      );

      expect(
        findBudgetFaults(units, [allowance("decisions/3.14-s3b.md", SHARD_CEILING_BYTES * 2)]),
      ).toEqual([]);
    });

    it("fails a shard that has grown past the size its row was granted at", () => {
      const source = `### 3.14 S3b\n${"y".repeat(SHARD_CEILING_BYTES * 2)}`;
      const units = measureUnits([document("decisions/3.14-s3b.md", source)], "");
      const faults = findBudgetFaults(units, [
        allowance("decisions/3.14-s3b.md", SHARD_CEILING_BYTES + 1024),
      ]);

      expect(kinds(faults)).toEqual(["allowance-outgrown"]);
      expect(faults[0].detail).toContain("granted at");
    });

    it("fails a row whose file has come back inside the ceiling", () => {
      const units = measureUnits([document("decisions/3.14-s3b.md", "### 3.14 S3b\nshort")], "");
      const faults = findBudgetFaults(units, [
        allowance("decisions/3.14-s3b.md", SHARD_CEILING_BYTES * 2),
      ]);

      expect(kinds(faults)).toEqual(["stale-allowance"]);
      expect(faults[0].detail).toContain("delete the row");
    });

    it("fails a row that names no indexed file at all", () => {
      const faults = findBudgetFaults(measureUnits([], ""), [
        allowance("decisions/3.99-deleted.md", SHARD_CEILING_BYTES * 2),
      ]);

      expect(kinds(faults)).toEqual(["stale-allowance"]);
      expect(faults[0].detail).toContain("names no indexed file");
    });

    it("fails a row missing a field, before judging any ceiling", () => {
      // No `tsc` pass in this repo reads a root config file, so a row without `ceilingBytes` would
      // compare against `undefined` and grant its file unlimited growth in silence.
      const units = measureUnits(
        [document("legal.md", section(3, "Trademark", SECTION_CEILING_BYTES + 1))],
        "",
      );
      const faults = findBudgetFaults(units, [
        { file: "decisions/3.14-s3b.md", reason: "because", expiresWhen: "later" },
      ]);

      expect(kinds(faults)).toEqual(["malformed-allowance"]);
      expect(faults[0].detail).toContain("ceilingBytes");
    });

    it("fails a row whose reason is blank — a register of exceptions with no reasons is a list", () => {
      const faults = findBudgetFaults(measureUnits([], ""), [
        { file: "decisions/3.14-s3b.md", ceilingBytes: 1, reason: "   ", expiresWhen: "later" },
      ]);

      expect(kinds(faults)).toEqual(["malformed-allowance"]);
      expect(faults[0].detail).toContain("reason");
    });

    it("fails an over-ceiling CLAUDE.md", () => {
      const units = measureUnits([], "x".repeat(OPERATIVE_INDEX_CEILING_BYTES + 1));
      const faults = findBudgetFaults(units, []);

      expect(kinds(faults)).toEqual(["operative-index-over"]);
      expect(faults[0].unit.name).toBe("CLAUDE.md");
    });

    it("reports every failing unit rather than stopping at the first", () => {
      const units = measureUnits(
        [
          document("legal.md", section(3, "Trademark", SECTION_CEILING_BYTES + 1)),
          document("decisions/3.14-s3b.md", `### 3.14 S3b\n${"y".repeat(SHARD_CEILING_BYTES)}`),
        ],
        "x".repeat(OPERATIVE_INDEX_CEILING_BYTES + 1),
      );

      expect(kinds(findBudgetFaults(units, []))).toEqual([
        "oversized-section",
        "oversized-shard",
        "operative-index-over",
      ]);
    });
  });

  describe("findTightestUnits", () => {
    it("ranks by headroom and leaves allow-listed shards out", () => {
      const units = measureUnits(
        [
          document("plan.md", section(1, "Roomy", 1000) + section(2, "Tight", 24_000)),
          document("decisions/3.14-s3b.md", `### 3.14 S3b\n${"y".repeat(SHARD_CEILING_BYTES * 3)}`),
        ],
        "x".repeat(14_000),
      );

      const tightest = findTightestUnits(units, [
        allowance("decisions/3.14-s3b.md", SHARD_CEILING_BYTES * 4),
      ]);

      expect(tightest.map((unit) => unit.name)).toEqual(["plan.md §2", "CLAUDE.md", "plan.md §1"]);
      expect(tightest[0].headroom).toBeLessThan(tightest[1].headroom);
    });
  });

  describe("formatBudgetFaults", () => {
    it("groups by kind and heads each group with what that kind means", () => {
      const units = measureUnits(
        [document("legal.md", section(3, "Trademark", SECTION_CEILING_BYTES + 1))],
        "x".repeat(OPERATIVE_INDEX_CEILING_BYTES + 1),
      );

      const report = formatBudgetFaults(findBudgetFaults(units, []));

      expect(report).toContain("oversized-section — ");
      expect(report).toContain("shard its parts into files");
      expect(report).toContain("operative-index-over — ");
      expect(report).toContain("legal.md §3");
    });
  });

  describe("kilobytes", () => {
    it("reports one decimal place against a 1024-byte KB", () => {
      expect(kilobytes(25 * 1024)).toBe("25.0 KB");
      expect(kilobytes(1536)).toBe("1.5 KB");
    });
  });
});
