import { css } from "@chakra-ui-solid/styled-system/css";
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
 * (`legal.md` §3.3.3 item 2).
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
 * on its own repository; ours is private (`legal.md` §3.5), so a link would 404 for every reader.
 * The path still tells you where the code lives, and the day the repository is public the
 * frontmatter value becomes a URL and this renders a link with nothing else changing.
 */
function PageLink(props: { name: string; value: string }) {
  const label = () => LINK_LABELS[props.name] ?? props.name;

  return (
    <Show
      when={/^https?:\/\//.test(props.value)}
      fallback={
        <span class={css({ color: "fg.muted" })}>
          {label()}: <code class={css({ fontFamily: "mono", fontSize: "xs" })}>{props.value}</code>
        </span>
      }
    >
      <a
        href={props.value}
        target="_blank"
        rel="noreferrer"
        class={css({
          fontWeight: "medium",
          color: "fg.muted",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          _hover: { color: "fg" },
        })}
      >
        {label()} ↗
      </a>
    </Show>
  );
}

export function PageHeader(props: { doc: DocPage }) {
  const links = () =>
    Object.entries(props.doc.links ?? {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1] !== "",
    );

  return (
    <div class={css({ display: "flex", flexDirection: "column", gap: "4", pb: "4" })}>
      <h1
        class={css({
          fontSize: "3xl",
          fontWeight: "semibold",
          letterSpacing: "tight",
          color: "fg",
        })}
      >
        {props.doc.title}
      </h1>
      <Show when={props.doc.description}>
        {(description) => <p class={css({ color: "fg.muted" })}>{description()}</p>}
      </Show>
      <Show when={links().length > 0}>
        <div class={css({ display: "flex", flexWrap: "wrap", gap: "6", fontSize: "sm" })}>
          <For each={links()}>{([name, value]) => <PageLink name={name} value={value} />}</For>
        </div>
      </Show>
    </div>
  );
}
