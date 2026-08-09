// Carried from hope-ui `main` (1dc059f), `vitest.config.ts`, with the globs lifted into
// `vitest-projects.ts` so `check:test-projects` reads the same declaration. Same author, MIT —
// ours, forked on copy (`legal.md` §1.6).

import { playwright } from "@vitest/browser-playwright";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";
import { solidPluginOptions } from "./solid-babel-options.ts";
import { chakraSolidAlias, serverBuildAlias } from "./vitest-aliases.ts";
import { hydrationFixtureBridge } from "./vitest-hydration-bridge.ts";
import { testProjects } from "./vitest-projects.ts";

// Three projects, one job each, and **the split is by which build of Solid the project
// resolves** — not by speed, taste, or test kind (`testing.md` §1). A two-project layout puts
// pure-logic and SSR tests together, which forces a module-resolution compromise that silently
// renders every SSR test against half the wrong build.
//
//   unit     node, no DOM.      Pure logic. Client builds (real effects, deferred writes).
//   ssr      node, no DOM.      Server output. Server builds of solid-js *and* @solidjs/web.
//   browser  real Chromium.     DOM/focus/pointer/computed styles/axe, and hydration.

// Opts a node project out of `vite-plugin-solid`'s automatic jest-dom injection, which otherwise
// breaks the project the moment any devDependency drags `@testing-library/jest-dom` into the
// graph. The file's *name* is what does the opting out — see the comment inside it. The browser
// project needs no such guard: the plugin already skips it.
const jestDomOptOut = ["./vitest.setup.jest-dom-optout.ts"];

const projectGlobs = (name: (typeof testProjects)[number]["name"]) => {
  const project = testProjects.find((candidate) => candidate.name === name);
  if (project === undefined) {
    throw new Error(`vitest-projects.ts declares no project named "${name}".`);
  }
  return { include: project.include, exclude: project.exclude };
};

export default defineConfig({
  test: {
    // No `passWithNoTests`: with it on, deleting every unit test keeps CI green.
    projects: [
      {
        // Client DOM compile, no hydration keys — pure logic, no DOM rendered here anyway.
        plugins: [solid(solidPluginOptions())],
        resolve: { alias: chakraSolidAlias },
        test: {
          name: "unit",
          // `node`, not `jsdom`, and deliberately: jsdom cannot be trusted for focus, keyboard or
          // pointer behavior, and its `getComputedStyle` returns the cascade it was told about —
          // precisely the thing under test (`testing.md` §1.3). With no `document` at all it is
          // *impossible* to write such a test here by accident, rather than merely discouraged.
          environment: "node",
          ...projectGlobs("unit"),
          setupFiles: jestDomOptOut,
        },
      },
      {
        // The SSR project: compile JSX to **server** templates (`generate: "ssr"`) and run against
        // the **server** builds of Solid — the only faithful way to test what a server sends.
        // Without this it compiles DOM templates (a hoisted `_$template()`) that throw at import
        // under the server runtime. `hydratable: true` emits the `_hk` hydration keys the browser
        // project claims, and it is set here and nowhere else.
        plugins: [solid(solidPluginOptions({ generate: "ssr", hydratable: true }))],
        // The only project that resolves the server builds. **Both** of them — aliasing
        // `@solidjs/web` alone leaves `solid-js` on its browser build, and the two disagree about
        // `createUniqueId`, which allocates the hydration child ids. That hybrid is why hydration
        // round-trips appeared impossible for months in hope-ui (`testing.md` §1.2).
        resolve: { alias: [...chakraSolidAlias, ...serverBuildAlias] },
        test: {
          name: "ssr",
          environment: "node",
          ...projectGlobs("ssr"),
          setupFiles: jestDomOptOut,
          // Without this, `@solidjs/web` is externalized and loaded by Node directly, so its own
          // `import { createRoot, getOwner } from "solid-js"` never sees the alias above — Node
          // resolves it to the *browser* build. The result is two `solid-js` instances with two
          // separate `currentOwner`s, and every `createUniqueId()` throws "cannot be used outside
          // of a reactive context" because the owner was set on the other copy. Inlining routes
          // those imports back through Vite's resolver.
          //
          // The same trap one level out applies to any pre-compiled Solid dependency we adopt: an
          // externalized dep's own `import { createSignal } from "solid-js"` bypasses the
          // server-build alias, so a render-body compute-form signal fails to consume its
          // hydration id on the server and every subsequent `_hk` shifts by one. Add such a dep
          // here when one arrives.
          server: { deps: { inline: ["@solidjs/web", "solid-js"] } },
        },
      },
      {
        // Client DOM compile, but `hydratable: true` so `hydrate()` can claim the server-rendered
        // nodes (the SSR project emits matching `_hk` keys) instead of re-creating them.
        //
        // `hydrationFixtureBridge` serves `virtual:hydration-fixture?id=<subject>` — genuine server
        // HTML rendered fresh in-process by a nested SSR Vite server, so a hydration round-trip
        // needs no committed `.html` fixture at any component count. See
        // `vitest-hydration-bridge.ts`.
        plugins: [solid(solidPluginOptions({ hydratable: true })), hydrationFixtureBridge()],
        resolve: { alias: chakraSolidAlias },
        test: {
          name: "browser",
          ...projectGlobs("browser"),
          // The generated stylesheet, without which every `getComputedStyle` assertion here reads
          // UA defaults and passes nothing. Shared with `.storybook/preview.ts`, which needs the
          // same two lines for the same reason. See the file.
          setupFiles: ["./dev-stylesheet.ts"],
          browser: {
            enabled: true,
            // Headless everywhere (locally and in CI): CI installs only the
            // "chromium-headless-shell" build (`playwright install --with-deps --only-shell`),
            // which Playwright only picks up when headless is on.
            headless: true,
            // `--hide-scrollbars` is Playwright's own default for *every* headless launch, and it
            // collapses the classic scrollbar gutter to nothing: `window.innerWidth -
            // documentElement.clientWidth` measures 0 with the document overflowing. That is the
            // exact quantity a scroll lock compensates, so its arithmetic branch is unreachable
            // and silently untested — and the gutter is what a real desktop reader has. Dropping
            // the arg restores a 15px gutter in the headless *shell* build CI installs (measured
            // in hope-ui), so this is not a full-Chromium-only capability. `ignoreDefaultArgs`
            // filters by exact string match.
            provider: playwright({
              launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] },
            }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
