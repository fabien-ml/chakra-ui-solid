#!/usr/bin/env node

// Generates `packages/panda-preset/src/component-recipes.ts` — which recipes each package entry
// reaches, and which exported name comes from which entry.
//
// The consumer's Panda config has to answer one question: *given the specifiers this app imports
// from us, which recipe bodies does its stylesheet need?* Nothing at config-load time can see the
// consumer's source, and nothing at parse time can see our import graph — so the graph is walked
// here, once, and committed as data.
//
// **Derived, never enumerated.** No component name and no recipe key is typed out anywhere in this
// file. An entry is whatever `chakraUiSolid.entries` lists, a recipe is whatever an entry's source
// transitively imports from `@chakra-ui-solid/styled-system/recipes`, and a component name is
// whatever that entry exports as a value. A new port is picked up because it added a directory and
// an entry; a new upstream recipe is picked up because a component imported it. Anything a human
// had to remember to add here would reintroduce silent unstyling exactly as the library grows.
//
// Two things make the walk trustworthy rather than approximate:
//
//   • **A type-only edge is not a runtime edge.** `import type { FieldRootProps } from "../field"`
//     compiles to nothing, so it must not drag Field's recipes into another entry's set. Likewise
//     `import { type ButtonVariantProps, button }` contributes `button` and not the type beside it.
//
//   • **Panda's generated recipe module exports exactly one *value* per recipe, named by the recipe
//     key** (`button`, `skipNavLink`, `colorSwatch`) — everything else it exports is a type. So a
//     value binding taken from that module *is* a recipe key, with no list to check it against.
//     The name before `as` is the one that counts: `tabs as tabsRecipe` is the `tabs` recipe.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = join(repoRoot, "packages/chakra-ui-solid");
const artifactPath = join(repoRoot, "packages/panda-preset/src/component-recipes.ts");
const recipesModule = "@chakra-ui-solid/styled-system/recipes";

/**
 * The source with comments blanked, and — when `keepStrings` is false — string *interiors* blanked
 * too. Newlines are preserved, so a match still maps to its original line.
 *
 * Copied from `scripts/check-ssr-coverage.mjs`, where the same projection keeps a commented-out
 * call from counting as a real one. Here it keeps a commented-out import from registering a recipe
 * the component no longer uses — a stale key is CSS nobody needs, and the whole point is to stop
 * shipping that. Strings are kept, because a module specifier *is* a string.
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

const withoutComments = (source) => project(source, { keepStrings: true });

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

/**
 * `tsconfig.base.json` is JSONC, and its `paths` are how a workspace specifier reaches a `src`.
 *
 * Only this file goes through the projection. A `package.json` must not: `exports` declares
 * `"./*"`, and blanking from a `/*` that is really inside a string eats the rest of the file.
 */
const tsconfigPaths = JSON.parse(
  withoutComments(readFileSync(join(repoRoot, "tsconfig.base.json"), "utf8")),
).compilerOptions.paths;

function resolveModule(specifier, importer) {
  const candidate = specifier.startsWith(".")
    ? join(dirname(importer), specifier)
    : tsconfigPaths[specifier]?.[0] && join(repoRoot, tsconfigPaths[specifier][0]);

  if (candidate === undefined) {
    return undefined;
  }
  for (const suffix of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const path = candidate + suffix;
    if (existsSync(path) && statSync(path).isFile()) {
      return path;
    }
  }
  return undefined;
}

// A statement's binding clause — everything between `import`/`export` and `from`. `[^;]` cannot
// cross a statement boundary, which is what stops a preceding `export const …;` from swallowing the
// next import's clause; it still spans newlines, so a multi-line `{ … }` list matches whole.
const REEXPORT = /^[ \t]*(import|export)\b([^;]*?)\bfrom\s*"([^"]+)"/gm;
const SIDE_EFFECT_IMPORT = /^[ \t]*import\s*"([^"]+)"/gm;
const LOCAL_DECLARATION =
  /^[ \t]*export\s+(?:declare\s+)?(?:async\s+)?(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)/gm;
const LOCAL_LIST = /^[ \t]*export\s*\{([^}]*)\}\s*;/gm;

/** `{ type A, b as c }` → the names, each tagged with whether it is erased at compile time. */
function readBindingList(list, statementIsTypeOnly) {
  return list
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const inlineType = /^type\s+/.test(item);
      const [source, alias] = item.replace(/^type\s+/, "").split(/\s+as\s+/);
      return {
        imported: source.trim(),
        exported: (alias ?? source).trim(),
        isType: statementIsTypeOnly || inlineType,
      };
    });
}

function parseModule(path) {
  const code = withoutComments(readFileSync(path, "utf8"));
  const edges = [];
  const localExports = [];

  for (const [, keyword, rawClause, specifier] of code.matchAll(REEXPORT)) {
    const clause = rawClause.trim();
    const isTypeOnly = /^type\b/.test(clause);
    const braced = /\{([\s\S]*)\}/.exec(clause);
    const namespaceAlias = /^\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(clause);
    const bindings = braced ? readBindingList(braced[1], isTypeOnly) : [];

    // `export * as Dialog from "./namespace"` binds one name, so it is *not* a star re-export:
    // following it would hoist `Root`, `Content` and `Trigger` to the package root, where nobody
    // can import them.
    edges.push({
      specifier,
      isTypeOnly,
      bindings,
      isStarReexport: keyword === "export" && !braced && !namespaceAlias,
    });

    if (keyword === "export" && !isTypeOnly) {
      if (namespaceAlias) {
        localExports.push(namespaceAlias[1]);
      }
      for (const binding of bindings.filter((each) => !each.isType)) {
        localExports.push(binding.exported);
      }
    }
  }

  for (const [, specifier] of code.matchAll(SIDE_EFFECT_IMPORT)) {
    edges.push({ specifier, isTypeOnly: false, bindings: [], isStarReexport: false });
  }
  for (const [, name] of code.matchAll(LOCAL_DECLARATION)) {
    localExports.push(name);
  }
  for (const [, list] of code.matchAll(LOCAL_LIST)) {
    for (const binding of readBindingList(list, false).filter((each) => !each.isType)) {
      localExports.push(binding.exported);
    }
  }

  return { edges, localExports };
}

