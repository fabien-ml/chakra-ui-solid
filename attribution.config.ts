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
 * The `container` recipe delta in `@chakra-ui-solid/panda-preset` was the first expression-tier
 * file inside a package but outside the fork, and it landed with the Container component rather
 * than with the preset — which is why that package shipped with an empty derived-file table and
 * grew a row later (`definition-of-done.md` §6; `decisions.md` D-122).
 */

export interface AttributionEntry {
  /** Repo-relative path of our file. */
  file: string;
  /** The upstream project, as its GitHub `owner/repo`. */
  upstreamProject: string;
  /** The upstream file this one is derived from — a reader auditing the claim has to open it. */
  upstreamFile: string;
  license: "MIT" | "Apache-2.0" | "ISC";
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
  ...["machine", "bindable", "merge-props", "normalize-props", "refs", "track"].map((name) => ({
    file: `packages/core/src/zag/${name}.ts`,
    upstreamProject: "chakra-ui/zag",
    upstreamFile: `packages/frameworks/solid/src/${name}.ts`,
    license: "MIT" as const,
    package: "core",
  })),
  {
    // The fork's barrel, which is the package's barrel: a `src/zag/index.ts` that only re-exports
    // is erased at bundle time, and `--dist` catches the `@license` header going with it.
    file: "packages/core/src/index.ts",
    upstreamProject: "chakra-ui/zag",
    upstreamFile: "packages/frameworks/solid/src/index.ts",
    license: "MIT" as const,
    package: "core",
  },
];

const chakraReact: AttributionEntry[] = [
  {
    // A whole recipe body, reproduced because `@chakra-ui/panda-preset` omits the `container` key
    // that `@chakra-ui/react`'s own theme defines. One modification, and it is the `className`.
    file: "packages/panda-preset/src/container-recipe.ts",
    upstreamProject: "chakra-ui/chakra-ui",
    upstreamFile: "packages/react/src/theme/recipes/container.ts",
    license: "MIT",
    package: "panda-preset",
  },
  {
    // One table — `exceptionPropMap`, the seven SVG tags whose geometry attributes must reach the
    // DOM rather than become a class. A verbatim data table is expression, where the factory's
    // API shape around it is not.
    file: "packages/core/src/factory/factory.tsx",
    upstreamProject: "chakra-ui/chakra-ui",
    upstreamFile: "packages/react/src/styled-system/factory.tsx",
    license: "MIT",
    package: "core",
  },
  {
    // The internal glyph set — 18 SVG paths, the defaults component recipes render when the caller
    // passes no icon. A copied path is expression however few bytes it takes
    // (`apps/docs/src/components/decorative-box.tsx` is here for the same reason), where the
    // components around them are API shape and owe nothing. The ✕ lived in `close-button.tsx` while
    // it was the only one; it moved here with the rest rather than earning a second row.
    file: "packages/chakra-ui-solid/src/components/icons.tsx",
    upstreamProject: "chakra-ui/chakra-ui",
    upstreamFile: "packages/react/src/components/icons.tsx",
    license: "MIT",
    package: "chakra-ui-solid",
  },
  {
    // Two more glyphs — the tick a checked Checkmark draws and the dash an indeterminate one draws.
    // They are not the row above: they come from a different upstream file, the tick is expressed
    // as a polyline rather than a path, and the dash has no counterpart in the glyph set at all.
    // (The tick traces the same three points as `CheckIcon` there, which is why the reuse was
    // considered; it was declined because a nested `svg` is not the markup Chakra renders.) The
    // component around them is public API shape and owes nothing.
    file: "packages/chakra-ui-solid/src/components/checkmark/checkmark.tsx",
    upstreamProject: "chakra-ui/chakra-ui",
    upstreamFile: "packages/react/src/components/checkmark/checkmark.tsx",
    license: "MIT",
    package: "chakra-ui-solid",
  },
];

