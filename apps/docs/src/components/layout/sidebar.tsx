import { Box } from "chakra-ui-solid";
import { SidebarNav } from "~/components/layout/sidebar-nav";

/**
 * The left sidebar, **scoped to the current section**.
 *
 * That scoping is the structural thing chakra-ui.com does and this site did not: their sidebar
 * shows the groups of whichever top-level section you are in, and the section tabs above it are
 * how you change sections. Rendering every section at once put *Components* under *Get Started*,
 * so the sidebar contradicted the bar above it (`decisions-ledger.md` **D-147** failure 1).
 *
 * It leaves the layout below `md`, where the same list is reachable from the header's burger
 * instead (`~/components/layout/mobile-nav`).
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
        <SidebarNav section={props.section} currentSlug={props.currentSlug} />
      </Box>
    </Box>
  );
}
