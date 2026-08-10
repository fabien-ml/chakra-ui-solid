// Carried from hope-ui `main` (1dc059f), `tsdown.config.base.ts`, with `deps.neverBundle`
// re-scoped to this repo and extended with the Panda tail. Same author, MIT — ours, forked on
// copy (`CLAUDE.md`, *Reference use*).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type UserConfig } from "tsdown";

interface PackageJson {
  /** The per-subpath entry map, e.g. `{ ".": "src/index.ts", "collection": "src/collection/index.ts" }`. */
  chakraUiSolid?: { entries?: Record<string, string> };
}

export interface TsdownOptions {
  /**
   * Who loads the built output, which decides the file extension and therefore the export
   * condition the package can offer.
   *
   * - `"solid"` (default) — a Solid app. Ships JSX-preserved `.jsx` under the `"solid"` condition
   *   so the consumer's own compiler produces server and client output per environment.
   * - `"node"` — a **build tool**, not an app. `@chakra-ui-solid/panda-preset` is read by Panda's
   *   config loader, which resolves under Node's `import` condition; a package offering only
   *   `"solid"` is unresolvable there, and the JSX rationale does not apply because a Panda preset
   *   is a plain object with no JSX in it.
   */
  loadedBy?: "solid" | "node";
}

/**
 * Shared tsdown build config for every publishable `@chakra-ui-solid/*` package.
 *
 * We ship **JSX-preserved source** only, under the `"solid"` export condition, with no
 * `"import"` / `"default"` fallback: the consumer's own `vite-plugin-solid` compiles each element
 * per environment (server `ssr`, client `dom` + hydrate), which is what "works in SolidStart"
 * requires. The rationale is not stylistic — `tsup` / `esbuild-plugin-solid` / `unplugin-solid`
 * bundle `babel-preset-solid@1.x`, which compiles a JSX `ref` into an import of `use`, a name
 * `@solidjs/web` 2.0 renamed to `ref`/`applyRef`. Any `ref=` in shipped output breaks at load
 * (`plan.md` §8).
 *
 * tsdown (rolldown + oxc) is used with `transform.jsx: "preserve"`: oxc's parser keeps JSX intact
 * while rolldown leaves the externals below alone. No Solid compiler runs here at all, so the
 * `babel-preset-solid@1.x` hazard does not apply to a preserve-only build.
 *
 * Entries come from `package.json`'s `chakraUiSolid.entries`; one `dist/<name>/index.jsx` (source)
 * plus `dist/<name>/index.d.ts` (types) per subpath.
 */
export function createTsdownConfig(packageDir: string, options: TsdownOptions = {}): UserConfig {
  const loadedBy = options.loadedBy ?? "solid";
  const pkg = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as PackageJson;

  const entries = pkg.chakraUiSolid?.entries;
  if (entries === undefined) {
    throw new Error(`createTsdownConfig: ${packageDir}/package.json has no chakraUiSolid.entries`);
  }

  // One tsdown entry per subpath: `collection` (src/collection/index.ts) → the output key
  // `collection/index`, which under `outDir: dist` + the `.jsx` extension lands at
  // `dist/collection/index.jsx`, with its bundled `dist/collection/index.d.ts` beside it. A `.`
  // entry name is the package root → output key `index` → `dist/index.jsx`.
  const entry = Object.fromEntries(
    Object.entries(entries).map(([name, relativePath]) => [
      name === "." ? "index" : `${name}/index`,
      relativePath,
    ]),
  );

  return defineConfig({
    entry,
    format: "esm",
    platform: loadedBy === "node" ? "node" : "browser",
    outDir: join(packageDir, "dist"),
    deps: {
      // Externals, in three groups, each for its own reason:
      //
      // - Solid and every `@chakra-ui-solid/*` sibling, so the consumer resolves them — each
      //   sibling via *its own* `"solid"` condition. Applies to the **dts** build too, so the
      //   emitted declarations reference siblings by bare specifier, never a src path.
      //   `@chakra-ui-solid/styled-system` is the load-bearing member: inlined, the library and
      //   the consumer app end up with two `css` runtime instances, silently (`plan.md` §4.3).
      // - `@zag-js/*`, the machine packages. Bundling them would duplicate a machine per
      //   component and detach it from the consumer's own copy.
      // - The Panda tail — `@pandacss/*`, `pkg-types`, `typescript`. This one is not obvious and
      //   cost a day in hope-ui to rediscover: `styled-system`'s types drag in `@pandacss/types`
      //   → `pkg-types` → `typescript`, and **rolldown-plugin-dts throws bundling `typescript`'s
      //   declarations**. hope-ui had to inline styled-system's types because consumers could not
      //   resolve a private package; publishing `styled-system` removes that cause, so the `.d.ts`
      //   can reference it by bare specifier — provided these three stay external.
      neverBundle: [
        /^solid-js/,
        /^@solidjs\//,
        /^@chakra-ui-solid\//,
        /^@zag-js\//,
        /^@pandacss\//,
        /^pkg-types$/,
        /^typescript$/,
      ],
    },
    // Ship source: keep JSX for the consumer's per-environment compile.
    inputOptions(options) {
      options.transform = { ...options.transform, jsx: "preserve" };
      return options;
    },
    // No `.jsx.map`: a source map of shipped source would point at the unshipped `.tsx`.
    // (Declaration maps are off via `declarationMap: false` in each package's tsconfig, for the
    // same tarball reason — `files: ["dist"]` would not contain the mapped sources.)
    //
    // `comments.legal` is pinned rather than left to rolldown's default because it carries a
    // license obligation. We ship JSX-preserved **source**, and rolldown strips every unmarked
    // block comment — so an `@license` header on a derivative file vanishes from `dist/` and the
    // published package becomes an unattributed derivative of the project we are porting, with a
    // green build. Unpinning this is a one-word edit nobody reviews, which is why
    // `check:license-headers` asserts the setting *and this comment* are still here
    // (`CLAUDE.md` obligation 5; `testing.md` §9).
    outputOptions(options) {
      options.sourcemap = false;
      options.comments = {
        ...(typeof options.comments === "object" ? options.comments : {}),
        legal: true,
      };
      return options;
    },
    outExtensions: () => ({ js: loadedBy === "node" ? ".js" : ".jsx" }),
    dts: true,
    sourcemap: false,
    // Bundle each subpath into one `.jsx`, with common code deduped into shared `.jsx` chunks the
    // entries import relatively — the consumer's compiler handles those the same as the entries.
    unbundle: false,
  }) as UserConfig;
}
