#!/usr/bin/env node

// check:ssr-coverage — the SSR contract's wiring, which nothing else can see.
//
// The contract has two halves, and only one of them enforces itself:
//
//   • **Every component server-renders.** Owned by
//     `packages/chakra-ui-solid/src/components/__tests__/components.ssr.test.tsx`, which asserts its
//     own completeness at runtime against the real barrel — a component added and not registered
//     fails there, with no list for this script to keep in step. All this script asks of that file
//     is that it exists and really renders.
//
//   • **A component's server markup still hydrates.** Per-component and opt-in, because each
//     subject costs a `*.ssr-entry.tsx` and a row in `HYDRATION_ENTRIES`
//     (`vitest-hydration-bridge.ts`). Every way that wiring can rot is silent: an entry module
//     nobody registered is never rendered, a registered id nobody hydrates proves nothing, and a
//     `*.ssr.test.tsx` whose only `renderServer` sits in a comment is a green file that tests
//     nothing.
//
// "Really calls" means outside a comment and outside a string. Both loopholes are one keystroke
// away from a passing suite — commenting a failing assertion out is the ordinary way a person
// makes a red run green — and a check that reads for the bare word cannot tell them apart.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const bridgePath = join(repoRoot, "vitest-hydration-bridge.ts");
const smokeTestPath = join(
  repoRoot,
  "packages/chakra-ui-solid/src/components/__tests__/components.ssr.test.tsx",
);

const problems = [];
const report = (message) => problems.push(message);
const asRepoPath = (path) => relative(repoRoot, path);

/**
 * The source with comments blanked, and — when `keepStrings` is false — string *interiors* blanked
 * too. Newlines are preserved, so a match still maps to its original line.
 *
 * Two projections because the two rules here live in different places. Whether a call really
 * happens is a fact about **code**, and a `"hydrateFixture()"` inside a string must not count.
 * Which fixture a test imports is a fact about a **string** — the module specifier — where all that
 * has to be excluded is a commented-out import.
 *
 * Deliberately not regex-literal aware: these are test files and bridge config, where the risk is a
 * commented-out call, not a regex carrying an unbalanced quote. If that ever bites, the answer is
 * hope-ui's full `source-projection.mjs` tokenizer, not a bigger regex here.
 */
function project(source, { keepStrings }) {
  let out = "";
  let index = 0;

  const blankTo = (end) => {
    for (; index < end; index++) {
      out += source[index] === "\n" ? "\n" : " ";
    }
  };

  while (index < source.length) {
    const two = source.slice(index, index + 2);

    if (two === "//") {
      const end = source.indexOf("\n", index);
      blankTo(end === -1 ? source.length : end);
      continue;
    }
    if (two === "/*") {
      const end = source.indexOf("*/", index + 2);
      blankTo(end === -1 ? source.length : end + 2);
      continue;
    }

    const char = source[index];
    if (!keepStrings && (char === '"' || char === "'" || char === "`")) {
      out += char;
      index += 1;
      while (index < source.length && source[index] !== char) {
        if (source[index] === "\\") {
          out += "  ";
          index += 2;
          continue;
        }
        out += source[index] === "\n" ? "\n" : " ";
        index += 1;
      }
      if (index < source.length) {
        out += char;
        index += 1;
      }
      continue;
    }

    out += char;
    index += 1;
  }

  return out;
}

const codeOnly = (source) => project(source, { keepStrings: false });
const withoutComments = (source) => project(source, { keepStrings: true });

function callsLive(source, callee) {
  return new RegExp(`\\b${callee}\\s*\\(`).test(codeOnly(source));
}

/**
 * Either spelling of "this file really produced server HTML": `renderServer` is the harness helper
 * that wraps the tree in the `<ChakraProvider>` every styled element needs, and `renderToStream` is
 * what a test with nothing styled in it still calls directly.
 */
function rendersOnServer(source) {
  return callsLive(source, "renderServer") || callsLive(source, "renderToStream");
}

function walk(directory, onFile) {
  for (const name of readdirSync(directory)) {
    if (name === "node_modules" || name === "dist") {
      continue;
    }
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      walk(path, onFile);
    } else {
      onFile(path, name);
    }
  }
}

// The registry, read as text. Importing it would pull Vite and a nested SSR server into a script
// whose whole job is to read four lines of configuration.
const bridgeSource = readFileSync(bridgePath, "utf8");
const registryBody = /HYDRATION_ENTRIES[^=]*=\s*\{([\s\S]*?)\n\};/.exec(bridgeSource)?.[1];
if (registryBody === undefined) {
  console.error(
    `check:ssr-coverage — could not find the \`HYDRATION_ENTRIES\` object in ${asRepoPath(bridgePath)}. ` +
      "This script reads it as text; if its shape changed, update the pattern here rather than " +
      "leaving the registry unchecked.\n",
  );
  process.exit(1);
}

