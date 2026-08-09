import { describe, expect, it } from "vitest";
import {
  classifyReadPath,
  measureSession,
  median,
  resultBytes,
  summariseSessions,
} from "../session-budget.mjs";

const transcript = (...records) => records.map((record) => JSON.stringify(record)).join("\n");

const toolUse = (...blocks) => ({ type: "assistant", message: { content: blocks } });
const toolResults = (...blocks) => ({ type: "user", message: { content: blocks } });

const read = (id, path, extra = {}) => ({
  type: "tool_use",
  id,
  name: "Read",
  input: { file_path: path, ...extra },
});
const result = (id, text) => ({ type: "tool_result", tool_use_id: id, content: text });
const write = (id) => ({ type: "tool_use", id, name: "Write", input: {} });

const GOVERNANCE = "/repo/__internal__/plan.md";

describe("check:context-budget --sessions", () => {
  describe("classifyReadPath", () => {
    it("holds the definition frozen at CLAUDE.md and __internal__", () => {
      expect(classifyReadPath("/repo/CLAUDE.md")).toBe("governance");
      expect(classifyReadPath("/repo/__internal__/decisions/3.15-x.md")).toBe("governance");
    });

    it("counts a skill separately rather than folding it in", () => {
      expect(classifyReadPath("/repo/.agents/skills/attribution/SKILL.md")).toBe("skill");
    });

    it("leaves everything else out — widening the definition breaks the comparison", () => {
      expect(classifyReadPath("/Users/x/.claude/plans/some-plan.md")).toBe("other");
      expect(classifyReadPath("/repo/packages/system/src/index.ts")).toBe("other");
      expect(classifyReadPath("/repo/README.md")).toBe("other");
    });
  });

  describe("resultBytes", () => {
    it("sums a string result in UTF-8 bytes", () => {
      expect(resultBytes("— §")).toBe(Buffer.byteLength("— §"));
    });

    it("sums a block-list result", () => {
      expect(
        resultBytes([
          { type: "text", text: "ab" },
          { type: "text", text: "cde" },
        ]),
      ).toBe(5);
    });

    it("returns 0 for a shape it does not recognise", () => {
      expect(resultBytes(undefined)).toBe(0);
      expect(resultBytes([{ type: "image" }])).toBe(0);
    });
  });

  describe("measureSession", () => {
    it("counts only what was read before the first producing tool call", () => {
      const session = measureSession(
        transcript(
          toolUse(read("a", GOVERNANCE)),
          toolResults(result("a", "x".repeat(100))),
          toolUse(write("w")),
          toolUse(read("b", GOVERNANCE)),
          toolResults(result("b", "x".repeat(900))),
        ),
      );

      expect(session.producedSomething).toBe(true);
      expect(session.governanceBytes).toBe(1000);
      expect(session.governanceBytesBeforeFirstEdit).toBe(100);
    });

    it("attributes a read to where its request falls, not its result", () => {
      // The request is the decision being measured, and a result can arrive after an edit that
      // was itself decided later in the same turn.
      const session = measureSession(
        transcript(
          toolUse(read("a", GOVERNANCE), write("w")),
          toolResults(result("a", "x".repeat(400))),
        ),
      );

      expect(session.governanceBytesBeforeFirstEdit).toBe(400);
    });

    it("reports a session that never produced anything rather than counting it", () => {
      const session = measureSession(
        transcript(toolUse(read("a", GOVERNANCE)), toolResults(result("a", "xxx"))),
      );

      expect(session.producedSomething).toBe(false);
      expect(session.governanceBytes).toBe(3);
      expect(session.governanceBytesBeforeFirstEdit).toBe(0);
    });

    it("measures the wider `.md` window alongside the frozen one", () => {
      const session = measureSession(
        transcript(
          toolUse(read("a", GOVERNANCE), read("b", "/Users/x/.claude/plans/p.md")),
          toolResults(result("a", "x".repeat(10)), result("b", "x".repeat(90))),
          toolUse(write("w")),
        ),
      );

      expect(session.governanceBytesBeforeFirstEdit).toBe(10);
      expect(session.markdownBytesBeforeFirstEdit).toBe(100);
    });

    it("counts a scoped governance read as scoped", () => {
      const session = measureSession(
        transcript(
          toolUse(read("a", GOVERNANCE, { offset: 10, limit: 20 }), read("b", GOVERNANCE)),
          toolResults(result("a", "x"), result("b", "x")),
        ),
      );

      expect(session.governanceReads).toBe(2);
      expect(session.scopedGovernanceReads).toBe(1);
    });

    it("skips a malformed line and says how many it skipped", () => {
      const session = measureSession(
        [
          JSON.stringify(toolUse(read("a", GOVERNANCE))),
          '{"type":"assistant","message":{"content":[',
          JSON.stringify(toolResults(result("a", "xxxx"))),
        ].join("\n"),
      );

      expect(session.malformedLines).toBe(1);
      expect(session.governanceBytes).toBe(4);
    });

    it("ignores a result whose request it never saw", () => {
      const session = measureSession(transcript(toolResults(result("orphan", "x".repeat(500)))));

      expect(session.reads).toBe(0);
      expect(session.allReadBytes).toBe(0);
    });
  });

  describe("median", () => {
    it("takes the middle of an odd set and the mean of the middle two of an even one", () => {
      expect(median([3, 1, 2])).toBe(2);
      expect(median([4, 1, 2, 3])).toBe(2.5);
    });

    it("is null rather than 0 for an empty set — no data is not a measurement of zero", () => {
      expect(median([])).toBeNull();
    });
  });

  describe("summariseSessions", () => {
    it("reports both n's, and takes the median over the sessions that reached an edit", () => {
      const sessions = [
        { producedSomething: true, governanceBytesBeforeFirstEdit: 100 },
        { producedSomething: true, governanceBytesBeforeFirstEdit: 300 },
        { producedSomething: false, governanceBytesBeforeFirstEdit: 0 },
      ].map((session) => ({
        malformedLines: 0,
        reads: 0,
        allReadBytes: 0,
        governanceBytes: 0,
        skillBytes: 0,
        markdownBytesBeforeFirstEdit: session.governanceBytesBeforeFirstEdit,
        governanceReads: 0,
        scopedGovernanceReads: 0,
        ...session,
      }));

      const report = summariseSessions(sessions);

      expect(report.sessions).toBe(3);
      expect(report.sessionsWithAnEdit).toBe(2);
      // Not 100 — the session that never edited has no "before the first edit" to contribute.
      expect(report.medianBeforeFirstEdit).toBe(200);
      expect(report.worstBeforeFirstEdit).toEqual([300, 100]);
    });
  });
});
