# Published packages ship JSX-preserved `.jsx` under the `solid` condition only

The build (tsdown) keeps JSX (`transform.jsx: "preserve"`) and ships `.jsx` plus `.d.ts` under the `solid` export condition, ESM only, one entry per subpath, with no `import` or `default` fallback. The consumer's Solid compiler then compiles our JSX.

**Why:** `tsup`, `esbuild-plugin-solid` and `unplugin-solid` bundle `babel-preset-solid@1.x`, which compiles a JSX `ref` into an import of `use`, a name `@solidjs/web` 2.0 renamed. Any `ref=` in shipped output breaks at load. An `import` fallback would hand a consumer's toolchain the wrong build silently. The legal-comment setting stays pinned in the shared build config, or provenance headers vanish from `dist/`.
