import { readFile } from "node:fs/promises";
import { codeToHtml } from "shiki";
import type { Plugin } from "vite";

const HIGHLIGHT_QUERY = "?highlight";

/**
 * Turns `import html from "./example.tsx?highlight"` into the file's Shiki-highlighted HTML,
 * **at build time**.
 *
 * It exists because a docs page shows two things that must not diverge: the component an example
 * renders, and that same file's source (`docs-plan.md` §8.2). The source pane is read from the
 * file rather than transcribed, so a hand-copied snippet cannot drift — and the highlighting has
 * to happen somewhere.
 *
 * **Not in the browser.** A client-side highlighter ships a highlighter to every reader for
 * content that never changes, and most of them create a `<style>` element on first render, which
 * is exactly what `plan.md` §0 forbids of our own code — on the most visible page in the project
 * (`docs-site.md` §1.4). Fenced code in `.mdx` is already highlighted at build time by
 * `rehype-pretty-code`; this is the same decision for the half of the site that is not a fence.
 *
 * `defaultColor: false` makes Shiki emit `--shiki-light` / `--shiki-dark` custom properties per
 * token instead of a committed colour, which is what lets one Panda rule pick the right one per
 * colour mode without a second stylesheet — the same shape `rehype-pretty-code`'s dual-theme
 * output has, so both panes are styled by the same rule.
 */
export function exampleSourceHighlighter(): Plugin {
  return {
    name: "chakra-ui-solid-docs:highlight",
    enforce: "pre",
    async load(id) {
      const [path, query] = id.split("?");
      if (path === undefined || `?${query ?? ""}` !== HIGHLIGHT_QUERY) {
        return null;
      }
      const source = await readFile(path, "utf8");
      const html = await codeToHtml(source.trimEnd(), {
        lang: "tsx",
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      });
      return `export default ${JSON.stringify(html)}`;
    },
  };
}
