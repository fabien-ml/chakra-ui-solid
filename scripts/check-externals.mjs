#!/usr/bin/env node

// check:externals — nothing a consumer can end up with two copies of is bundled into our built
// output (`testing.md` §8, DoD 4.2).
//
// `@chakra-ui-solid/styled-system` is the load-bearing member. Panda's external-package model has
// the consumer generate only the *stylesheet* while our published runtime computes the class names,
// so a second, inlined `css` instance means class names generated from a different configuration
// than the sheet was — total silent unstyling, with nothing to say so. Two copies of Solid means
// two reactive graphs; two copies of a machine detaches it from the consumer's own.
//
// The assertion is driven by what each package's **source actually imports at runtime**, not by
// what its `package.json` declares: a type-only import legitimately disappears from the output, and
// a check that read declarations would report every one of those as bundling.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSync } from "oxc-parser";
import { listPublishedPackages } from "./lib/published-packages.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** The specifiers whose duplication a consumer can observe. */
const SENTINEL_PREFIXES = ["@chakra-ui-solid/", "solid-js", "@solidjs/", "@zag-js/"];

const isSentinel = (specifier) =>
  SENTINEL_PREFIXES.some((prefix) =>
    prefix.endsWith("/")
      ? specifier.startsWith(prefix)
      : specifier === prefix || specifier.startsWith(`${prefix}/`),
  );

function filesUnder(directory, matches) {
  if (!existsSync(directory)) {
    return [];
  }
  const found = [];
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const path = join(current, entry);
      if (statSync(path).isDirectory()) {
        walk(path);
      } else if (matches(entry)) {
        found.push(path);
      }
    }
  };
  walk(directory);
  return found;
}

/** Bare specifiers a source file imports **for their value** — `import type` and `{ type X }` excluded. */
function valueImports(file) {
  const contents = readFileSync(file, "utf8");
  const { program, errors } = parseSync(file, contents, { sourceType: "module" });
  if (errors.length > 0) {
    return new Set();
  }

  const specifiers = new Set();
  for (const node of program.body) {
    const source = node.source?.value;
    if (typeof source !== "string" || source.startsWith(".")) {
      continue;
    }
    if (node.type !== "ImportDeclaration" && node.type !== "ExportNamedDeclaration") {
      continue;
    }
    if (node.importKind === "type" || node.exportKind === "type") {
      continue;
    }
    const named = node.specifiers ?? [];
    const hasValueSpecifier =
      named.length === 0 ||
      named.some((specifier) => specifier.importKind !== "type" && specifier.exportKind !== "type");
    if (hasValueSpecifier) {
      specifiers.add(source);
    }
  }
  return specifiers;
}

const failures = [];
let checkedPackages = 0;
let checkedSpecifiers = 0;

for (const { name, directory } of listPublishedPackages(repoRoot)) {
  const dist = join(directory, "dist");
  // Only what the build actually ships. Tests, stories, SSR entries and `__fixtures__` are all
  // excluded from the tsdown build too — a fixture consumer's `panda.config.ts` importing
  // `@chakra-ui-solid/panda-preset` is not a claim about the tarball.
  const sourceFiles = filesUnder(
    join(directory, "src"),
    (entry) => /\.tsx?$/.test(entry) && !/\.(test|stories|ssr-entry)\./.test(entry),
  ).filter((file) => !file.includes("__fixtures__"));
  // `styled-system` has no `src` and no `dist`: its build IS Panda's codegen, and it publishes the
  // generated directory as-is.
  if (sourceFiles.length === 0) {
    continue;
  }
  if (!existsSync(dist)) {
    failures.push({ name, reason: "has no built `dist/` — run `pnpm build` before this check" });
    continue;
  }
  checkedPackages++;

  const expected = new Set();
  for (const file of sourceFiles) {
    for (const specifier of valueImports(file)) {
      if (isSentinel(specifier)) {
        expected.add(specifier);
      }
    }
  }

  const emitted = new Set();
  for (const file of filesUnder(dist, (entry) => /\.(jsx?|mjs)$/.test(entry))) {
    const contents = readFileSync(file, "utf8");
    for (const match of contents.matchAll(/from\s*["']([^"'.][^"']*)["']/g)) {
      emitted.add(match[1]);
    }
  }

  for (const specifier of [...expected].sort()) {
    checkedSpecifiers++;
    const survived = [...emitted].some(
      (candidate) => candidate === specifier || candidate.startsWith(`${specifier}/`),
    );
    if (!survived) {
      failures.push({
        name,
        reason:
          `\`src\` imports \`${specifier}\` for its value, and \`dist/\` imports it nowhere — it ` +
          "has been bundled in. Check `deps.neverBundle` in `tsdown.config.base.ts`",
      });
    }
  }
}

if (failures.length > 0) {
  console.error(
    `check:externals — ${failures.length} problem(s):\n\n` +
      `${failures.map(({ name, reason }) => `  ${name}\n      ${reason}`).join("\n")}\n`,
  );
  process.exit(1);
}

console.log(
  `check:externals — ${checkedSpecifiers} runtime import(s) across ${checkedPackages} built ` +
    "package(s) resolve as bare specifiers rather than being bundled.",
);
