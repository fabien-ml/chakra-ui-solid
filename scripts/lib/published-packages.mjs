/** Every package under `packages/` that is actually published — the subject of the distribution checks. */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

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
