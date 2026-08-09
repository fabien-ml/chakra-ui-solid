---
name: port-a-component
description: The reading order for porting one Chakra UI v3 component to SolidJS — its parity-matrix row, the blueprint sections in sequence, and the gate it has to pass. Use when starting, resuming or reviewing a component port in chakra-ui-solid.
---

# Port a component

- Resolve every `§` below through `__internal__/INDEX.md` — line range and size per anchor.

## 1. What this component is

- `roadmap.md` §4 — the matrix; §4.1–§4.5 are the five shape classes.
- `roadmap.md` §6 — the presence-gated set; §6.1 family Z, §6.2 family M, §6.3 `aria-controls`.
- `roadmap.md` §10 — `RootProvider`, `PropsProvider`, `Context`, and `./hooks`.
- `roadmap.md` §5 — check the exclusions first, one reason each.

## 2. The blueprint, in this order

- `component-blueprint.md` §2 — machine instantiation; §2.4 before writing a prop interface.
- `component-blueprint.md` §3 — `anatomy` → part components; §3.1 the two lists, §3.2 the four shapes.
- `component-blueprint.md` §4 — `renderStyled` and the `recipeClass` seam; §4.1.1 for merged props.
- `component-blueprint.md` §5 — where inline `style` and CSS custom properties are legal.
- `component-blueprint.md` §6 — the `hidden`-vs-`display` rule; §7 presence; §10 SSR and hydration.
- `component-blueprint.md` §11 — Dialog, worked fully through, as the model.

## 3. The gate

- `definition-of-done.md` §2 — per component, every row; §1 per file, for each file added.
- `definition-of-done.md` §5 — the axe allowance register; §6 the coverage allow-list.
- `testing.md` §2 — computed-style assertions; §1.4 the `mount()` diagnostic gate.
- `.agents/skills/docs-page/SKILL.md` — the page `definition-of-done.md` §2 owes.
- `.agents/skills/close-a-step/SKILL.md` — when the batch closes.
