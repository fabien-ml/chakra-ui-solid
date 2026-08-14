import type { JSX } from "@solidjs/web";
import { Link } from "@tanstack/solid-router";

/**
 * A link to a docs page.
 *
 * The whole content tier is one splat route (`/docs/$`), so the typed form of a link to
 * `/docs/components/box` is that route plus a `_splat` param. Wrapping it here means the router's
 * route-id types still check every destination — a slug that has no content file is a dead link,
 * and `check:docs-inventory` is what catches that half.
 *
 * `aria-current="page"` is passed in rather than derived, because the two places that mark a
 * current link mean different things by it: the sidebar marks the exact page, and the section
 * tabs mark a prefix.
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
    <Link
      to="/docs/$"
      params={{ _splat: props.slug }}
      hash={props.hash}
      class={props.class}
      aria-current={props["aria-current"]}
    >
      {props.children}
    </Link>
  );
}
