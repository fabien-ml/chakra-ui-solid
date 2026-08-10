/**
 * The logic behind `check:skill-pointers`.
 *
 * The five repo-authored skills under `.agents/skills/` are **pointer bundles**: a task-shaped
 * reading order over the `__internal__` corpus, containing no rule text of their own. Two things
 * can go wrong with one, and both are silent — a green build with a skill that is actively
 * misleading:
 *
 * 1. **A pointer stops resolving.** A renumbered `§`, a moved script, a renamed file. The skill
 *    still reads as authoritative and now sends a reader to a section that is not the one cited.
 * 2. **A skill drifts into being a summary.** A rule stated in a skill is a second copy of that
 *    rule, and the copy is the one that goes stale (`CLAUDE.md`, the three-surface split).
 *
 * This catches (1) exactly, and bounds the *shape* that (2) needs in order to happen. What it
 * cannot do is tell a terse pointer from a terse restatement — that residue is registered as an
 * unenforced convention in `definition-of-done.md` §7.8 rather than pretended away here.
 *
 * **Anchors, never line ranges.** A skill writes `` `plan.md` §3.5 `` and stops. A line range in a
 * hand-written file is invalidated by any edit above it in the document it points at, and there is
 * no `pnpm docs:index` equivalent to repair five hand-written files — so ranges would stale on
 * every document commit and be repaired by hand. `INDEX.md` is generated and checked; it is where
 * a range is looked up. (`testing.md` §8.2.)
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const SKILL_FILENAME = "SKILL.md";

/**
 * A skill has to be readable in one glance or it is not a retrieval aid — a reader who has to
 * scroll a skill has paid for the routing hop twice.
 */
export const MAX_SKILL_LINES = 40;

/**
 * Words on a pointer line that are not part of a citation. Measured across the five skills at the
 * gate: the widest genuine line carries **11**, so the ceiling is three words of headroom above
 * what a real ordering clause needs.
 *
 * It bounds a line to a clause, which is what stops an explanatory paragraph. It does **not** stop
 * a rule restated tersely — "tests assert computed styles, never class names" is seven words. That
 * is the part left to review (`definition-of-done.md` §7.8).
 */
export const MAX_PROSE_WORDS = 14;

