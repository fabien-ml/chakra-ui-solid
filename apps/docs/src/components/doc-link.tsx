import type { JSX } from "@solidjs/web";
import { Link } from "@tanstack/solid-router";

/**
 * A link to a docs page.
 *
 * The whole content tier is one splat route (`/docs/$`), so the typed form of a link to
 * `/docs/components/box` is that route plus a `_splat` param. Wrapping it here means the router's
 * route-id types still check every destination — a slug that has no content file is a dead link,
 * and `check:docs-inventory` is what catches that half.
 */
export function DocLink(props: { slug: string; class?: string; children: JSX.Element }) {
  return (
    <Link to="/docs/$" params={{ _splat: props.slug }} class={props.class}>
      {props.children}
    </Link>
  );
}
