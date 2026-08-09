import { css } from "@chakra-ui-solid/styled-system/css";
import { For, Show } from "solid-js";
import { DocLink } from "~/components/doc-link";
import { type DocPage, groupLabel, liveTiers, pagesInTier } from "~/lib/site-map";

/**
 * Every page on the site, grouped by tier and then by its optional one-level group. Built from the
 * same content glob the routes resolve against, so adding a page is adding a file — there is no
 * second list that can disagree with the first.
 */
export function DocsSidebar() {
  return (
    <nav
      aria-label="Docs"
      class={css({
        flexShrink: "0",
        w: "60",
        display: "none",
        md: { display: "block" },
        alignSelf: "start",
        position: "sticky",
        top: "20",
        maxH: "calc(100vh - 6rem)",
        overflowY: "auto",
        pr: "4",
      })}
    >
      <For each={liveTiers()}>
        {(tier) => <SidebarTier label={tier.label} pages={pagesInTier(tier.segment)} />}
      </For>
    </nav>
  );
}

function SidebarTier(props: { label: string; pages: DocPage[] }) {
  const ungrouped = () => props.pages.filter((page) => page.group === undefined);
  const groups = () => [
    ...new Set(
      props.pages.map((page) => page.group).filter((group): group is string => group !== undefined),
    ),
  ];

  return (
    <section class={css({ mb: "6" })}>
      <h2
        class={css({
          fontSize: "xs",
          fontWeight: "semibold",
          textTransform: "uppercase",
          letterSpacing: "wide",
          color: "fg.muted",
          mb: "2",
        })}
      >
        {props.label}
      </h2>
      <SidebarLinks pages={ungrouped()} />
      <For each={groups()}>
        {(group) => (
          <Show when={props.pages.filter((page) => page.group === group)}>
            {(pages) => (
              <div class={css({ mt: "3" })}>
                <h3 class={css({ fontSize: "xs", color: "fg.subtle", mb: "1", pl: "2" })}>
                  {groupLabel(group)}
                </h3>
                <SidebarLinks pages={pages()} />
              </div>
            )}
          </Show>
        )}
      </For>
    </section>
  );
}

function SidebarLinks(props: { pages: DocPage[] }) {
  return (
    <ul class={css({ listStyle: "none", display: "flex", flexDirection: "column", gap: "1" })}>
      <For each={props.pages}>
        {(page) => (
          <li>
            <DocLink
              slug={page.slug}
              class={css({
                display: "block",
                px: "2",
                py: "1",
                borderRadius: "l1",
                fontSize: "sm",
                color: "fg.muted",
                textDecoration: "none",
                _hover: { bg: "bg.muted", color: "fg" },
                "&[data-status=active]": { color: "fg", fontWeight: "medium", bg: "bg.muted" },
              })}
            >
              {page.title}
            </DocLink>
          </li>
        )}
      </For>
    </ul>
  );
}
