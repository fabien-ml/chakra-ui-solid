/**
 * The logic behind the three attribution checks — `check:license-headers`, `check:notice-rows`
 * and `check:package-files` (`testing.md` §9; `CLAUDE.md`, the five obligations; `zag-solid-adapter.md` §7.3).
 *
 * All three read one registry, `attribution.config.ts`, and all three assert **both directions**:
 * a registry entry with no header fails, and a `NOTICE.md` row with no entry fails. The reason
 * they are scripts rather than a review habit is that every failure mode here is silent and green
 * — the published package becomes an unattributed derivative of the project we are porting, and
 * nothing goes red.
 */

/**
 * The header must be tagged `@license`, name the upstream **file**, and promise the license file
 * that travels with the package.
 *
 * `@license` is the load-bearing token, not decoration: we ship JSX-preserved **source**, and
 * rolldown strips every unmarked block comment. An attribution written as a plain `/** … *​/`
 * vanishes from `dist/` (`CLAUDE.md` obligation 5) — which is exactly the state the fork was in at
 * hope-ui's tip.
 */
export function checkLicenseHeader(entry, contents) {
  const problems = [];
  const header = contents.slice(0, 1200);

  if (!header.includes("@license")) {
    problems.push(
      "no `@license` tag in the opening comment — rolldown strips every unmarked block comment, " +
        "so an untagged header vanishes from `dist/`",
    );
  }
  if (!header.includes(entry.upstreamFile)) {
    problems.push(`does not name the upstream file \`${entry.upstreamFile}\``);
  }
  if (!header.includes("LICENSE")) {
    problems.push("does not point at the LICENSE distributed with the package");
  }
  if (!header.includes("This file has been modified from the original.")) {
    problems.push('missing the "This file has been modified from the original." line');
  }
  return problems;
}

/**
 * The same header, read back out of the built `dist/` — rule (b), and the one that matters.
 *
 * Entries with no owning package are skipped: there is no `dist/` to read, because nothing
 * publishes them. What they owe instead is asserted in full by the source half above.
 */
export function findMissingDistHeaders(entries, readDistFiles) {
  return entries.flatMap((entry) => {
    if (entry.package === null) {
      return [];
    }
    const distFiles = readDistFiles(entry);
    if (distFiles.length === 0) {
      return [{ entry, reason: "the package has no `dist/` — run the build before this check" }];
    }
    const carried = distFiles.some(
      ({ contents }) => contents.includes("@license") && contents.includes(entry.upstreamFile),
    );
    return carried
      ? []
      : [
          {
            entry,
            reason:
              "the `@license` header naming this upstream file is NOT in `dist/`. Check that " +
              "`comments.legal` is still pinned in `tsdown.config.base.ts`",
          },
        ];
  });
}

/**
 * `comments.legal` pinned **with its comment**. The setting alone is a one-word edit nobody
 * reviews; the comment is what stops someone unpinning it, so both are asserted
 * (`CLAUDE.md` obligation 5).
 */
export function checkCommentsLegalPinned(tsdownBaseConfig) {
  const problems = [];
  if (!/comments\s*=\s*\{[\s\S]{0,200}?legal:\s*true/.test(tsdownBaseConfig)) {
    problems.push(
      "`comments.legal` is not pinned `true` in tsdown.config.base.ts — every `@license` header " +
        "disappears from `dist/` and the published packages become unattributed derivatives, " +
        "with a green build",
    );
  }
  if (!/comments\.legal.+license obligation/s.test(tsdownBaseConfig)) {
    problems.push(
      "the comment explaining WHY `comments.legal` is pinned is gone from tsdown.config.base.ts. " +
        "`CLAUDE.md` obligation 5 requires the comment, not just the setting: without it the next reader " +
        "sees a redundant-looking option and unpins it",
    );
  }
  return problems;
}

/**
 * A `NOTICE.md` table row mentioning this path. Both files, both directions (`CLAUDE.md` obligation 3).
 *
 * The root row is owed by every entry. The package row is owed only by entries a package
 * publishes: a `NOTICE.md` is the notice that travels in the tarball, and an entry with no package
 * has no tarball to travel in (`attribution.config.ts`, `AttributionEntry.package`).
 */
export function findNoticeRowProblems(entries, rootNotice, packageNotices) {
  const problems = [];

  for (const entry of entries) {
    if (!rootNotice.includes(entry.file)) {
      problems.push({ entry, file: "NOTICE.md", reason: `no row for \`${entry.file}\`` });
    }
    if (entry.package === null) {
      continue;
    }
    const packageNotice = packageNotices.get(entry.package);
    if (packageNotice === undefined) {
      problems.push({
        entry,
        file: `packages/${entry.package}/NOTICE.md`,
        reason: "the package has no NOTICE.md — it is the only notice a consumer ever sees",
      });
      continue;
    }
    const withinPackage = entry.file.replace(`packages/${entry.package}/`, "");
    if (!packageNotice.includes(withinPackage)) {
      problems.push({
        entry,
        file: `packages/${entry.package}/NOTICE.md`,
        reason: `no row for \`${withinPackage}\``,
      });
    }
  }

  return problems;
}

/**
 * The other direction: a row claiming a derivation the registry does not declare. A stale row is
 * a claim we no longer make, and it is how a deleted derivative leaves a false statement behind.
 *
 * `noticeOnlyPaths` are declared too — a directory, a binary and a third-party mark all owe a row
 * and can carry no header, so they are declared in the second list rather than left to pass
 * because the scan does not reach them.
 */
export function findOrphanNoticeRows(
  entries,
  noticeText,
  noticeName,
  pathPattern,
  noticeOnlyPaths = [],
) {
  const declared = new Set([
    ...entries.flatMap((entry) => [
      entry.file,
      entry.file.replace(`packages/${entry.package}/`, ""),
    ]),
    ...noticeOnlyPaths.map(({ path }) => path),
  ]);
  return [...noticeText.matchAll(pathPattern)]
    .map((match) => match[1])
    .filter((path) => !declared.has(path))
    .map((path) => ({ file: noticeName, reason: `row for \`${path}\` has no registry entry` }));
}

/**
 * `files` must carry `LICENSE` and `NOTICE.md`, and every file an `@license` header promises is
 * "distributed with this package as …" must actually be in that array. The default `files` ships
 * `dist` and nothing else, which is what makes this the easiest promise in the repo to break
 * (`CLAUDE.md` obligation 4).
 */
export function findPackageFilesProblems(packages) {
  const problems = [];
  for (const { name, directory, files, promisedFiles } of packages) {
    for (const required of ["LICENSE", "NOTICE.md"]) {
      if (!files.includes(required)) {
        problems.push({
          package: name,
          reason: `\`files\` does not carry \`${required}\`, so it never reaches the tarball`,
        });
      }
    }
    for (const promised of promisedFiles) {
      if (!files.includes(promised)) {
        problems.push({
          package: name,
          reason:
            `an \`@license\` header in ${directory} promises the consumer \`${promised}\`, and ` +
            "`files` does not contain it",
        });
      }
    }
  }
  return problems;
}
