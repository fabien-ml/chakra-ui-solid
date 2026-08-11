import type { Component } from "solid-js";
import { docsNav, type NavItem } from "~/lib/docs-config";

/**
 * The content tree, joined to the nav register.
 *
 * Two sources, on purpose. **`docs-config.ts` decides order and grouping** — which section a page
 * belongs to, which group inside it, and where in that group. **The content glob decides
 * existence** — a register entry with no `.mdx` file does not render, so the settled IA can be
 * written down in full while the sidebar shows only pages a reader can open (`decisions.md`
 * **D-141**).
 *
 * Neither is an inventory of what *owes* a page: that is `roadmap.md` §4, read by
 * `check:docs-inventory` (**D-140**).
 */

/** A heading, as `@stefanprobst/rehype-extract-toc` emits it — nested by depth. */
export interface TocEntry {
  value: string;
  depth: number;
  id?: string;
  children?: TocEntry[];
}

/**
 * The outward links a page carries in its frontmatter, rendered by the page header
 * (`docs-plan.md` §8.1). **No `storybook` link** — Storybook here is a dev harness and a
 * compile-mode canary, not user-facing docs.
 */
export interface DocLinks {
  /** The component's directory under `packages/chakra-ui-solid/src/components`. */
  source?: string;
  /** Its preset key, or absent where the key resolves to nothing (`roadmap.md` §4). */
  recipe?: string;
  /** Its `@zag-js/*` machine, or absent where it has none. */
  machine?: string;
  /** The upstream page for the same component — an outward link, and `docs-site.md` §3.4
   * row 4 makes it a virtue: a reader who wanted the official project leaves in one click. */
  chakra?: string;
}

export interface DocFrontmatter {
  title: string;
  description?: string;
  links?: DocLinks;
}

export interface DocModule {
  default: Component;
  tableOfContents: TocEntry[];
  frontmatter: DocFrontmatter;
}

export interface DocPage {
  /** `get-started/frameworks/vite` — the path under `/docs/`, and the content file's own path. */
  slug: string;
  /** `get-started` — the top-level section, and the top bar's unit. */
  section: string;
  path: string;
  title: string;
  description?: string;
  links?: DocLinks;
  module: DocModule;
}

export interface NavSection {
  segment: string;
  label: string;
}

/**
 * A page as the navigation names it. `navTitle` is the register's label — short, so a sidebar
 * column stays a column — while `title` is the page's own frontmatter heading, which is a
 * sentence: *Vite* in the sidebar, *Using chakra-ui-solid in Vite* at the top of the page. That
 * split is chakra-ui.com's, and losing it is what turns their sidebar into a wall of prose.
 */
export interface NavPage extends DocPage {
  navTitle: string;
}

export interface SidebarGroup {
  title: string;
  pages: NavPage[];
}

// One MDX file per route, under `src/content/<section>/[<group>/]<name>.mdx`. Eager, because the
// sidebar needs every page's metadata on every route and this site is prerendered — there is no
// async boundary to hide an await behind.
const modules = import.meta.glob<DocModule>("../content/**/*.mdx", { eager: true });

function toPage(key: string, module: DocModule): DocPage | null {
  const slug = key.match(/\/content\/(.+)\.mdx$/)?.[1];
  const section = slug?.split("/")[0];
  if (slug === undefined || section === undefined) {
    return null;
  }
  return {
    slug,
    section,
    path: `/docs/${slug}`,
    title: module.frontmatter.title,
    description: module.frontmatter.description,
    links: module.frontmatter.links,
    module,
  };
}

const pagesBySlug = new Map<string, DocPage>();
for (const [key, module] of Object.entries(modules)) {
  const page = toPage(key, module);
  if (page !== null) {
    pagesBySlug.set(page.slug, page);
  }
}

export const pageForSlug = (slug: string): DocPage | undefined => pagesBySlug.get(slug);

const joinSegments = (...segments: (string | undefined)[]) =>
  segments.filter((segment) => segment !== undefined && segment !== "").join("/");

/**
 * A register group's pages, in register order, keeping only the ones that have a content file.
 * `group.url` is a path segment on the groups that nest (`frameworks`, `style-props`) and absent
 * on the ones that are only a heading (`Layout`, `Concepts`) — exactly as chakra-ui.com's own
 * tree distinguishes them.
 */
function pagesOf(section: NavItem, group: NavItem): NavPage[] {
  return (group.items ?? [])
    .map((item) => {
      const page = pagesBySlug.get(joinSegments(section.url, group.url, item.url));
      return page === undefined ? undefined : { ...page, navTitle: item.title };
    })
    .filter((page): page is NavPage => page !== undefined);
}

/**
 * The current section's groups — **the sidebar is scoped to one section**, which is the single
 * structural thing chakra-ui.com does that this site did not (`decisions.md` **D-147** failure 1).
 * Rendering every section at once put *Components* under *Get Started*.
 *
 * A page with a content file and no register entry lands in a trailing **Ungrouped** heading
 * rather than vanishing: an unreachable page is the worse failure, and this one is visible on the
 * page rather than only in a diff.
 */
export function sidebarGroups(sectionSegment: string): SidebarGroup[] {
  const section = docsNav.find((item) => item.url === sectionSegment);
  if (section === undefined) {
    return [];
  }

  const registered = new Set<string>();
  const groups: SidebarGroup[] = [];

  for (const group of section.items ?? []) {
    const pages = pagesOf(section, group);
    for (const page of pages) {
      registered.add(page.slug);
    }
    if (pages.length > 0) {
      groups.push({ title: group.title, pages });
    }
  }

  const ungrouped = [...pagesBySlug.values()]
    .filter((page) => page.section === sectionSegment && !registered.has(page.slug))
    .map((page) => ({ ...page, navTitle: page.title }));
  if (ungrouped.length > 0) {
    groups.push({ title: "Ungrouped", pages: ungrouped });
  }

  return groups;
}

/** The sections that have at least one page — what the top bar actually renders. */
export function liveSections(): NavSection[] {
  return docsNav
    .filter((section) => sidebarGroups(section.url ?? "").length > 0)
    .map((section) => ({ segment: section.url ?? "", label: section.title }));
}

/** The first page of a section, which is where its top-bar entry points. */
export const firstPageOf = (sectionSegment: string): NavPage | undefined =>
  sidebarGroups(sectionSegment)[0]?.pages[0];

/**
 * Every live page in register order, flattened across sections — the sequence the previous/next
 * pager walks. It crosses section boundaries the way chakra-ui.com's does, so the last page of
 * Get Started leads into the first page of Components rather than dead-ending.
 */
export function orderedPages(): NavPage[] {
  return docsNav.flatMap((section) =>
    sidebarGroups(section.url ?? "").flatMap((group) => group.pages),
  );
}

export function siblingsOf(slug: string): { previous?: NavPage; next?: NavPage } {
  const pages = orderedPages();
  const index = pages.findIndex((page) => page.slug === slug);
  if (index === -1) {
    return {};
  }
  return { previous: pages[index - 1], next: pages[index + 1] };
}