/** `` `plan.md` ``, `` `check:doc-index` ``, `` `anatomy` `` — every backticked span, in order. */
const BACKTICKED = /`([^`]+)`/g;

/** `§3`, `§4.1`, `§7b`, `§3.3.1`, `§8.3b` — every anchor shape the corpus uses. */
const ANCHOR = /§(\d+[a-z]?(?:\.\d+[a-z]?)*)/g;

/** A path citation is recognised by its extension, so `@chakra-ui/panda-preset` is not one. */
const PATH_TOKEN = /^[\w.@/-]+\.(?:md|mjs|js|ts|tsx|json|yml|yaml)$/;

/** `check:doc-index`, `pnpm docs:index` — a colon, and nothing that would make it a path. */
const SCRIPT_TOKEN = /^(?:pnpm\s+)?([a-z][\w-]*:[\w:-]+)$/;

const PROSE_WORD = /[A-Za-z][A-Za-z'-]*/g;

/**
 * The repo-authored skills: every directory under `.agents/skills/` that `skills-lock.json` does
 * not claim.
 *
 * The lock file is the list of vendored skills, so it is the list this check reads. Naming the
 * five repo-authored ones here instead would keep passing after a sixth is added, and report it as
 * checked by omission — the same defect `readIndexableDocuments` avoids in `doc-index.mjs`.
 */
export function readRepoAuthoredSkills(skillsDirectory, vendoredNames) {
  const vendored = new Set(vendoredNames);

  return readdirSync(skillsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !vendored.has(entry.name))
    .map((entry) => entry.name)
    .sort()
    .map((name) => ({
      name,
      file: `${skillsDirectory}/${name}/${SKILL_FILENAME}`,
      source: readFileSync(join(skillsDirectory, name, SKILL_FILENAME), "utf8"),
    }));
}

export function readVendoredSkillNames(lockPath) {
  return existsSync(lockPath)
    ? Object.keys(JSON.parse(readFileSync(lockPath, "utf8")).skills ?? {})
    : [];
}

const FRONTMATTER_FENCE = "---";

/**
 * `{ frontmatter, lines }` — the YAML block read as a flat key map, and every line tagged with
 * what the shape rules should do with it.
 *
 * `body` is the only kind the pointer rules apply to. A heading is exempt because it names rather
 * than states, exactly as a heading title is the one thing `INDEX.md` copies out of a document.
 */
export function parseSkill(source) {
  const rawLines = source.split("\n");
  const frontmatter = {};
  let inFrontmatter = rawLines[0] === FRONTMATTER_FENCE;
  let frontmatterClosed = !inFrontmatter;

  const lines = rawLines.map((text, index) => {
    const number = index + 1;

    if (index === 0 && inFrontmatter) {
      return { number, text, kind: "frontmatter" };
    }
    if (inFrontmatter) {
      if (text === FRONTMATTER_FENCE) {
        inFrontmatter = false;
        frontmatterClosed = true;
      } else {
        const separator = text.indexOf(":");
        if (separator > 0) {
          frontmatter[text.slice(0, separator).trim()] = text.slice(separator + 1).trim();
        }
      }
      return { number, text, kind: "frontmatter" };
    }

    if (text.trim() === "") {
      return { number, text, kind: "blank" };
    }
    if (text.startsWith("#")) {
      return { number, text, kind: "heading" };
    }
    return { number, text, kind: "body" };
  });

  return { frontmatter, frontmatterClosed, lines };
}

/**
 * Every citation on one line: `§` anchors with the document that governs them, plus the backticked
 * paths and script names.
 *
 * **An anchor is governed by the nearest backticked `*.md` before it on the same line**, which is
 * how the corpus already reads — `` `zag-solid-adapter.md` §7.1 — the headers; §7.2 the rows ``
 * carries two anchors and names the document once. An anchor with nothing before it is reported
 * rather than guessed at.
 */
export function collectCitations(text) {
  const citations = [];
  const backticked = [...text.matchAll(BACKTICKED)];

  for (const [, token] of backticked) {
    const script = SCRIPT_TOKEN.exec(token);
    if (script !== null) {
      citations.push({ kind: "script", raw: token, script: script[1] });
    } else if (PATH_TOKEN.test(token)) {
      citations.push({ kind: "path", raw: token, path: token });
    }
  }

  for (const match of text.matchAll(ANCHOR)) {
    const governing = backticked.findLast(
      (candidate) => candidate.index < match.index && candidate[1].endsWith(".md"),
    );
    citations.push({
      kind: "anchor",
      raw: `§${match[1]}`,
      document: governing?.[1],
      anchor: match[1],
    });
  }

  return citations;
}

/** Prose is what is left once every citation is removed — the words a reader could restate a rule in. */
export function countProseWords(text) {
  const stripped = text.replace(BACKTICKED, " ").replace(ANCHOR, " ");
  return (stripped.match(PROSE_WORD) ?? []).length;
}

/**
 * `(documentName, anchor) => boolean`, built from the documents themselves rather than from
 * `INDEX.md`.
 *
 * The index and this resolver run the same parser over the same files, so they cannot disagree
 * about what an anchor is; keeping `check:doc-index` as the sole owner of *is the index current*
 * means a stale index fails once, there, instead of twice with two different messages.
 *
 * **A ledger entry resolves under the document that cites it.** `decisions.md` §3's entries are
 * files under `decisions/`, and the corpus cites them as `` `decisions.md` §3.15 ``. The rule is
 * general — anchors in `<name>/**` fold into `<name>.md` — so no path is named here.
 */
export function buildAnchorResolver(documents, parseSections) {
  const byDocument = new Map();

  const record = (documentName, anchors) => {
    const existing = byDocument.get(documentName) ?? new Set();
    for (const anchor of anchors) {
      existing.add(anchor);
    }
    byDocument.set(documentName, existing);
  };

  for (const { name, source } of documents) {
    const anchors = parseSections(source).map((section) => section.anchor);
    record(name, anchors);

    const directory = name.includes("/") ? name.slice(0, name.indexOf("/")) : null;
    if (directory !== null) {
      record(`${directory}.md`, anchors);
    }
  }

  return (documentName, anchor) => byDocument.get(documentName)?.has(anchor) === true;
}

