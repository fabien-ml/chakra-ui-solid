import type { ComponentProps, JSX } from "@solidjs/web";
import { createLink } from "@tanstack/solid-router";
import { omit } from "solid-js";

/**
 * The anchor the router renders through, and the reason `DocLink` is not a bare `Link`.
 *
 * `Link` defines `aria-current` as a **getter of its own** over whatever it was handed
 * (`@tanstack/solid-router/dist/esm/link.js`), and it measures *current* from the link's own href —
 * that page and anything under it. A section tab points at the section's first page, so the router
 * marks it only while you stand there, and the prefix-match answer the header works out is
 * discarded silently. That is why the four tabs went dark on every deeper page for as long as they
 * existed.
 *
 * `createLink` is the public way out. It spreads the router's props onto this component instead of
 * onto its own `<a>`, so a value written **after** that spread is the one that lands. The caller's
 * answer travels under `currentPage` because `aria-current` is the very key being overridden.
 */
function DocAnchor(
  props: ComponentProps<"a"> & {
    currentPage?: "page" | undefined;
  },
) {
  const routerProps = omit(props, "currentPage");

  return <a {...routerProps} aria-current={props.currentPage} />;
}

const RoutedAnchor = createLink(DocAnchor);

/**
 * A link to a docs page.
 *
 * The whole content tier is one splat route (`/docs/$`), so the typed form of a link to
 * `/docs/components/box` is that route plus a `_splat` param. Wrapping it here means the router's
 * route-id types still check every destination — a slug that has no content file is a dead link.
 *
 * `aria-current="page"` is passed in rather than derived, because the two places that mark a
 * current link mean different things by it: the sidebar marks the exact page, and the section tabs
 * mark a prefix. It is the only source of the attribute — a caller that passes nothing gets no
 * marker, rather than the router's own guess.
 */
export function DocLink(props: {
  slug: string;
  /**
   * A heading id on the destination page, without the `#`. It is a separate prop rather than part
   * of `slug` because the slug is the splat **param**: a `#` inside it is percent-encoded into the
   * path and the link resolves to a page that does not exist.
   */
  hash?: string;
  class?: string;
  "aria-current"?: "page" | undefined;
  children: JSX.Element;
}) {
  return (
    <RoutedAnchor
      to="/docs/$"
      params={{ _splat: props.slug }}
      hash={props.hash}
      class={props.class}
      currentPage={props["aria-current"]}
    >
      {props.children}
    </RoutedAnchor>
  );
}
