# Three Vitest projects, split by which Solid build resolves

| Project | Environment | Resolves |
|---|---|---|
| `unit` | node | no DOM, no Solid override |
| `ssr` | node | server builds of both `solid-js` and `@solidjs/web` |
| `browser` | real Chromium | client builds; focus, pointer, computed styles, axe, hydration's client half |

The split is not by speed, taste or kind of test. It is by module resolution, a property no `describe` block can express. One alias table is shared by the three. No jsdom ([0042](0042-no-jsdom.md)).
