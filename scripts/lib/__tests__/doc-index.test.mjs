import { describe, expect, it } from "vitest";
import {
  countSections,
  findIndexDrift,
  formatIndexDrift,
  parseSections,
  renderIndex,
} from "../doc-index.mjs";

const lines = (...rows) => rows.join("\n");

describe("check:doc-index", () => {
  describe("parseSections", () => {
    it("reads the anchor, title and line range of a numbered heading", () => {
      const sections = parseSections(lines("# Title", "", "## 1. The first thing", "body", "more"));

      expect(sections).toEqual([
        expect.objectContaining({ level: 2, anchor: "1", title: "The first thing", startLine: 3 }),
      ]);
      expect(sections[0].endLine).toBe(5);
    });

    it("ends a section at the next heading of the same or shallower level", () => {
      const sections = parseSections(
        lines("## 1. One", "a", "### 1.1 One-one", "b", "### 1.2 One-two", "c", "## 2. Two", "d"),
      );

      expect(sections.map((s) => [s.anchor, s.startLine, s.endLine])).toEqual([
        ["1", 1, 6],
        ["1.1", 3, 4],
        ["1.2", 5, 6],
        ["2", 7, 8],
      ]);
    });

    it("reports a parent's size as including its children, so the two are not summed", () => {
      const sections = parseSections(lines("## 1. One", "xxxx", "### 1.1 Child", "yyyy"));
      const [parent, child] = sections;

      expect(parent.bytes).toBeGreaterThan(child.bytes);
      expect(parent.bytes).toBe(lines("## 1. One", "xxxx", "### 1.1 Child", "yyyy").length);
    });

    it("accepts every anchor shape the corpus uses", () => {
      const sections = parseSections(
        lines(
          "## 7b. Named, not yet written",
          "### 3.3.1 A three-deep anchor",
          "#### 4.1.1 A fourth-level heading",
          "### 8.3b P8",
        ),
      );

      expect(sections.map((s) => s.anchor)).toEqual(["7b", "3.3.1", "4.1.1", "8.3b"]);
    });

    it("ignores heading-looking lines inside a fenced code block", () => {
      // `roadmap.md` fences shell output whose comments start with `#`. A phantom row would point
      // a reader at a line range that is not the section they cited.
      const sections = parseSections(
        lines("## 1. Real", "```", "## 2. Not a heading", "```", "## 3. Also real"),
      );

      expect(sections.map((s) => s.anchor)).toEqual(["1", "3"]);
    });

    it("skips an unnumbered heading rather than inventing an anchor for it", () => {
      // `legal.md` has one: `#### Why the route is closed`. Nothing cites it, because there is
      // nothing to cite it by.
      expect(parseSections(lines("## Unnumbered", "### 1.1 Numbered"))).toHaveLength(1);
    });

    it("does not treat an h1 as a section", () => {
      expect(parseSections(lines("# 1. Document title", "## 1. A section"))).toHaveLength(1);
    });
  });

  describe("renderIndex", () => {
    // A sentinel rather than a plausible word: the index's own header is prose, and asserting
    // against something like "body" would fail on the header explaining what a body is.
    const BODY = "UNIQUE-BODY-PROSE";
    const documents = [
      { name: "alpha.md", source: lines("# A", "## 1. First", BODY, "### 1.1 Nested", BODY) },
      { name: "beta.md", source: lines("# B", "## 1. Only", BODY) },
    ];
    const rendered = renderIndex(documents);

    it("emits one block per document and one row per section", () => {
      expect(rendered).toContain("## `alpha.md`");
      expect(rendered).toContain("## `beta.md`");
      expect(countSections(documents)).toBe(3);
    });

    it("copies heading titles and no other text out of the documents", () => {
      expect(rendered).toContain("First");
      expect(rendered).not.toContain(BODY);
    });

    it("points the summary at the line each block actually starts on", () => {
      const indexLines = rendered.split("\n");
      const summaryRow = indexLines.find(
        (line) => line.includes("`beta.md`") && line.includes("|"),
      );
      const claimedLine = Number(/L(\d+) \|/.exec(summaryRow)[1]);

      expect(indexLines[claimedLine - 1]).toBe("## `beta.md`");
    });

    it("omits a document with no numbered sections rather than emitting an empty block", () => {
      const withEmpty = renderIndex([
        { name: "alpha.md", source: lines("## 1. First", "body") },
        { name: "empty.md", source: lines("# Just a title", "prose") },
      ]);

      expect(withEmpty).not.toContain("empty.md");
    });
  });

  describe("countSections", () => {
    it("counts the documents, not the rendered index", () => {
      // The rendered header carries a worked example that is itself a `§` row, so a count taken
      // by matching `^§` over the output reports one section more than exists.
      const documents = [{ name: "alpha.md", source: lines("## 1. One", "### 1.1 Two") }];

      expect(countSections(documents)).toBe(2);
      expect(renderIndex(documents).match(/^§/gm)).toHaveLength(3);
    });
  });

  describe("findIndexDrift", () => {
    it("finds nothing when the file on disk is current", () => {
      expect(findIndexDrift("same\ntext", "same\ntext")).toEqual({ shown: [], total: 0 });
    });

    it("names the drifted line, with both sides", () => {
      expect(findIndexDrift("a\nold\nc", "a\nnew\nc")).toEqual({
        shown: [{ line: 2, onDisk: "old", expected: "new" }],
        total: 1,
      });
    });

    it("reports a truncated file as drift at the missing line", () => {
      expect(findIndexDrift("a", "a\nb")).toEqual({
        shown: [{ line: 2, onDisk: "(end of file)", expected: "b" }],
        total: 1,
      });
    });

    it("caps what it shows but still counts every difference", () => {
      const onDisk = Array.from({ length: 50 }, (_, i) => `old ${i}`).join("\n");
      const expected = Array.from({ length: 50 }, (_, i) => `new ${i}`).join("\n");
      const drift = findIndexDrift(onDisk, expected);

      expect(drift.shown).toHaveLength(3);
      expect(drift.total).toBe(50);
    });

    it("says how many differences it did not show", () => {
      const drift = findIndexDrift("a\nb\nc\nd\ne", "1\n2\n3\n4\n5");

      expect(formatIndexDrift(drift)).toContain("… and 2 more differing line(s).");
    });
  });
});
