/**
 * Reading the generated stylesheet, for the checks that ask a question only the emitted CSS can
 * answer — the preflight rule, the colour-mode selector, the token-resolution probe.
 *
 * They read the sheet rather than the config for the same reason the tests assert computed styles
 * rather than class names: what a config *declares* and what Panda *emits* are two different
 * things, and every failure mode this repo tracks lives in the gap between them.
 */

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

/** The dev stylesheet `cssgen` writes. Never published — it is a test and Storybook artifact. */
export function generatedStylesheetPath(repoRoot) {
  const require = createRequire(join(repoRoot, "packages/styled-system/package.json"));
  const packageRoot = dirname(require.resolve("@chakra-ui-solid/styled-system/package.json"));
  return join(packageRoot, "styled-system", "styles.css");
}

/**
 * The docs app's sheet — **a second Panda run, over a consumer's config and a consumer's source**
 * (`apps/docs/panda.config.ts`). It carries what our own dev sheet cannot: the style props the site
 * writes as the first consumer of the library.
 */
export function docsStylesheetPath(repoRoot) {
  return join(repoRoot, "apps/docs/styled-system/styles.css");
}

export function readGeneratedStylesheet(repoRoot, checkName) {
  return readStylesheet(generatedStylesheetPath(repoRoot), checkName);
}

export function readStylesheet(path, checkName) {
  if (!existsSync(path)) {
    console.error(
      `${checkName} — the generated stylesheet is missing at ${path}.\n\n` +
        "Run `pnpm cssgen` first. This check reads what Panda actually emitted, and there is " +
        "nothing to read yet.",
    );
    process.exit(1);
  }
  return readFileSync(path, "utf8");
}
