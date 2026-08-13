// Carried from hope-ui `main` (1dc059f), `vitest-aliases.ts`, with the `@hope-ui/*` table replaced
// by an empty `@chakra-ui-solid/*` one. Same author, MIT — ours, and forked on copy
// (`CLAUDE.md`, *Reference use*).

import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

// The workspace → src and `solid-js`/`@solidjs/web` → server-build aliases, extracted
// into their own module so that `vitest.config.ts`'s three projects — and, from step 2, the
// hydration-fixture bridge — are consumers of the *same* arrays rather than four copies that can
// drift. `plan.md` §9's "always resolve to src, never a sibling's dist" invariant lives here.
// Nothing holds this file and `tsconfig.base.json#paths` together any more — `check:resolution-sync`
// did until `76382c5` deleted it — so the two are kept in step by hand.

const requireFromRoot = createRequire(join(import.meta.dirname, "package.json"));

/**
 * `solid-js` and `@solidjs/web` each ship two builds: a server one (string-producing SSR ops,
 * `isServer: true`, `createUniqueId` consuming a hydration child id) and a browser one (real DOM
 * ops). `package.json#exports` picks between them with the `node` / `browser` conditions.
 *
 * **Neither direction is reachable through `resolve.conditions`, and both had to be measured.**
 * Setting `resolve.conditions` / `ssr.resolve.conditions` to `["node"]` on a node project did not
 * pull in the server build (measured in hope-ui); setting them to Vite's `defaultClientConditions`
 * does not pull in the browser build either (measured here, at the rc bump) — a Vitest project's
 * top-level `resolve.conditions` is not what `@solidjs/vite-plugin`'s `configEnvironment` hook
 * reads. An explicit alias to the entry you want is what actually works, in both directions.
 *
 * `createRequire().resolve()` applies Node's `node` + `require` conditions, so it lands on the
 * CommonJS server entry; its ESM sibling sits beside it and is what a real SSR bundler picks.
 */
export function resolveServerEntry(packageName: string): string {
  const cjsServerEntry = requireFromRoot.resolve(packageName);
  const esmServerEntry = cjsServerEntry.replace(/\.cjs$/, ".js");

  if (esmServerEntry === cjsServerEntry || !existsSync(esmServerEntry)) {
    throw new Error(
      `Could not locate the ESM server build for "${packageName}". Resolved ${cjsServerEntry}, ` +
        `expected an ESM sibling at ${esmServerEntry}. Check the package's #exports map — the ` +
        `"ssr" Vitest project silently renders against the browser build without this.`,
    );
  }
  return esmServerEntry;
}

/**
 * The other half: the **client** build's dev entry, which sits beside the server one.
 *
 * Needed because `@solidjs/vite-plugin@3.0.0-next.24` started deriving a *server test posture*
 * from `test.environment` — `environment: "node"` or `"edge-runtime"` now means "resolve the
 * framework's server build". The `unit` project is `node` for a reason that has nothing to do with
 * SSR (no `document` at all, so a focus or computed-style test cannot be written there by
 * accident), and it needs client semantics: deferred writes, a real `flush()`, real effects.
 *
 * The failure is silent in the way this repo keeps meeting: the server build has no scheduler, so
 * writes land eagerly and `flush(fn)` does nothing. Nothing errors — assertions about *ordering*
 * just come out wrong, in files whose names are `bindable`, `track` and `mergeProps` rather than
 * anything about resolution.
 *
 * `dev` rather than `solid`: a test run is a dev-mode client build, which is what
 * `@solidjs/vite-plugin` resolves for the `browser` project through the `development` condition.
 */
export function resolveClientDevEntry(packageName: string): string {
  const serverEntry = resolveServerEntry(packageName);
  const clientDevEntry = serverEntry.replace(/server\.js$/, "dev.js");

  if (clientDevEntry === serverEntry || !existsSync(clientDevEntry)) {
    throw new Error(
      `Could not locate the client dev build for "${packageName}". Resolved ${serverEntry}, ` +
        `expected a sibling at ${clientDevEntry}. Check the package's dist layout — the "unit" ` +
        `Vitest project silently runs against the server build without this, where writes are ` +
        `eager and flush() is inert.`,
    );
  }
  return clientDevEntry;
}

/**
 * Workspace packages resolve to `src`, never to a sibling's `dist`.
 *
 * A package-resolved import of one of ours reads the sibling's *built* output, so editing
 * that sibling's source has no effect on its dependants' tests until it is rebuilt. hope-ui hit
 * this directly: a fix was edited, the owning package's own tests went green, and the dependant's
 * tests kept failing identically against the stale pre-fix `dist`.
 *
 * Every entry here owes a matching `tsconfig.base.json#paths` entry **in the same commit**, and
 * since `check:resolution-sync` was deleted nothing but review says so. Every package here has a
 * root barrel and no subpaths, so these are exact-anchored matches rather than wildcards — an
 * unanchored `find` would also capture `@chakra-ui-solid/core-something`.
 *
 * `@chakra-ui-solid/styled-system` and `@chakra-ui-solid/panda-preset` are absent on purpose:
 * neither has a `src` to point at. The long form of both reasons is in `tsconfig.base.json`,
 * beside the paths this list has to agree with.
 */
export const chakraSolidAlias: { find: RegExp; replacement: string }[] = [
  {
    find: /^@chakra-ui-solid\/core$/,
    replacement: join(import.meta.dirname, "packages/core/src/index.ts"),
  },
  {
    find: /^chakra-ui-solid$/,
    replacement: join(import.meta.dirname, "packages/chakra-ui-solid/src/components/index.ts"),
  },
  {
    find: /^@chakra-ui-solid\/internal-test-utils$/,
    replacement: join(import.meta.dirname, "packages/internal-test-utils/src/index.ts"),
  },
  {
    find: /^@chakra-ui-solid\/internal-test-utils\/stylesheet$/,
    replacement: join(import.meta.dirname, "packages/internal-test-utils/src/stylesheet/index.ts"),
  },
];

/**
 * The docs app's own `~/…` → `apps/docs/src/…` alias, mirrored from `apps/docs/vite.config.ts`.
 *
 * Without it the `browser` project can mount only those docs components that happen to import
 * nothing through `~` — which is 6 files out of 23, and is why the docs app's one component test
 * covers `prose.tsx` and nothing else. A component nobody can mount is a component whose bugs are
 * found on the page, which is how a props table shipped with two unlabelled tables.
 *
 * Scoped to the `~/` prefix, which only this repo's docs app uses, so it cannot capture a package
 * import.
 */
export const docsSrcAlias = [
  { find: /^~\//, replacement: `${join(import.meta.dirname, "apps/docs/src")}/` },
];

export const serverBuildAlias = [
  { find: /^solid-js$/, replacement: resolveServerEntry("solid-js") },
  { find: /^@solidjs\/web$/, replacement: resolveServerEntry("@solidjs/web") },
];

/** The mirror of `serverBuildAlias`, for the one project that is `node` but wants client Solid. */
export const clientBuildAlias = [
  { find: /^solid-js$/, replacement: resolveClientDevEntry("solid-js") },
  { find: /^@solidjs\/web$/, replacement: resolveClientDevEntry("@solidjs/web") },
];
