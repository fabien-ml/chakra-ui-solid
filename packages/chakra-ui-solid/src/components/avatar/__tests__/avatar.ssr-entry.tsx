import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { Avatar, AvatarGroup } from "../index";

/**
 * The one Avatar tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * Two things in this component move hydration keys (`_hk` — the positional marker Solid matches a
 * server node to a client node by), and the tree exercises both:
 *
 * - **`Avatar.Fallback` resolves a slot through `children()`**, and its three branches build
 *   different amounts of tree: a consumer's own child, the initials of a `name` (a text node), and
 *   `<Avatar.Icon />` (an `svg` with a `path` inside it). The icon branch is the expensive one, and
 *   a server that took it where the client takes the text branch shifts every key after it.
 * - **`data-group-item` comes from a context read**, so it is the one attribute here whose presence
 *   is decided by where the element sits rather than by what it was passed. A grouped row and a
 *   lone avatar are both below: the group writes the attribute on both of its children, and the
 *   `AvatarGroup` of one gets it too while `Group`'s own rule takes the ring off.
 *
 * Each Root also calls `createUniqueId()` once, off the same counter as the `_hk` keys — so the four
 * of them together are what catches a generated id that moves between the two renders.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <Avatar.Root data-probe="named">
        <Avatar.Fallback data-probe="named-fallback" name="Segun Adebayo" />
      </Avatar.Root>

      <Avatar.Root data-probe="iconic">
        <Avatar.Fallback data-probe="iconic-fallback" />
      </Avatar.Root>

      <Avatar.Root data-probe="pictured">
        <Avatar.Image data-probe="pictured-image" src="/segun.png" alt="Segun Adebayo" />
        <Avatar.Fallback data-probe="pictured-fallback">
          <span data-probe="pictured-child">SA</span>
        </Avatar.Fallback>
      </Avatar.Root>

      <AvatarGroup data-probe="row" size="sm">
        <Avatar.Root data-probe="row-first">
          <Avatar.Fallback data-probe="row-first-fallback" name="Ada Lovelace" />
        </Avatar.Root>
        <Avatar.Root data-probe="row-second">
          <Avatar.Fallback data-probe="row-second-fallback" />
        </Avatar.Root>
      </AvatarGroup>

      <AvatarGroup data-probe="lone">
        <Avatar.Root data-probe="lone-only">
          <Avatar.Fallback data-probe="lone-only-fallback" name="Grace Hopper" />
        </Avatar.Root>
      </AvatarGroup>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=avatar`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
