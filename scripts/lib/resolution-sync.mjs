/**
 * The logic behind `check:resolution-sync`.
 *
 * Workspace packages always resolve to `src`, never to a sibling's `dist`. Three files encode
 * that and they are **one unit**, because drift between them is silent by construction: a package
 * resolves to a stale sibling build and everything still passes (`plan.md` §9).
 *
 *   1. `tsconfig.base.json#paths`   — what the editor and `tsc --noEmit` read
 *   2. `vitest-aliases.ts`          — what the three Vitest projects read
 *   3. the docs app's Vite alias    — what the docs build reads (from step 8; absent before then)
 *
 * Each is written in its own notation, so the check projects all three onto one canonical pair —
 * `{ specifier, source }`, with `*` for the wildcard segment — and compares the sets.
 */

/** `["@chakra-ui-solid/system", "packages/system/src/index.ts"]`, from either notation. */
const canonicalKey = (entry) => `${entry.specifier} -> ${entry.source}`;

/**
 * A Vite alias `find` is a regex; a tsconfig path is a string with a `*`. Projecting the regex is
 * only unambiguous for the anchored one-wildcard form the alias table is required to use — an
 * unanchored `find` captures unrelated specifiers as well, which is a defect in its own right, so
 * this throws rather than guessing.
 */
export function specifierFromAliasPattern(source) {
  if (!source.startsWith("^") || !source.endsWith("$")) {
    throw new Error(
      `Alias pattern /${source}/ is not anchored. An unanchored \`find\` also captures unrelated ` +
        `specifiers (e.g. "@chakra-ui-solid/system-x"); write it as /^…$/.`,
    );
  }

  const specifier = source.slice(1, -1).replace("(.+)", "*").replace(/\\(.)/g, "$1");

  if (/[\\^$*+?()[\]{}|]/.test(specifier.replace("*", ""))) {
    throw new Error(
      `Alias pattern /${source}/ uses regex syntax this check cannot project onto a tsconfig ` +
        `path. Keep alias patterns to the anchored form with at most one \`(.+)\` wildcard.`,
    );
  }
  return specifier;
}

/** Repo-relative, `/`-separated, `$1` → `*`, and no `./` prefix. */
export function normalizeSource(rawSource, repoRoot) {
  return rawSource
    .split("\\")
    .join("/")
    .replace(`${repoRoot.split("\\").join("/")}/`, "")
    .replace("$1", "*")
    .replace(/^\.\//, "");
}

export function fromViteAliases(aliases, repoRoot) {
  return aliases.map((alias) => ({
    specifier: specifierFromAliasPattern(alias.find.source),
    source: normalizeSource(alias.replacement, repoRoot),
  }));
}

export function fromTsconfigPaths(paths, repoRoot) {
  return Object.entries(paths ?? {}).map(([specifier, targets]) => {
    if (targets.length !== 1) {
      throw new Error(
        `tsconfig.base.json#paths["${specifier}"] has ${targets.length} targets. A fallback list ` +
          `has no equivalent in a Vite alias, so the three files cannot be compared.`,
      );
    }
    return { specifier, source: normalizeSource(targets[0], repoRoot) };
  });
}

/**
 * @param sources `{ name, entries }` per file, already projected.
 * @returns the entries missing from at least one source, keyed canonically.
 */
export function findResolutionDrift(sources) {
  const everyKey = new Set(sources.flatMap((s) => s.entries.map(canonicalKey)));

  return [...everyKey]
    .sort()
    .map((key) => ({
      entry: key,
      presentIn: sources
        .filter((s) => s.entries.some((e) => canonicalKey(e) === key))
        .map((s) => s.name),
      missingFrom: sources
        .filter((s) => !s.entries.some((e) => canonicalKey(e) === key))
        .map((s) => s.name),
    }))
    .filter((result) => result.missingFrom.length > 0);
}

export function formatResolutionDrift(drift) {
  return drift
    .map(
      ({ entry, presentIn, missingFrom }) =>
        `  ${entry}\n      declared in: ${presentIn.join(", ")}\n` +
        `      MISSING from: ${missingFrom.join(", ")}`,
    )
    .join("\n");
}
