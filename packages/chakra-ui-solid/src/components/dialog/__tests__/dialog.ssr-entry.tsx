import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { Portal } from "@solidjs/web";
import { Show } from "solid-js";
import { Dialog } from "../index";

/**
 * The one Dialog tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * **All three roots are closed**, because that is how a page is served — a dialog is opened by a
 * client event, and there is no `defaultOpen` subject here for the same reason. What differs is how
 * much of each one exists in the markup, and each answer consumes a different number of hydration
 * keys (`_hk` — the positional marker Solid matches a server node to a client node by):
 *
 * - **lazy** — Chakra's defaults, so the trigger is the only thing in the markup and the backdrop,
 *   positioner and content subtree contribute no keys at all;
 * - **eager** — `lazyMount={false}`, so the whole tree ships carrying `hidden`, including the three
 *   slot parts and a `Context` render prop that has no element of its own;
 * - **portal** — the same tree inside `<Portal>`, which renders **nothing** on the server and costs
 *   exactly one child id there. The `after-portal` sibling is the probe: if the two builds disagreed
 *   about that one id, every key after the portal would shift and this span would hydrate against
 *   the wrong node.
 *
 * Each root also calls `createUniqueId()` once, off the same counter as the `_hk` keys, and each
 * runs two presence machines beside the dialog's own.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <Dialog.Root>
        <Dialog.Trigger data-probe="lazy-trigger">Open</Dialog.Trigger>
        <Dialog.Backdrop data-probe="lazy-backdrop" />
        <Dialog.Positioner data-probe="lazy-positioner">
          <Dialog.Content data-probe="lazy-content">
            <Dialog.Title data-probe="lazy-title">Never rendered</Dialog.Title>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <Dialog.Root lazyMount={false}>
        <Dialog.Trigger data-probe="eager-trigger">Open</Dialog.Trigger>
        <Dialog.Context>
          {(dialog) => (
            <span data-probe="eager-label">
              <Show when={dialog.open} fallback="closed">
                open
              </Show>
            </span>
          )}
        </Dialog.Context>
        <Dialog.Backdrop data-probe="eager-backdrop" />
        <Dialog.Positioner data-probe="eager-positioner">
          <Dialog.Content data-probe="eager-content">
            <Dialog.Header data-probe="eager-header">
              <Dialog.Title data-probe="eager-title">Delete file</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body data-probe="eager-body">
              <Dialog.Description data-probe="eager-description">
                This cannot be undone.
              </Dialog.Description>
            </Dialog.Body>
            <Dialog.Footer data-probe="eager-footer">
              <Dialog.ActionTrigger data-probe="eager-action">Cancel</Dialog.ActionTrigger>
            </Dialog.Footer>
            <Dialog.CloseTrigger data-probe="eager-close">✕</Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <Dialog.Root lazyMount={false}>
        <Dialog.Trigger data-probe="portal-trigger">Open</Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop data-probe="portal-backdrop" />
          <Dialog.Positioner data-probe="portal-positioner">
            <Dialog.Content data-probe="portal-content">
              <Dialog.Title data-probe="portal-title">Portalled</Dialog.Title>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
        <span data-probe="after-portal">after</span>
      </Dialog.Root>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=dialog`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
