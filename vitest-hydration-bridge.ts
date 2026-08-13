// Carried from hope-ui `main` (1dc059f), `vitest-hydration-bridge.ts`, with the `@hope-ui/*` alias
// swapped for `chakraSolidAlias` and `HYDRATION_ENTRIES` reduced to the one subject that exists at
// step 2. Same author, MIT — ours, forked on copy (`CLAUDE.md`, *Reference use*).

import { join } from "node:path";
import solid from "@solidjs/vite-plugin";
import { createServer, type Plugin, type ViteDevServer } from "vite";
import { solidPluginOptions } from "./solid-babel-options.ts";
import { chakraSolidAlias, serverBuildAlias } from "./vitest-aliases.ts";

// An always-fresh SSR generation bridge, so a hydration round-trip needs **zero committed fixture
// files** at any component count. A `.html` fixture per subject is snapshot-rot waiting to happen:
// at 40+ components each `_hk`-affecting structural change churns dozens of auto-regenerated files
// that stop being reviewed. (`_hk` is the hydration key — the positional marker Solid matches
// server and client nodes by, so inserting any sibling before a node shifts it.) Instead, the
// `browser` project imports server HTML on demand from a virtual module —
// `import dialogSSR from "virtual:hydration-fixture?id=dialog"` — that this plugin renders
// in-process, fresh each run. No persisted cache (a stale one would be a silent wrong-green), so
// there is nothing to commit and nothing to drift.
//
// The mechanism is vite-inside-vite. Hydration is two environments by definition (server render +
// client hydrate) and no single Vitest project can be both — `ssr` resolves the *server* solid
// builds, `browser` the *client* ones (`testing.md` §1.2, §1.3). This plugin runs in the `browser`
// project (client builds) but spins up one nested Vite SSR server configured exactly like the `ssr`
// project — server-build aliases, `generate: "ssr"`, `ssr.noExternal` — and renders the subject's
// tree through it. Same config in, so the bytes match what the `ssr` project renders, hydration
// keys and all.

const VIRTUAL_ID = "virtual:hydration-fixture";
// Rollup's convention for a virtual module with no file on disk: a leading NUL keeps other plugins
// (and Vite's fs layer) from trying to read/transform it.
const RESOLVED_PREFIX = `\0${VIRTUAL_ID}`;

const repoRoot = import.meta.dirname;

/**
 * Registry mapping a fixture id to the absolute path of its **render entry** module — the single
 * source of truth for that subject's SSR → hydration tree. The entry exports `renderFixture()`
 * (a server render this bridge invokes) and the `Tree` component the `*.ssr.test.tsx` and
 * `*.browser.test.tsx` share. Adding a component means adding one line here and one entry module;
 * no committed fixture file, ever.
 *
 * The first entry is the harness's own probe, which is component-free on purpose
 * (`zag-solid-adapter.md` §6.4). `definition-of-done.md` §2 rule 2.5 puts a round-trip fixture on
 * every shipping component, and `box` is the first of those.
 */
