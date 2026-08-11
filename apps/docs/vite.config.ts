// Adapted from hope-ui `main` (b2df60d), `apps/docs/vite.config.ts`. Same author, MIT — ours,
// forked on copy (`CLAUDE.md`, *Reference use*). What is carried is the **configuration**: every comment below
// that names a crash names one somebody diagnosed there. The Tailwind plugin is dropped (styling
// here is the app's own Panda run) and the alias table is the repo's shared one rather than a
// second copy.

import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import withToc from "@stefanprobst/rehype-extract-toc";
import withTocExport from "@stefanprobst/rehype-extract-toc/mdx";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkSmartypants from "remark-smartypants";
import { defineConfig } from "vite";
import viteSolid from "vite-plugin-solid";
import { solidPluginOptions } from "../../solid-babel-options.ts";
import { exampleSourceHighlighter } from "./highlight-plugin.ts";

// Re-exported, not re-declared. `plan.md` §9 keeps three files as **one unit** — this one,
// `tsconfig.base.json#paths` and `vitest-aliases.ts` — because drift between them is silent: a
// package resolves to a stale sibling `dist/` and everything still builds and still passes.
// `scripts/check-resolution-sync.mjs` imports this name from this file by name, and re-exporting
// the shared array is what makes the three agree by construction rather than by vigilance.
export { chakraSolidAlias } from "../../vitest-aliases.ts";

import { chakraSolidAlias } from "../../vitest-aliases.ts";

const src = fileURLToPath(new URL("./src", import.meta.url));

/**
 * The docs app is a **consumer** — that is the load-bearing part, not an incidental one
 * (`docs-site.md` §1.1). It imports our packages by name, writes its own `panda.config.ts` from
 * `defineChakraConfig()`, and runs its own Panda build. Take any of those shortcuts away and the site
 * stops being evidence and becomes decoration, which is what `check:docs-consumer-config` exists
 * to prevent.
 *
 * Four knobs below are not preferences. Each is here because getting it wrong produces a failure
 * whose message names the wrong cause (`docs-site.md` §1.2), and each carries the failure it
 * prevents.
 */
