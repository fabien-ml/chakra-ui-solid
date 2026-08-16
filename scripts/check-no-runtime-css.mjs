#!/usr/bin/env node

// check:no-runtime-css — the one rule this library is built on, at its three boundaries.
//
//   A. No CSS-in-JS engine anywhere in the INSTALLED dependency closure. Judges what a dependency
//      *is*. A transitive edge is the one nobody adds deliberately, so this reads the installed
//      tree and cross-checks the lockfile, which sees packages `pnpm ls` prunes.
//   B. None of OUR source writes a stylesheet at runtime. Judges what our code *does*.
//   B2. None of OUR source styles anything at MODULE SCOPE. The same scan, one step further: the
//      styled-system arrives on a context now, so every helper that reads it has to run while a
//      component is being constructed. At module scope there is no owner, and the read throws
//      naming `<ChakraProvider>` at import time — a whole route down for a line nobody would look
//      at twice.
//   C. What we PUBLISH: no `.css` anywhere in a tarball or an `exports` map, and no Panda-generated
//      styled-system runtime either. The second half is the same rule one step out — Panda in the
//      consumer's build is the prerequisite, so they generate the runtime their sheet agrees with,
//      and a precompiled copy of ours in the tarball is a second set of class names for the same
//      page.
//
// They stay separate assertions in one file. Merging B into A would flag an audited inline
// `style` attribute as a styling engine; merging A into B would miss the dependency that ships one.
//
// Allowed, and routinely needed: the DOM `style` attribute (Zag's `normalizeProps` emits `style`
// objects for floating positioning, slider thumbs, progress fills), inline CSS custom properties,
// and Panda's `css`/`cva`/`sva`/`cx`, which only compute strings.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findCijEngines,
  flattenPnpmTree,
  formatCijEngines,
  parseLockfilePackages,
} from "./lib/no-cij-manifest.mjs";
import {
  formatRuntimeSheetHits,
  isExcludedFromScan,
  listOurSourceFiles,
  scanForRuntimeSheets,
} from "./lib/no-runtime-sheet.mjs";
import {
  flattenExports,
  listPackedFiles,
  listPublishedPackages,
} from "./lib/published-packages.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const fail = (message) => {
  console.error(`check:no-runtime-css — ${message}\n`);
  process.exit(1);
};

// A — what a dependency IS.

let tree;
try {
  tree = JSON.parse(
    execFileSync("pnpm", ["ls", "--json", "--depth", "Infinity", "--recursive"], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    }),
  );
} catch (error) {
  fail(
    "could not read the installed closure. This assertion is only meaningful against an installed " +
      `tree; run \`pnpm install\` first.\n  ${error.message}`,
  );
}

const installed = flattenPnpmTree(tree);
const lockfile = parseLockfilePackages(readFileSync(join(repoRoot, "pnpm-lock.yaml"), "utf8"));

// An empty closure is not a pass: it means `pnpm ls` returned a tree this script did not
// understand, and a check reporting "0 packages, all clean" is worse than no check.
if (installed.length === 0 || lockfile.length === 0) {
  fail(
    `read an EMPTY closure (pnpm ls: ${installed.length} packages, lockfile: ${lockfile.length}). ` +
      "That is a broken check reporting success, not a clean tree.",
  );
}

const engines = [
  ...findCijEngines(installed, "pnpm ls"),
  ...findCijEngines(lockfile, "pnpm-lock.yaml"),
];

if (engines.length > 0) {
  fail(
    `${engines.length} CSS-in-JS engine(s) in the dependency closure:\n\n${formatCijEngines(engines)}\n\n` +
      "This is a STOP, not a workaround. A runtime styling engine makes build-time extraction " +
      "impossible and takes the distribution model with it, so there is no local mitigation: drop " +
      "the dependency, or do not ship the component that needs it.",
  );
}

// B — what our own code DOES.

const { scanned, hits } = scanForRuntimeSheets(repoRoot);

if (hits.length > 0) {
  fail(
    `${hits.length} runtime-stylesheet use(s) in our own source:\n\n${formatRuntimeSheetHits(hits)}\n\n` +
      "There is no allow-list here. A dynamic value goes through a custom property — " +
      '`style={{ "--w": w }}` with `w="var(--w)"` — not through a rule written at runtime.',
  );
}

