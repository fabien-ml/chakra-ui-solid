import { Link, useLocation } from "@tanstack/solid-router";
import { Box, IconButton } from "chakra-ui-solid";
import { For } from "solid-js";
import { ColorModeToggle } from "~/components/layout/color-mode-toggle";
import { MobileNav } from "~/components/layout/mobile-nav";
import { Container } from "~/components/ui/container";
import { DocLink } from "~/components/ui/doc-link";
import { LogoIcon } from "~/components/ui/logo";
import { GithubIcon } from "~/components/ui/project-marks";
import { SITE_NAME } from "~/config";
import { repoUrl } from "~/lib/docs-config";
import { firstPageOf, liveSections } from "~/lib/site-map";

/**
 * The top bar: the wordmark, the four sections, the colour-mode toggle. **One row.**
 *
 * chakra-ui.com has two, and copying that shape here would be copying it for the wrong reason.
 * Their first row is a **site-level** nav over five content types — Docs · Showcase · Spotlight ·
 * Blog · Guides — and the second row appears *inside* Docs to pick a section. This site has one
 * content type, so the sections have no row to be secondary to: they are the top bar
 * (`docs-site.md` §2.1, which has said *"the top bar is exactly four items"* since it was
 * written).
 *
 * A section appears once it has a page. The site is built incrementally and is meant to be
 * readable as a site at every gate (`definition-of-done.md` rule 2.15), and a nav item pointing
 * at an empty tier is a 404 with a promise attached (`decisions-ledger.md` **D-141**).
 *
 * The mark is Chakra's bolt glyph beside **our** wordmark: the logotype next to it reads
 * `chakra-ui-solid`, never `chakra`. The glyph is MIT like the rest of their source and is
 * attributed in `~/components/ui/logo` and the root `NOTICE.md`.
 *
 * Below `md` the row is wordmark · burger · theme toggle: the sections and the GitHub link move
 * into the drawer (`~/components/layout/mobile-nav`), which is where the sidebar's pages have to go
 * anyway once the sidebar itself is out of the layout.
 */
export function SiteHeader() {
  const location = useLocation();
  const isCurrent = (segment: string) => location().pathname.startsWith(`/docs/${segment}`);

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      display="flex"
      justifyContent="center"
      width="full"
      minH="var(--header-height)"
      borderBottomWidth="1px"
      borderColor="border.muted"
      bg="bg"
    >
      <Container as="nav" aria-label="Main" display="flex" alignItems="center" gap="8">
        <Box
          display="inline-flex"
          alignItems="center"
          gap="2.5"
          flexShrink="0"
          fontWeight="semibold"
          color="fg"
          textDecoration="none"
          focusRing="outside"
          render={(props) => (
            <Link
              to="/"
              aria-label={`${SITE_NAME}, back to homepage`}
              class={props.class as string}
            >
              {props.children}
            </Link>
          )}
        >
          <LogoIcon />
          {SITE_NAME}
        </Box>

        <Box
          as="ul"
          hideBelow="md"
          display="flex"
          alignItems="center"
          gap="6"
          listStyleType="none"
          overflowX="auto"
        >
          <For each={liveSections()}>
            {(section) => (
              <Box as="li">
                <Box
                  fontSize="sm"
                  color="fg.muted"
                  textDecoration="none"
                  whiteSpace="nowrap"
                  transition="color 0.2s"
                  _hover={{ color: "fg" }}
                  _currentPage={{ color: "fg", fontWeight: "medium" }}
                  render={(props) => (
                    <DocLink
                      slug={firstPageOf(section.segment)?.slug ?? ""}
                      aria-current={isCurrent(section.segment) ? "page" : undefined}
                      class={props.class as string}
                    >
                      {props.children}
                    </DocLink>
                  )}
                >
                  {section.label}
                </Box>
              </Box>
            )}
          </For>
        </Box>

        <Box ms="auto" display="flex" alignItems="center" gap="1">
          <MobileNav />
          {/* The label sits on the anchor rather than on IconButton, because the render callback
            picks `class` and `children` rather than spreading: Button's computed props carry a
            `type="button"` and a `disabled`, and neither belongs on a link. */}
          <IconButton
            variant="ghost"
            size="sm"
            hideBelow="md"
            render={(renderProps) => (
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${SITE_NAME} on GitHub`}
                class={renderProps.class as string}
              >
                {renderProps.children}
              </a>
            )}
          >
            <GithubIcon />
          </IconButton>
          <ColorModeToggle />
        </Box>
      </Container>
    </Box>
  );
}
