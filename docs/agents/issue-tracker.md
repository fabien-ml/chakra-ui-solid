# Issue tracker: GitHub issues for direction, `.scratch/` for slice work

Work lives in two places, each with one job.

| What | Where |
|---|---|
| A roadmap item (label `roadmap`, one milestone per unit) | GitHub Issues on `fabien-ml/chakra-ui-solid` |
| A deferral (label `deferred`) | GitHub Issues on `fabien-ml/chakra-ui-solid` |
| A slice's spec | `.scratch/<name>/spec.md`, first line links the slice's GitHub issue |
| A slice's tickets | `.scratch/<name>/issues/NN-<slug>.md`, numbered from `01`, one file per ticket |
| Anything a skill writes that nobody keeps | `.scratch/local/` (gitignored) |

`.scratch/<name>/` is tracked on `feat/<name>` and removed before the merge. The GitHub issue is what
outlives the slice: the PR body says `Closes #<n>`.

A deferral names what wakes it: a `--blocked-by` edge when that is another issue, otherwise a
`Comes back at:` line at the top of its body.

## GitHub conventions

Use the `gh` CLI. It infers the repo from `git remote -v`.

- **Create**: `gh issue create --title "..." --body "..." --label roadmap|deferred --milestone "..."`. Use a heredoc for multi-line bodies.
- **Read**: `gh issue view <n> --json number,title,body,labels,milestone,comments`.
- **List**: `gh issue list --state open --label <label> --json number,title,labels,milestone`.
- **Sub-issue**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>`.
- **Blocking**: GitHub's native issue dependencies. `gh issue create --blocked-by <n>,<n> ...` or `gh issue edit <child> --add-blocked-by <blocker>`. An issue is startable when every blocker is closed.
- **Count open blockers**: `gh api repos/fabien-ml/chakra-ui-solid/issues/<n> --jq .issue_dependencies_summary.blocked_by` (0 means startable).
- **Comment**: `gh issue comment <n> --body "..."`.
- **Labels**: `gh issue edit <n> --add-label "..."` / `--remove-label "..."`.
- **Close**: post the reason with `gh issue comment`, then `gh issue close <n>`. On an already-closed issue, `gh issue close --comment` drops the comment and still exits 0.

File issues only into `fabien-ml/chakra-ui-solid`.

**PRs as a request surface: no.**

## Slice conventions

- **Claim**: `gh issue edit <n> --add-assignee @me`, create `feat/<name>`, create `.scratch/<name>/`.
- A ticket's blockers go on a `Blocked by: NN, NN` line near the top of its file. A ticket is unblocked when every file it lists is done.
- Comments and conversation history append under a `## Comments` heading at the bottom of the file.

## When a skill says "publish to the issue tracker"

| Skill | Writes |
|---|---|
| `to-spec` | `.scratch/<name>/spec.md` |
| `to-tickets` | `.scratch/<name>/issues/NN-<slug>.md` |
| anything new for the roadmap, or a deferral | a GitHub issue with its label |

## When a skill says "fetch the relevant ticket"

A path under `.scratch/`: read the file. A `#<n>`: `gh issue view <n>`.
