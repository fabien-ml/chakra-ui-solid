#!/usr/bin/env node

// check:exports — three assertions about what the published packages expose (`testing.md` §8,
// DoD 4.1). Each protects a failure that is silent for the consumer.
//
//   1. No export resolves to `jsx/index`.
//   2. `./is-valid-prop` exists, and resolves INSIDE `jsx/`.
//   3. No published `package.json` exposes a `.css` file, anywhere.
//
// Note that 1 and 2 are not the same rule with different signs: the rule is *not* "expose nothing
// from `jsx/`". Panda generates its config-aware `isCssProperty` into that directory, and the whole
// style-prop vocabulary rests on it.

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { flattenExports, listPublishedPackages } from "./lib/published-packages.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

for (const { name, manifest } of listPublishedPackages(repoRoot)) {
  const entries = flattenExports(manifest.exports ?? {});

  for (const { subpath, target } of entries) {
    if (/\bjsx\/index\b/.test(target)) {
      failures.push({
        name,
        reason:
          `\`${subpath}\` resolves to \`${target}\` — Panda's generated JSX factory, which targets ` +
          "Solid 1.x. It imports `splitProps` (gone in 2.0) and `solid-js/web` (which does not " +
          "exist; it is `@solidjs/web`), so a consumer's first import throws at load",
      });
    }
    if (target.endsWith(".css")) {
      failures.push({
        name,
        reason:
          `\`${subpath}\` resolves to a stylesheet (\`${target}\`). This library publishes zero ` +
          "CSS: a prebuilt sheet cannot carry a consumer's own style props or their theming, so " +
          "it would create a second, half-functional support tier that every later knob has to be " +
          "documented into twice",
      });
    }
  }

  for (const listed of manifest.files ?? []) {
    if (listed.endsWith(".css")) {
      failures.push({
        name,
        reason: `\`files\` ships \`${listed}\` — see above; we publish no CSS`,
      });
    }
  }
  if (typeof manifest.style === "string") {
    failures.push({
      name,
      reason: `has a \`style\` field (\`${manifest.style}\`) — we publish no CSS`,
    });
  }
}

// The generated `isCssProperty` knows *our* utilities and tokens; the standalone
// `@pandacss/is-valid-prop` package knows only Panda's defaults, so a well-meaning "fix" that
// re-points this subpath makes every custom style prop silently become a DOM attribute.
const styledSystem = listPublishedPackages(repoRoot).find(
  (candidate) => candidate.name === "@chakra-ui-solid/styled-system",
);

if (styledSystem === undefined) {
  failures.push({
    name: "@chakra-ui-solid/styled-system",
    reason: "is not a published package — the whole external-package model rests on it being one",
  });
} else {
  const isValidProp = flattenExports(styledSystem.manifest.exports ?? {}).filter(
    (entry) => entry.subpath === "./is-valid-prop",
  );
  if (isValidProp.length === 0) {
    failures.push({
      name: styledSystem.name,
      reason:
        "has no `./is-valid-prop` export. `renderStyled` imports it to learn which props are style " +
        "props, so without it the module the factory imports is unresolvable",
    });
  }
  for (const { target } of isValidProp) {
    if (!/\bjsx\/is-valid-prop\b/.test(target)) {
      failures.push({
        name: styledSystem.name,
        reason:
          `\`./is-valid-prop\` resolves to \`${target}\`, which is not inside \`jsx/\`. The ` +
          "config-aware `isCssProperty` is generated there; anything else knows only Panda's " +
          "defaults and silently narrows the style-prop vocabulary",
      });
    }
    const resolved = join(repoRoot, styledSystem.dir, target);
    if (target.endsWith(".mjs") && !existsSync(resolved)) {
      failures.push({
        name: styledSystem.name,
        reason: `\`./is-valid-prop\` points at ${target}, which does not exist. Run \`pnpm codegen\``,
      });
    }
  }
}

if (failures.length > 0) {
  console.error(
    `check:exports — ${failures.length} problem(s):\n\n` +
      `${failures.map(({ name, reason }) => `  ${name}\n      ${reason}`).join("\n")}\n`,
  );
  process.exit(1);
}

console.log(
  `check:exports — ${listPublishedPackages(repoRoot).length} published package(s): no export ` +
    "resolves to `jsx/index`, `./is-valid-prop` resolves inside `jsx/`, and nothing exposes a " +
    "`.css` file.",
);
