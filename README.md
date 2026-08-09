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
| `useToken()` token lookup | Supported, reimplemented as a CSS-variable read |
| Style props with **runtime** values | Not supported. Use a CSS custom property, or declare the value at build time |
| `createSystem(...)` runtime theming | Not supported. Build-time `panda.config.ts` only |
| Arbitrary one-off values anywhere | Only where they are statically extractable, pre-declared in `staticCss`, or passed as a CSS variable |

The inline `style` attribute is *not* affected by any of this — `style={{ "--x": value }}` is the
sanctioned escape hatch for genuinely dynamic values, and it is how positioning, slider offsets, and
progress fills work.

## Status

**Pre-release. Nothing is published, and no component exists yet** — this repository holds the
architecture documents the implementation is being built from, plus the workspace and test harness
they specify. The stack targets `solid-js@2.0.0-beta.x`, and nothing upstream is built for SolidJS
2.0 yet, so every Solid-2.0-shaped adaptation here is ours.

Packages will publish under the `@chakra-ui-solid` scope: `@chakra-ui-solid/components`,
`@chakra-ui-solid/styled-system`, `@chakra-ui-solid/panda-preset`, and the rest.

## Credit where it is due

chakra-ui-solid exists because of work other people did and licensed generously. Chakra UI, Zag.js,
Ark UI, and Panda CSS are all MIT, all from Chakra Systems Inc. and its maintainers, and this
project builds on them gratefully. `@chakra-ui/panda-preset` is consumed as published, not copied —
the design tokens and recipes here are Chakra's own, applied at build time.

## License

MIT — see [`LICENSE`](LICENSE). Portions derived from other projects remain under their own
licenses; see [`NOTICE.md`](NOTICE.md).
