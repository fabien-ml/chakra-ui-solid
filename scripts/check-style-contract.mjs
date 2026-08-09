#!/usr/bin/env node

// check:style-contract — the styling layer's lint rules, over `packages/*/src/**`
// (`testing.md` §6).
//
//   rule 1  style-prop-static-value   every style-prop value is a literal, a token, or a `var(--…)`
//   rule 2  require-style-source      NOT YET — it needs `renderStyled`'s `styleSource`, which is P5's
//   rule 3  no-class-name-assertion   an *.ssr/*.browser test asserts computed styles, never classes
//
// It parses with **oxc-parser**, the same parser tsdown/rolldown already use to build this repo, so
// the rules read the tree the build reads rather than a second approximation of it.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSync } from "oxc-parser";
import { listOurSourceFiles } from "./lib/no-runtime-sheet.mjs";
import {
  findClassNameAssertions,
  findStylePropViolations,
  isElementBearingTest,
} from "./lib/style-contract.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(repoRoot, "packages/styled-system/package.json"));

const generated = join(
  dirname(require.resolve("@chakra-ui-solid/styled-system/package.json")),
  "styled-system/jsx/is-valid-prop.mjs",
);

let isCssProperty;
try {
  ({ isCssProperty } = await import(generated));
} catch (error) {
  console.error(
    "check:style-contract — rule 1 needs the generated `isCssProperty` to know which props are " +
      `style props, and it is not there yet. Run \`pnpm codegen\`.\n\n${error}`,
  );
  process.exit(1);
}

const files = listOurSourceFiles(repoRoot);
const stylePropViolations = [];
const classNameViolations = [];
let stylePropsSeen = 0;

for (const file of files) {
  const absolute = join(repoRoot, file);
  const contents = readFileSync(absolute, "utf8");

  if (isElementBearingTest(file)) {
    classNameViolations.push(...findClassNameAssertions(file, contents));
    continue;
  }
  // A test file's own JSX is not shipped source, so rule 1 does not apply to it — a test may write
  // `<Box p={padding()}>` precisely to prove the factory stays reactive.
  if (/\.test\.[jt]sx?$/.test(file) || !file.endsWith("x")) {
    continue;
  }

  const { program, errors } = parseSync(absolute, contents, { sourceType: "module" });
  if (errors.length > 0) {
    console.error(
      `check:style-contract — could not parse ${file}:\n` +
        errors.map((error) => `  ${error.message}`).join("\n"),
    );
    process.exit(1);
  }

  const { violations, checked } = findStylePropViolations(file, contents, program, isCssProperty);
  stylePropViolations.push(...violations);
  stylePropsSeen += checked;
}

if (stylePropViolations.length > 0) {
  console.error(
    `check:style-contract rule 1 — ${stylePropViolations.length} style-prop value(s) Panda cannot ` +
      "extract. Each computes a class name whose CSS was never generated: the element renders " +
      "unstyled, nothing errors, and a class-name assertion still passes.\n\n" +
      `${stylePropViolations
        .map(({ file, line, prop, kind }) => `  ${file}:${line}\n      \`${prop}\` is ${kind}`)
        .join("\n")}\n\n` +
      'Route it through a CSS custom property instead: `style={{ "--w": value }}` with ' +
      '`w="var(--w)"`. The inline `style` attribute is a DOM attribute, not a stylesheet, and it ' +
      "beats every class.",
  );
  process.exit(1);
}

if (classNameViolations.length > 0) {
  console.error(
    `check:style-contract rule 3 — ${classNameViolations.length} class-name assertion(s) in tests ` +
      "that have a real element in front of them. Under Panda a class name proves nothing: " +
      "`css()` computes the name and never injects the rule, so the assertion passes on a " +
      "completely unstyled element.\n\n" +
      `${classNameViolations
        .map(({ file, line, label, text }) => `  ${file}:${line}\n      ${label} — ${text}`)
        .join("\n")}\n\n` +
      "Assert `getComputedStyle(el).<property>` instead (in `ssr`, resolve the class through the " +
      "generated stylesheet with `declarationsForClassList`).",
  );
  process.exit(1);
}

console.log(
  `check:style-contract — rule 1 green over ${stylePropsSeen} style-prop value(s), rule 3 green ` +
    `over ${files.filter(isElementBearingTest).length} element-bearing test file(s). ` +
    "Rule 2 (`require-style-source`) lands with the first machine part.",
);
