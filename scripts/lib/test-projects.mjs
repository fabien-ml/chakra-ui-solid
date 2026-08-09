import { readdirSync } from "node:fs";
import { join, matchesGlob, relative, sep } from "node:path";

/**
 * The logic behind `check:test-projects`.
 *
 * A test file's Vitest project is decided by its *filename*: `foo.test.ts` goes to `unit`,
 * `foo.ssr.test.tsx` to `ssr`, `foo.browser.test.tsx` to `browser`. A file named
 * `dialog.browser.tsx` or `dialog.test.browser.tsx` matches none of them, so it never runs and
 * nothing says so — a green suite with a whole file missing from it (`testing.md` §1.7).
 */

/**
 * Files worth classifying, under each package's `src` directory.
 *
 * The rule is deliberately wider than "the name contains `test`". `testing.md` §1.7's own worked
 * example is `dialog.browser.tsx`, which contains no `test` at all — scanning on that word alone
 * would miss the very file the check is named for. So a `.browser.` or `.ssr.` dot-segment is
 * enough to put a file in the scan set, and a source file that adopts one of those infixes for
 * some other purpose is expected to fail here and be renamed.
 */
export function isTestLikeFile(relativePath) {
  const basename = relativePath.split("/").at(-1) ?? "";
  return basename.includes("test") || basename.includes(".browser.") || basename.includes(".ssr.");
}

/** Every project whose include globs claim `relativePath` and whose excludes do not disclaim it. */
export function projectsClaiming(relativePath, projects) {
  return projects
    .filter(
      (project) =>
        project.include.some((glob) => matchesGlob(relativePath, glob)) &&
        !project.exclude.some((glob) => matchesGlob(relativePath, glob)),
    )
    .map((project) => project.name);
}

/**
 * @returns one entry per file that does **not** resolve to exactly one project — `claimedBy` is
 * empty (the file never runs) or has two or more members (it runs twice, in disagreeing module
 * resolutions).
 */
export function findMisroutedTestFiles(relativePaths, projects) {
  return relativePaths
    .map((relativePath) => ({
      file: relativePath,
      claimedBy: projectsClaiming(relativePath, projects),
    }))
    .filter((result) => result.claimedBy.length !== 1);
}

/** Every file under each package's `src` directory, repo-relative and `/`-separated. */
export function listPackageSourceFiles(repoRoot) {
  const packagesDir = join(repoRoot, "packages");
  const files = [];

  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== "dist") {
          walk(absolute);
        }
      } else {
        files.push(relative(repoRoot, absolute).split(sep).join("/"));
      }
    }
  };

  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    try {
      walk(join(packagesDir, entry.name, "src"));
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  return files.sort();
}

export function formatMisroutedTestFiles(misrouted) {
  return misrouted
    .map(({ file, claimedBy }) =>
      claimedBy.length === 0
        ? `  ${file}\n` +
          `      Claimed by NO project: it never runs, and nothing else in the suite says so.\n` +
          `      Rename it to one of  *.test.ts(x) [unit]  *.ssr.test.ts(x) [ssr]  ` +
          `*.browser.test.ts(x) [browser].`
        : `  ${file}\n` +
          `      Claimed by ${claimedBy.length} projects (${claimedBy.join(", ")}): it runs more ` +
          `than once, against disagreeing builds of Solid.\n` +
          `      Tighten the include/exclude globs in vitest-projects.ts, or rename the file.`,
    )
    .join("\n");
}
