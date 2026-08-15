// Carried from hope-ui `main` (1dc059f), `packages/internal-test-utils/src/index.ts`. Same author,
// MIT — ours, forked on copy (`CLAUDE.md`, *Reference use*).

export { expectNoA11yViolations } from "./axe";
export type { HydratedComponent } from "./hydrate-fixture";
export { hydrateFixture } from "./hydrate-fixture";
export type { MountedComponent, MountedElement } from "./mount";
export { mount, mountElement } from "./mount";

// `./stylesheet` is **deliberately not re-exported here.** It reads the generated stylesheet off
// disk with `node:fs`, and this barrel is imported by the `browser` project — where a `node:fs`
// import is externalized and throws at module load, taking down every test in the file. It is
// reached as `@chakra-ui-solid/internal-test-utils/stylesheet` instead, from the `ssr` project,
// which is the only project that both runs in Node and has no DOM to compute a style with.
//
// `./render-server` is out for the mirror-image reason: its callers are all in the `ssr` project,
// and this barrel imports the axe helper, which loads `axe-core` — a module that wants a DOM. It is
// reached as `@chakra-ui-solid/internal-test-utils/render-server`.
