/** Every package under `packages/` that is actually published — the subject of the distribution checks. */

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// `npm pack --json` lists every file in the tarball; the whole report arrives on one pipe,
// and the default 1 MB stdio buffer truncates it into invalid JSON.
const PACK_REPORT_MAX_BUFFER = 64 * 1024 * 1024;

export function listPublishedPackages(repoRoot) {
  const packages = [];
  for (const entry of readdirSync(join(repoRoot, "packages"), { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const directory = join(repoRoot, "packages", entry.name);
    const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
    // A private package is never published, so it owes a consumer nothing.
    if (manifest.private === true) {
      continue;
    }
    packages.push({ name: manifest.name, dir: `packages/${entry.name}`, directory, manifest });
  }
  return packages;
}

/**
 * Every file that would end up in a package's tarball, **asked of npm** rather than derived from
 * `files`.
 *
 * The manifest is not the tarball, and the gap is where a promise about what we ship gets broken:
 * `files: ["styled-system"]` is one entry naming a directory, and what it ships is whatever is in
 * that directory at pack time — 319 kB of generated stylesheet included, after anyone runs
 * `pnpm cssgen`. Re-deriving that here would be a second implementation of npm-packlist's
 * semantics (`files` globs, `.npmignore`, the always-included set), so the question goes to the
 * tool that builds the tarball.
 */
export function listPackedFiles(directory) {
  const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: directory,
    encoding: "utf8",
    // npm writes its file listing to stderr as human-readable notices; the JSON is on stdout.
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: PACK_REPORT_MAX_BUFFER,
  });
  const [report] = JSON.parse(output);
  return (report?.files ?? []).map((file) => file.path);
}

/** Every `{ subpath, target }` pair in an `exports` map, flattened across its condition objects. */
export function flattenExports(exportsField, subpath = ".") {
  if (typeof exportsField === "string") {
    return [{ subpath, target: exportsField }];
  }
  if (exportsField === null || typeof exportsField !== "object") {
    return [];
  }
  return Object.entries(exportsField).flatMap(([key, value]) =>
    key.startsWith(".") ? flattenExports(value, key) : flattenExports(value, subpath),
  );
}
