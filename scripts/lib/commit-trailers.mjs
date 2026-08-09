/**
 * The logic behind `check:commit-trailers`.
 *
 * Commit messages carry the change rationale only. `CLAUDE.md`'s git convention, and DoD rule 1.10.
 */

const BANNED = [
  { label: "Co-Authored-By trailer", pattern: /^\s*co-authored-by\s*:/im },
  { label: '"Generated with" trailer', pattern: /generated with/i },
];

/** @returns the banned trailers present in one commit message. */
export function bannedTrailersIn(message) {
  return BANNED.filter(({ pattern }) => pattern.test(message)).map(({ label }) => label);
}

/**
 * @param commits `{ sha, subject, message }`
 * @returns one entry per offending commit.
 */
export function findCommitsWithBannedTrailers(commits) {
  return commits
    .map((commit) => ({ ...commit, trailers: bannedTrailersIn(commit.message) }))
    .filter((commit) => commit.trailers.length > 0);
}

/**
 * `git log -z --format=...` output, split back into commits. `-z` because a commit message
 * contains blank lines and anything else would need the message to be well-behaved.
 */
export function parseGitLog(output) {
  return output
    .split("\0")
    .filter((record) => record.trim() !== "")
    .map((record) => {
      const [sha = "", ...rest] = record.split("\n");
      const message = rest.join("\n");
      return { sha, subject: rest[0] ?? "", message };
    });
}

export function formatOffendingCommits(offenders) {
  return offenders
    .map(
      ({ sha, subject, trailers }) =>
        `  ${sha.slice(0, 9)} ${subject}\n      carries: ${trailers.join(", ")}`,
    )
    .join("\n");
}
