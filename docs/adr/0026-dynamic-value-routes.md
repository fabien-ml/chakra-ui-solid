# A style value takes one of three routes; there is no fourth

`<Box w={runtimeValue}>` cannot work as it does in Chakra: that needs styles serialized at render time ([0067](0067-zero-published-css.md)). Panda only generates CSS for values it can see at build time, and a class whose CSS was never generated renders nothing with no error (silent unstyling). So a style value must take one of three routes, in preference order:

| Value is | Route | What you write |
|---|---|---|
| a literal or token known at author time | 1 | a style prop or recipe base: `p="6"`, `bg="bg.panel"` |
| from a finite set the code picks, but the source never writes literally | 2 | a `staticCss` row (Panda's config list of classes generated regardless of usage) |
| unbounded: a pixel offset, a measured height, a consumer number | 3 | a CSS custom property through inline `style`, consumed by a static class: `style={{ "--w": w() }}` with `w="var(--w)"` |

Notes on the routes:

- **Before reaching for 2, restructure to literals** when the code chooses between a few things: `<Show>`, or a data attribute the recipe styles against.
- **Recipe variants are automatic**: the preset declares `staticCss` per recipe, so no component author declares anything. Route 2 stays manual only for atomic style-prop values a component's own logic picks. `<Flex inline>` flips `display` to `inline-flex` at runtime and Panda's usage scan cannot see it, so the rule is pre-generated or the prop silently does nothing.
- **A responsive recipe variant** (`<Button size={{ base: "sm", md: "lg" }}>`) is opt-in through the config helper's `responsive` option, not a style-prop route.
- **Route 3 needs a lint rule**, because using it accidentally as route 1 fails silently.

The contract is documented as a first-class page, the loudest in the docs ([0019](0019-docs-silent-unstyling-prominence.md)).

## Considered options

- **Support runtime values, as Chakra does.** Rejected: needs runtime style serialization.
- **Leave route 3 to convention.** Rejected: accidental misuse fails silently.