// B2 — what our own code does, at MODULE SCOPE.

/**
 * Every helper whose first act is to read the styled-system off the `<ChakraProvider>` context.
 *
 * Panda's own `css()`, `cva()` and `cx()` are deliberately **absent**. They compute strings out of a
 * generated runtime and read no context, so `apps/docs` computing a class constant at module scope —
 * `~/components/mdx/prose`, `~/components/layout/shell` — is the documented shape a consumer copies,
 * not a violation.
 */
const CONTEXT_READERS = [
  "useChakraContext",
  "renderStyled",
  "createRecipeClass",
  "createSlotClasses",
  "useRecipeVariantKeys",
];

// Type arguments are allowed between the name and the parenthesis, and never contain a `(` —
// `createSlotClasses<DialogSlot, DialogVariants>("dialog", …)`. Same shape as
// `generate-component-recipes.mjs`'s recipe-key sites, for the same reason.
const CONTEXT_READER_CALL = new RegExp(`\\b(${CONTEXT_READERS.join("|")})\\s*(?:<[^(]*>)?\\s*\\(`);

// `export function renderStyled<Props>(` matches the call pattern exactly, and every one of these
// helpers is declared at module scope by definition. The declaration is where they are *defined*,
// which is the one place the parenthesis means a parameter list.
const CONTEXT_READER_DECLARATION = new RegExp(`\\bfunction\\s+(?:${CONTEXT_READERS.join("|")})\\b`);

/**
 * The source with comments blanked and string *interiors* blanked, newlines preserved so a match
 * still maps to its original line.
 *
 * Copied from `scripts/check-ssr-coverage.mjs`, which copied it into
 * `scripts/generate-component-recipes.mjs`, and for the same reason each time: a commented-out call
 * is not a call, and neither is one inside a string. Blanking strings is what makes the nesting
 * counter below trustworthy — an unmatched brace in a template literal would otherwise leave every
 * later line looking like module scope.
 *
 * Deliberately not regex-literal aware, as there too. If that ever bites, the answer is hope-ui's
 * full `source-projection.mjs` tokenizer, not a bigger regex here.
 */
