import { Box } from "chakra-ui-solid";
import { For } from "solid-js";
import { DocLink } from "~/components/ui/doc-link";
import { type NavPage, sidebarGroups } from "~/lib/site-map";

/**
 * A section's groups and their pages — **the list, not the landmark**.
 *
 * Two places render it: the sticky `<aside>` on desktop (`~/components/layout/sidebar`) and the
 * drawer below `md` (`~/components/layout/mobile-nav`). Each owns its own `<nav>` element, because
 * each needs a different `aria-label` — two landmarks called *Docs* in one accessibility tree is
 * the failure this split exists to avoid. Everything below the landmark is shared, so the two
 * cannot drift.
 *
 * Groups and their order come from `~/lib/docs-config`, which is a decision. Which of their entries
 * render comes from the content tree, which is a fact.
 */
export function SidebarNav(props: { section: string; currentSlug: string }) {
  return (
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
        //
        // The palette is set inside the condition rather than on the link, so only the current item
        // is teal and the hover wash above stays neutral. This is the one accented site in
        // chakra-ui.com's docs shell, and it is accented in exactly this place.
        _currentPage={{
          colorPalette: "teal",
          layerStyle: "fill.subtle",
          color: "colorPalette.fg",
          fontWeight: "medium",
        }}
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