export const HYDRATION_ENTRIES: Record<string, string> = {
  // A component-free keyed tree the `hydrateFixture` helper's own suite hydrates to pin its
  // success and reuse-failure paths against genuine `_hk` markup.
  "hydrate-fixture": join(
    repoRoot,
    "packages/internal-test-utils/src/hydrate-fixture/__tests__/hydrate-fixture.ssr-entry.tsx",
  ),
  // The first *component* subject. Box is where the class string has to survive the round trip:
  // `css()` is pure render-time computation and `hash: false` makes its output stable, so server
  // and client must name the same classes — and if they do not, the element is styled by whichever
  // side won, silently.
  box: join(repoRoot, "packages/chakra-ui-solid/src/components/box/__tests__/box.ssr-entry.tsx"),
  // A `Switch` whose three arms are three different node counts — a `path`, a `polyline`, or
  // nothing — so the branch the server took decides every hydration key after it. It is also the
  // only subject rendering an `svg`, where the presentation style props leave as classes and the
  // two sides have to name the same ones.
  checkmark: join(
    repoRoot,
    "packages/chakra-ui-solid/src/components/checkmark/__tests__/checkmark.ssr-entry.tsx",
  ),
  // Three trees in one, because Button picks its shape from `loading` and `loadingText` and each
  // shape consumes a different number of hydration keys. It is also the only subject that renders
  // a **props context** on the server — `ButtonGroup` supplies the variants from above.
  button: join(
    repoRoot,
    "packages/chakra-ui-solid/src/components/button/__tests__/button.ssr-entry.tsx",
  ),
  // The first subject whose tree is *conditional*. Loader branches on `visible`/`text`/`spinner`
  // and resolves two of them through `children()`, which allocates in the ambient owner rather
  // than at the position it is read — so its hydration keys are exactly the thing that has to
  // match, and the thing no assertion about markup or styles can see.
  loader: join(
    repoRoot,
    "packages/chakra-ui-solid/src/components/loader/__tests__/loader.ssr-entry.tsx",
  ),
  // Conditional too, and the smallest version of it: a checked one renders `span.dot` and an
  // unchecked one renders nothing, so one sibling's state shifts the hydration key of every sibling
  // after it. Its `unstyled` arm is the consumer path — the recipe drops out and the `css` prop is
  // all that names the dot, on both sides.
  radiomark: join(
    repoRoot,
    "packages/chakra-ui-solid/src/components/radiomark/__tests__/radiomark.ssr-entry.tsx",
  ),
  // The first **machine** subject, and the first whose branch is decided by a state machine rather
  // than by a prop the render body reads. Three roots — closed, `defaultOpen`, and `lazyMount` with
  // no content element at all — so the state the machine started in on the server decides the key of
  // everything after it. It is also the first subject calling `createUniqueId()`, three times, off
  // the same counter the `_hk` keys come from.
  collapsible: join(
    repoRoot,
    "packages/chakra-ui-solid/src/components/collapsible/__tests__/collapsible.ssr-entry.tsx",
  ),
  // The first **presence** subject, and the first whose tree is split across two DOM roots. Three
  // closed dialogs — Chakra's defaults (the trigger is all there is), `lazyMount={false}` in place,
  // and `lazyMount={false}` inside a `<Portal>` — so each one contributes a different number of
  // hydration keys, and the `after-portal` sibling proves the Portal costs exactly one aligned child
  // id on both builds. Two presence machines per root run beside the dialog's own.
  dialog: join(
    repoRoot,
    "packages/chakra-ui-solid/src/components/dialog/__tests__/dialog.ssr-entry.tsx",
  ),
  // Conditional on a **count** rather than a boolean: `ColorSwatchMix` renders a `<For>` over two,
  // three or four colours, so each subject consumes a different number of hydration keys and a
  // miscount shifts every sibling after it. It is also the first subject styled through an inline
  // `style` attribute — `--color` is an arbitrary runtime colour, so it cannot be a class — and a
  // server and client that write that string differently leave the swatch painted by whichever side
  // won, with nothing to say so.
  "color-swatch": join(
    repoRoot,
    "packages/chakra-ui-solid/src/components/color-swatch/__tests__/color-swatch.ssr-entry.tsx",
  ),
};

let ssrServerPromise: Promise<ViteDevServer> | undefined;

/**
 * One lazily-created nested SSR Vite server, shared across every fixture id and reused for the whole
 * run. Middleware mode with no HMR/watch/optimizer so it opens no port and holds no file handles that
 * would keep the process alive; its only job is `ssrLoadModule`. Mirrors the `ssr` Vitest project's
 * resolution precisely — the same `serverBuildAlias` plus `ssr.noExternal` (Vite's own equivalent of
 * `server.deps.inline`) that stops `@solidjs/web`'s internal `import ... from "solid-js"` from
 * escaping to the *browser* build and yielding two `solid-js` instances (the "createUniqueId cannot
 * be used outside of a reactive context" failure documented in `vitest.config.ts`).
 */
