# Four override paths, cheapest to widest, and no runtime system object

| # | Path | Needs a build? |
|---|---|---|
| 1 | CSS custom properties on any element | No: the only path reachable at runtime, via a `style` attribute |
| 2 | Style props or the `css` prop on any part | The consumer's own Panda run |
| 3 | `theme.extend.slotRecipes.<key>` in the consumer's config | Yes |
| 4 | A different preset | Yes |

A component reaches its recipe by a static import from the generated `styled-system/recipes`, resolved once on the Root and read from context by its parts. We did not reproduce `useRecipe` / `useSlotRecipe`, because both resolve through a runtime system object that does not exist here ([0043](0043-no-runtime-style-system-apis.md)). The variant API is Chakra's; only the resolution differs.

Docs list path 1 first: readers arriving from `createSystem` assume nothing is reachable at runtime.