export default defineConfig(({ command }) => ({
  server: { port: 3000 },

  // KNOB 1 — `ssr.noExternal`.
  //
  // We publish **JSX-preserved `.jsx`** under the `"solid"` export condition, with no `"import"`
  // or `"default"` fallback (`plan.md` §8). Node cannot import raw JSX, so the prerender pass has
  // to inline our packages and compile them rather than externalize them. Externalized, every
  // route dies at build time with a syntax error pointing inside *our* `dist` — which reads as a
  // broken package rather than as a missing line in this file.
  ssr: {
    noExternal: [/^@chakra-ui-solid\//],
  },

  optimizeDeps: {
    // KNOB 2 — `optimizeDeps.exclude`.
    //
    // The client build's dependency pre-bundler compiles JSX **as React**. A pre-bundled
    // `@chakra-ui-solid/components` therefore produces a runtime that is not Solid, and the
    // symptom is a component that renders nothing at all — no error, no warning. Same fact as
    // knob 1 seen from the client side: shipping source moves work into the consumer's build,
    // which is `plan.md` §8's deliberate trade and this app is its first proof.
    exclude: [
      "@chakra-ui-solid/components",
      "@chakra-ui-solid/system",
      "@chakra-ui-solid/styled-system",
      "@chakra-ui-solid/zag-solid",
    ],
    // Carried from hope-ui, where it was diagnosed rather than guessed: Vite 8's rolldown
    // dependency **scanner** runs with JSX disabled, so it throws `Unexpected JSX expression` the
    // moment it walks into any first-party `.tsx`/`.mdx` source. At startup Vite catches that and
    // silently skips pre-bundling, but the automatic re-discovery that fires whenever an edit
    // introduces a new import re-runs the same scan mid-session — and *that* takes the dev server
    // down. The symptom is "dev crashes after every change; a restart fixes it". This app is
    // SSG-first and runs fine with pre-bundling off, so no scan, no crash.
    noDiscovery: true,
  },

  resolve: {
    // Dev resolves to `src`, build resolves to `dist` (`docs-site.md` §1.3). In `serve` the
    // library hot-reloads from source while the docs are being written; in `build` these are
    // **omitted**, so resolution falls through `node_modules` → package `exports` → `dist` under
    // the `"solid"` condition. That split is what makes a docs example a consumer test rather
    // than a second in-repo test, and `check:docs-consumer-config` asserts the `build` branch
    // stays empty.
    //
    // `@rollup/plugin-alias` takes the first match, so ours precede the `~` alias. Vite's native
    // `tsconfigPaths` rewrites `~/…` only for TS/JS importers and not for imports originating
    // inside an `.mdx` file, so `~` is declared explicitly here rather than inherited.
    alias: [
      ...(command === "serve" ? chakraSolidAlias : []),
      { find: /^~\//, replacement: `${src}/` },
    ],
  },

  plugins: [
    // Example sources, highlighted at build time. See the plugin — the reason it is not a
    // browser-side highlighter is `plan.md` §0, not performance.
    exampleSourceHighlighter(),

    // KNOB 3 — `mdx()` at `enforce: "pre"`, **before** `vite-plugin-solid`.
    //
    // MDX has to emit JSX (`jsx: true`) for the Solid compiler to compile it. Compiled the other
    // way round we get MDX's own hyperscript shim instead of the real Solid runtime, and the
    // symptom is prose that renders with none of the reactivity or context around it working.
    {
      enforce: "pre",
      ...mdx({
        // Emit JSX for `vite-plugin-solid` below. `providerImportSource` supplies real Solid
        // components for intrinsic tags — MDX's defaults map each tag to a *string* (`h1: "h1"`),
        // which a React-style `jsx()` runtime can call and Solid's compiler cannot.
        jsx: true,
        providerImportSource: "~/mdx-components",
        // MDX defaults element attributes to REACT casing, which rewrites the `class` that
        // rehype-pretty-code/Shiki emit into `className`. Under the Solid compiler `className`
        // becomes a literal attribute, so every Shiki selector silently fails to match and
        // highlighting is invisible with no error anywhere. Both settings affect only
        // markdown-derived HTML, never author-written JSX.
        elementAttributeNameCase: "html",
        stylePropertyNameCase: "css",
        // `remarkFrontmatter` tokenizes the `---` block so it stops being rendered as prose;
        // `remarkMdxFrontmatter` turns it into `export const frontmatter`, which is what
        // `~/lib/site-map` reads for a page's title, description and outward links. The pair has
        // to run before smartypants, or the quotes inside the YAML get curled into invalid YAML.
        //
        // A page's `title` lives here rather than in an `# H1`, because the header component
        // renders it (`docs-plan.md` §8.1) — an `# H1` in the body would print it twice.
        //
        // `remarkGfm` is the table, the strikethrough and the task list — the markdown a reader
        // writing a page assumes they have. Without it a pipe table is not a table at all: it is
        // parsed as a paragraph and printed with its pipes showing. chakra-ui.com runs it too.
        remarkPlugins: [
          remarkFrontmatter,
          remarkMdxFrontmatter,
          remarkGfm,
          [remarkSmartypants, { dashes: false }],
        ],
        // Highlighting is **Shiki at build time**, baked into the compiled module. A client-side
        // highlighter would ship a highlighter to every reader for content that never changes,
        // and — the reason that belongs to this project — most of them create a `<style>` element
        // on first render, which is precisely what `plan.md` §0 forbids of our own code, on the
        // most visible page in the project (`docs-site.md` §1.4).
        //
        // `rehypePrettyCode` is order-independent; the slug → extract → export chain is strictly
        // ordered: `rehypeSlug` adds heading ids, `withToc` collects them, `withTocExport` emits
        // `export const tableOfContents` from the MDX module so the table of contents is a module
        // export rather than something computed in the browser.
        rehypePlugins: [
          [
            rehypePrettyCode,
            { theme: { light: "github-light", dark: "github-dark" }, keepBackground: false },
          ],
          rehypeSlug,
          withToc,
          withTocExport,
        ],
      }),
    },

    // KNOB 4 — `tanstackStart({ prerender })` with `failOnError`.
    //
    // Full-document SSR of every route into static HTML. **Not** SPA mode, which prerenders a
    // client-hydrated shell: the prose would be absent from the HTML, which costs search indexing,
    // costs readers on slow connections the whole page, and — the loss that is ours alone — makes
    // the site stop being evidence that our packages server-render at all (`docs-site.md` §1.5).
    //
    // `failOnError` is the difference between a broken route and a silently missing page.
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true, failOnError: true },
    }),

    // `compiler: "babel"` is a workaround with a stated expiry, pinned for **this app alone**.
    // Since `vite-plugin-solid@3.0.0-next.23` the default JSX backend is a native (Rust/oxc)
    // compiler that picks its parser dialect from the file extension. The plugin knows custom
    // `extensions` are unknown to it and rewrites the name (`id + ".jsx"`) for its
    // `transformLazyAsync`/`transformRefreshAsync` passes, but the JSX pass itself is still handed
    // the raw `id`, so every `.mdx` module dies with "Unknown file extension". Babel takes its
    // dialect from `parserOpts.plugins` and does not care about the extension.
    //
    // **Drop this the day the JSX pass uses the same normalized filename as its siblings.** Only
    // this app is affected — nothing under `packages/` is `.mdx`, so the library's own tests and
    // Storybook stay on the native backend a real consumer gets by default.
    viteSolid({ ...solidPluginOptions(), ssr: true, extensions: [".mdx"], compiler: "babel" }),
  ],
}));
