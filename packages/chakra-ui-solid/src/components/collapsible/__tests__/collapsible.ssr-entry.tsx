import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Collapsible } from "../index";

/**
 * The one Collapsible tree the `ssr` and `browser` projects share, so the server render they compare
 * is the same subject rather than two hand-kept copies.
 *
 * Three roots, because the thing under test is the **hydration key** (`_hk` — the positional marker
 * Solid matches a server node to a client node by) and each root consumes a different number of
 * them:
 *
 * - **closed** — the content is in the DOM carrying `hidden`;
 * - **open** — `defaultOpen`, so the server takes the other branch of the machine's `initialState`;
 * - **lazy** — `lazyMount` with nothing ever open, so the `<Show>` renders *no* content element at
 *   all and every key after it shifts by the whole subtree.
 *
 * Each root also calls `createUniqueId()` once, off the same counter as the `_hk` keys — so the
 * three of them together are what catches a generated id that moves between the two renders.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <Collapsible.Root data-probe="closed">
        <Collapsible.Trigger data-probe="closed-trigger">
          Show
          <Collapsible.Indicator data-probe="closed-indicator">▾</Collapsible.Indicator>
        </Collapsible.Trigger>
        <Collapsible.Content data-probe="closed-content">
          <span data-probe="closed-body">closed body</span>
        </Collapsible.Content>
      </Collapsible.Root>

      <Collapsible.Root defaultOpen data-probe="open">
        <Collapsible.Trigger data-probe="open-trigger">Hide</Collapsible.Trigger>
        <Collapsible.Context>
          {(collapsible) => (
            <span data-probe="open-label">{collapsible.open ? "open" : "closed"}</span>
          )}
        </Collapsible.Context>
        <Collapsible.Content data-probe="open-content">
          <span data-probe="open-body">open body</span>
        </Collapsible.Content>
      </Collapsible.Root>

      <Collapsible.Root lazyMount data-probe="lazy">
        <Collapsible.Trigger data-probe="lazy-trigger">Show</Collapsible.Trigger>
        <Collapsible.Content data-probe="lazy-content">
          <span data-probe="lazy-body">never rendered</span>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=collapsible`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
