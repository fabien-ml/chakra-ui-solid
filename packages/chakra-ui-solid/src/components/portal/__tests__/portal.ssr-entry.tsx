import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { Portal } from "../index";

/**
 * The one Portal tree the `ssr` and `browser` projects share.
 *
 * Portal is the sharpest case the bridge has: the server emits **nothing** for it, so the two sides
 * disagree about the tree by construction and the round trip is the only place the disagreement is
 * observable. Three things here can go wrong quietly:
 *
 * - **Siblings on both sides of it.** `before` and `after` are what a shifted hydration key (`_hk` —
 *   the positional marker Solid matches a server node to a client node by) would show up in: if the
 *   portal spends a different number of keys than the server left room for, `after` is claimed
 *   under the wrong client node, or client-rendered fresh, and both look identical in the markup.
 * - **Children built a flush late.** The component holds its children back one effect flush so a
 *   nested portal cannot reserve its slot first, which means they are built *after* hydration has
 *   finished rather than during it. That is the property most likely to break, and the one no
 *   server-only or client-only test can see.
 * - **A nested portal.** Ordering is the whole reason this component exists, and hydration is where
 *   the outer portal's slot is reserved against markup that never described it.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <span data-probe="before">before</span>

      <Portal>
        <div data-probe="outer">
          outer
          <Portal>
            <div data-probe="inner">inner</div>
          </Portal>
        </div>
      </Portal>

      <span data-probe="after">after</span>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=portal`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
