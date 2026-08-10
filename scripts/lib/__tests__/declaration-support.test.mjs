import { describe, expect, it } from "vitest";
import {
  applyAllowances,
  distinctPairs,
  extractDeclarations,
  findMalformedAllowances,
  formatUnusedAllowances,
  isCustomProperty,
  partitionForProbe,
} from "../declaration-support.mjs";

const lines = (...rows) => rows.join("\n");

const allowance = (overrides) => ({
  property: "background",
  value: "currentBg",
  selectors: [".tabs__trigger"],
  reason: "an upstream recipe body",
  expiresWhen: "the preset resolves it",
  ...overrides,
});

const rejection = (overrides) => ({
  property: "background",
  value: "currentBg",
  container: ".tabs__trigger--variant_outline",
  sheet: "styles.css",
  line: 1,
  important: false,
  ...overrides,
});

describe("check:declaration-support", () => {
  describe("extractDeclarations", () => {
    it("reads property, value, container and line out of a rule", () => {
      const declarations = extractDeclarations(
        lines("", ".mt_4 {", "  margin-top: var(--spacing-4);", "}", ""),
      );

      expect(declarations).toEqual([
        {
          property: "margin-top",
          value: "var(--spacing-4)",
          important: false,
          container: ".mt_4",
          line: 3,
        },
      ]);
    });

    it("takes the last declaration in a block even without its semicolon", () => {
      const declarations = extractDeclarations(".a { color: red; display: flex }");

      expect(declarations.map((declaration) => declaration.property)).toEqual(["color", "display"]);
    });

    it("strips `!important` from the value and records that it was there", () => {
      const [declaration] = extractDeclarations(".a { display: none !important; }");

      // `CSS.supports("display", "none !important")` is false, so an unstripped value would report
      // every `!important` declaration in the sheet as unsupported.
      expect(declaration.value).toBe("none");
      expect(declaration.important).toBe(true);
    });

    it("keeps a paren group whole, semicolons and all", () => {
      const [declaration] = extractDeclarations(
        ".a { background: url(data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=) no-repeat; }",
      );

      expect(declaration.property).toBe("background");
      expect(declaration.value).toBe("url(data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=) no-repeat");
    });

    it("keeps a string whole, braces and all", () => {
      const declarations = extractDeclarations('.a { content: "}"; color: red; }');

      expect(declarations.map((declaration) => declaration.property)).toEqual(["content", "color"]);
    });

    it("survives the escapes Panda puts in a class name", () => {
      // Unhandled, the `(` in `.w_var\(--x\)` opens a paren group that never closes and swallows
      // the rest of the file — the sheet's remaining declarations vanish and the check goes green.
      const declarations = extractDeclarations(
        lines(".w_var\\(--x\\) { width: var(--x); }", ".p_4\\.5 { padding: 1.125rem; }"),
      );

      expect(declarations.map((declaration) => declaration.container)).toEqual([
        ".w_var\\(--x\\)",
        ".p_4\\.5",
      ]);
    });

    it("drops comments without losing the line count", () => {
      const declarations = extractDeclarations(
        lines("/* a", "   two-line comment */", ".a {", "  color: red;", "}"),
      );

      expect(declarations[0]).toMatchObject({ value: "red", line: 4 });
    });

    it("collapses a value that spans lines", () => {
      const [declaration] = extractDeclarations(
        lines(".a {", "  grid-template-areas:", '    "one two"', '    "three four";', "}"),
      );

      expect(declaration.value).toBe('"one two" "three four"');
    });

    it("reports the innermost block as the container", () => {
      const declarations = extractDeclarations(
        lines(
          "@layer utilities {",
          "  @media (min-width: 40rem) {",
          "    .sm\\:d_flex { display: flex; }",
          "  }",
          "}",
          "@keyframes spin { to { rotate: 360deg; } }",
        ),
      );

      expect(declarations.map((declaration) => declaration.container)).toEqual([
        ".sm\\:d_flex",
        "to",
      ]);
    });

    it("ignores an at-rule statement, inside a block or out", () => {
      const declarations = extractDeclarations(
        lines('@charset "utf-8";', "@layer reset, base;", "@layer base { @import url(x.css); }"),
      );

      expect(declarations).toEqual([]);
    });
  });

  describe("partitionForProbe", () => {
    it("skips custom properties, which the oracle accepts unconditionally", () => {
      const { probeable, skipped } = partitionForProbe(
        extractDeclarations(".a { --gradient-from: ; color: red; }"),
      );

      expect(probeable.map((declaration) => declaration.property)).toEqual(["color"]);
      expect(skipped).toEqual({ customProperty: 1, descriptor: 0 });
    });

    it("skips at-rule descriptors, which are not properties", () => {
      const { probeable, skipped } = partitionForProbe(
        extractDeclarations('@font-face { font-family: "X"; src: url(x.woff2); }'),
      );

      expect(probeable).toEqual([]);
      expect(skipped).toEqual({ customProperty: 0, descriptor: 2 });
    });

    it("does not treat a keyframe step as a descriptor block", () => {
      const { probeable } = partitionForProbe(
        extractDeclarations("@keyframes spin { from { rotate: 0deg; } }"),
      );

      expect(probeable).toHaveLength(1);
    });
  });

  describe("isCustomProperty", () => {
    it("is true for `--x` and false for a prefixed property", () => {
      expect(isCustomProperty("--gradient-from")).toBe(true);
      expect(isCustomProperty("-webkit-overflow-scrolling")).toBe(false);
    });
  });

  describe("distinctPairs", () => {
    it("asks the browser once per pair and keeps every site it was emitted at", () => {
      const pairs = distinctPairs([
        rejection({ line: 10 }),
        rejection({ line: 20, container: ".timeline__indicator" }),
        rejection({ property: "color", value: "red" }),
      ]);

      expect(pairs).toHaveLength(2);
      expect(pairs[0].sites.map((site) => site.line)).toEqual([10, 20]);
    });
  });

  describe("applyAllowances", () => {
    it("forgives a rejection whose selector the row scopes it to", () => {
      const { unallowed, used, unused } = applyAllowances([rejection()], [allowance()]);

      expect(unallowed).toEqual([]);
      expect(used).toBe(1);
      expect(unused).toEqual([]);
    });

    it("does not forgive the same declaration under a different selector", () => {
      const elsewhere = rejection({ container: ".bg_currentBg" });

      const { unallowed } = applyAllowances([elsewhere], [allowance()]);

      expect(unallowed).toEqual([elsewhere]);
    });

    it("scopes per selector, so one repaired recipe fails its own entry", () => {
      const row = allowance({ selectors: [".tabs__trigger", ".timeline__indicator"] });

      const { unallowed, unused } = applyAllowances([rejection()], [row]);

      expect(unallowed).toEqual([]);
      expect(unused).toEqual([{ row, selector: ".timeline__indicator" }]);
    });

    it("reports a row that matches nothing at all", () => {
      const { unused } = applyAllowances([], [allowance()]);

      expect(unused).toEqual([{ row: allowance(), selector: ".tabs__trigger" }]);
      expect(formatUnusedAllowances(unused)).toContain("`background: currentBg`");
    });
  });

  describe("findMalformedAllowances", () => {
    it("passes a complete row", () => {
      expect(findMalformedAllowances([allowance()])).toEqual([]);
    });

    it("names every missing text field by row", () => {
      const faults = findMalformedAllowances([allowance({ property: "", reason: "  " })]);

      expect(faults).toEqual([
        { position: 0, field: "property" },
        { position: 0, field: "reason" },
      ]);
    });

    it("rejects an empty, absent or non-string `selectors`", () => {
      const faults = findMalformedAllowances([
        allowance({ selectors: [] }),
        allowance({ selectors: undefined }),
        allowance({ selectors: [""] }),
      ]);

      expect(faults).toEqual([
        { position: 0, field: "selectors" },
        { position: 1, field: "selectors" },
        { position: 2, field: "selectors" },
      ]);
    });
  });
});
