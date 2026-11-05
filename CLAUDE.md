# CLAUDE.md

`chakra-ui-solid` aims to be the de facto Chakra UI for **SolidJS 2.0**: Chakra UI v4's component
API, built the way Chakra builds it. Components sit on `@ark-ui/solid`, which runs Zag.js machines
through `@zag-js/solid`, and are styled with Panda CSS. No component imports `@zag-js/*` directly,
as no Chakra component does. The **driver** is the human running the
session and makes every product decision. Agents write every line of code, every file and every
name. Nothing is published until the dependencies are stable, so a breaking change costs only the
edit and the test run.

## The loop

A **slice** takes one GitHub issue labelled `roadmap` from claimed to merged, in one main session on
`feat/<name>`, with `/compact` at each phase boundary.

| Phase | Skill | Done when |
|---|---|---|
| claim | — | the next open `roadmap` issue with no open blocker, lowest milestone first, is assigned; `feat/<name>` and `.scratch/<name>/` exist |
| grill | `grill-with-docs` | the design tree is empty; every recommendation carries its evidence; pokes are measured with `prototype` in `.scratch/local/poke/` |
| spec | `to-spec` | `.scratch/<name>/spec.md` links the issue and is committed after the driver's **first go** |
| tickets | `to-tickets` | `.scratch/<name>/issues/NN-<slug>.md` are approved |
| implement | `implement-spec` | every ticket is done, one commit each, worktrees in `.scratch/local/worktrees/` |
| review | `code-review` | every Standards and Spec finding is answered by its own commit |
| UI review | `interface-review` | every finding on a rendered surface is answered |
| retro | `retro` | every accepted change has landed |
| merge | `pr` | `.scratch/<name>/` is removed, the full suite is green, and the PR (`Closes #<n>`) is merged with a merge commit after the driver's **second go** |

A gap in the spec sends the slice back to grill. A decision travels up: subagent to main session,
main session to driver.

| Who | Does | Model |
|---|---|---|
| main session | orchestrates, grills, writes markdown | Opus `high` |
| implementer | code, config and CI edits, with `tdd`; a fresh subagent per ticket or fix, its diff read before it is accepted | Sonnet `medium`, `low` when mechanical |
| reviewer | `code-review`'s Standards and Spec sub-agents, fresh, in parallel since they only read | Opus `high` |

## Where agents write

Two places hold everything the workflow produces. Three root files are fixed by the harness and the
skills.

| Path | Holds |
|---|---|
| `.scratch/<name>/` | a slice's spec, tickets and questionnaires; tracked on its branch, removed before merge |
| `.scratch/local/` | gitignored: `worktrees/`, `handoff/`, `poke/`, anything nobody keeps |
| `docs/` | everything persistent: ADRs, measured facts, research, component explanations |
| `CLAUDE.md`, `GLOSSARY.md`, `CODING_STANDARDS.md` | the root files the harness and the skills read by name |

A skill's default output path gives way to this table: `handoff` writes to `.scratch/local/handoff/`,
not `$TMPDIR`; `to-questionnaire` writes to `.scratch/<name>/`, or `.scratch/local/` outside a slice;
`research` writes into the `docs/` folder of its subject.

## Rules for `docs/`

- **One file, one subject.** A file that grows a second subject is split, each piece filed where it belongs.
- **Never write what a dependency already says.** A fact recoverable from a dependency's source or docs goes stale on its next bump. Only what we measured and the dependency does not document is written down, with how it was measured.
- A decision is an ADR in `docs/adr/`. A term is a `GLOSSARY.md` entry. A judgement call on code is a `CODING_STANDARDS.md` rule; a mechanical one is a lint rule, a hook or a CI check.

## Rules the skills run under

- A vendored skill (`.agents/skills/`) stays as published; a need it misses is a rule in this file. Install and update per `docs/agents/skills.md`.
- Dependencies track their newest line, `next` tags included. A prerelease is never a blocker.
- `grilling` asks with a recommendation on every question, naming the reference files read.

## Communicating

Visual beats text. Reach for the first form that fits:

| Content | Form |
|---|---|
| a flow, a structure, a dependency | a Mermaid diagram |
| a comparison, a list of items with attributes | a table |
| a finding or a fix | three short sentences: problem, cause, solution |
| a change | a code snippet or the diff |
| anything else | short connective sentences, never a block of prose |

Every text, in the chat and on disk, follows the unslop rules
([cursor/plugins `pstack/skills/unslop`](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md)):

| Cut | Write instead |
|---|---|
| AI vocabulary (crucial, delve, enhance, leverage, robust, seamless, pivotal, showcase) and "serves as" / "boasts" | the plain word, "is", "has", "use" |
| filler ("in order to", "it is important to note"), hedging, adverbs propping a weak verb | the short form, one hedge at most, a stronger verb or the number |
| "not just X but Y", forced groups of three, synonym cycling, false "from X to Y" ranges | the point stated once, the natural count, one term repeated |
| em dashes, colons as mid-sentence connectors, bold on every noun, bold-label-colon list items | periods and commas, bold only what must not be missed |
| abstract metaphor nouns (surface, substrate, primitive as a noun, north star) and mannered prose | the concrete word, literal phrasing |
| sentences that name a feeling ("feels fast") | what it does, or the number |
| passive voice | the actor named |
| dense or over-compressed lines (dropped articles, arrows, symbol-speak) | one idea per sentence, whole sentences |
| chatbot phrases, flattery, generic conclusions, decorative emoji, Title Case headings, curly quotes | nothing; sentence-case headings, straight quotes |

| Rule |
|---|
| Talk to the driver in their language. Everything on disk is English. Technical terms stay English in the chat too |
| Each term is defined in plain words on first use |
| A decision is a question with a recommendation, the whole frontier in one round, worded so "yes" accepts |
| An instruction already given is carried out, not asked again |
| A question from the driver is answered, never acted on as a decision |
| When the driver pushes back, concede what is right first, then bring the evidence. A technical opinion is checked against the real artifact before it is stated |
| A change is announced in one line; the driver reads the diff in the IDE |
| A durable preference is written into the repo, never into auto-memory |

## Git

- Slice commits land without a go; the driver's go comes twice, on the spec and before the merge. Work smaller than a slice goes to `main`.
- Stage explicit paths, and account for every `git status --short` line first.
- A commit message ends at its own last line, with no `Co-Authored-By` or generated-with trailer.
- A repo file states a rule and its reason, with no personal detail or decision date: `git log` holds who and when.

## Where things are

| Need | Open |
|---|---|
| before writing or reviewing code or a test | `CODING_STANDARDS.md` |
| a domain term | `GLOSSARY.md` |
| why something is built the way it is | `docs/adr/` |
| a fact already measured | `docs/<subject>/` |
| the upstream checkouts | `__reference-impl__/` (gitignored) |
| the code base before the rebuild: the docs app's look and prose, the style props system | tag `pre-rebuild` (`git show pre-rebuild:<path>`), read as reference, never restored |

## Agent skills

### Issue tracker

Roadmap items and deferrals are GitHub issues; a slice's spec and tickets are files under `.scratch/<name>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
