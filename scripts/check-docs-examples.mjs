#!/usr/bin/env node

// check:docs-examples — a docs example is a deliverable, not a file (`docs-site.md` §4.1).
//
// It inherited that job from a deleted canary. `prior-art.md` §8.1's fourth rule — *a deliverable
// verified by a file-existence check is verified in name only* — is named after ZagListbox's
// stories: written, typechecked, linted and committed, every one of them crashed, and nobody knew
// because nobody opened them. **The rule kept its force and changed its subject** (D-133): a story
// renders a component in a harness we control, and an example renders it the way a consumer does.
//
//   (a) it typechecks under the docs app's own tsconfig — which types against `dist`, not `src`
//   (b) it imports only subpaths that exist in `plan.md` §5.5's exports map
//   (c) it mounts in the `browser` project, with no console error and a non-empty root
//   (d) it runs axe
//
// (c) is the one that earns the check its place, and compiling is what all the crashed stories did.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EXAMPLES_DIRECTORY,
  inspectExample,
  listExamples,
  packageDirectoryFor,
  referencedExamples,
  resolveThroughExports,
  splitWorkspaceSpecifier,
} from "./lib/docs-examples.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const examples = listExamples(repoRoot);

if (examples.length === 0) {
  console.error(
    `check:docs-examples — no example files under ${EXAMPLES_DIRECTORY}/.\n\n` +
      "Every assertion below would be vacuous, and a check with nothing to check looks exactly " +
      "like a check that passed.\n",
  );
  process.exit(1);
}

// (b) — the imports a reader copies out of the page resolve.
let unbuiltPackages = 0;
for (const example of examples) {
  const relativePath = `${EXAMPLES_DIRECTORY}/${example}.tsx`;
  const source = readFileSync(join(repoRoot, relativePath), "utf8");
  const { imports, hasDefaultExport } = inspectExample(join(repoRoot, relativePath), source);

  if (!hasDefaultExport) {
    failures.push(
      `${relativePath} has no default export.\n` +
        "  The page renders `module.default`, so an example without one renders nothing — and " +
        "nothing is what an unstyled component looks like too.",
    );
  }

  for (const specifier of imports) {
    const split = splitWorkspaceSpecifier(specifier);
    if (split === null) {
      continue;
    }
    const packageDirectory = packageDirectoryFor(repoRoot, split.name);
    if (packageDirectory === null) {
      failures.push(`${relativePath} imports \`${specifier}\` — no such workspace package.`);
      continue;
    }
    const packageJson = JSON.parse(readFileSync(join(packageDirectory, "package.json"), "utf8"));
    const { ok, target } = resolveThroughExports(packageJson, split.subpath);
    if (!ok) {
      failures.push(
        `${relativePath} imports \`${specifier}\`, which ${split.name}'s \`exports\` map has no ` +
          `entry for.\n  A reader copying that line gets a resolution error; the map is ` +
          "`plan.md` §5.5.",
      );
      continue;
    }
    if (target === undefined) {
      failures.push(
        `${relativePath} imports \`${specifier}\`, and ${split.name}'s \`exports\` entry resolves ` +
          "to nothing under `solid`/`import`/`default`.",
      );
      continue;
    }
    // The map can name a file the build never produced. That half is only checkable once the
    // package has been built, and the `docs` job builds before it runs this.
    const built = join(packageDirectory, target.replace(/^\.\//, ""));
    if (!/[/\\]dist[/\\]/.test(built)) {
      continue;
    }
    try {
      readFileSync(built);
    } catch {
      unbuiltPackages++;
    }
  }
}

// Orphans, both directions. An example nothing renders is dead code that still costs a mount; an
// `<Example name>` with no file is a page promising code that is not there.
const referenced = referencedExamples(repoRoot);
const orphaned = examples.filter((name) => !referenced.has(name));
const missing = [...referenced].filter((name) => !examples.includes(name)).sort();

if (orphaned.length > 0) {
  failures.push(
    `${orphaned.length} example(s) no page renders:\n` +
      orphaned.map((name) => `    ${EXAMPLES_DIRECTORY}/${name}.tsx`).join("\n"),
  );
}
if (missing.length > 0) {
  failures.push(
    `${missing.length} \`<Example name>\` reference(s) with no file:\n` +
      missing.map((name) => `    ${EXAMPLES_DIRECTORY}/${name}.tsx`).join("\n"),
  );
}

if (failures.length > 0) {
  console.error(`check:docs-examples —\n\n${failures.join("\n\n")}\n`);
  process.exit(1);
}

// (a) — typecheck, under the docs app's own tsconfig. It deliberately does not extend the base
// config, so this types against the published `dist` `.d.ts` a consumer resolves rather than
// against our `src` (`docs-site.md` §1.3).
const typecheck = spawnSync("pnpm", ["--filter", "@chakra-ui-solid/docs", "typecheck"], {
  cwd: repoRoot,
  stdio: "inherit",
});
if (typecheck.status !== 0) {
  console.error("\ncheck:docs-examples — the docs app does not typecheck (assertion a).\n");
  process.exit(1);
}

// (c) + (d) — mount every example in a real browser, with no console error, a non-empty root and
// a clean axe run.
const mounted = spawnSync(
  "pnpm",
  ["vitest", "run", "--project=browser", `${EXAMPLES_DIRECTORY}/__tests__`],
  { cwd: repoRoot, stdio: "inherit" },
);
if (mounted.status !== 0) {
  console.error(
    "\ncheck:docs-examples — an example did not mount cleanly (assertions c and d).\n" +
      "This is the assertion the check exists for: every crashed story in the prior art " +
      "typechecked.\n",
  );
  process.exit(1);
}

console.log(
  `\ncheck:docs-examples — ${examples.length} example(s): every import resolves through an ` +
    "`exports` entry, every one is rendered by a page, the app typechecks against `dist`, and " +
    "every example mounts with a non-empty root, no console error and a clean axe run." +
    (unbuiltPackages > 0
      ? `\n  (${unbuiltPackages} \`exports\` target(s) not on disk — run \`pnpm build\` for the ` +
        "file-existence half.)"
      : ""),
);
