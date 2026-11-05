# Silent unstyling

A Panda class whose CSS was never generated renders nothing and raises no error. An unstyled component and a green suite look identical.

## Cause

Panda writes rules at **build time**: it extracts `css()`, `cva()`, `sva()` and `cx()` calls from source and emits their rules. At runtime `css({ p: "4" })` only recomputes the class name `p_4`. Reading it as "applies styles" leads to values built dynamically with no rule behind them, and nothing throws.

A value reaches the stylesheet by one of three routes: [dynamic value routes](../adr/0026-dynamic-value-routes.md).

## Why types and tests miss it

- Types come from our recipes while the CSS comes from the consumer's config, so a type cannot say whether a rule exists.
- Tests cover only the variants they render.
- `classList.contains("p_4")` passes on a completely unstyled element.

## How to detect it

- Assert computed styles, never class names.
- A value that is statically valid can still resolve to nothing (`mt="4x"`, `bg="bg.pannel"`): Panda emits the raw value when a token does not resolve. `CSS.supports` over the generated sheet catches this.
- Docs examples backed by real files that mount and render.
