/**
 * The transcript half of `check:context-budget` — a **local diagnostic**, never a gate
 * (`testing.md` §8.3; `definition-of-done.md` §7.9).
 *
 * It re-runs the measurement the context-budget plan was written from: across every session
 * transcript for this repo, match each `Read` `tool_use` to its `tool_result`, sum the bytes the
 * result actually returned, and take the median of the governance bytes read **before the session's
 * first `Edit` or `Write`** — the bill a task pays before it produces anything.
 *
 * **It cannot run in CI**, and that is a property of the input rather than a gap: transcripts live
 * under `~/.claude/projects/` on one machine and are not in the repo. Naming a script CI never runs
 * as though it were enforcement is the failure `definition-of-done.md` §7b exists to stop, so this
 * half is registered as a convention with a runnable aid and the aid is this.
 *
 * **The definition of a governance read is frozen at the plan's**: `CLAUDE.md`, or a `.md` under
 * `__internal__`. Widening it — to the skills, to `.claude/plans/` — would produce a number that is
 * not comparable to the figure it is measured against, and an incomparable before/after is worse
 * than no measurement. Anything outside that definition is counted and reported **separately**.
 *
 * A **second, wider** window is measured alongside it — every `.md` read before the first edit —
 * for one reason: the plan's stated 137 KB is **not reproducible** from the transcripts on disk
 * under the definition the plan gives, and printing the narrow number alone would hide that. The
 * two together bracket the figure and let a reader see the spread instead of trusting one line.
 */

const GOVERNANCE_PATH = /(?:^|\/)(?:CLAUDE\.md$|__internal__\/.*\.md$)/;
const SKILL_PATH = /\.agents\/skills\/.*\.md$/;

/** What counts as producing something. `NotebookEdit` is included; nothing in this repo uses it. */
const PRODUCING_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);

export function classifyReadPath(path) {
  if (GOVERNANCE_PATH.test(path)) {
    return "governance";
  }
  return SKILL_PATH.test(path) ? "skill" : "other";
}

/** A `tool_result`'s content is a string or a block list; both are what entered the context. */
export function resultBytes(content) {
  if (typeof content === "string") {
    return Buffer.byteLength(content, "utf8");
  }
  if (!Array.isArray(content)) {
    return 0;
  }
  return content.reduce((total, block) => total + Buffer.byteLength(block?.text ?? "", "utf8"), 0);
}

const contentBlocks = (record) =>
  Array.isArray(record?.message?.content) ? record.message.content : [];

/**
 * One session's figures, from its raw `.jsonl` text.
 *
 * Lines are read in file order, which is the order the turns happened in — the transcript is
 * append-only. A `Read` is attributed to the phase (before or after the first producing tool call)
 * that its **request** falls in, not its result, because the request is the decision being measured.
 *
 * A malformed line is skipped rather than fatal. These are machine-local logs written by another
 * process; a half-flushed final line is normal and refusing to report on 26 good transcripts
 * because of it would be the wrong trade for a diagnostic.
 */
export function measureSession(text) {
  const pending = new Map();
  const reads = [];
  let firstProducingIndex = null;
  let index = 0;
  let malformedLines = 0;

  for (const line of text.split("\n")) {
    if (line.trim() === "") {
      continue;
    }

    let record;
    try {
      record = JSON.parse(line);
    } catch {
      malformedLines += 1;
      continue;
    }

    for (const block of contentBlocks(record)) {
      if (block.type === "tool_use") {
        index += 1;
        if (PRODUCING_TOOLS.has(block.name) && firstProducingIndex === null) {
          firstProducingIndex = index;
        }
        if (block.name === "Read" && typeof block.input?.file_path === "string") {
          pending.set(block.id, {
            index,
            path: block.input.file_path,
            scoped: block.input.offset !== undefined || block.input.limit !== undefined,
          });
        }
      } else if (block.type === "tool_result") {
        const request = pending.get(block.tool_use_id);
        if (request !== undefined) {
          pending.delete(block.tool_use_id);
          reads.push({ ...request, bytes: resultBytes(block.content) });
        }
      }
    }
  }

  const beforeFirstEdit = (read) =>
    firstProducingIndex !== null && read.index < firstProducingIndex;

  const sum = (predicate) => reads.filter(predicate).reduce((total, read) => total + read.bytes, 0);

  const governance = (read) => classifyReadPath(read.path) === "governance";

  return {
    producedSomething: firstProducingIndex !== null,
    malformedLines,
    reads: reads.length,
    allReadBytes: sum(() => true),
    governanceBytes: sum(governance),
    skillBytes: sum((read) => classifyReadPath(read.path) === "skill"),
    governanceBytesBeforeFirstEdit: sum((read) => governance(read) && beforeFirstEdit(read)),
    markdownBytesBeforeFirstEdit: sum((read) => read.path.endsWith(".md") && beforeFirstEdit(read)),
    governanceReads: reads.filter(governance).length,
    scopedGovernanceReads: reads.filter((read) => governance(read) && read.scoped).length,
  };
}

export function median(values) {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * The corpus figures, and **the two n's that qualify them**.
 *
 * `sessions` is how many transcripts were read; `sessionsWithAnEdit` is how many the median is
 * actually over — a session that never edited has no "before the first edit", and folding its whole
 * governance bill in would measure a different thing under the same name. Both are reported,
 * because a number quoted without its n is exactly the failure `prior-art.md` §0.4 is about.
 */
export function summariseSessions(sessions) {
  const withAnEdit = sessions.filter((session) => session.producedSomething);
  const worst = [...withAnEdit]
    .sort(
      (left, right) => right.governanceBytesBeforeFirstEdit - left.governanceBytesBeforeFirstEdit,
    )
    .slice(0, 2)
    .map((session) => session.governanceBytesBeforeFirstEdit);

  const total = (key) => sessions.reduce((sum, session) => sum + session[key], 0);

  return {
    sessions: sessions.length,
    sessionsWithAnEdit: withAnEdit.length,
    malformedLines: total("malformedLines"),
    medianBeforeFirstEdit: median(
      withAnEdit.map((session) => session.governanceBytesBeforeFirstEdit),
    ),
    medianMarkdownBeforeFirstEdit: median(
      withAnEdit.map((session) => session.markdownBytesBeforeFirstEdit),
    ),
    worstBeforeFirstEdit: worst,
    allReadBytes: total("allReadBytes"),
    governanceBytes: total("governanceBytes"),
    skillBytes: total("skillBytes"),
    governanceReads: total("governanceReads"),
    scopedGovernanceReads: total("scopedGovernanceReads"),
  };
}
