import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The logic behind `check:docs-inventory`.
 *
 * **A page for an unbuilt component is a promise** (`roadmap.md` §9.2), and a built component with
 * no page is a component nobody can find. Rule 2.15 makes the second half a per-component gate — a
 * component is not done until its docs page is done, in the same phase — so both directions are
 * asserted here rather than reviewed.
 *
 * Three sets, and the check is the two differences between them:
 *
 *   S  shipping rows of `roadmap.md` §4      — the inventory, and the only list that means anything
 *   L  directories under packages/components/src — what has actually landed
 *   P  pages under apps/docs/src/content/components — what the site claims
 *
 * The assertion is `P === S ∩ L`. Deriving *landed* from the source tree rather than from a
 * hand-maintained batch list is deliberate: a list would need editing at every step, and the step
 * where somebody forgets is the step the check stops meaning anything.
 */

/**
 * The `Component` and `Status` columns of every markdown table under `## 4. The matrix`.
 *
 * §4.1–§4.3 carry a `Status` column; §4.4 and §4.5 carry one too, in a different position — so the
 * header row is read per table rather than assumed. A table whose header has no `Component` column
 * is skipped, which is how the surrounding prose tables stay out of the set.
 */
export function parseParityMatrix(roadmapMarkdown) {
  const section = roadmapMarkdown.split(/^## 4\. The matrix$/m)[1]?.split(/^## 5\./m)[0];
  if (section === undefined) {
    throw new Error("roadmap.md has no `## 4. The matrix` section, or no `## 5.` after it.");
  }

  const rows = [];
  let columns = null;

  for (const line of section.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) {
      columns = null;
      continue;
    }
    const cells = trimmed
      .slice(1, trimmed.endsWith("|") ? -1 : undefined)
      .split("|")
      .map((cell) => cell.trim());

    if (columns === null) {
      columns = cells.map((cell) => cell.toLowerCase());
      continue;
    }
    // The `|---|---|` separator under every header.
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) {
      continue;
    }

    const componentIndex = columns.indexOf("component");
    const statusIndex = columns.indexOf("status");
    if (componentIndex === -1 || statusIndex === -1) {
      continue;
    }
    const component = (cells[componentIndex] ?? "").replace(/[*`]/g, "").trim();
    const status = (cells[statusIndex] ?? "").replace(/[*`]/g, "").trim();
    if (component === "" || status === "") {
      continue;
    }
    rows.push({ component, status });
  }

  if (rows.length === 0) {
    throw new Error("Parsed `## 4. The matrix` and found no component rows — the format moved.");
  }
  return rows;
}

/**
 * The rows that ship as components with a page of their own.
 *
 * `relocated` and `excluded` rows are out, and the two relocations are the interesting case:
 * `environment` and `locale` are re-export directories whose context lives in
 * `@chakra-ui-solid/system` (`roadmap.md` §4.5). They are documented on their `get-started/`
 * environment pages rather than in the component tier, so the component tier is **111** pages
 * rather than §2.1's 113.
 */
export const shippingComponents = (rows) =>
  rows.filter((row) => row.status.startsWith("ships")).map((row) => row.component);

export function landedComponents(repoRoot) {
  const source = join(repoRoot, "packages/components/src");
  return readdirSync(source, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

export function documentedComponents(repoRoot) {
  const directory = join(repoRoot, "apps/docs/src/content/components");
  let entries = [];
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.replace(/\.mdx$/, ""));
}

/** Every content page's tier, so a page filed outside the four settled tiers is a failure. */
export function contentTiers(repoRoot) {
  const directory = join(repoRoot, "apps/docs/src/content");
  let entries = [];
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

export function findInventoryDrift({ shipping, landed, documented }) {
  const expected = new Set(shipping.filter((name) => landed.includes(name)));
  const pages = new Set(documented);

  return {
    // A component that shipped and has no page. Rule 2.15: not done.
    undocumented: [...expected].filter((name) => !pages.has(name)).sort(),
    // A page whose component has not landed, or is not a shipping row at all. A promise.
    unbuilt: [...pages].filter((name) => !expected.has(name)).sort(),
  };
}

export const readRoadmap = (repoRoot) =>
  readFileSync(join(repoRoot, "__internal__/roadmap.md"), "utf8");
