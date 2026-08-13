// Adapted from hope-ui `main` (b2df60d), `.storybook/main.ts`. Same author, MIT — ours, forked on
// copy (`CLAUDE.md`, *Reference use*). The Tailwind plugin is dropped (our dev stylesheet comes from Panda, and
// `preview.ts` imports it) and the alias table is the repo's shared one rather than a second copy.

import solid from "@solidjs/vite-plugin";
import type { StorybookConfig } from "storybook-solidjs-vite";
import type { PluginOption } from "vite";
import { solidPluginOptions } from "../solid-babel-options.ts";
import { chakraSolidAlias } from "../vitest-aliases.ts";

// Storybook is a **local playground**, never user-facing docs and never a CI gate — the docs site is
// a separate deliverable in `apps/docs`, and nothing automated opens a story (`testing.md` §7;
// D-133). So: no addons, no MDX authoring, no deployed build, no visual-regression suite. Kept to
// what it takes to run `pnpm storybook` and look at a component.
const config: StorybookConfig = {
  stories: ["../packages/*/src/**/*.stories.@(ts|tsx)"],
  framework: { name: "storybook-solidjs-vite", options: {} },
  viteFinal(config) {
    // `storybook-solidjs-vite`'s framework preset has already put its own compiler in this config,
    // with default options, before we see it — it does a literal `await import("vite-plugin-solid")`,
    // which is the *only* reason that renamed shim is still a dependency (`pnpm-workspace.yaml`).
    // Adding a second one would compile every file twice; swapping it for ours is what gets
    // `solid-babel-options.ts` — one declaration of how this repo compiles JSX, shared with the
    // three Vitest projects and the docs app. The default in particular leaves `solid-refresh`
    // enabled, which silently drops `children` for a component imported from another module, i.e.
    // exactly what every story does.
    //
    // Both names are the same plugin and both still emit `name: "solid"`, so this filter removes
    // the preset's copy whichever specifier loaded it.
    const plugins = (config.plugins ?? []).filter(
      (plugin) =>
        !(plugin && typeof plugin === "object" && "name" in plugin && plugin.name === "solid"),
    ) as PluginOption[];
    plugins.push(solid(solidPluginOptions()));

    // `@chakra-ui-solid/*` resolves to `src`, never to a sibling's `dist` — the same invariant the
    // Vitest projects and the docs app's dev server hold, from the same array, so a story cannot
    // exercise the last build while its source sits edited beside it (`plan.md` §9).
    //
    // Storybook hands us `resolve.alias` in whichever shape its own presets left it, so normalize
    // to the array form a regex `find` requires and put ours first (`@rollup/plugin-alias` takes
    // the first match).
    const existingAlias = config.resolve?.alias;
    const aliasArray = Array.isArray(existingAlias)
      ? existingAlias
      : Object.entries(existingAlias ?? {}).map(([find, replacement]) => ({ find, replacement }));

    return {
      ...config,
      plugins,
      resolve: { ...config.resolve, alias: [...chakraSolidAlias, ...aliasArray] },
    };
  },
};

export default config;
