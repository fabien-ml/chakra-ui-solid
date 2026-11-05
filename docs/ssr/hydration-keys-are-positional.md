# Hydration keys are positional

Solid stamps a positional key (`_hk`) on server-rendered nodes and matches against it on hydration. The key is a path through the component tree, and `createUniqueId` draws from the same counter. So **anything that changes how many nodes a subtree allocates changes every key after it**, and a miscount lands every later node on the wrong marker, silently.

## Consequences

| Case | Effect |
|---|---|
| a structural difference between server and client trees, even a component that renders nothing | shifts keys and breaks hydration; the client tree in a test must be the same `Tree` the server rendered |
| a Root wrapping its children in a host element | shifts the Trigger's key against a consumer's own markup; a Root renders providers only |
| `children()` | allocates ahead of the surrounding element, so adding or removing one shifts keys for that subtree |
| a `<Show>` inside a Portal-guarded subtree | consumes no server key, since the subtree never renders on the server |
| a class-string computation (`recipeClass`) | not a node, cannot move a key; keep style resolution free of DOM, effects and generated ids |
| a repeated part | allocates N keys; one more or fewer node per item misplaces every later key |

## Proof

Every `children()` added or removed, and every repeated part, owes a real server-render and hydrate round-trip with a non-trivial item list (several items, a checked one). A one-item smoke test does not count.
