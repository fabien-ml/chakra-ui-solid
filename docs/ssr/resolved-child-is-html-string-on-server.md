# A resolved child is an HTML string on the server

On the server, a child resolved with `children()` is already an HTML **string**, so there is no element left to put a class on. A component that wants to repair a child's spelling (an icon passed as an `<svg>` inside its own wrapper) cannot do it by resolving the child.

Collapsing it on the client only would make the two sides render different trees, which breaks hydration. The wrong spelling stays wrong.
