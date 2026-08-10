import { Box } from "@chakra-ui-solid/components";
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
    <Box as="nav" aria-label="Pagination" display="flex" gap="8" mt="20">
      <Show when={siblings().previous} fallback={<Box as="span" flex="1" />}>
        {(page) => <PaginationItem doc={page()} label="Previous" />}
      </Show>
      <Show when={siblings().next} fallback={<Box as="span" flex="1" />}>
        {(page) => <PaginationItem doc={page()} label="Next" />}
      </Show>
    </Box>
  );
}

// `label`, not `direction`: Panda extracts style props from *any* capitalized JSX component, and
// `direction` is a real CSS property — so `direction="Previous"` generated a `.direction_Previous`
// rule whose declaration no browser parses (`check:declaration-support`, D-178).
function PaginationItem(props: { doc: NavPage; label: "Previous" | "Next" }) {
  const isNext = () => props.label === "Next";

  return (
    <Box
      flex="1"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l2"
      p="4"
      fontSize="sm"
      textDecoration="none"
      _hover={{ borderColor: "border.emphasized" }}
      render={(renderProps) => (
        <DocLink slug={props.doc.slug} class={renderProps.class as string}>
          {renderProps.children}
        </DocLink>
      )}
    >
      {/* A ternary between two literals is two static values, so Panda extracts both branches and
          generates both rules — the same shape `site/link-button` uses for its two looks. A value
          assembled from a variable would be a class nobody generated: it renders nothing and
          raises nothing. */}
      <Box as="span" display="block" color="fg.muted" textAlign={isNext() ? "end" : "start"}>
        {props.label}
      </Box>
      <Box
        as="span"
        display="block"
        mt="1"
        fontWeight="medium"
        color="fg"
        textAlign={isNext() ? "end" : "start"}
      >
        {isNext() ? `${props.doc.navTitle} →` : `← ${props.doc.navTitle}`}
      </Box>
    </Box>
  );
}
