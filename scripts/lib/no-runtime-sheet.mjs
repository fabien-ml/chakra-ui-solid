import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * The logic behind `check:no-runtime-sheet` — **hygiene on ourselves** (`testing.md` §5.2).
 *
 * The companion to `check:no-cij-manifest`, and deliberately **not** merged with it. That one
 * judges a dependency by what it *is*; this one judges our own code by what it *does*, because
 * nothing in a manifest stops us growing a "just inject one keyframe at runtime" fix that installs
 * clean, passes the closure check, and defeats build-time extraction from the inside
 * (`testing.md` §5.3).
 *
 * Scope is **`packages/*​/src/**` and `apps/docs/src/**`**, tests excluded. The docs app is our
 * source too, and it is the likeliest place a runtime stylesheet appears — a client-side
 * highlighter, a theme toggle, a playground shortcut — and the most visible place for a reader to
 * conclude the rule is negotiable (`docs-site.md` §8 row 1).
 *
 * Deliberately over-catching. There is no allow-list: a hit in our own code is a line that should
 * not exist.
 */

export const FORBIDDEN_PATTERNS = [
  { label: "insertRule", pattern: /\binsertRule\s*\(/ },
  { label: "deleteRule", pattern: /\bdeleteRule\s*\(/ },
  { label: "adoptedStyleSheets", pattern: /\badoptedStyleSheets\b/ },
  { label: "new CSSStyleSheet", pattern: /\bnew\s+CSSStyleSheet\b/ },
  { label: 'createElement("style")', pattern: /createElement\s*\(\s*["'`]style["'`]/ },
  {
    label: "document.head.append*",
    pattern: /\bhead\s*\.\s*(?:appendChild|append|insertBefore)\s*\(/,
  },
  { label: "<style", pattern: /<style[\s>]/ },
];

/**
 * The DOM `style` **attribute** is explicitly allowed and routinely needed — Zag's
 * `normalizeProps` emits `style` objects for floating positioning, slider thumbs and progress
 * fills (`plan.md` §0.3) — so `style={{…}}` must never match. None of the patterns above can:
 * they all require a sheet-shaped call or a `<style` element.
 */
export function findRuntimeSheetUses(relativePath, contents) {
  return contents.split("\n").flatMap((line, index) =>
    FORBIDDEN_PATTERNS.filter(({ pattern }) => pattern.test(line)).map(({ label }) => ({
      file: relativePath,
      line: index + 1,
      label,
      text: line.trim(),
    })),
  );
}

/** A test file is out of scope: a test may legitimately build a sheet to assert against. */
export function isExcludedFromScan(relativePath) {
  const basename = relativePath.split("/").at(-1) ?? "";
  return (
    basename.includes(".test.") ||
    basename.includes(".stories.") ||
    relativePath.includes("/__tests__/") ||
    relativePath.includes("/__fixtures__/")
  );
}

const SCANNED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"];

function walk(directory, repoRoot, files) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  }
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== "dist") {
        walk(absolute, repoRoot, files);
      }
    } else if (SCANNED_EXTENSIONS.some((extension) => entry.name.endsWith(extension))) {
      files.push(relative(repoRoot, absolute).split(sep).join("/"));
    }
  }
}

/**
 * `packages/*​/src` plus `apps/docs/src`, repo-relative and `/`-separated. `apps/docs` does not
 * exist until step 8; an absent directory contributes nothing rather than throwing.
 */
export function listOurSourceFiles(repoRoot) {
  const files = [];

  let packageDirs = [];
  try {
    packageDirs = readdirSync(join(repoRoot, "packages"), { withFileTypes: true });
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  for (const entry of packageDirs) {
    if (entry.isDirectory()) {
      walk(join(repoRoot, "packages", entry.name, "src"), repoRoot, files);
    }
  }
  walk(join(repoRoot, "apps", "docs", "src"), repoRoot, files);

  return files.sort();
}

export function scanForRuntimeSheets(repoRoot) {
  const scanned = listOurSourceFiles(repoRoot).filter((file) => !isExcludedFromScan(file));
  const hits = scanned.flatMap((file) =>
    findRuntimeSheetUses(file, readFileSync(join(repoRoot, file), "utf8")),
  );
  return { scanned, hits };
}

export function formatRuntimeSheetHits(hits) {
  return hits
    .map(({ file, line, label, text }) => `  ${file}:${line}  [${label}]\n      ${text}`)
    .join("\n");
}
