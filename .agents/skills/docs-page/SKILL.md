---
name: docs-page
description: The template a chakra-ui-solid docs page follows, the shared machinery it plugs into, and the claims it must never make. Use when writing or reviewing any page under apps/docs, component page or not.
---

# Write a docs page

- Resolve every `§` below through `__internal__/INDEX.md` — line range and size per anchor.

## 1. The template

- `docs-plan.md` §8 — the component page, one template; §8.1 through §8.13, in order.
- `docs-plan.md` §0 — what that document specs, and where the rest is.
- `docs-plan.md` §1, §3, §4, §5, §6, §7 — the non-component tiers, one spec each.
- `docs-site.md` §2.1 — the route map; the page's slug is a row in it.

## 2. The machinery every page shares

- `docs-site.md` §4 — the machinery; §4.1 examples, §4.2 the props table.
- `docs-site.md` §4.3 — generated pages; §4.4 the playground, constrained by `plan.md` §0.
- `docs-site.md` §1.4 — MDX; §1.3 dev resolves to `src`, build resolves to `dist`.

## 3. What it must not say, and the gate

- `docs-site.md` §5 — what the docs must never say.
- `docs-site.md` §3 — the copyright boundary; §3.2 the flag list, §3.3 the mechanical proxy.
- `docs-site.md` §6.1 — what CI asserts; §6.2 what it cannot.
- `check:docs-inventory`, `check:docs-examples` — the two gates; `docs-site.md` §6.1 for each.
- `definition-of-done.md` §7 — row 7.6, on opening the built site.