function getSsrServer(): Promise<ViteDevServer> {
  if (!ssrServerPromise) {
    ssrServerPromise = createServer({
      configFile: false,
      root: repoRoot,
      appType: "custom",
      logLevel: "warn",
      server: { middlewareMode: true, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true, include: [] },
      plugins: [solid(solidPluginOptions({ generate: "ssr", hydratable: true }))],
      resolve: { alias: [...chakraSolidAlias, ...serverBuildAlias] },
      // Must stay in lockstep with the `ssr` project's `server.deps.inline` in `vitest.config.ts`:
      // any pre-compiled Solid dependency we adopt has to be inlined here too. Externalized, its
      // own `import ... from "solid-js"` escapes the server-build alias and resolves a *second*
      // `solid-js` copy, so a render-body compute-form signal skips its hydration id on the server
      // and every `_hk` after it shifts by one — a hydration mismatch three layers from its cause.
      ssr: { noExternal: ["@solidjs/web", "solid-js"] },
    });
  }
  return ssrServerPromise;
}

/**
 * Renders a subject's fixture to genuine server HTML, fresh. Exported so a plain Node script (or a
 * future non-Vitest caller) can drive the same render the virtual module serves.
 */
export async function renderFixtureHtml(id: string): Promise<string> {
  const entry = HYDRATION_ENTRIES[id];
  if (!entry) {
    throw new Error(
      `Unknown hydration fixture id "${id}". Known ids: ${Object.keys(HYDRATION_ENTRIES).join(", ")}. ` +
        "Add a render entry to HYDRATION_ENTRIES in vitest-hydration-bridge.ts.",
    );
  }

  const server = await getSsrServer();
  const mod = (await server.ssrLoadModule(entry)) as { renderFixture?: () => Promise<unknown> };
  if (typeof mod.renderFixture !== "function") {
    throw new Error(
      `${entry} must export a \`renderFixture()\` function for the hydration bridge.`,
    );
  }

  const html = await mod.renderFixture();
  if (typeof html !== "string") {
    throw new Error(
      `renderFixture() in ${entry} returned ${typeof html}, not a string — the nested server must ` +
        "resolve the *server* builds of solid-js and @solidjs/web (renderToStream returns " +
        "undefined on the client build).",
    );
  }
  return html;
}

/**
 * The `browser`-project Vite plugin exposing `virtual:hydration-fixture?id=<subject>`. Its default
 * export is the fresh server HTML string, so a hydration test does
 * `import ssr from "virtual:hydration-fixture?id=dialog"` and feeds it to `hydrateFixture`.
 */
export function hydrationFixtureBridge(): Plugin {
  return {
    name: "chakra-ui-solid:hydration-fixture-bridge",
    resolveId(id) {
      // Keep the `?id=…` query as part of the resolved id so `load` can read it.
      if (id === VIRTUAL_ID || id.startsWith(`${VIRTUAL_ID}?`)) {
        return RESOLVED_PREFIX + id.slice(VIRTUAL_ID.length);
      }
      return undefined;
    },
    async load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) {
        return undefined;
      }
      const query = id.slice(RESOLVED_PREFIX.length);
      const fixtureId = new URLSearchParams(query.replace(/^\?/, "")).get("id");
      if (!fixtureId) {
        throw new Error(
          `Import "${VIRTUAL_ID}" with an ?id=<subject> query, e.g. "${VIRTUAL_ID}?id=dialog".`,
        );
      }
      const html = await renderFixtureHtml(fixtureId);
      return `export default ${JSON.stringify(html)};`;
    },
    async closeBundle() {
      // Release the nested server's handles when the run ends, so the process can exit cleanly.
      if (ssrServerPromise) {
        const server = await ssrServerPromise;
        ssrServerPromise = undefined;
        await server.close();
      }
    },
  };
}
