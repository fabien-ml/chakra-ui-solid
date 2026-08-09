import { css } from "@chakra-ui-solid/styled-system/css";
import { Show } from "solid-js";
import { DocLink } from "~/components/doc-link";
import { type NavPage, siblingsOf } from "~/lib/site-map";

/**
 * Previous / next, at the foot of every content page.
 *
 * The sequence is the nav register flattened across sections, so the last page of Get Started
 * leads into the first page of Components rather than dead-ending — the same behaviour
 * chakra-ui.com has, and the reason it walks the register rather than the current sidebar.
 */
export function MdxPagination(props: { slug: string }) {
  const siblings = () => siblingsOf(props.slug);

  return (
    <nav aria-label="Pagination" class={css({ display: "flex", gap: "8", mt: "20" })}>
      <Show when={siblings().previous} fallback={<span class={css({ flex: "1" })} />}>
        {(page) => <PaginationItem doc={page()} direction="Previous" />}
      </Show>
      <Show when={siblings().next} fallback={<span class={css({ flex: "1" })} />}>
        {(page) => <PaginationItem doc={page()} direction="Next" />}
      </Show>
    </nav>
  );
}

function PaginationItem(props: { doc: NavPage; direction: "Previous" | "Next" }) {
  const isNext = () => props.direction === "Next";

  return (
    <DocLink
      slug={props.doc.slug}
      class={css({
        flex: "1",
        borderWidth: "1px",
        borderColor: "border",
        borderRadius: "l2",
        p: "4",
        fontSize: "sm",
        textDecoration: "none",
        _hover: { borderColor: "border.emphasized" },
      })}
    >
      <span
        class={css({ display: "block", color: "fg.muted" })}
        style={{ "text-align": isNext() ? "end" : "start" }}
      >
        {props.direction}
      </span>
      <span
        class={css({ display: "block", mt: "1", fontWeight: "medium", color: "fg" })}
        style={{ "text-align": isNext() ? "end" : "start" }}
      >
        {isNext() ? `${props.doc.navTitle} →` : `← ${props.doc.navTitle}`}
      </span>
    </DocLink>
  );
}
