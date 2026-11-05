# The custom-property route

The third style route (see [dynamic value routes](../adr/0026-dynamic-value-routes.md)) writes a value through a CSS custom property: `style={{ "--w": w() }}` with `w="var(--w)"`.

## Cheaper in Solid than in React

Solid writes the property straight onto the node when the value changes, so the route is an ordinary reactive write, not a concession. Docs should say so: a reader who believes the hatch is a downgrade avoids it.

## An unset `var()` is safe in a longhand and fatal in a shorthand

| Declaration | Unset variable resolves to |
|---|---|
| `grid-column-start: var(--x)` | invalid at computed-value time, falls back to `auto`, as if undeclared |
| `grid-area: var(--x)` | resets all four line properties |
| `background: var(--x)` | the whole shorthand is invalidated |

A shorthand on this route is applied conditionally, never from an always-on base. `ColorSwatch` is the measured case: `--color` unset invalidates the `background` shorthand and takes the checkerboard with it, so the assertion that means anything is `background-image`; `backgroundColor` reads `rgba(0, 0, 0, 0)` on a working swatch.
