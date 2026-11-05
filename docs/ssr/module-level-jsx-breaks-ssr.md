# Module-level JSX breaks SSR

A JSX expression stored in a module-level constant crashes the route: it is built at import time, `ssrHydrationKey()` runs with no render context, and the request dies with `getNextContextId cannot be used under non-hydrating context`.

Solid builds JSX where it is written, not where it is rendered, and module scope is evaluated before any hydration context exists.

## Signature

The stack points at the constant's line, not at the component reading it. In dev the page shows a blank body and a 500; the HTML that reaches the browser carries the error as a serialized object.

## Fix

Store a function (`() => <>…</>`) and call it at the render site.
