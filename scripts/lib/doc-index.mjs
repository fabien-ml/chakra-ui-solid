/**
 * The logic behind `check:doc-index` and `docs:index`.
 *
 * The eleven `__internal__` documents are cited by section — `` `plan.md` §3.5 ``. Resolving one
 * of those citations without an index means grepping for the heading, reading the line number, and
 * guessing how far to read; guessing wide is what makes a consultation cost 40 KB instead of 3 KB.
 * This builds the lookup: every section's anchor, line range and size, so a citation resolves to
 * an exact range and an oversized read has no excuse.
 *
 * **Nothing but heading text is ever copied out of a document here.** A heading names a rule; a
 * body states it. Copying a body would put a rule in two places, which is the thing the index
 * exists to avoid needing (`CLAUDE.md`, the three-surface split; `decisions.md` §0).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** `## 3. The ledger`, `### 3.3.1 …`, `#### 4.1.1 …` — every heading in the corpus is numbered. */
const NUMBERED_HEADING = /^(#{2,4})\s+(\d+[a-z]?(?:\.\d+[a-z]?){0,2})\.?\s+(.*?)\s*$/;

export const INDEX_FILENAME = "INDEX.md";

/**
 * The indexed set: every `.md` anywhere under `__internal__`, minus the index itself, keyed by its
 * path relative to that directory.
 *
 * Both the generator and the check call this rather than each listing the documents, because a
 * check carrying its own copy of the file list goes on passing after a twelfth document is added
 * — it would verify eleven documents and report the twelfth as indexed by omission. It **recurses**
 * for the same reason: the ledger's entries are one file each under `decisions/`, and a sixteenth
 * has to arrive without anyone remembering to edit this script.
 *
 * What to index is then left entirely to `renderIndex`, which drops a file with no numbered
 * heading. That is what keeps the design notes under `zag-solid/` and `internal-test-utils/` out —
 * nothing cites them by anchor because they have none — without a list of directories to skip
 * here, which would be the same defect one level down.
 */
export function readIndexableDocuments(internalDirectory) {
  const paths = [];

  const collect = (directory, prefix) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const relativePath = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
      if (entry.isDirectory()) {
        collect(join(directory, entry.name), relativePath);
      } else if (entry.name.endsWith(".md") && relativePath !== INDEX_FILENAME) {
        paths.push(relativePath);
      }
    }
  };
  collect(internalDirectory, "");

  return paths
    .sort()
    .map((name) => ({ name, source: readFileSync(join(internalDirectory, name), "utf8") }));
}

