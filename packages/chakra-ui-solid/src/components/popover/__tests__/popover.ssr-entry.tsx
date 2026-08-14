import type { JSX } from "@solidjs/web";
import { Portal, renderToStream } from "@solidjs/web";
import { Show } from "solid-js";
import { Popover } from "../index";

/**
 * The one Popover tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * **All three roots are closed**, because that is how a page is served. What differs is how much of
 * each one exists in the markup, and each answer consumes a different number of hydration keys
 * (`_hk` — the positional marker Solid matches a server node to a client node by):
 *
 * - **lazy** — `lazyMount`, which is the *opt-in* here where it is Dialog's default, so the trigger
 *   is the only thing in the markup and the positioner and content subtree contribute no keys;
 * - **eager** — Chakra's own Popover defaults, so the whole tree ships carrying `hidden`, including
 *   the three slot parts, the anchor, the arrow with its default tip, and a `Context` render prop
 *   that has no element of its own;
 * - **portal** — the same tree inside `<Portal>`, which renders **nothing** on the server and costs
 *   exactly one child id there. The `after-portal` sibling is the probe: if the two builds disagreed
 *   about that one id, every key after the portal would shift and this span would hydrate against
 *   the wrong node.
 *
 * Each root also calls `createUniqueId()` once, off the same counter as the `_hk` keys, and runs one
 * presence machine beside the popover's own.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <Popover.Root lazyMount>
        <Popover.Trigger data-probe="lazy-trigger">Open</Popover.Trigger>
        <Popover.Positioner data-probe="lazy-positioner">
          <Popover.Content data-probe="lazy-content">
            <Popover.Title data-probe="lazy-title">Never rendered</Popover.Title>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>

      <Popover.Root>
        <Popover.Anchor data-probe="eager-anchor">anchored</Popover.Anchor>
        <Popover.Trigger data-probe="eager-trigger">Open</Popover.Trigger>
        <Popover.Context>
          {(popover) => (
            <span data-probe="eager-label">
              <Show when={popover.open} fallback="closed">
                open
              </Show>
            </span>
          )}
        </Popover.Context>
        <Popover.Positioner data-probe="eager-positioner">
          <Popover.Content data-probe="eager-content">
            <Popover.Arrow data-probe="eager-arrow" />
            <Popover.Header data-probe="eager-header">
              <Popover.Title data-probe="eager-title">Delete file</Popover.Title>
            </Popover.Header>
            <Popover.Body data-probe="eager-body">
              <Popover.Description data-probe="eager-description">
                This cannot be undone.
              </Popover.Description>
            </Popover.Body>
            <Popover.Footer data-probe="eager-footer">
              <Popover.CloseTrigger data-probe="eager-close">✕</Popover.CloseTrigger>
            </Popover.Footer>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>

      <Popover.Root>
        <Popover.Trigger data-probe="portal-trigger">Open</Popover.Trigger>
        <Portal>
          <Popover.Positioner data-probe="portal-positioner">
            <Popover.Content data-probe="portal-content">
              <Popover.Title data-probe="portal-title">Portalled</Popover.Title>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
        <span data-probe="after-portal">after</span>
      </Popover.Root>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=popover`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
