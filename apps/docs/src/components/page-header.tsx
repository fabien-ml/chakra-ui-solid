import type { JSX } from "@solidjs/web";
import { Box } from "chakra-ui-solid";
import { For, Show } from "solid-js";
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
  chakra: "Chakra UI",
};

/**
 * A link value that is a URL renders as an anchor; anything else renders as text.
 *
 * The one that is not a URL today is `source`. chakra-ui.com builds it into a `tree/main/...` link
 * on its own repository; ours is private (`decisions.md` D-02), so a link would 404 for every reader.
 * The path still tells you where the code lives, and the day the repository is public the
 * frontmatter value becomes a URL and this renders a link with nothing else changing.
 */
function PageLink(props: { name: string; value: string }) {
  const label = () => LINK_LABELS[props.name] ?? props.name;

  return (
    <Show
      when={/^https?:\/\//.test(props.value)}
      fallback={
        <Box as="span" color="fg.muted">
          {label()}:{" "}
          <Box as="code" fontFamily="mono" fontSize="xs">
            {props.value}
          </Box>
        </Box>
      }
    >
      <Box
        fontWeight="medium"
        color="fg.muted"
        textDecoration="underline"
        textUnderlineOffset="3px"
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
        {label()} ↗
      </Box>
    </Show>
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