const registered = new Map();
for (const match of registryBody.matchAll(
  /(?:"([^"\n]+)"|([\w$-]+))\s*:\s*join\(([\s\S]*?)\)\s*,?/g,
)) {
  const id = match[1] ?? match[2];
  const path = [...match[3].matchAll(/"([^"\n]+)"/g)].at(-1)?.[1];
  if (id !== undefined && path !== undefined) {
    registered.set(id, path);
  }
}

if (registered.size === 0) {
  console.error("check:ssr-coverage — parsed zero hydration entries, which cannot be right.\n");
  process.exit(1);
}

// A — the registry and the entry modules on disk agree, in both directions.

const entryFiles = new Set();
walk(join(repoRoot, "packages"), (path, name) => {
  if (name.endsWith(".ssr-entry.tsx")) {
    entryFiles.add(asRepoPath(path));
  }
});

for (const [id, path] of registered) {
  if (!entryFiles.has(path)) {
    report(`\`${id}\` points at ${path}, which does not exist.`);
    continue;
  }

  // The id names the file, so one is derivable from the other and a typo cannot produce a working
  // pair that means something else.
  const expectedId = path.split("/").at(-1)?.replace(".ssr-entry.tsx", "");
  if (expectedId !== id) {
    report(`\`${id}\` is registered against ${path}, whose name says its id is \`${expectedId}\`.`);
  }

  const source = readFileSync(join(repoRoot, path), "utf8");
  for (const exported of ["renderFixture", "Tree"]) {
    if (!new RegExp(`export\\s+(async\\s+)?function\\s+${exported}\\b`).test(codeOnly(source))) {
      report(
        `${path} does not export \`${exported}\`. The bridge invokes \`renderFixture()\`, and ` +
          "the `ssr` and `browser` projects share `Tree` so they render the same subject.",
      );
    }
  }
}

for (const path of entryFiles) {
  if (![...registered.values()].includes(path)) {
    report(
      `${path} is not registered in HYDRATION_ENTRIES, so nothing ever renders it — a fixture ` +
        "that exists and is never served is indistinguishable from one that works.",
    );
  }
}

// B — every registered subject is really hydrated by a browser test.

const browserTests = [];
const ssrTests = [];
for (const root of ["packages", "apps"]) {
  walk(join(repoRoot, root), (path, name) => {
    if (name.endsWith(".browser.test.tsx") || name.endsWith(".browser.test.ts")) {
      browserTests.push(path);
    } else if (name.endsWith(".ssr.test.tsx") || name.endsWith(".ssr.test.ts")) {
      ssrTests.push(path);
    }
  });
}

for (const id of registered.keys()) {
  const hydrating = browserTests.filter((path) => {
    const source = readFileSync(path, "utf8");
    return (
      withoutComments(source).includes(`virtual:hydration-fixture?id=${id}`) &&
      callsLive(source, "hydrateFixture")
    );
  });

  if (hydrating.length === 0) {
    report(
      `\`${id}\` is registered but no browser test both imports ` +
        `\`virtual:hydration-fixture?id=${id}\` and calls \`hydrateFixture()\`. The fixture is ` +
        "rendered and thrown away.",
    );
  }
}

// C — an SSR test that renders nothing, and the smoke test that covers every component.

for (const path of ssrTests) {
  if (!rendersOnServer(readFileSync(path, "utf8"))) {
    report(
      `${asRepoPath(path)} never calls \`renderServer()\` or \`renderToStream()\`, so whatever it ` +
        "asserts, it does not assert it against a server render.",
    );
  }
}

let smokeSource;
try {
  smokeSource = readFileSync(smokeTestPath, "utf8");
} catch {
  report(
    `${asRepoPath(smokeTestPath)} is missing. It is the only place every exported component is ` +
      "server-rendered, and it asserts its own completeness against the barrel.",
  );
}
if (smokeSource !== undefined && !rendersOnServer(smokeSource)) {
  report(`${asRepoPath(smokeTestPath)} never calls \`renderServer()\` or \`renderToStream()\`.`);
}

if (problems.length > 0) {
  console.error(
    `check:ssr-coverage — ${problems.length} problem(s):\n${problems
      .map((problem) => `  - ${problem}`)
      .join("\n")}\n`,
  );
  process.exit(1);
}

console.log(
  `check:ssr-coverage — ${registered.size} hydration subject(s) registered, rendered and hydrated; ` +
    `${ssrTests.length} SSR test file(s) really render; every exported component has a server-render ` +
    "subject (asserted at runtime by components.ssr.test.tsx).",
);
