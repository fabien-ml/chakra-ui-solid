/**
 * The logic behind `check:no-cij-manifest` — **the §0 rule proper** (`testing.md` §5.1).
 *
 * §0 bans runtime CSS-in-JS **engines**: a library that serializes component styles into a
 * stylesheet at render time makes build-time extraction impossible and takes the distribution
 * model with it (`plan.md` §0, §0.2). A dependency is judged by what it **is**, so the instrument
 * is a manifest check over the *installed* closure — not a source grep. The grep is the other
 * check, `check:no-runtime-sheet`, and it is scoped to our own source. Merging the two would have
 * failed Splitter, whose gesture-cursor stylesheet is not a violation and which ships
 * (`zag-solid-adapter.md` §5.3; `testing.md` §5.3).
 *
 * A failure here is a **stop, not a workaround**: the response is to not ship that machine's
 * component and to file upstream. There is no local mitigation, which is exactly why it is cheap
 * enough to run on every install (`zag-solid-adapter.md` §5.4).
 */

/**
 * The engines, as name patterns. Each is a package that writes a stylesheet at render time; none
 * has a build-time-extraction mode we could opt into.
 *
 * `@emotion/*` is the whole scope on purpose — `@emotion/react`, `@emotion/styled` and
 * `@emotion/css` are three doors into the same engine, and `@chakra-ui/react`'s own
 * `styled-system` is built on it (`plan.md` §0.5), so this is the edge most likely to arrive
 * transitively rather than deliberately.
 */
export const CIJ_ENGINES = [
  { label: "@emotion/*", test: (name) => name === "@emotion" || name.startsWith("@emotion/") },
  { label: "styled-components", test: (name) => name === "styled-components" },
  { label: "goober", test: (name) => name === "goober" },
  { label: "stitches", test: (name) => name === "stitches" || name === "@stitches/react" },
];

function engineFor(packageName) {
  return CIJ_ENGINES.find((engine) => engine.test(packageName))?.label;
}

/**
 * Flattens `pnpm ls --json --depth Infinity` into `{ name, version, path }`, one per distinct
 * package in the closure.
 *
 * The tree repeats a shared package under every dependant, so this dedupes on `name@version` and
 * keeps the first path it saw — enough to name the package, and the `via` chain below is what
 * says who pulled it in.
 */
export function flattenPnpmTree(roots) {
  const seen = new Map();

  const walk = (node, name, via) => {
    const version = node?.version ?? "?";
    const key = `${name}@${version}`;
    if (!seen.has(key)) {
      seen.set(key, { name, version, via });
    }
    for (const group of ["dependencies", "devDependencies", "optionalDependencies"]) {
      for (const [childName, child] of Object.entries(node?.[group] ?? {})) {
        walk(child, childName, [...via, key]);
      }
    }
  };

  for (const root of roots) {
    const rootName = root.name ?? "<workspace root>";
    for (const group of [
      "dependencies",
      "devDependencies",
      "optionalDependencies",
      "unsavedDependencies",
    ]) {
      for (const [childName, child] of Object.entries(root?.[group] ?? {})) {
        walk(child, childName, [rootName]);
      }
    }
  }

  return [...seen.values()];
}

/** Every `name@version` key in a pnpm lockfile's `packages`/`snapshots` maps, as `{ name, version }`. */
export function parseLockfilePackages(lockfileText) {
  const entries = [];
  // `packages:` and `snapshots:` keys look like `'@zag-js/core@1.43.0':` or
  // `@zag-js/core@1.43.0:`, and a peer-dependent one carries a suffix *inside* the quotes:
  // `'@solidjs/web@2.0.0-beta.32(solid-js@2.0.0-beta.32)':`. A YAML parser is not a dependency
  // here and the key shape is fixed, so this reads the keys directly.
  const keyPattern = /^ {2}'?((?:@[^/@\s]+\/)?[^@\s'()]+)@([^'()\s]+)(?:\([^\n]*\))*'?:\s*$/gm;
  for (const match of lockfileText.matchAll(keyPattern)) {
    entries.push({ name: match[1], version: match[2] });
  }
  return entries;
}

/**
 * @param packages `{ name, version, via? }` from either source.
 * @returns one entry per CSS-in-JS engine found, with the source that saw it.
 */
export function findCijEngines(packages, source) {
  return packages
    .map((entry) => ({ ...entry, engine: engineFor(entry.name), source }))
    .filter((entry) => entry.engine !== undefined);
}

export function formatCijEngines(found) {
  return found
    .map(
      ({ name, version, engine, source, via }) =>
        `  ${name}@${version}  (matches ${engine}, seen in ${source})` +
        (via && via.length > 0 ? `\n      pulled in via: ${via.join(" › ")}` : ""),
    )
    .join("\n");
}
