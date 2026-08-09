---
name: attribution
description: What a derivative file owes in chakra-ui-solid and which check catches each omission — the expression-tier test, the five obligations, the commit order. Use when copying, adapting or reviewing code taken from Chakra UI, Ark UI, Zag.js or hope-ui.
---

# Attribution

- Resolve every `§` below through `__internal__/INDEX.md` — line range and size per anchor.
- The rule lives in `CLAUDE.md`, section *Reference use, and the expression tier*.

## 1. Is it expression at all?

- `CLAUDE.md` — the reading test, and the four reference sources one line each.
- `attribution.config.ts` — its header states what must never be added.
- `definition-of-done.md` §7 — row 7.1, and what is enforced in place of the judgement.

## 2. The five obligations

- `CLAUDE.md` — the numbered list; all five land in the same commit as the code.
- `attribution.config.ts` — the registry itself, and the only place a derivative is declared.
- `NOTICE.md` — the root table; the owning package has its own.
- `tsdown.config.base.ts` — `comments.legal`, pinned with the comment that explains it.

## 3. The worked example — the seven forked files

- `zag-solid-adapter.md` §7.1 — the headers; §7.2 the rows, and the number that matters.
- `zag-solid-adapter.md` §7.3 — the checklist, in commit order.
- `packages/zag-solid/src/machine.ts` — what a compliant header looks like.

## 4. Which check catches which

- `definition-of-done.md` §1 — rule 1.7, on the commit rather than the code.
- `testing.md` §9 — one row per check, with what each failure means.
- `check:license-headers`, `check:notice-rows`, `check:package-files` — before the gate.
