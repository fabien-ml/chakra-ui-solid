#!/usr/bin/env node

// check:peer-panda — `@pandacss/dev` is a non-optional `peerDependency` of the three packages that
// cannot work without it (`testing.md` §8, DoD 4.4).
//
// Panda in the consumer's build is a hard prerequisite, not a preference: this library publishes no
// CSS, so their Panda run is what produces the stylesheet our runtime's class names refer to.
// Without the peer declaration the failure is `npm install`, run the app, every component renders
// naked, and no tool anywhere says why. **The warning is the enforcement**, which is why
// `peerDependenciesMeta.optional` must stay unset — setting it deletes the only signal.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listPublishedPackages } from "./lib/published-packages.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED = [
  "@chakra-ui-solid/preset",
  "@chakra-ui-solid/styled-system",
  "@chakra-ui-solid/components",
];

const packages = listPublishedPackages(repoRoot);
const failures = [];

for (const name of REQUIRED) {
  const found = packages.find((candidate) => candidate.name === name);
  if (found === undefined) {
    failures.push({ name, reason: "is not a published package in this repo" });
    continue;
  }

  const { manifest } = found;
  if (manifest.peerDependencies?.["@pandacss/dev"] === undefined) {
    failures.push({
      name,
      reason:
        manifest.dependencies?.["@pandacss/dev"] !== undefined
          ? "lists `@pandacss/dev` as a **dependency**. It has to be a peer: the consumer's Panda " +
            "is the one that must run, and a nested copy would generate a second, differently " +
            "configured stylesheet"
          : "does not declare `@pandacss/dev` as a `peerDependency`",
    });
  }
  if (manifest.peerDependenciesMeta?.["@pandacss/dev"]?.optional === true) {
    failures.push({
      name,
      reason:
        "marks the `@pandacss/dev` peer **optional**, which deletes the install warning. That " +
        "warning is the only thing standing between a consumer and an app where every component " +
        "renders unstyled with no error anywhere",
    });
  }
}

if (failures.length > 0) {
  console.error(
    `check:peer-panda — ${failures.length} problem(s):\n\n` +
      `${failures.map(({ name, reason }) => `  ${name}\n      ${reason}`).join("\n")}\n`,
  );
  process.exit(1);
}

console.log(
  `check:peer-panda — \`@pandacss/dev\` is a non-optional peerDependency on all ${REQUIRED.length} ` +
    "packages that require it.",
);
