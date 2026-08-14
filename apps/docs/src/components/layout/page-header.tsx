import type { JSX } from "@solidjs/web";
import { Box } from "chakra-ui-solid";
import { For, Show } from "solid-js";
import { ArrowUpRightIcon } from "~/components/ui/icons";
import { GithubIcon, ReactIcon } from "~/components/ui/project-marks";
import type { DocPage } from "~/lib/site-map";

/**
 * A page's title, its one-line description, and its outward links — rendered from frontmatter
 * rather than written into the body (`docs-plan.md` §8.1).
 *
 * The links are structured data for the same reason the props tables are generated: written as
 * body prose, they drift out of a page and nobody notices. Four of them, and **no `storybook`
 * link** — Storybook here is a dev harness and a compile-mode canary, not user-facing docs.
 *
 * The `chakra` link points at the upstream page for the same component, and it is deliberate
 * rather than a courtesy: a reader who wanted the official project should leave in one click
 * (`docs-site.md` §3.4 row 4).
 */
const LINK_LABELS: Record<string, string> = {
  source: "Source",
  recipe: "Recipe",
  machine: "Machine",
  chakra: "React version",
};

/**
 * Every link key but `chakra` points at a file on GitHub — ours for `source` and `recipe`, Zag's for
 * `machine`. `chakra` is the same page on the React version's site, so it takes React's mark.
 */
function LinkIcon(props: { name: string }) {
  return (
    <Box as="span" display="inline-flex" fontSize="lg">
      <Show when={props.name === "chakra"} fallback={<GithubIcon />}>
        <ReactIcon />
      </Show>
    </Box>
  );
}

/**
 * Mark, label, and an arrow saying it opens elsewhere — chakra-ui.com's own header link, whose
 * `ResourceIcon` is the same rule: the mark of whatever the link crosses to.
 *
 * Every value here is a URL by now: `source` is a repo-relative path in frontmatter and
 * `~/lib/site-map` joins it onto the repository (`decisions-ledger.md` D-02 assumed a private
 * repository and a path that could not be linked; it is public, so it is a link).
 */
function PageLink(props: { name: string; value: string }) {
  const label = () => LINK_LABELS[props.name] ?? props.name;

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="2"
      fontWeight="medium"
      color="fg.muted"
      _hover={{ color: "fg" }}
      render={(renderProps) => (
        <a
          {...(renderProps as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
          href={props.value}
          target="_blank"
          rel="noreferrer"
        >
          {renderProps.children}
        </a>
      )}
    >
      <LinkIcon name={props.name} />
      <Box as="span" textDecoration="underline" textUnderlineOffset="3px">
        {label()}
      </Box>
      <Box as="span" display="inline-flex" color="fg.subtle" ms="-1">
        <ArrowUpRightIcon />
      </Box>
    </Box>
  );
}

export function PageHeader(props: { doc: DocPage }) {
  const links = () =>
    Object.entries(props.doc.links ?? {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1] !== "",
    );

  return (
    <Box display="flex" flexDirection="column" gap="4" pb="4">
      <Box as="h1" fontSize="3xl" fontWeight="semibold" letterSpacing="tight" color="fg">
        {props.doc.title}
      </Box>
      <Show when={props.doc.description}>
        {(description) => (
          <Box as="p" color="fg.muted">
            {description()}
          </Box>
        )}
      </Show>
      <Show when={links().length > 0}>
        <Box display="flex" flexWrap="wrap" gap="6" fontSize="sm">
          <For each={links()}>{([name, value]) => <PageLink name={name} value={value} />}</For>
        </Box>
      </Show>
    </Box>
  );
}
