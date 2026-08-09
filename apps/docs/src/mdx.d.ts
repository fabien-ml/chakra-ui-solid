declare module "*.mdx" {
  import type { Component } from "solid-js";
  import type { TocEntry } from "~/lib/site-map";

  const MDXComponent: Component;
  export default MDXComponent;

  /**
   * Injected by `@stefanprobst/rehype-extract-toc/mdx` (the rehype chain in `vite.config.ts`), so
   * the table of contents is a module export rather than something computed in the browser.
   * Always defined — an empty array for a page with no headings.
   */
  export const tableOfContents: TocEntry[];

  /** A plain MDX named export at the top of the file: `export const description = "…"`. */
  export const description: string | undefined;

  /** Sidebar position within the tier. Pages without one sort last, alphabetically. */
  export const order: number | undefined;
}
