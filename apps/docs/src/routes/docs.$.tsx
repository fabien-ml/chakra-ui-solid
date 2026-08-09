import { css } from "@chakra-ui-solid/styled-system/css";
import { Dynamic } from "@solidjs/web";
import { createFileRoute } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { DocsSidebar } from "~/components/docs-sidebar";
import { NotFound } from "~/components/not-found";
import { proseClass } from "~/components/prose";
import { pageForSlug } from "~/lib/site-map";

/**
 * One splat route for the whole content tier. The route map is the content glob
 * (`~/lib/site-map`), so `/docs/get-started/installation` and `/docs/components/box` resolve the
 * same way and adding a page is adding a file — there is no route file per page to forget.
 *
 * Every page is reachable from the sidebar, which is what the prerender's `crawlLinks` follows;
 * `check:docs-inventory` is what asserts the set is the right one.
 */
export const Route = createFileRoute("/docs/$")({ component: DocsPage });

function DocsPage() {
  const params = Route.useParams();
  const page = () => pageForSlug(params()._splat ?? "");

  return (
    <div
      class={css({
        display: "flex",
        gap: "10",
        maxW: "7xl",
        mx: "auto",
        px: "6",
        py: "10",
        alignItems: "flex-start",
      })}
    >
      <DocsSidebar />
      <article class={css({ minW: "0", flex: "1", maxW: "3xl" })}>
        <Show when={page()} fallback={<NotFound />}>
          {(doc) => (
            <div class={proseClass}>
              <Dynamic component={doc().module.default} />
            </div>
          )}
        </Show>
      </article>
    </div>
  );
}
