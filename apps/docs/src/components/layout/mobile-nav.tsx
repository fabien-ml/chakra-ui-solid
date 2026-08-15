import { Portal } from "@solidjs/web";
import { useLocation } from "@tanstack/solid-router";
import {
  Box,
  CloseButton,
  type CloseButtonProps,
  Drawer,
  IconButton,
  type IconButtonProps,
} from "chakra-ui-solid";
import { createEffect, createSignal, For, Show } from "solid-js";
import { SidebarNav } from "~/components/layout/sidebar-nav";
import { DocLink } from "~/components/ui/doc-link";
import { MenuIcon } from "~/components/ui/icons";
import { GithubIcon } from "~/components/ui/project-marks";
import { SITE_NAME } from "~/config";
import { repoUrl } from "~/lib/docs-config";
import { firstPageOf, liveSections } from "~/lib/site-map";

const DOCS_PREFIX = "/docs/";

/**
 * The whole navigation, below `md`.
 *
 * The top bar has no room for four section tabs on a phone, and the sidebar that carries the pages
 * is `display: none` there — so below `md` the bar drops to wordmark · burger · theme toggle, and
 * everything else moves in here: the sections, the current section's groups, and the GitHub link.
 * Before this, the only way to reach a page from a phone was the prev/next pager or the URL bar.
 *
 * Its destination is derived from the router rather than passed down. `/docs/$` is one splat route,
 * so the pathname already carries the slug and the section is its first segment — the header is not
 * inside the route, and plumbing them through the root layout would put the whole content tier's
 * shape into a component that only needs a string.
 */
export function MobileNav() {
  const location = useLocation();
  const currentSlug = () => {
    const { pathname } = location();
    return pathname.startsWith(DOCS_PREFIX) ? pathname.slice(DOCS_PREFIX.length) : "";
  };
  const currentSection = () => currentSlug().split("/")[0] ?? "";
  const isCurrentSection = (segment: string) => currentSection() === segment;

  const [open, setOpen] = createSignal(false);

  // TanStack navigates on the client, so the header never unmounts and a drawer opened on one page
  // would still be sitting over the next one. The links stay plain links — wrapping each in
  // `Drawer.ActionTrigger` is the per-link answer, but they live in `SidebarNav`, which the desktop
  // sidebar shares and which has no drawer to close.
  createEffect(
    () => location().pathname,
    () => {
      setOpen(false);
    },
  );

  return (
    <Drawer.Root open={open()} onOpenChange={(details) => setOpen(details.open)} placement="start">
      <Drawer.Trigger
        render={(props) => (
          <IconButton
            variant="ghost"
            size="sm"
            hideFrom="md"
            {...(props as IconButtonProps)}
            aria-label="Open navigation"
          />
        )}
      >
        <MenuIcon />
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title flex="1">Navigation</Drawer.Title>
              <Drawer.CloseTrigger
                pos="initial"
                render={(props) => <CloseButton size="sm" {...(props as CloseButtonProps)} />}
              />
            </Drawer.Header>
            <Drawer.Body>
              {/* Not `aria-label="Docs"` — the sticky sidebar owns that name, and nothing stops a
                  viewport from having both in the accessibility tree at once. */}
              <Box
                as="nav"
                aria-label="Site"
                display="flex"
                flexDirection="column"
                gap="6"
                fontSize="sm"
              >
                {/* The header's four tabs, relocated. `_currentPage` below marks the whole
                    section, not just its first page, because `DocLink` takes the prefix-match
                    answer written here over the router's own — see `~/components/ui/doc-link`. */}
                <Box as="ul" listStyle="none" display="flex" flexDirection="column" gap="1px">
                  <For each={liveSections()}>
                    {(section) => (
                      <li>
                        <Box
                          display="flex"
                          alignItems="center"
                          py="1.5"
                          ps="4"
                          pe="3"
                          borderRadius="sm"
                          fontWeight="semibold"
                          color="fg"
                          textDecoration="none"
                          _hover={{ layerStyle: "fill.subtle" }}
                          _currentPage={{
                            colorPalette: "teal",
                            layerStyle: "fill.subtle",
                            color: "colorPalette.fg",
                          }}
                          render={(props) => (
                            <DocLink
                              slug={firstPageOf(section.segment)?.slug ?? ""}
                              aria-current={isCurrentSection(section.segment) ? "page" : undefined}
                              class={props.class as string}
                            >
                              {props.children}
                            </DocLink>
                          )}
                        >
                          {section.label}
                        </Box>
                      </li>
                    )}
                  </For>
                </Box>

                {/* The landing page is in no section, so there are no groups to show there. */}
                <Show when={currentSection()}>
                  {(section) => <SidebarNav section={section()} currentSlug={currentSlug()} />}
                </Show>

                <Box
                  display="inline-flex"
                  alignItems="center"
                  gap="2"
                  ps="4"
                  color="fg.muted"
                  textDecoration="none"
                  _hover={{ color: "fg" }}
                  render={(props) => (
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      class={props.class as string}
                    >
                      {props.children}
                    </a>
                  )}
                >
                  <GithubIcon />
                  {`${SITE_NAME} on GitHub`}
                </Box>
              </Box>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
