# One Solid instance per environment

`solid-js` and `@solidjs/web` each ship a server build. Aliasing only one of them to its server build gives two disagreeing instances, with the renderer walking a client-shaped reactive graph. The symptom is a hydration mismatch far from the cause.

Alias both from one shared module so the two cannot drift apart.