const parsed = new Map();
function moduleAt(path) {
  if (!parsed.has(path)) {
    parsed.set(path, parseModule(path));
  }
  return parsed.get(path);
}

/** Every recipe key the entry's runtime graph reaches. Cycles are why this is a visited-set walk. */
function recipesReachedFrom(entryPath) {
  const visited = new Set();
  const recipes = new Set();
  const pending = [entryPath];

  while (pending.length > 0) {
    const path = pending.pop();
    if (visited.has(path)) {
      continue;
    }
    visited.add(path);

    for (const edge of moduleAt(path).edges) {
      if (edge.isTypeOnly) {
        continue;
      }
      if (edge.specifier === recipesModule) {
        for (const binding of edge.bindings.filter((each) => !each.isType)) {
          recipes.add(binding.imported);
        }
        continue;
      }
      const resolved = resolveModule(edge.specifier, path);
      if (resolved !== undefined) {
        pending.push(resolved);
      }
    }
  }

  return [...recipes].sort();
}

/** The value names the entry offers a consumer, following `export *` to where they are declared. */
function namesExportedFrom(entryPath) {
  const visited = new Set();
  const names = new Set();
  const pending = [entryPath];

  while (pending.length > 0) {
    const path = pending.pop();
    if (visited.has(path)) {
      continue;
    }
    visited.add(path);

    const module = moduleAt(path);
    for (const name of module.localExports) {
      names.add(name);
    }
    for (const edge of module.edges) {
      if (!edge.isStarReexport || edge.isTypeOnly) {
        continue;
      }
      const resolved = resolveModule(edge.specifier, path);
      if (resolved !== undefined) {
        pending.push(resolved);
      }
    }
  }

  return [...names].sort();
}

export function collect() {
  const { entries } = readJson(join(packageRoot, "package.json")).chakraUiSolid;

  const componentRecipes = {};
  const exportRecipes = {};

  for (const [entry, source] of Object.entries(entries)) {
    const path = join(packageRoot, source);
    const recipes = recipesReachedFrom(path);
    componentRecipes[entry] = recipes;

    // The root barrel re-exports every other entry, so indexing its names would map every
    // component to every recipe. It is the union, not a component.
    if (entry === ".") {
      continue;
    }
    for (const name of namesExportedFrom(path)) {
      exportRecipes[name] = [...new Set([...(exportRecipes[name] ?? []), ...recipes])].sort();
    }
  }

  return { componentRecipes, exportRecipes };
}

const asObjectLiteral = (record) =>
  `{${Object.entries(record)
    .map(([key, values]) => `${JSON.stringify(key)}: [${values.map((v) => JSON.stringify(v))}],`)
    .join("")}}`;

/**
 * The artifact's text, formatted the way Biome would leave it — so `pnpm lint` stays green and,
 * more importantly, so regenerating a committed file can only differ when its *content* differs.
 */
export function renderComponentRecipesModule() {
  const { componentRecipes, exportRecipes } = collect();
  const generator = relative(repoRoot, fileURLToPath(import.meta.url));

  const source = `// Generated by \`pnpm exec node ${generator}\`. Do not edit; run the generator.
//
// Which recipe bodies a consumer's stylesheet needs, keyed two ways, because a consumer names us
// two ways. \`import { Button } from "chakra-ui-solid"\` gives a component name; \`import { Button }
// from "chakra-ui-solid/button"\` gives an entry. Both have to reach the same recipe.
//
// A key is present with an empty array when that entry reaches no *named* recipe — Box, Stack,
// Grid and the rest style themselves through the factory's inline \`cva\`, and an absent key would
// be indistinguishable from a component the walk failed to see.

/**
 * Package entry → the recipe keys its source transitively imports.
 *
 * \`"."\` is the root barrel, so its array is the union of every other entry's: it is what a
 * consumer gets when nothing can be narrowed.
 */
export const componentRecipes: Record<string, readonly string[]> = ${asObjectLiteral(componentRecipes)};

/**
 * Exported component name → the same recipe keys, for the specifier that names no entry.
 *
 * Values only. A type-only import compiles to nothing and needs no CSS, so \`ButtonProps\` is
 * deliberately absent where \`Button\` is present. \`"."\` contributes no keys here — it exports
 * everything, and indexing it would map every name to every recipe.
 */
export const exportRecipes: Record<string, readonly string[]> = ${asObjectLiteral(exportRecipes)};
`;

  return execFileSync(
    join(repoRoot, "node_modules/.bin/biome"),
    ["format", `--stdin-file-path=${artifactPath}`],
    { input: source, encoding: "utf8" },
  );
}

export const componentRecipesPath = artifactPath;

if (import.meta.main) {
  writeFileSync(artifactPath, renderComponentRecipesModule());
  console.log(`generate:component-recipes — wrote ${relative(repoRoot, artifactPath)}.`);
}
