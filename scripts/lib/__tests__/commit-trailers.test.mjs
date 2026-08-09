import { describe, expect, it } from "vitest";
import {
  bannedTrailersIn,
  findCommitsWithBannedTrailers,
  parseGitLog,
} from "../commit-trailers.mjs";

describe("check:commit-trailers", () => {
  describe("bannedTrailersIn", () => {
    it("passes a message that is rationale only", () => {
      expect(bannedTrailersIn("feat: add the thing\n\nBecause the other thing needed it.")).toEqual(
        [],
      );
    });

    it.each([
      "Co-Authored-By: Someone <someone@example.com>",
      "co-authored-by: someone <someone@example.com>",
      "Co-authored-by: Someone <someone@example.com>",
    ])("catches %s in any casing", (trailer) => {
      expect(bannedTrailersIn(`feat: x\n\n${trailer}`)).toEqual(["Co-Authored-By trailer"]);
    });

    it('catches a "Generated with" line', () => {
      expect(bannedTrailersIn("feat: x\n\nGenerated with some tool")).toEqual([
        '"Generated with" trailer',
      ]);
    });

    it("does not fire on the words appearing mid-sentence in a body", () => {
      // The trailer form is anchored to the start of a line; prose about co-authorship is not a
      // trailer and a check that failed on it would be trained around rather than fixed.
      expect(bannedTrailersIn("docs: explain how co-authored-by trailers are rejected")).toEqual(
        [],
      );
    });
  });

  describe("parseGitLog", () => {
    it("splits NUL-delimited records into sha, subject and full message", () => {
      const output = "abc123\nfeat: one\n\nbody line\0def456\nfix: two\n\0";
      expect(parseGitLog(output)).toEqual([
        { sha: "abc123", subject: "feat: one", message: "feat: one\n\nbody line" },
        { sha: "def456", subject: "fix: two", message: "fix: two\n" },
      ]);
    });
  });

  describe("findCommitsWithBannedTrailers", () => {
    it("reports only the offending commits", () => {
      const offenders = findCommitsWithBannedTrailers([
        { sha: "aaa", subject: "feat: clean", message: "feat: clean\n\nwhy" },
        {
          sha: "bbb",
          subject: "feat: dirty",
          message: "feat: dirty\n\nCo-Authored-By: X <x@y.z>",
        },
      ]);

      expect(offenders).toEqual([
        {
          sha: "bbb",
          subject: "feat: dirty",
          message: "feat: dirty\n\nCo-Authored-By: X <x@y.z>",
          trailers: ["Co-Authored-By trailer"],
        },
      ]);
    });
  });
});