const FENCE = /^\s*(?:```|~~~)/;

/**
 * Heading-looking lines inside a fenced code block are not headings — `roadmap.md` has fourteen
 * shell comments that start with `#`. None is `##` today, so a parser that ignored fences would
 * pass; it would start emitting phantom sections the first time someone pastes a markdown sample
 * into a fence, and a phantom row points a reader at a line range that is not the section they
 * cited. Tracking the fence state costs three lines and removes the whole class.
 */
export function parseSections(source) {
  const lines = source.split("\n");
  const headings = [];
  let insideFence = false;

  lines.forEach((line, index) => {
    if (FENCE.test(line)) {
      insideFence = !insideFence;
      return;
    }
    if (insideFence) {
      return;
    }

    const match = NUMBERED_HEADING.exec(line);
    if (match === null) {
      return;
    }

    const [, hashes, anchor, title] = match;
    headings.push({ level: hashes.length, anchor, title, startLine: index + 1 });
  });

  return headings.map((heading, position) => {
    const nextPeerOrShallower = headings
      .slice(position + 1)
      .find((candidate) => candidate.level <= heading.level);
    const endLine = nextPeerOrShallower ? nextPeerOrShallower.startLine - 1 : lines.length;
    const bytes = lines.slice(heading.startLine - 1, endLine).join("\n").length;
    return { ...heading, endLine, bytes };
  });
}

/**
 * `{ read, indexed, sections }` — what the two scripts print when they finish.
 *
 * Counted from the documents, never by matching `^§` over the rendered index — the header's
 * worked example is a `§` row too, so counting the output overstates the input by one.
 *
 * `indexed` is lower than `read` because `renderIndex` drops a file with no numbered heading:
 * ten design notes under `zag-solid/` and `internal-test-utils/` are read and not indexed, and a
 * message quoting only `read` would report them as being in the index.
 */
export function summariseCorpus(documents) {
  const perDocument = documents.map(({ source }) => parseSections(source).length);
  return {
    read: documents.length,
    indexed: perDocument.filter((count) => count > 0).length,
    sections: perDocument.reduce((total, count) => total + count, 0),
  };
}

const kilobytes = (bytes) => `${(bytes / 1024).toFixed(1)}`;

function formatRow(section, widths) {
  const anchor = `§${section.anchor}`.padEnd(widths.anchor);
  const start = String(section.startLine).padStart(widths.line);
  const end = String(section.endLine).padEnd(widths.line);
  const size = kilobytes(section.bytes).padStart(widths.size);
  return `${anchor} L${start}–${end} ${size} KB  ${section.title}`;
}

function formatBlock(document) {
  const widths = {
    anchor: Math.max(...document.sections.map((s) => s.anchor.length + 1)),
    line: Math.max(...document.sections.map((s) => String(s.endLine).length)),
    size: Math.max(...document.sections.map((s) => kilobytes(s.bytes).length)),
  };
  const rows = document.sections.map((section) => formatRow(section, widths));
  return `## \`${document.name}\`\n\n\`\`\`\n${rows.join("\n")}\n\`\`\`\n`;
}

const HEADER = `# The anchor index

**Generated — do not edit.** \`pnpm docs:index\` rewrites it; \`check:doc-index\` fails the build when
it has drifted from the documents it describes.

**What a row is.** One section of one \`__internal__\` document: its anchor as a citation writes it,
the line range to read, and what reading that range costs.

\`\`\`
§3.5   L 512–587    3.1 KB  Static extraction, and the third option
\`\`\`

**Sizes nest — do not add them up.** A \`§3\` row spans its \`§3.5\` children, so it reports the cost of
reading the whole section. The child rows report the cost of reading only that part.

**Titles are the only text copied out of the documents.** A heading names a rule; the body states
it. The bodies stay in one place, which is the point of having an index at all.

**Read this file in slices.** The summary below says which file a citation lives in and where its
block starts *in this file*. A block is a few KB — read that one, not the whole index.

**A ledger entry is a file.** \`decisions.md\` §3's entries live one per file under \`decisions/\`,
so \`§3.13\` is indexed under \`decisions/3.13-…\` rather than under \`decisions.md\`.
`;

function formatSummary(documents, blockStartLines) {
  const rows = documents.map((document, position) => {
    const widest = document.sections.reduce(
      (worst, section) => (section.bytes > worst.bytes ? section : worst),
      document.sections[0],
    );
    // The document's own length, not the sum of its sections — sections nest, so summing them
    // counts every child twice and reports a document half again larger than it is.
    return (
      `| [\`${document.name}\`](#${anchorSlug(document.name)}) | ${kilobytes(document.bytes)} KB | ` +
      `${document.lineCount} | ${document.sections.length} | ` +
      `§${widest.anchor} at ${kilobytes(widest.bytes)} KB | L${blockStartLines[position]} |`
    );
  });
  return [
    `## The ${documents.length} indexed files`,
    "",
    "| Document | Size | Lines | Sections | Largest section | Block starts |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}

/** GitHub's heading-slug rule, narrowed to what our document names actually contain. */
function anchorSlug(name) {
  return name.toLowerCase().replace(/[./]/g, "");
}

/**
 * @param documents `{ name, source }`, in the order they should appear.
 * @returns the full `INDEX.md` text.
 *
 * Two passes, because the summary cites the line each block starts on and writing those numbers
 * changes nothing about the summary's own height — it has one row per document either way.
 */
export function renderIndex(documents) {
  const parsed = documents.map(({ name, source }) => ({
    name,
    sections: parseSections(source),
    lineCount: source.split("\n").length,
    bytes: source.length,
  }));

  const withSections = parsed.filter((document) => document.sections.length > 0);
  const blocks = withSections.map(formatBlock);

  const summaryHeight = withSections.length + 5;
  const preamble = `${HEADER}\n---\n\n`;
  let cursor = preamble.split("\n").length + summaryHeight;

  const blockStartLines = blocks.map((block) => {
    const start = cursor;
    cursor += block.split("\n").length;
    return start;
  });

  const summary = formatSummary(withSections, blockStartLines);
  return `${preamble}${summary}\n${blocks.join("\n")}`;
}

/**
 * How many drifted lines the report shows before it stops.
 *
 * Deliberately small. Inserting one heading shifts every line after it, so a line-by-line report
 * is a handful of real differences followed by an arbitrary amount of offset cascade. The first
 * few are the informative ones — the summary table sits at the top of the index, so a changed
 * document shows up there by name before any of its rows do.
 */
const DRIFT_SHOWN = 3;

/**
 * @returns `{ shown, total }` — the first few differing lines, and how many differ in all.
 *
 * Compared line by line rather than as one string so the failure names a drifted row instead of
 * saying only that 34 KB of text differs. It is a staleness signal, not a reviewable diff: the
 * fix is always to regenerate, and `git diff __internal__/INDEX.md` is the diff.
 */
export function findIndexDrift(onDisk, regenerated) {
  if (onDisk === regenerated) {
    return { shown: [], total: 0 };
  }

  const current = onDisk.split("\n");
  const expected = regenerated.split("\n");
  const shown = [];
  let total = 0;

  for (let line = 0; line < Math.max(current.length, expected.length); line += 1) {
    if (current[line] === expected[line]) {
      continue;
    }
    total += 1;
    if (shown.length < DRIFT_SHOWN) {
      shown.push({
        line: line + 1,
        onDisk: current[line] ?? "(end of file)",
        expected: expected[line] ?? "(end of file)",
      });
    }
  }

  return { shown, total };
}

export function formatIndexDrift({ shown, total }) {
  const rows = shown.map(
    ({ line, onDisk, expected }) =>
      `  INDEX.md:${line}\n      on disk:  ${onDisk}\n      expected: ${expected}`,
  );
  const remainder = total - shown.length;
  return remainder > 0
    ? `${rows.join("\n")}\n  … and ${remainder} more differing line(s).`
    : rows.join("\n");
}
