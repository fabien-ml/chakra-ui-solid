import { css } from "@chakra-ui-solid/styled-system/css";
import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import { codePaneClass } from "~/components/code-pane";
import { DocLink } from "~/components/doc-link";
import { containerClass } from "~/components/layout";
import { DISCLAIMER, PANDA_PREREQUISITE, PARITY_SENTENCE, SITE_NAME } from "~/config";

export const Route = createFileRoute("/")({ component: DocsHome });

/**
 * The docs home — **the one page whose structure is not copied**, and the reason is specific
 * rather than squeamish: a marketing page's structure is its claims, and three of chakra-ui.com's
 * are false here (runtime theming, a `css` prop that takes anything, a zero-config install)
 * (`docs-plan.md` §3.1). So there is no *used by*, no stats row, no testimonials, no sponsors, no
 * ready-made templates and no Pro tier.
 *
 * What it is instead: **the page that sets expectations.** A reader should be able to decide in
 * thirty seconds whether this library is usable for them, and the two facts that decide it —
 * SolidJS 2.0, and Panda in their build — are above the fold.
 */
function DocsHome() {
  return (
    <div class={`${containerClass} ${css({ py: "16" })}`}>
      <div class={css({ maxW: "3xl" })}>
        <h1
          class={css({
            fontSize: "5xl",
            fontWeight: "semibold",
            letterSpacing: "tighter",
            color: "fg",
          })}
        >
          {SITE_NAME}
        </h1>
        <p class={css({ mt: "3", fontSize: "lg", color: "fg.muted" })}>
          An independent SolidJS 2.0 component library targeting Chakra UI v3's component API and
          design system. Styles are compiled at build time; nothing generates CSS while your app is
          running.
        </p>

        {/* `plan.md` §0's sentence, verbatim, in the most prominent of its placements. */}
        <p class={css({ mt: "4", fontSize: "lg", color: "fg" })}>
          It is <strong class={css({ fontWeight: "semibold" })}>{PARITY_SENTENCE}</strong> — not a
          1:1 port, and it does not pretend to be one.
        </p>

        {/* The disclaimer, verbatim and above the fold. Under a mark-derived name it is doing that
          work alone, and the link is what turns it into a redirect (`legal.md` §3.3.3 item 1). */}
        <aside
          class={css({
            mt: "8",
            borderWidth: "1px",
            borderColor: "border",
            borderRadius: "l2",
            bg: "bg.subtle",
            p: "4",
            fontSize: "sm",
            color: "fg.muted",
          })}
        >
          <strong class={css({ color: "fg", fontWeight: "semibold" })}>Unofficial.</strong>{" "}
          {DISCLAIMER.before}
          <a href={DISCLAIMER.linkHref} class={css({ color: "fg", textDecoration: "underline" })}>
            {DISCLAIMER.linkText}
          </a>
          {DISCLAIMER.after}
        </aside>

        <Section title="Before you install">
          <ul class={css({ listStyleType: "disc", pl: "6", color: "fg.muted" })}>
            <li class={css({ my: "2" })}>
              <strong class={css({ color: "fg" })}>SolidJS 2.0.</strong> Not 1.x — the packages
              import <code>@solidjs/web</code>, and a 1.x install fails at load.
            </li>
            <li class={css({ my: "2" })}>
              <strong class={css({ color: "fg" })}>{PANDA_PREREQUISITE}</strong> Your Panda run
              reads your source and writes your stylesheet; there is no supported way to use this
              library without one.
            </li>
            <li class={css({ my: "2" })}>
              <strong class={css({ color: "fg" })}>ESM only.</strong>
            </li>
          </ul>
        </Section>

        <Section title="What you get, and what you do not">
          <div
            class={css({
              display: "grid",
              gap: "6",
              // The track function is written out because Panda's `gridTemplateColumns` is the raw
              // CSS property: a bare `"2"` compiles to `grid-template-columns: 2`, which resolves
              // as the length `2px`.
              md: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
            })}
          >
            <div>
              <h3 class={css({ fontSize: "sm", fontWeight: "semibold", color: "fg", mb: "2" })}>
                You get
              </h3>
              <List
                items={[
                  "Chakra v3's component API",
                  "Its design system, through the official Panda preset",
                  "Zag.js behavior and ARIA",
                  "Style props, recipes and variants",
                ]}
              />
            </div>
            <div>
              <h3 class={css({ fontSize: "sm", fontWeight: "semibold", color: "fg", mb: "2" })}>
                You do not get
              </h3>
              <List
                items={[
                  "Runtime theming — no createSystem",
                  "Style-prop values computed at runtime",
                  "asChild — polymorphism is a render prop",
                ]}
              />
            </div>
          </div>
        </Section>

        <Section title="Install">
          <pre class={codePaneClass}>
            <code>
              pnpm add @chakra-ui-solid/components @chakra-ui-solid/preset
              @chakra-ui-solid/styled-system{"\n"}
              pnpm add -D @pandacss/dev
            </code>
          </pre>
          <p class={css({ mt: "3", color: "fg.muted" })}>
            <DocLink
              slug="get-started/installation"
              class={css({ color: "colorPalette.fg", textDecoration: "underline" })}
            >
              The install page
            </DocLink>{" "}
            has the Panda config, the verification step, and what to check when everything renders
            naked.
          </p>
        </Section>

        <Section title="Where to go next">
          <ul class={css({ listStyleType: "disc", pl: "6", color: "fg.muted" })}>
            <li class={css({ my: "2" })}>
              <DocLink
                slug="get-started/installation"
                class={css({ color: "colorPalette.fg", textDecoration: "underline" })}
              >
                Installation
              </DocLink>{" "}
              — the config, and how to tell it worked.
            </li>
            <li class={css({ my: "2" })}>
              <DocLink
                slug="components/box"
                class={css({ color: "colorPalette.fg", textDecoration: "underline" })}
              >
                Components
              </DocLink>{" "}
              — what has shipped so far.
            </li>
          </ul>
        </Section>

        {/* The positive form of *a page for an unbuilt component is a promise* (`roadmap.md` §9.2):
          the absence is stated rather than left for a reader to find through a 404. */}
        <Section title="What is not here yet">
          <p class={css({ color: "fg.muted" })}>
            This library is being built one batch at a time, and the docs are built with it — a
            component gets its page in the same phase it ships, so anything missing from the sidebar
            has not been written rather than gone undocumented.
          </p>
          <p class={css({ color: "fg.muted" })}>
            Charts are excluded outright, and the reason is a dependency one rather than a styling
            one: Chakra's chart tier peer-depends on Recharts and React, and there is no Solid
            charting substrate to bind to.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section(props: { title: string; children: unknown }) {
  return (
    <section class={css({ mt: "12" })}>
      <h2
        class={css({
          fontSize: "xl",
          fontWeight: "semibold",
          letterSpacing: "tight",
          color: "fg",
          mb: "3",
        })}
      >
        {props.title}
      </h2>
      <div class={css({ display: "flex", flexDirection: "column", gap: "3" })}>
        {props.children as never}
      </div>
    </section>
  );
}

function List(props: { items: string[] }) {
  return (
    <ul class={css({ listStyleType: "disc", pl: "6", color: "fg.muted", fontSize: "sm" })}>
      <For each={props.items}>{(item) => <li class={css({ my: "1" })}>{item}</li>}</For>
    </ul>
  );
}
