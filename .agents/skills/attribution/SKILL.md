---
name: attribution
description: What a derivative file owes in chakra-ui-solid and which check catches each omission — the expression-tier test, the five obligations, the commit order. Use when copying, adapting or reviewing code taken from Chakra UI, Ark UI, Zag.js or hope-ui.
---

# Attribution

- Resolve every `§` below through `__internal__/INDEX.md` — line range and size per anchor.

## 1. Is it expression at all?

- `legal.md` §1.4 — reading owes nothing, and where the line is drawn.
- `legal.md` §1.5 — `@chakra-ui/panda-preset`: depend, do not vendor.
- `legal.md` §1.6 — hope-ui carry-overs; §1.3 the `@zag-js/solid` fork.
- `definition-of-done.md` §7 — row 7.1, and what is enforced in place of the judgement.

## 2. The five obligations

- `legal.md` §2 — the mechanism; §2.1 what triggers it.
- `legal.md` §2.2 — the `@license` header; §2.3 why it is load-bearing.
- `legal.md` §2.4 — root and per-package `NOTICE.md`.
- `legal.md` §2.5 — the license files in `package.json#files`.
- `legal.md` §2.6 — the checklist for a new derivative file.
- `attribution.config.ts` — the registry itself.

## 3. Commit order, and which check catches which

- `zag-solid-adapter.md` §7.3 — the checklist in commit order; §7.1 headers, §7.2 rows.
- `definition-of-done.md` §1 — rule 1.7, on the commit rather than the code.
- `testing.md` §9 — one row per check, with what each failure means.
- `check:license-headers`, `check:notice-rows`, `check:package-files` — before the gate.
