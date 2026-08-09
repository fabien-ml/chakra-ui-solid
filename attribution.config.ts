/**
 * The registry of expression-tier derivatives — one entry per file that reproduces an upstream's
 * *expression*, which is the only tier that owes anything (`legal.md` §1.4, §2.6).
 *
 * **This file is the single place a derivative is declared**, and all three attribution checks
 * read it: `check:license-headers`, `check:notice-rows`, `check:package-files` (`testing.md` §9).
 * They assert both directions — an entry with no `@license` header fails, and a `NOTICE.md` row
 * with no entry fails — because both failure modes are silent and green.
 *
 * **What must not be added:** anything at the *reasoning* or *API shape* tier. Reading a reference
 * for why a component behaves as it does, for its public prop names, or for an ARIA pattern owes
 * nothing. The named non-entry is `theme.extend.tokens.cursor.switch` — a one-word token value is
 * not expression, and a check that demanded a header for it would be wrong (`roadmap.md` §1.3c).
 *
 * The `container` recipe delta in `@chakra-ui-solid/preset` is the eighth entry and the first
 * outside the fork; it arrives with the preset at step 3 (`definition-of-done.md` §6).
 */

export interface AttributionEntry {
  /** Repo-relative path of our file. */
  file: string;
  /** The upstream project, as its GitHub `owner/repo`. */
  upstreamProject: string;
  /** The upstream file this one is derived from — a reader auditing the claim has to open it. */
  upstreamFile: string;
  license: "MIT" | "Apache-2.0";
  /** The owning package's directory name under `packages/`. */
  package: string;
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

export const attributions: AttributionEntry[] = [...zagSolidFork];
