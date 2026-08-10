import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSections } from "../doc-index.mjs";
import {
  buildAnchorResolver,
  collectCitations,
  countProseWords,
  findSkillFaults,
  formatSkillFaults,
  MAX_PROSE_WORDS,
  MAX_SKILL_LINES,
  parseSkill,
  readRepoAuthoredSkills,
} from "../skill-pointers.mjs";

const lines = (...rows) => rows.join("\n");

const skill = (name, ...body) => ({
  name,
  file: `.agents/skills/${name}/SKILL.md`,
  source: lines("---", `name: ${name}`, "description: A description.", "---", "", ...body),
});

/** Everything resolves, so a test asserts against the one thing it broke. */
const allResolve = {
  resolveAnchor: () => true,
  resolvePath: () => true,
  resolveScript: () => true,
};

describe("check:skill-pointers", () => {
  describe("parseSkill", () => {
    it("reads the frontmatter as keys and tags every line after it", () => {
      const { frontmatter, lines: parsed } = parseSkill(
        lines(
          "---",
          "name: docs-page",
          "description: When writing a page.",
          "---",
          "",
          "## 1. A",
          "",
        ),
      );

      expect(frontmatter).toEqual({ name: "docs-page", description: "When writing a page." });
      expect(parsed.map((line) => line.kind)).toEqual([
        "frontmatter",
        "frontmatter",
        "frontmatter",
        "frontmatter",
        "blank",
        "heading",
        "blank",
      ]);
    });

    it("reports frontmatter that was never closed", () => {
      // The skill does not load at all in this state, so every other fault is downstream noise.
      expect(parseSkill(lines("---", "name: a", "- a pointer")).frontmatterClosed).toBe(false);
    });
  });

  describe("collectCitations", () => {
    it("governs an anchor by the nearest backticked document before it", () => {
      const citations = collectCitations(
        "- `attribution.md` §2.2 — the header; §2.3 why it matters.",
      );

      expect(citations).toEqual([
        { kind: "path", raw: "attribution.md", path: "attribution.md" },
        { kind: "anchor", raw: "§2.2", document: "attribution.md", anchor: "2.2" },
        { kind: "anchor", raw: "§2.3", document: "attribution.md", anchor: "2.3" },
      ]);
    });

    it("does not let a backticked non-document govern an anchor", () => {
      // `anatomy` sits between the document and the second anchor and must not capture it.
      const citations = collectCitations("- `component-blueprint.md` §3 — `anatomy`; §3.1 first.");

      expect(citations.filter((c) => c.kind === "anchor").map((c) => c.document)).toEqual([
        "component-blueprint.md",
        "component-blueprint.md",
      ]);
    });

    it("leaves an anchor with no document before it undecided rather than guessing", () => {
      expect(collectCitations("- §3.5 — the section.")).toEqual([
        { kind: "anchor", raw: "§3.5", document: undefined, anchor: "3.5" },
      ]);
    });

    it("recognises a script with or without its runner", () => {
      const citations = collectCitations(
        "- `pnpm docs:index`, `check:doc-index` — before the gate.",
      );

      expect(citations.map((c) => c.script)).toEqual(["docs:index", "check:doc-index"]);
    });

    it("treats a package name as neither a path nor a script", () => {
      // `@chakra-ui/panda-preset` has a slash and `data-*` has a dash; an extension is what makes
      // a path, so neither is checked for existence.
      expect(collectCitations("- `@chakra-ui/panda-preset`, `data-*`, `renderStyled`.")).toEqual(
        [],
      );
    });
  });

  describe("countProseWords", () => {
    it("counts what is left once the citations are removed", () => {
      expect(
        countProseWords("- `attribution.md` §2.6 — the checklist for a new derivative file."),
      ).toBe(7);
    });

    it("counts a hyphenated word once", () => {
      expect(countProseWords("computed-style assertions")).toBe(2);
    });
  });

  describe("buildAnchorResolver", () => {
    const resolve = buildAnchorResolver(
      [
        { name: "decisions.md", source: "## 3. The ledger" },
        { name: "decisions/3.15-context-budget.md", source: "### 3.15 The context budget" },
        { name: "attribution.md", source: "## 2. Attribution" },
      ],
      parseSections,
    );

    it("resolves a ledger entry under the document that cites it", () => {
      // The corpus writes `decisions.md` §3.15; the heading lives in a file under `decisions/`.
      expect(resolve("decisions.md", "3.15")).toBe(true);
      expect(resolve("decisions/3.15-context-budget.md", "3.15")).toBe(true);
    });

    it("does not fold an anchor into a document that has no such section", () => {
      expect(resolve("attribution.md", "3.15")).toBe(false);
      expect(resolve("attribution.md", "2")).toBe(true);
    });

    it("rejects an anchor in a document nothing knows about", () => {
      expect(resolve("nowhere.md", "1")).toBe(false);
    });
  });

  describe("findSkillFaults", () => {
    const faultKinds = (skills, resolvers = allResolve) =>
      findSkillFaults(skills, resolvers).map((item) => `${item.kind}: ${item.detail}`);

    it("passes a skill whose every line points somewhere", () => {
      expect(
        findSkillFaults(
          [skill("docs-page", "## 1. A", "", "- `attribution.md` §2 — the mechanism.")],
          allResolve,
        ),
      ).toEqual([]);
    });

    it("names the document an anchor does not exist in", () => {
      expect(
        faultKinds([skill("docs-page", "- `attribution.md` §99 — nowhere.")], {
          ...allResolve,
          resolveAnchor: () => false,
        }),
      ).toEqual(["dead-pointer: attribution.md has no §99"]);
    });

    it("catches a path and a script that do not exist", () => {
      expect(
        faultKinds(
          [skill("docs-page", "- `scripts/gone.mjs`, `check:gone` — two dead pointers.")],
          {
            ...allResolve,
            resolvePath: () => false,
            resolveScript: () => false,
          },
        ),
      ).toEqual([
        "dead-pointer: scripts/gone.mjs is not a file in the repo",
        "dead-pointer: check:gone is not a package.json script",
      ]);
    });

    it("checks an anchor inside a heading too", () => {
      expect(
        faultKinds([skill("docs-page", "## 1. See `attribution.md` §99")], {
          ...allResolve,
          resolveAnchor: () => false,
        }),
      ).toEqual(["dead-pointer: attribution.md has no §99"]);
    });

    it("rejects a body line that cites nothing", () => {
      // The failure this exists for: a sentence of rule text, which is a second copy of the rule.
      expect(
        faultKinds([skill("docs-page", "- Tests assert computed styles, never class names.")]),
      ).toEqual(["not-a-pointer: no citation on this line"]);
    });

    it("rejects a paragraph written beside a citation", () => {
      const paragraph = `- \`attribution.md\` §2 — ${"word ".repeat(MAX_PROSE_WORDS + 1)}`;

      expect(faultKinds([skill("docs-page", paragraph)])).toEqual([
        `not-a-pointer: ${MAX_PROSE_WORDS + 1} words outside its citations, ceiling is ${MAX_PROSE_WORDS}`,
      ]);
    });

    it("exempts a heading and a blank line from needing a citation", () => {
      expect(findSkillFaults([skill("docs-page", "## 1. The template", "")], allResolve)).toEqual(
        [],
      );
    });

    it("fails a skill that has to be scrolled", () => {
      const long = skill(
        "docs-page",
        ...Array(MAX_SKILL_LINES).fill("- `attribution.md` §2 — a pointer."),
      );

      expect(faultKinds([long])).toEqual([
        `length: ${MAX_SKILL_LINES + 5} lines, ceiling is ${MAX_SKILL_LINES}`,
      ]);
    });

    it("fails a name that does not match the directory the skill loads from", () => {
      const mismatched = {
        ...skill("docs-page", "- `attribution.md` §2 — a pointer."),
        name: "docs-pages",
      };

      expect(faultKinds([mismatched])).toEqual([
        "frontmatter: name is docs-page, directory is docs-pages",
      ]);
    });

    it("fails a skill with no description, because nothing decides when it triggers", () => {
      const undescribed = {
        name: "docs-page",
        file: ".agents/skills/docs-page/SKILL.md",
        source: lines("---", "name: docs-page", "---", "", "- `attribution.md` §2 — a pointer."),
      };

      expect(faultKinds([undescribed])).toEqual([
        "frontmatter: no description; nothing decides when it triggers",
      ]);
    });
  });

  describe("readRepoAuthoredSkills", () => {
    const skillsDirectory = () => {
      const root = mkdtempSync(join(tmpdir(), "skill-pointers-"));
      for (const name of ["vitest", "docs-page", "attribution"]) {
        mkdirSync(join(root, name));
        writeFileSync(join(root, name, "SKILL.md"), `name: ${name}`);
      }
      return root;
    };

    it("skips the skills the lock file claims", () => {
      // The lock file is the list of vendored skills, so a sixth repo-authored one needs no edit
      // here — naming the five would keep passing and report the sixth as checked.
      const skills = readRepoAuthoredSkills(skillsDirectory(), ["vitest"]);

      expect(skills.map((item) => item.name)).toEqual(["attribution", "docs-page"]);
    });
  });

  describe("formatSkillFaults", () => {
    it("groups by kind and says what the kind means", () => {
      const report = formatSkillFaults([
        { skill: "docs-page", file: "a/SKILL.md", line: 9, kind: "dead-pointer", detail: "gone" },
        {
          skill: "docs-page",
          file: "a/SKILL.md",
          line: 12,
          kind: "dead-pointer",
          detail: "also gone",
        },
      ]);

      expect(report).toContain("dead-pointer — the pointer sends a reader somewhere");
      expect(report).toContain("a/SKILL.md:9 — gone");
      expect(report).toContain("a/SKILL.md:12 — also gone");
    });
  });
});
