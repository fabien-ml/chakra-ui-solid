// Carried from hope-ui `main` (1dc059f), `packages/internal-test-utils/src/index.ts`. Same author,
// MIT — ours, forked on copy (`legal.md` §1.6).

export { expectNoA11yViolations } from "./axe";
export type { HydratedComponent } from "./hydrate-fixture";
export { hydrateFixture } from "./hydrate-fixture";
export type { MountedComponent } from "./mount";
export { mount } from "./mount";

// `./stylesheet` is **deliberately not re-exported here.** It reads the generated stylesheet off
// disk with `node:fs`, and this barrel is imported by the `browser` project — where a `node:fs`
// import is externalized and throws at module load, taking down every test in the file. It is
// reached as `@chakra-ui-solid/internal-test-utils/stylesheet` instead, from the `ssr` project,
// which is the only project that both runs in Node and has no DOM to compute a style with.
