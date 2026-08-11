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
 * Vite's default `resolve.conditions` includes `browser` **regardless of Vitest's
 * `test.environment`** — that setting only swaps JS globals like `document`, never package
 * `#exports` resolution. Confirmed empirically in hope-ui: setting `resolve.conditions` /
 * `ssr.resolve.conditions` to `["node"]` on a node project did *not* change which build was
 * resolved. An explicit alias to the server entry is what actually works.
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

export const serverBuildAlias = [
  { find: /^solid-js$/, replacement: resolveServerEntry("solid-js") },
  { find: /^@solidjs\/web$/, replacement: resolveServerEntry("@solidjs/web") },
];
