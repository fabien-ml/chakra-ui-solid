import { css } from "@chakra-ui-solid/styled-system/css";
import { Link } from "@tanstack/solid-router";
import { For } from "solid-js";
import { ColorModeToggle } from "~/components/color-mode-toggle";
import { DocLink } from "~/components/doc-link";
import { SITE_NAME } from "~/config";
import { liveTiers, pagesInTier } from "~/lib/site-map";

/**
 * The top bar. Nav is exactly the four tiers of `docs-site.md` §2.1 — **Get Started · Components ·
 * Styling · Theming** — and nothing else: no sponsor button, no version dropdown, no
 * Docs/Showcase/Blog split, no Charts.
 *
 * A tier appears once it has a page. The site is built incrementally and is meant to be readable
 * as a site at every gate (`definition-of-done.md` rule 2.15), and a nav item pointing at an empty
 * tier is a 404 with a promise attached.
 *
 * The wordmark is the project name and nothing else. "Chakra UI" belongs in body copy where it is
 * genuinely the subject, never in the site chrome (`legal.md` §3.6).
 */
export function SiteHeader() {
  return (
    <header
      class={css({
        position: "sticky",
        top: "0",
        zIndex: "sticky",
        borderBottomWidth: "1px",
        borderColor: "border",
        bg: "bg",
      })}
    >
      <nav
        aria-label="Main"
        class={css({
          display: "flex",
          alignItems: "center",
          gap: "6",
          maxW: "7xl",
          mx: "auto",
          px: "6",
          h: "14",
        })}
      >
        <Link to="/" class={css({ fontWeight: "semibold", color: "fg", textDecoration: "none" })}>
          {SITE_NAME}
        </Link>
        <ul class={css({ display: "flex", alignItems: "center", gap: "5", listStyle: "none" })}>
          <For each={liveTiers()}>
            {(tier) => (
              <li>
                <DocLink
                  slug={pagesInTier(tier.segment)[0]?.slug ?? ""}
                  class={css({
                    fontSize: "sm",
                    color: "fg.muted",
                    textDecoration: "none",
                    _hover: { color: "fg" },
                  })}
                >
                  {tier.label}
                </DocLink>
              </li>
            )}
          </For>
        </ul>
        <div class={css({ ml: "auto" })}>
          <ColorModeToggle />
        </div>
      </nav>
    </header>
  );
}
