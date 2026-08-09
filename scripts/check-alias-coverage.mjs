#!/usr/bin/env node

// check:alias-coverage — every one of Chakra's 95 style-prop shorthands is in the generated
// `isCssProperty` vocabulary (`testing.md` §8; assumption P3-D).
//
// This check is **both the verifier and the producer**. Chakra's shorthands live in an Emotion
// runtime we do not port, and Panda's own utilities cover most but not all of them; the set this
// check reports missing IS the list `@chakra-ui-solid/preset` must alias. It was specified to fail
// before it passed, and its first green run was the deliverable.
//
// Why it must keep running: `isCssProperty` is generated *from our config*, so a preset change, a
// Panda bump or a Chakra bump can silently drop a name. A dropped shorthand does not error — it
// stops being a style prop and starts being a DOM attribute, so `<Box gapX="4">` renders an
// element with a `gapx="4"` attribute and no column gap.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(repoRoot, "packages/styled-system/package.json"));

// Chakra's shorthand list, read from the checkout rather than copied here: a copy would go on
// passing after Chakra added a shorthand, which is the whole failure mode.
const chakraPresetBase = join(
  repoRoot,
  "__reference-impl__/chakra-ui/packages/react/src/preset-base.ts",
);

function chakraShorthands() {
  const source = readFileSync(chakraPresetBase, "utf8");
  const names = new Set();
  for (const block of source.match(/shorthand: \[[^\]]*\]/g) ?? []) {
    for (const quoted of block.match(/"[a-zA-Z]+"/g) ?? []) {
      names.add(quoted.slice(1, -1));
    }
  }
  return [...names].sort();
}

const generated = join(
  dirname(require.resolve("@chakra-ui-solid/styled-system/package.json")),
  "styled-system/jsx/is-valid-prop.mjs",
);

let isCssProperty;
try {
  ({ isCssProperty } = await import(generated));
} catch (error) {
  console.error(
    `check:alias-coverage — could not load the generated \`isCssProperty\` at ${generated}.\n` +
      "Run `pnpm codegen` first; the vocabulary this check reads does not exist until Panda has " +
      `written it.\n\n${error}`,
  );
  process.exit(1);
}

const shorthands = chakraShorthands();
const missing = shorthands.filter((name) => !isCssProperty(name));

if (missing.length > 0) {
  console.error(
    `check:alias-coverage — ${missing.length} of Chakra's ${shorthands.length} shorthands are ` +
      "absent from the generated `isCssProperty`. Each one is a style prop a consumer can write " +
      "that will silently become a DOM attribute instead.\n\n" +
      "This list IS the alias table `packages/preset/src/alias-utilities.ts` must carry — add each " +
      "name to the Panda utility that already owns its property, keeping that utility's existing " +
      "shorthands, then re-run `pnpm codegen`:\n\n" +
      `${missing.map((name) => `  - ${name}`).join("\n")}\n`,
  );
  process.exit(1);
}

console.log(
  `check:alias-coverage — all ${shorthands.length} Chakra shorthands resolve through the generated ` +
    "`isCssProperty`.",
);
