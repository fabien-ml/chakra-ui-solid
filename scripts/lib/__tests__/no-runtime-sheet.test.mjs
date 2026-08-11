import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  findRuntimeSheetUses,
  isExcludedFromScan,
  listOurSourceFiles,
} from "../no-runtime-sheet.mjs";

const repoRoot = join(import.meta.dirname, "../../..");

describe("check:no-runtime-css", () => {
  describe("what it catches", () => {
    it.each([
      ["const sheet = new CSSStyleSheet();", "new CSSStyleSheet"],
      ["sheet.insertRule(`.a{color:red}`);", "insertRule"],
      ["document.adoptedStyleSheets = [sheet];", "adoptedStyleSheets"],
      ['const el = document.createElement("style");', 'createElement("style")'],
      ["document.head.appendChild(styleElement);", "document.head.append*"],
      ['return <style>{".a{color:red}"}</style>;', "<style"],
    ])("catches %s", (line, label) => {
      expect(findRuntimeSheetUses("packages/x/src/a.ts", line)).toEqual([
        { file: "packages/x/src/a.ts", line: 1, label, text: line },
      ]);
    });
  });

  describe("what it must NOT catch, or it fails the thing §0 explicitly permits", () => {
    it.each([
      // `plan.md` §0.3 — the DOM `style` attribute is allowed and routinely needed: Zag's
      // `normalizeProps` emits `style` objects for floating positioning, slider thumbs and
      // progress fills.
      'return <div style={{ "--w": width() }} />;',
      "const style = normalizeProps.element({ style: api().thumbStyle });",
      // Panda's helpers only compute strings.
      'const className = css({ padding: "4" });',
      "element.style.setProperty('--z-index', String(zIndex));",
      // A prop named `style`, and a type named after one.
      "export interface StyleProps { style?: JSX.CSSProperties }",
    ])("leaves %s alone", (line) => {
      expect(findRuntimeSheetUses("packages/x/src/a.ts", line)).toEqual([]);
    });
  });

  describe("scope", () => {
    it("excludes tests, stories and fixtures — a test may build a sheet to assert against", () => {
      expect(isExcludedFromScan("packages/x/src/a.test.ts")).toBe(true);
      expect(isExcludedFromScan("packages/x/src/__tests__/a.browser.test.tsx")).toBe(true);
      expect(isExcludedFromScan("packages/x/src/a.stories.tsx")).toBe(true);
      expect(isExcludedFromScan("packages/x/src/__fixtures__/a.tsx")).toBe(true);
    });

    it("includes ordinary source", () => {
      expect(isExcludedFromScan("packages/x/src/a.ts")).toBe(false);
      expect(isExcludedFromScan("apps/docs/src/a.tsx")).toBe(false);
    });

    it("scans a non-empty set — an empty scan is a broken check reporting success", () => {
      const files = listOurSourceFiles(repoRoot);
      expect(files.length).toBeGreaterThan(0);
      expect(files).toContain("packages/core/src/zag/merge-props.ts");
    });
  });
});