function codeOnly(source) {
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
    if (char === '"' || char === "'" || char === "`") {
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

/**
 * Which lines of a projected source sit at nesting depth zero — outside every function body, object
 * literal and JSX expression, which is what "module scope" means here.
 *
 * A line is judged by the depth it **opens** at, so the line declaring a function counts as module
 * scope and its body does not. `export const Button = () => renderStyled(…)` is therefore reported,
 * which is correct: the arrow is a component, but nothing constructs it at import time and the call
 * would run under whatever owner happens to be current — which at module scope is none.
 */
function moduleScopeLines(projected) {
  const lines = projected.split("\n");
  const atModuleScope = [];
  let depth = 0;

  for (const line of lines) {
    atModuleScope.push(depth === 0);
    for (const char of line) {
      if (char === "{" || char === "(" || char === "[") {
        depth += 1;
      } else if (char === "}" || char === ")" || char === "]") {
        depth = Math.max(0, depth - 1);
      }
    }
  }

  return atModuleScope;
}

const moduleScopeScanned = listOurSourceFiles(repoRoot).filter((file) => !isExcludedFromScan(file));
const moduleScopeHits = [];

for (const file of moduleScopeScanned) {
  const projected = codeOnly(readFileSync(join(repoRoot, file), "utf8"));
  const atModuleScope = moduleScopeLines(projected);

  projected.split("\n").forEach((line, index) => {
    const match = CONTEXT_READER_CALL.exec(line);
    if (match && atModuleScope[index] && !CONTEXT_READER_DECLARATION.test(line)) {
      moduleScopeHits.push({ file, line: index + 1, callee: match[1] });
    }
  });
}

// Never empty: this walks the same file list assertion B does, and that one already refused an empty
// scan. Kept as its own guard so a future change to either list cannot quietly turn B2 into a pass.
if (moduleScopeScanned.length === 0) {
  fail(
    "read an EMPTY source list for the module-scope scan. That is a broken check reporting " +
      "success, not a clean tree.",
  );
}

if (moduleScopeHits.length > 0) {
  fail(
    `${moduleScopeHits.length} styling call(s) at module scope:\n\n` +
      `${moduleScopeHits.map(({ file, line, callee }) => `  ${file}:${line}  ${callee}()`).join("\n")}\n\n` +
      "Each of these reads the styled-system off the `<ChakraProvider>` context, so it has to run " +
      "while a component is being constructed. At module scope the read happens at import time, " +
      "with no provider anywhere above it: the module throws as it loads and takes the route with " +
      "it. Move the call into the component body.",
  );
}

// C — what we publish.

/**
 * A module out of Panda's own `codegen` — `css/index.mjs`, `recipes/button.mjs`, and their ~270
 * siblings. Matched by the directory it is generated into rather than by package name, so this
 * catches a copy vendored into any package's tarball.
 */
const STYLED_SYSTEM_RUNTIME = /(^|\/)styled-system\/.+\.(mjs|cjs|js|jsx)$/;

const cssExposures = [];
const runtimeExposures = [];

for (const { name, directory, manifest } of listPublishedPackages(repoRoot)) {
  for (const { subpath, target } of flattenExports(manifest.exports ?? {})) {
    if (target.endsWith(".css")) {
      cssExposures.push(`  ${name}\n      \`${subpath}\` resolves to \`${target}\``);
    }
  }
  if (typeof manifest.style === "string") {
    cssExposures.push(`  ${name}\n      has a \`style\` field (\`${manifest.style}\`)`);
  }

  // The tarball rather than the `files` entries, because a directory entry is not a suffix: `files:
  // ["styled-system"]` reads as one harmless line and ships everything Panda wrote into it.
  let packed;
  try {
    packed = listPackedFiles(directory);
  } catch (error) {
    fail(`could not ask npm what \`${name}\` would publish.\n  ${error.message}`);
  }
  // Never empty: `package.json`, `LICENSE` and the readme are always packed. Zero means npm
  // answered something this script did not understand, which is a check reporting success.
  if (packed.length === 0) {
    fail(
      `read an EMPTY tarball listing for \`${name}\`. That is a broken check reporting success, ` +
        "not a clean package.",
    );
  }
  for (const file of packed) {
    if (file.endsWith(".css")) {
      cssExposures.push(`  ${name}\n      the tarball would contain \`${file}\``);
    }
    if (STYLED_SYSTEM_RUNTIME.test(file)) {
      runtimeExposures.push(`  ${name}\n      the tarball would contain \`${file}\``);
    }
  }
}

if (cssExposures.length > 0) {
  fail(
    `${cssExposures.length} published package(s) expose CSS:\n\n${cssExposures.join("\n")}\n\n` +
      "This library publishes zero CSS. A prebuilt sheet cannot carry a consumer's own style props " +
      "or their theming, so it would create a second, half-functional support tier.",
  );
}

if (runtimeExposures.length > 0) {
  fail(
    `${runtimeExposures.length} published package(s) ship a styled-system runtime:\n\n` +
      `${runtimeExposures.join("\n")}\n\n` +
      "The consumer generates the styled-system and hands it to `<ChakraProvider>`, so the class " +
      "names on the element and the rules in their sheet come out of one Panda run. A published " +
      "runtime is a second set of names for the same page: it computes `p_4` against a sheet that " +
      "may hash, prefix or re-separate, and every component then renders unstyled with no error " +
      "anywhere. `@chakra-ui-solid/styled-system` publishes declarations alone — the generated " +
      "instance in this repo is for our own tests, Storybook and the browser suite.",
  );
}

console.log(
  `check:no-runtime-css — no CSS-in-JS engine across ${installed.length} installed packages ` +
    `(${lockfile.length} lockfile entries cross-checked); no runtime stylesheet and no ` +
    `module-scope styling call in ${scanned.length} source file(s); no published package exposes ` +
    "CSS or ships a styled-system runtime.",
);
