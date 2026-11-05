# Packages build with tsdown, ESM only

One `tsdown` config per package, extending a shared base, ships JSX-preserved `.jsx` plus `.d.ts` under the `"solid"` export condition, with no `"import"` or `"default"` fallback. ESM only; no CJS build.

The JSX-preserved shape is not stylistic ([0058](0058-publish-shape-jsx-preserved.md)): bundlers that compile JSX themselves (`tsup`, `esbuild-plugin-solid`, `unplugin-solid`) use `babel-preset-solid@1.x`, which compiles a JSX `ref` into an import of `use`, a name `@solidjs/web` 2.0 renamed. Any `ref=` in shipped output breaks at load.

- The styled-system package, `solid-js`, `@solidjs/web` and sibling packages stay external, never inlined.
- The `.d.ts` build keeps `@pandacss/*`, `pkg-types` and `typescript` in `deps.neverBundle`: `rolldown-plugin-dts` throws when bundling `typescript`'s declarations. Recorded because the failure is non-obvious.
- `comments.legal` stays pinned in the shared config: it keeps the `@license` provenance headers from being stripped from `dist/` ([0045](0045-notice-per-package.md)).
- SolidStart consumers need `ssr.noExternal` for the package; document it.
