import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSync } from "oxc-parser";

/**
 * The static half of `check:docs-examples` (`docs-site.md` §4.1).
 *
 * The mounting half is `apps/docs/src/examples/__tests__/examples.browser.test.tsx`, in the
 * `browser` Vitest project, and it is the half that earns the check its place — the difference
 * between *the example compiles* and *the example works*, which is exactly what every crashed
 * ZagListbox story did (`prior-art.md` §8.1).
 *
 * What is here instead is the part a mounting test cannot see: that the import a reader will copy
 * out of the page **is a subpath that exists**, and that no example is orphaned.
 */

export const EXAMPLES_DIRECTORY = "apps/docs/src/examples";

export function listExamples(repoRoot) {
  const directory = join(repoRoot, EXAMPLES_DIRECTORY);
  let entries = [];
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
    .map((entry) => entry.name.replace(/\.tsx$/, ""))
    .sort();
}

/** Every module specifier an example imports, plus whether it has a default export. */
export function inspectExample(filePath, source) {
  const { program, errors } = parseSync(filePath, source, { sourceType: "module" });
  if (errors.length > 0) {
    throw new Error(`Could not parse ${filePath}: ${errors.map((e) => e.message).join(", ")}`);
  }
  return {
    imports: program.body
      .filter((node) => node.type === "ImportDeclaration")
      .map((node) => node.source.value),
    hasDefaultExport: program.body.some(
      (node) =>
        node.type === "ExportDefaultDeclaration" ||
        (node.type === "ExportNamedDeclaration" &&
          node.specifiers?.some((specifier) => specifier.exported?.name === "default")),
    ),
  };
}

/**
 * Resolves `@chakra-ui-solid/components/box` against that package's `exports` map, the way a
 * consumer's bundler does — exact key first, then a `./*` pattern.
 *
 * @returns `{ ok, target }`, where `target` is the file the map points at, or `{ ok: false }` when
 * the map has no entry for the subpath at all.
 */
export function resolveThroughExports(packageJson, subpath) {
  const exportsMap = packageJson.exports;
  if (exportsMap === undefined) {
    return { ok: false };
  }

  const pick = (entry) => {
    if (typeof entry === "string") {
      return entry;
    }
    if (entry === null || typeof entry !== "object") {
      return undefined;
    }
    // The conditions our packages publish under, in the order a Solid consumer's bundler tries
    // them. `"solid"` first, deliberately: it is the only one our JSX-preserving packages offer.
    for (const condition of ["solid", "import", "default", "types"]) {
      if (entry[condition] !== undefined) {
        return pick(entry[condition]);
      }
    }
    return undefined;
  };

  if (exportsMap[subpath] !== undefined) {
    return { ok: true, target: pick(exportsMap[subpath]) };
  }

  for (const [pattern, entry] of Object.entries(exportsMap)) {
    if (!pattern.includes("*")) {
      continue;
    }
    const [before, after] = pattern.split("*");
    if (subpath.startsWith(before) && subpath.endsWith(after ?? "")) {
      const wildcard = subpath.slice(before.length, subpath.length - (after ?? "").length);
      const target = pick(entry);
      return { ok: true, target: target?.replace("*", wildcard) };
    }
  }
  return { ok: false };
}

/** `@chakra-ui-solid/components/box` → `{ name, subpath }`; a non-scoped specifier → `null`. */
export function splitWorkspaceSpecifier(specifier) {
  if (!specifier.startsWith("@chakra-ui-solid/")) {
    return null;
  }
  const segments = specifier.split("/");
  const name = segments.slice(0, 2).join("/");
  const rest = segments.slice(2).join("/");
  return { name, subpath: rest === "" ? "." : `./${rest}` };
}

export function packageDirectoryFor(repoRoot, packageName) {
  const directory = join(repoRoot, "packages", packageName.replace("@chakra-ui-solid/", ""));
  return existsSync(join(directory, "package.json")) ? directory : null;
}

/** `<Example name="box-basic" />` occurrences across the content tier. */
export function referencedExamples(repoRoot) {
  const directory = join(repoRoot, "apps/docs/src/content");
  const referenced = new Set();

  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
      } else if (entry.name.endsWith(".mdx")) {
        const contents = readFileSync(absolute, "utf8");
        for (const match of contents.matchAll(/<Example\s+name=["']([^"']+)["']/g)) {
          referenced.add(match[1]);
        }
      }
    }
  };

  try {
    walk(directory);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  return referenced;
}
