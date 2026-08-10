/**
 * The registry of expression-tier derivatives — one entry per file that reproduces an upstream's
 * *expression*, which is the only tier that owes anything (`CLAUDE.md`, *Reference use, and the expression tier*).
 *
 * **This file is the single place a derivative is declared**, and all three attribution checks
 * read it: `check:attribution`, `check:attribution`, `check:attribution` (`testing.md` §9).
 * They assert both directions — an entry with no `@license` header fails, and a `NOTICE.md` row
 * with no entry fails — because both failure modes are silent and green.
 *
 * **What must not be added:** anything at the *reasoning* or *API shape* tier. Reading a reference
 * for why a component behaves as it does, for its public prop names, or for an ARIA pattern owes
 * nothing. The named non-entry is `theme.extend.tokens.cursor.switch` — a one-word token value is
 * not expression, and a check that demanded a header for it would be wrong (`roadmap.md` §1.3c).
 *
 * **The registry covers `apps/` as well as `packages/`** (`docs-site.md` §3.3). A derivative in an
 * unpublished app owes fewer things, not nothing, and `package: null` is how an entry says so.
 *
 * The `container` recipe delta in `@chakra-ui-solid/panda-preset` is the first expression-tier file
 * inside a package but outside the fork. It arrives with the **Container component at step 6a**,
 * not with the preset — the preset package itself ships at step 3 with an empty derived-file table,
 * because it vendors nothing (`definition-of-done.md` §6; `decisions.md` D-122).
 */

export interface AttributionEntry {
  /** Repo-relative path of our file. */
  file: string;
  /** The upstream project, as its GitHub `owner/repo`. */
  upstreamProject: string;
  /** The upstream file this one is derived from — a reader auditing the claim has to open it. */
  upstreamFile: string;
  license: "MIT" | "Apache-2.0";
  /**
   * The owning package's directory name under `packages/`, or `null` when no package publishes the
   * file — today that means the docs app.
   *
   * `null` narrows what the entry owes rather than excusing it. The obligations it drops are the
   * ones whose whole point is reaching someone who installed a tarball: a package `NOTICE.md`, a
   * `files` array, and the header surviving into `dist/`. The two it keeps are the ones that do not
   * depend on npm — the `@license` header on the file, and the row in the root `NOTICE.md`, which
   * is the audit surface whatever the file's distribution channel is. The docs site is published;
   * it is published to the web (`docs-site.md` §3.3).
   */
  package: string | null;
}

/**
 * A path that owes a row in the root `NOTICE.md` and **cannot** owe an `@license` header — a
 * directory, a binary, or a third-party mark that is not our derivative at all.
 *
 * This list is what lets `check:attribution` scan `apps/` rows in the orphan direction. Without it
 * every row below reads as a row with no registry entry, and the check would have to stop looking
 * at `apps/` altogether — which is the state that let a NOTICE row and its `@license` header both
 * become deletable with nothing going red.
 */
export interface NoticeOnlyPath {
  /** The path exactly as the root `NOTICE.md` row writes it. */
  path: string;
  /** Why it cannot be a registry entry. A row with no reason is a row nobody re-examined. */
  reason: string;
}

const zagSolidFork: AttributionEntry[] = [
  "machine",
  "bindable",
  "merge-props",
  "normalize-props",
  "refs",
  "track",
  "index",
].map((name) => ({
  file: `packages/zag-solid/src/${name}.ts`,
  upstreamProject: "chakra-ui/zag",
  upstreamFile: `packages/frameworks/solid/src/${name}.ts`,
  license: "MIT" as const,
  package: "zag-solid",
}));

const chakraReact: AttributionEntry[] = [
  {
    // One table — `exceptionPropMap`, the seven SVG tags whose geometry attributes must reach the
    // DOM rather than become a class. A verbatim data table is expression, where the factory's
    // API shape around it is not.
    file: "packages/system/src/factory/factory.tsx",
    upstreamProject: "chakra-ui/chakra-ui",
    upstreamFile: "packages/react/src/styled-system/factory.tsx",
    license: "MIT",
    package: "system",
  },
];

const docsApp: AttributionEntry[] = [
  {
    file: "apps/docs/src/components/site/icons.tsx",
    upstreamProject: "chakra-ui/chakra-ui",
    upstreamFile: "apps/www/components/site/icons.tsx",
    license: "MIT",
    package: null,
  },
];

export const attributions: AttributionEntry[] = [...zagSolidFork, ...chakraReact, ...docsApp];

export const noticeOnlyPaths: NoticeOnlyPath[] = [
  {
    path: "apps/docs/src/content",
    reason:
      "A directory, and deliberately one row rather than 111 — the content tier is a single " +
      "derivative and a directory carries no header (`decisions.md` D-148).",
  },
  {
    path: "apps/docs/public/favicon.ico",
    reason: "A binary. There is nowhere in an `.ico` to put a comment.",
  },
  {
    path: "apps/docs/public/logos/vite.svg",
    reason:
      "Not our derivative. Another project's mark, shown unmodified to name the framework its " +
      "cell links to — nominative use, which owes a row and no header.",
  },
  {
    path: "apps/docs/public/logos/solid-start.svg",
    reason: "Nominative use, as `vite.svg`.",
  },
  {
    path: "apps/docs/public/logos/tanstack-light.svg",
    reason: "Nominative use, as `vite.svg`.",
  },
  {
    path: "apps/docs/public/logos/tanstack-dark.svg",
    reason: "Nominative use, as `vite.svg`.",
  },
];