const fault = (skill, line, kind, detail) => ({
  skill: skill.name,
  file: skill.file,
  line,
  kind,
  detail,
});

/**
 * Every fault across every skill, in file then line order.
 *
 * @param resolvers `{ resolveAnchor, resolvePath, resolveScript }` — each a predicate, so the
 *   check owns what a repo path and a runnable script *are* and this module owns only the grammar.
 */
export function findSkillFaults(skills, resolvers) {
  const faults = [];

  for (const skill of skills) {
    const { frontmatter, frontmatterClosed, lines } = parseSkill(skill.source);

    if (!frontmatterClosed) {
      faults.push(fault(skill, 1, "frontmatter", "no closing `---`; the skill will not load"));
    }
    if (frontmatter.name !== skill.name) {
      faults.push(
        fault(
          skill,
          1,
          "frontmatter",
          `name is ${frontmatter.name ?? "(absent)"}, directory is ${skill.name}`,
        ),
      );
    }
    if ((frontmatter.description ?? "") === "") {
      faults.push(
        fault(skill, 1, "frontmatter", "no description; nothing decides when it triggers"),
      );
    }
    if (lines.length > MAX_SKILL_LINES) {
      faults.push(
        fault(
          skill,
          lines.length,
          "length",
          `${lines.length} lines, ceiling is ${MAX_SKILL_LINES}`,
        ),
      );
    }

    for (const line of lines) {
      if (line.kind === "frontmatter" || line.kind === "blank") {
        continue;
      }

      const citations = collectCitations(line.text);

      for (const citation of citations) {
        if (citation.kind === "anchor" && citation.document === undefined) {
          faults.push(
            fault(skill, line.number, "dead-pointer", `${citation.raw} names no document`),
          );
        } else if (
          citation.kind === "anchor" &&
          !resolvers.resolveAnchor(citation.document, citation.anchor)
        ) {
          faults.push(
            fault(
              skill,
              line.number,
              "dead-pointer",
              `${citation.document} has no ${citation.raw}`,
            ),
          );
        } else if (citation.kind === "path" && !resolvers.resolvePath(citation.path)) {
          faults.push(
            fault(skill, line.number, "dead-pointer", `${citation.raw} is not a file in the repo`),
          );
        } else if (citation.kind === "script" && !resolvers.resolveScript(citation.script)) {
          faults.push(
            fault(
              skill,
              line.number,
              "dead-pointer",
              `${citation.script} is not a package.json script`,
            ),
          );
        }
      }

      if (line.kind !== "body") {
        continue;
      }

      if (citations.length === 0) {
        faults.push(fault(skill, line.number, "not-a-pointer", "no citation on this line"));
      }

      const prose = countProseWords(line.text);
      if (prose > MAX_PROSE_WORDS) {
        faults.push(
          fault(
            skill,
            line.number,
            "not-a-pointer",
            `${prose} words outside its citations, ceiling is ${MAX_PROSE_WORDS}`,
          ),
        );
      }
    }
  }

  return faults;
}

const WHAT_A_FAULT_MEANS = {
  frontmatter: "the skill will not load, or will load under the wrong name",
  length: "a skill that has to be scrolled costs the routing hop twice",
  "dead-pointer": "the pointer sends a reader somewhere that is not what it names",
  "not-a-pointer":
    "a skill states where to read, never what it will say — a line with no citation, or with a paragraph beside one, is a second copy of a rule",
};

export function formatSkillFaults(faults) {
  const byKind = new Map();
  for (const item of faults) {
    byKind.set(item.kind, [...(byKind.get(item.kind) ?? []), item]);
  }

  return [...byKind]
    .map(([kind, items]) => {
      const rows = items.map((item) => `    ${item.file}:${item.line} — ${item.detail}`);
      return `  ${kind} — ${WHAT_A_FAULT_MEANS[kind]}\n${rows.join("\n")}`;
    })
    .join("\n\n");
}
