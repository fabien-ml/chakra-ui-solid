# The docs site is built with `Box` and style props

The docs site's own UI is written with `Box` and style props, not `css({...})` on native elements. The docs app is the standing consumer ([0008](0008-docs-app-is-a-consumer.md)); a site advertising a style-props API without using one is not evidence that the API works.

- Write `<Box as="h2" fontSize="5xl">`, not `<h2 class={css({...})}>`.
- Reach `DocLink`, `<a href>`, `<button type>`, `<svg viewBox>` and `<img src>` through Box's `render` prop: `BoxProps` is `JSX.HTMLAttributes<HTMLElement>` and `as` never re-types it, so those attributes are type errors on `as`.
- A descendant selector into markup we do not author (Shiki's `<pre>`, MDX's `<p>`) is Box's `css` prop, never a module-level class.
