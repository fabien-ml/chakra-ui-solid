#!/usr/bin/env node

// Writes `apps/docs/src/routeTree.gen.ts`, which TanStack Router generates from the files under
// `apps/docs/src/routes/` and overwrites on every run — so it is never committed, and a fresh
// checkout has no route tree at all until something generates one.
//
// Only the `tanstackStart` Vite plugin generates it, and only `vite dev`/`vite build` run that
// plugin. `verify` runs neither: it goes straight to `pnpm typecheck`, which is why CI failed on a
// file no job had produced —
//
//   src/router.tsx(3,27): error TS2307: Cannot find module './routeTree.gen'
//   src/routes/index.tsx(12,38): error TS2345: Argument of type '"/"' is not assignable to
//     parameter of type 'undefined'
//
// — where only the first line names the cause. The rest are `createFileRoute` type-checking route
// ids against a registry no module declared.
//
// **The generator here is the app's own dev server, not a second implementation of it.** Creating
// one runs the plugin's `buildStart`, which writes the tree and returns; closing it immediately
// costs ~1s and no request is ever served. The alternative — `@tanstack/router-cli`'s `tsr
// generate` — is a dependency that reads its own `tsr.config.json`, defaults to `target: "react"`,
// and emits no `Register` footer, so its output and the plugin's would overwrite each other on
// every dev run. Going through the real config means the file this writes is byte-identical to the
// one `pnpm build:docs` writes, which is the property that keeps `typecheck` honest.

import { createServer } from "vite";

const docsRoot = new URL("../apps/docs", import.meta.url);

const server = await createServer({
  root: docsRoot.pathname,
  logLevel: "warn",
  // Middleware mode with no HMR and no watcher: nothing binds a port and nothing holds a file
  // handle open, so the process exits on its own once the tree is written.
  server: { middlewareMode: true, hmr: false, watch: null },
});
await server.close();

console.log("route-tree — apps/docs/src/routeTree.gen.ts");
