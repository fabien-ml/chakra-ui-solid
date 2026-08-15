#!/usr/bin/env node

// Writes `packages/chakra-ui-solid/dist/panda.buildinfo.json` — the one library file a consumer
// adds to their Panda `include`, and the last channel that is not decided by their imports.
//
// ~18 components style themselves with an inline `cva` handed to `chakra(tag, config)` rather than
// a named recipe — `stack`, `grid`, `center`, `aspect-ratio`, `visually-hidden` and friends — plus
// direct `css()` / `cx()` calls. None of those values is written in a consumer's source, so their
// extractor can only reach them through ours. A recursive glob over our 129 built files did that
// until now; `panda ship` resolves the same scan once, here, into one file they name by path.
//
// Two properties make the swap more than cosmetic, and both are measured:
//
//   • **The scan cannot be tripped by our own files.** Panda's parser routes a `.json` include
//     straight to `encoder.fromJSON` and never fires `parser:before`, so the import gate in
//     `recipe-gate-plugin.ts` sees only the consumer's own source. With the glob it saw 129 files
//     that all import `@chakra-ui-solid/core`, which meant a consumer whose *source* glob was
//     wrong still looked like a successful scan — the loud "0 components detected" message could
//     not fire, and their app rendered unstyled anyway.
//
//   • **No class name is in the artifact.** Every entry is a `prop / value / cond` hash; the class
//     names are computed later, by the consumer's own config. Shipping from a config with
//     `hash: true` and `separator: "="` produces a byte-identical file, so there is no skew to
//     leak across the published-runtime boundary.
//
// The config is `packages/styled-system/panda.config.ts` itself — the one our published runtime is
// generated from — with only `include` replaced, which `panda ship [glob]` does on the command
// line. Nothing here can drift from it because nothing here restates it.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = join(repoRoot, "packages/chakra-ui-solid");
const outfile = join(packageRoot, "dist/panda.buildinfo.json");

execFileSync(
  join(packageRoot, "node_modules/.bin/panda"),
  ["ship", "dist/**/*.jsx", "--config", "../styled-system/panda.config.ts", "--outfile", outfile],
  { cwd: packageRoot, stdio: "inherit" },
);

// **Recipes come out, and that is the difference between this file and the glob it replaces.**
// Panda records a recipe variant for every `<Spinner size="inherit">` or `<Skeleton>` our own
// components write inside their own JSX, because the preset's recipe bodies carry `jsx` tracking
// hints that match those tags. Replayed into a consumer's build those entries are ungated: a
// Button-only app was getting `colorSwatch`, `skeleton` and `switchRecipe` rules for components it
// never imported — 5,849 bytes of them — and that leak grows with every port.
//
// Nothing is lost by dropping them. Which recipes a consumer's sheet needs is decided by the import
// gate from `component-recipes.ts`, which is derived from the import graph and therefore already
// contains every recipe any imported component can reach, at every variant value.
const buildinfo = JSON.parse(readFileSync(outfile, "utf8"));
writeFileSync(
  outfile,
  `${JSON.stringify({ ...buildinfo, styles: { atomic: buildinfo.styles.atomic } }, null, 2)}\n`,
);

console.log(
  `🐼 chakra-ui-solid  ${buildinfo.styles.atomic.length} style entries → dist/panda.buildinfo.json`,
);
