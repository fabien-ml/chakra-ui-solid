import type { Component } from "solid-js";

/**
 * The site's structure, in one module, because three things have to agree about it: the top bar,
 * the sidebar, and `check:docs-inventory`. `docs-site.md` §2.1 is the register of which pages
 * exist; this file is what the app reads, and the check is what holds the two together.
 */

/** A heading, as `@stefanprobst/rehype-extract-toc` emits it — nested by depth. */
export interface TocEntry {
  value: string;
  depth: number;
  id?: string;
  children?: TocEntry[];
}

export interface DocModule {
  default: Component;
  tableOfContents: TocEntry[];
  description?: string;
  order?: number;
}

export interface DocPage {
  /** `get-started/frameworks/vite` — the path under `/docs/`, and the content file's own path. */
  slug: string;
  /** `get-started` — the top-level tier, and the top bar's unit. */
  tier: string;
  /** `frameworks` where the page is nested one level, otherwise `undefined`. */
  group?: string;
  path: string;
  title: string;
  description?: string;
  order: number;
  module: DocModule;
}

/**
 * The four tiers, in nav order, exactly as `docs-site.md` §2.1 settles them: **Get Started ·
 * Components · Styling · Theming**. No sponsor button, no version dropdown, no Docs/Showcase/Blog
 * split, no Charts.
 *
 * A tier renders in the top bar only once it has a page. The site is built incrementally — a
 * component is not done until its docs page is (`definition-of-done.md` rule 2.15) — so a tier
 * with no content yet would be a nav item leading to a 404, which is the reader-facing form of
 * *a page for an unbuilt component is a promise* (`roadmap.md` §9.2).
 */
export const TIERS: { segment: string; label: string }[] = [
  { segment: "get-started", label: "Get Started" },
  { segment: "components", label: "Components" },
  { segment: "styling", label: "Styling" },
  { segment: "theming", label: "Theming" },
];

const GROUP_LABELS: Record<string, string> = {
  frameworks: "Frameworks",
  environments: "Environments",
};

export const groupLabel = (group: string) => GROUP_LABELS[group] ?? group;

// One MDX file per route, under `src/content/<tier>/[<group>/]<name>.mdx`. Adding a page is
// adding a file; there is no second list to update, which is what stops the route map and the
// sidebar from disagreeing. Eager, because the sidebar needs every page's metadata on every
// route and this site is prerendered — there is no async boundary to hide a await behind.
const modules = import.meta.glob<DocModule>("../content/**/*.mdx", { eager: true });

/** The page's `<h1>` — the first depth-1 heading its own table of contents reports. */
function titleOf(toc: TocEntry[], slug: string): string {
  return (toc.find((entry) => entry.depth === 1) ?? toc[0])?.value ?? slug;
}

function toPage(key: string, module: DocModule): DocPage | null {
  const match = key.match(/\/content\/(.+)\.mdx$/);
  if (match?.[1] === undefined) {
    return null;
  }
  const slug = match[1];
  const segments = slug.split("/");
  const tier = segments[0];
  if (tier === undefined || segments.length > 3) {
    return null;
  }

  return {
    slug,
    tier,
    group: segments.length === 3 ? segments[1] : undefined,
    path: `/docs/${slug}`,
    title: titleOf(module.tableOfContents, slug),
    description: module.description,
    order: module.order ?? Number.POSITIVE_INFINITY,
    module,
  };
}

export const docPages: DocPage[] = Object.entries(modules)
  .map(([key, module]) => toPage(key, module))
  .filter((page): page is DocPage => page !== null)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export const pageForSlug = (slug: string): DocPage | undefined =>
  docPages.find((page) => page.slug === slug);

export const pagesInTier = (tier: string): DocPage[] =>
  docPages.filter((page) => page.tier === tier);

/** The tiers with at least one page — what the top bar actually renders. */
export const liveTiers = () => TIERS.filter((tier) => pagesInTier(tier.segment).length > 0);