const docsApp: AttributionEntry[] = [
  {
    // The brand marks — the bolt and the logotype glyph. They were `site/icons.tsx` until the
    // Lucide set arrived and each file was made to owe exactly one upstream.
    file: "apps/docs/src/components/site/logo.tsx",
    upstreamProject: "chakra-ui/chakra-ui",
    upstreamFile: "apps/www/components/site/icons.tsx",
    license: "MIT",
    package: null,
  },
  {
    // One entry for twenty-five glyphs, on the reasoning that makes `apps/docs/src/content` one row
    // rather than 111: the icon set is a single derivative of one upstream directory. `upstreamFile`
    // is that directory, and the module names the individual `icons/*.svg` above each component —
    // which is what a reader auditing the claim actually opens.
    //
    // The only ISC entry, and the only one owing a *second* upstream: fifteen of the twenty-five are
    // Lucide's own derivatives of Feather, MIT. Both notices are in the root `NOTICE.md`.
    file: "apps/docs/src/components/site/icons.tsx",
    upstreamProject: "lucide-icons/lucide",
    upstreamFile: "icons/",
    license: "ISC",
    package: null,
  },
  {
    // The same glyph as `LogoIcon` above, as a standalone document a browser can use as the tab
    // icon. An `.svg` is text and carries a header, which is what keeps it out of the list below.
    file: "apps/docs/public/icon.svg",
    upstreamProject: "chakra-ui/chakra-ui",
    upstreamFile: "apps/www/components/logo.tsx",
    license: "MIT",
    package: null,
  },
  {
    // The hatched surface every layout example stands on. Its declarations are ordinary and its
    // data-URI pattern is not — a copied SVG path is expression however few bytes it takes.
    file: "apps/docs/src/components/decorative-box.tsx",
    upstreamProject: "chakra-ui/chakra-ui",
    upstreamFile: "apps/compositions/src/lib/decorative-box.tsx",
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
    path: "apps/docs/public/apple-touch-icon.png",
    reason:
      "`icon.svg` rasterized for iOS, which reads no SVG icon. A render of a derivative is one " +
      "too, and a PNG has nowhere to put the header the `.svg` carries.",
  },
  {
    path: "apps/docs/public/icon-192.png",
    reason: "The manifest's icon for Android home screens. A binary, as `apple-touch-icon.png`.",
  },
  {
    path: "apps/docs/public/icon-512.png",
    reason: "As `icon-192.png`, at the size an install prompt uses.",
  },
  {
    path: "apps/docs/src/components/site/project-marks.tsx",
    reason:
      "Not our derivative. Two other projects' marks — GitHub's and React's — naming what a page " +
      "header's links cross to. Nominative use, as the framework logos are. Inline rather than " +
      "files in `public/` because they sit in a line of text and must take `currentColor`; that " +
      "monochrome, and React's stroke width at text size, are the only departures from each mark " +
      "as its project publishes it.",
  },
  {
    path: "apps/docs/public/logos/vite-dark.svg",
    reason:
      "Not our derivative. Another project's mark, shown to name the framework its cell links " +
      "to — nominative use, which owes a row and no header. Vite's own `logo.svg`, byte for byte.",
  },
  {
    path: "apps/docs/public/logos/vite-light.svg",
    reason:
      "The same file with its two parenthesis strokes recoloured, because white ones are " +
      "invisible on a white page and Vite publishes no dark-ink version of the bare mark. The " +
      "colour is `#08060D`, taken from their own light-background lockup rather than chosen here.",
  },
  {
    path: "apps/docs/public/logos/solid-start.svg",
    reason: "Nominative use, as `vite-dark.svg`.",
  },
  {
    path: "apps/docs/public/logos/tanstack-light.svg",
    reason: "Nominative use, as `vite-dark.svg`.",
  },
  {
    path: "apps/docs/public/logos/tanstack-dark.svg",
    reason: "Nominative use, as `vite-dark.svg`.",
  },
];
