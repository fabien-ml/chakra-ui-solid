# chakra-ui-solid

**chakra-ui-solid** is an independent component library for [SolidJS](https://www.solidjs.com/) 2.0
that targets **Chakra UI v3**'s component API and design system — [Zag.js](https://zagjs.com) state
machines for behavior and accessibility, [Panda CSS](https://panda-css.com) with
`@chakra-ui/panda-preset` for tokens and recipes, and **no runtime CSS-in-JS anywhere**.

> **Unofficial.** chakra-ui-solid is not affiliated with, sponsored by, or endorsed by Chakra
> Systems Inc. or the Chakra UI maintainers. "Chakra UI" is their trademark, and it is used here only to
> describe what this library targets. If you are looking for the official Chakra UI, it is at
> [chakra-ui.com](https://chakra-ui.com).

## Not a 1:1 port

Chakra v3 styles at runtime, through Emotion. chakra-ui-solid does not, by design: **no library or
code here generates stylesheets at runtime.** Every class name is computed against CSS that Panda emitted
at build time.

That constraint is the point of the project, and it has a price. chakra-ui-solid is
**as close to Chakra v3 parity as is achievable without runtime CSS-in-JS** — not a 1:1 port, and it
does not pretend to be one. Concretely:

| Chakra v3 | Here |
|---|---|
| Token, recipe, and variant styling | **Full parity** — the bulk of the surface |
| `useToken()` token lookup | Planned, reimplemented as a read of the build-time token map rather than a runtime dictionary |
| Style props with **runtime** values | Not supported. Use a CSS custom property, or declare the value at build time |
| `createSystem(...)` runtime theming | Not supported. Build-time `panda.config.ts` only |
| Arbitrary one-off values anywhere | Only where they are statically extractable, pre-declared in `staticCss`, or passed as a CSS variable |

The inline `style` attribute is *not* affected by any of this — `style={{ "--x": value }}` is the
sanctioned escape hatch for genuinely dynamic values, and it is how positioning, slider offsets, and
progress fills work.

## Status

**Pre-release. Nothing is published.** 61 of the roadmap's 110 components ship from the package:
every layout and typography primitive but `image`, `input-element` and `input-group`; every
atomic-recipe component but `input-addon`; all fifteen multi-part components that need no state
machine; and the first four rows that run on one — Collapsible, Dialog, Popover and Tabs, each over
its Zag machine. Forty-one machine-backed rows and the four utility rows are still ahead.

Around them: the `chakra` factory and the style-prop surface, the Panda preset, a docs site (54
component pages plus the get-started, styling and theming tracks) that installs the packages by name
and runs its own Panda build, and a three-project Vitest harness — client, server-render, and real
Chromium, where every computed-style assertion lives.

The stack targets `solid-js@2.0.0-rc.0`, and nothing upstream is built for SolidJS 2.0 yet, so every
Solid-2.0-shaped adaptation here is ours.

The library publishes as the unscoped `chakra-ui-solid`; its satellites keep the scope —
`@chakra-ui-solid/core`, `@chakra-ui-solid/styled-system` and `@chakra-ui-solid/panda-preset`.

## Credit where it is due

chakra-ui-solid exists because of work other people did and licensed generously. Chakra UI, Zag.js,
Ark UI, and Panda CSS are all MIT, all from Chakra Systems Inc. and its maintainers, and this
project builds on them gratefully. `@chakra-ui/panda-preset` is consumed as published, not copied —
the design tokens and recipes here are Chakra's own, applied at build time.

## License

MIT — see [`LICENSE`](LICENSE). Portions derived from other projects remain under their own
licenses; see [`NOTICE.md`](NOTICE.md).
