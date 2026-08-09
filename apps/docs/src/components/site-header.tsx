import { css } from "@chakra-ui-solid/styled-system/css";
import { Link, useLocation } from "@tanstack/solid-router";
import { For } from "solid-js";
import { ColorModeToggle } from "~/components/color-mode-toggle";
import { DocLink } from "~/components/doc-link";
import { containerClass } from "~/components/layout";
import { SITE_NAME } from "~/config";
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
 * at an empty tier is a 404 with a promise attached (`decisions.md` **D-141**).
 *
 * The wordmark is the project name and nothing else. "Chakra UI" belongs in body copy where it is
 * genuinely the subject, never in the site chrome, and there is no Chakra logo, wordmark or
 * favicon derivative anywhere on this site (`legal.md` §3.6).
 */
export function SiteHeader() {
  const location = useLocation();
  const isCurrent = (segment: string) => location().pathname.startsWith(`/docs/${segment}`);

  return (
    <header
      class={css({
        position: "sticky",
        top: "0",
        zIndex: "sticky",
        display: "flex",
        justifyContent: "center",
        width: "full",
        minH: "var(--header-height)",
        borderBottomWidth: "1px",
        borderColor: "border.muted",
        bg: "bg",
      })}
    >
      <nav
        aria-label="Main"
        class={`${containerClass} ${css({ display: "flex", alignItems: "center", gap: "8" })}`}
      >
        <Link
          to="/"
          aria-label={`${SITE_NAME}, back to homepage`}
          class={css({ fontWeight: "semibold", color: "fg", textDecoration: "none" })}
        >
          {SITE_NAME}
        </Link>

        <ul
          class={css({
            display: "flex",
            alignItems: "center",
            gap: "6",
            listStyle: "none",
            overflowX: "auto",
          })}
        >
          <For each={liveSections()}>
            {(section) => (
              <li>
                <DocLink
                  slug={firstPageOf(section.segment)?.slug ?? ""}
                  aria-current={isCurrent(section.segment) ? "page" : undefined}
                  class={css({
                    fontSize: "sm",
                    color: "fg.muted",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                    _hover: { color: "fg" },
                    "&[aria-current=page]": { color: "fg", fontWeight: "medium" },
                  })}
                >
                  {section.label}
                </DocLink>
              </li>
            )}
          </For>
        </ul>

        <div class={css({ ms: "auto", display: "flex", alignItems: "center", gap: "2" })}>
          <ColorModeToggle />
        </div>
      </nav>
    </header>
  );
}
