import { css } from "@chakra-ui-solid/styled-system/css";
import { Dynamic } from "@solidjs/web";
import { createFileRoute } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { DocsSidebar } from "~/components/docs-sidebar";
import { containerClass } from "~/components/layout";
import { MdxPagination } from "~/components/mdx-pagination";
import { NotFound } from "~/components/not-found";
import { PageHeader } from "~/components/page-header";
import { proseClass } from "~/components/prose";
import { Toc } from "~/components/toc";
import { pageForSlug } from "~/lib/site-map";

/**
 * One splat route for the whole content tier. The route map is the content glob
 * (`~/lib/site-map`), so `/docs/get-started/installation` and `/docs/components/box` resolve the
 * same way and adding a page is adding a file — there is no route file per page to forget.
 *
 * The three-column shell is chakra-ui.com's: a sidebar scoped to the current section, the
 * article, and the table of contents. Both columns are sticky against the header's own height,
 * which is why `--header-height` is declared once on the shell rather than at three call sites.
 *
 * Every page is reachable from the sidebar, which is what the prerender's `crawlLinks` follows;
 * `check:docs-inventory` is what asserts the set is the right one.
 */
export const Route = createFileRoute("/docs/$")({ component: DocsPage });

function DocsPage() {
  const params = Route.useParams();
  const slug = () => params()._splat ?? "";
  const page = () => pageForSlug(slug());

  return (
    <Show when={page()} fallback={<NotFound />}>
      {(doc) => (
        <div class={`${containerClass} ${css({ display: "flex" })}`}>
          <DocsSidebar section={doc().section} currentSlug={doc().slug} />
          <article
            class={css({
              flex: "1",
              minW: "0",
              width: "full",
              px: { md: "12" },
              pt: "10",
              pb: "16",
              minH: "var(--content-height)",
            })}
          >
            <PageHeader doc={doc()} />
            <div class={proseClass}>
              <Dynamic component={doc().module.default} />
            </div>
            <MdxPagination slug={doc().slug} />
          </article>
          <Toc entries={doc().module.tableOfContents} />
        </div>
      )}
    </Show>
  );
}
