import { Box } from "chakra-ui-solid";
import { For } from "solid-js";
import { DocLink } from "~/components/doc-link";
import { type NavPage, sidebarGroups } from "~/lib/site-map";

/**
 * The left sidebar, **scoped to the current section**.
 *
 * That scoping is the structural thing chakra-ui.com does and this site did not: their sidebar
 * shows the groups of whichever top-level section you are in, and the section tabs above it are
 * how you change sections. Rendering every section at once put *Components* under *Get Started*,
 * so the sidebar contradicted the bar above it (`decisions.md` **D-147** failure 1).
 *
 * Groups and their order come from `~/lib/docs-config`, which is a decision. Which of their
 * entries render comes from the content tree, which is a fact.
 */
export function DocsSidebar(props: { section: string; currentSlug: string }) {
  return (
    <Box
      as="aside"
      display="none"
      md={{ display: "block" }}
      flexShrink="0"
      width="16rem"
      pe="5"
      ms="-3"
      py="8"
      fontSize="sm"
      position="sticky"
      top="var(--header-height)"
      height="var(--content-height)"
      overflowY="auto"
      overscrollBehavior="contain"
    >
      <Box as="nav" aria-label="Docs" display="flex" flexDirection="column" gap="6">
        <For each={sidebarGroups(props.section)}>
          {(group) => (
            <Box display="flex" flexDirection="column" gap="2">
              {/* A `div`, not a heading: the page's own `## …` are the document outline, and a
                  sidebar group title inserted above the `<h1>` would put the outline out of
                  order for a screen reader. chakra-ui.com's sidenav title is a `div` for the
                  same reason. */}
              <Box ps="4" fontWeight="semibold" color="fg">
                {group.title}
              </Box>
              <Box as="ul" listStyle="none" display="flex" flexDirection="column" gap="1px">
                <For each={group.pages}>
                  {(page) => <SidebarLink doc={page} currentSlug={props.currentSlug} />}
                </For>
              </Box>
            </Box>
          )}
        </For>
      </Box>
    </Box>
  );
}

function SidebarLink(props: { doc: NavPage; currentSlug: string }) {
  return (
    <li>
      <Box
        display="flex"
        alignItems="center"
        py="1.5"
        ps="4"
        pe="3"
        borderRadius="sm"
        color="fg.muted"
        textDecoration="none"
        _hover={{ layerStyle: "fill.subtle" }}
        // `_currentPage` is Panda's name for the `[aria-current=page]` selector this used to spell
        // out — same rule, and the same one the section tabs in the header use.
        _currentPage={{ layerStyle: "fill.subtle", color: "colorPalette.fg", fontWeight: "medium" }}
        render={(renderProps) => (
          <DocLink
            slug={props.doc.slug}
            aria-current={props.doc.slug === props.currentSlug ? "page" : undefined}
            class={renderProps.class as string}
          >
            {renderProps.children}
          </DocLink>
        )}
      >
        {props.doc.navTitle}
      </Box>
    </li>
  );
}
