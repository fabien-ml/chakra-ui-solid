import { describe, expect, it } from "vitest";
import { testProjects } from "../../../vitest-projects.ts";
import { findMisroutedTestFiles, isTestLikeFile, projectsClaiming } from "../test-projects.mjs";

describe("check:test-projects", () => {
  describe("the scan set", () => {
    it("takes any file whose name contains `test`", () => {
      expect(isTestLikeFile("packages/x/src/foo.test.ts")).toBe(true);
      expect(isTestLikeFile("packages/x/src/__tests__/foo.browser.test.tsx")).toBe(true);
    });

    it("takes a `.browser.`/`.ssr.` file even though it contains no `test`", () => {
      // `testing.md` §1.7's own worked example. Scanning on the word `test` alone would miss it.
      expect(isTestLikeFile("packages/x/src/dialog.browser.tsx")).toBe(true);
      expect(isTestLikeFile("packages/x/src/dialog.ssr.tsx")).toBe(true);
    });

    it("leaves ordinary source alone", () => {
      expect(isTestLikeFile("packages/x/src/dialog.tsx")).toBe(false);
      expect(isTestLikeFile("packages/x/src/use-browser-locale.ts")).toBe(false);
    });
  });

  describe("routing, against the real vitest-projects.ts table", () => {
    it.each([
      ["packages/x/src/bindable.test.ts", "unit"],
      ["packages/x/src/__tests__/machine.test.tsx", "unit"],
      ["packages/x/src/portal.ssr.test.tsx", "ssr"],
      ["packages/x/src/__tests__/dialog.browser.test.tsx", "browser"],
    ])("routes %s to %s, and only there", (file, project) => {
      expect(projectsClaiming(file, testProjects)).toEqual([project]);
    });

    it.each([
      "packages/x/src/dialog.browser.tsx",
      "packages/x/src/dialog.test.browser.tsx",
      "packages/x/src/dialog.spec.ts",
    ])("routes the mis-suffixed %s to no project at all", (file) => {
      expect(projectsClaiming(file, testProjects)).toEqual([]);
    });

    it("does not let `unit` also claim an ssr or browser test", () => {
      // `*.ssr.test.ts` ends in `.test.ts`, so `unit`'s include glob matches it and only the
      // exclude keeps it out. Drop that exclude and every SSR test runs a second time against the
      // client build, silently.
      expect(projectsClaiming("packages/x/src/a.ssr.test.ts", testProjects)).toEqual(["ssr"]);
      expect(projectsClaiming("packages/x/src/a.browser.test.ts", testProjects)).toEqual([
        "browser",
      ]);
    });
  });

  describe("findMisroutedTestFiles", () => {
    it("reports nothing when every file routes to exactly one project", () => {
      expect(
        findMisroutedTestFiles(
          ["packages/x/src/a.test.ts", "packages/x/src/a.ssr.test.tsx"],
          testProjects,
        ),
      ).toEqual([]);
    });

    it("reports a file no project claims", () => {
      expect(findMisroutedTestFiles(["packages/x/src/a.browser.tsx"], testProjects)).toEqual([
        { file: "packages/x/src/a.browser.tsx", claimedBy: [] },
      ]);
    });

    it("reports a file two projects claim", () => {
      const overlapping = [
        { name: "unit", include: ["**/*.test.ts"], exclude: [] },
        { name: "ssr", include: ["**/*.test.ts"], exclude: [] },
      ];
      expect(findMisroutedTestFiles(["packages/x/src/a.test.ts"], overlapping)).toEqual([
        { file: "packages/x/src/a.test.ts", claimedBy: ["unit", "ssr"] },
      ]);
    });
  });
});
