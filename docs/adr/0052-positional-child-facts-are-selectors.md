# A positional fact about a child is a selector, not an attribute

React's `data-first`, `data-last` and `--group-index` exist because a parent that cannot reach a child turns positions into props via `Children.toArray` and `cloneElement`. Positions are structural and CSS selects on them natively, so a group spells them as `:nth-child(1 of :not([data-group-skip]))` and ships no effect. An effect-based route leaves square corners for a frame, because the seam is in the server's first byte.

An out-of-flow child marks itself (`data-group-skip`) rather than needing a skip predicate on the parent. Reach for decoration only for a fact CSS cannot see, and know that Solid cannot clone children even then: by the time a parent sees a child it is a constructed DOM node, so the route is `children()` plus a render effect writing onto resolved nodes, which costs SSR.
