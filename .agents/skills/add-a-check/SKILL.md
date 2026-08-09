---
name: add-a-check
description: Where a new check gets defined, registered and run in chakra-ui-solid — the testing.md slot, the definition-of-done tier, the CI job, and the census a named-but-unwritten script belongs in. Use when adding, renaming or retiring a `check:*` script.
---

# Add a check

- Resolve every `§` below through `__internal__/INDEX.md` — line range and size per anchor.

## 1. Define it once — `testing.md` owns the slot

- `testing.md` §0 — the division of labour with `definition-of-done.md`, before writing either.
- `testing.md` §8 — distribution, styling-config and structural; §8.1 a definition worked through.
- `testing.md` §3 — generated-CSS coverage; §4 axe; §5 the no-runtime-sheet pair; §6 lint rules.
- `testing.md` §9 — attribution; §10 the bundle; §11 the scheduled upstream checks.

## 2. Register when it must pass — `definition-of-done.md`

- `definition-of-done.md` §1 — per file; §2 per component; §3 per batch; §4 per release.
- `definition-of-done.md` §7 — conventions with no script, each naming the proxy that is real.
- `definition-of-done.md` §7b — the census, for a name whose subject does not exist yet.
- `definition-of-done.md` §9 — scheduled checks: what fires them, who reads them.

## 3. Wire it

- `package.json` — the `check:*` entry.
- `.github/workflows/ci.yml` — the job; `testing.md` §12 maps check to job.
- `scripts/lib/doc-index.mjs` — the house shape; `scripts/check-doc-index.mjs` its entry point.
- `scripts/lib/__tests__/doc-index.test.mjs` — the unit tests that ship with it.
- `.agents/skills/close-a-step/SKILL.md` — the gate, once it is wired.
