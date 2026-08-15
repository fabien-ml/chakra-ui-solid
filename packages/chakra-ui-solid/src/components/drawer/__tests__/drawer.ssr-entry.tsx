import type { JSX } from "@solidjs/web";
import { Portal, renderToStream } from "@solidjs/web";
import { Show } from "solid-js";
import { Drawer } from "../index";

/**
 * The one Drawer tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * **All three roots are closed**, because that is how a page is served — a drawer is opened by a
 * client event. What differs is how much of each one exists in the markup, and each answer consumes
 * a different number of hydration keys (`_hk` — the positional marker Solid matches a server node to
 * a client node by):
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
 * The eager root also carries `placement="start"`, away from the recipe's own `end` default, so the
 * class strings the two builds compute are a variant resolution rather than a constant. A recipe
 * that resolved differently on the server would leave the panel styled by whichever side won.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <Drawer.Root>
        <Drawer.Trigger data-probe="lazy-trigger">Open</Drawer.Trigger>
        <Drawer.Backdrop data-probe="lazy-backdrop" />
        <Drawer.Positioner data-probe="lazy-positioner">
          <Drawer.Content data-probe="lazy-content">
            <Drawer.Title data-probe="lazy-title">Never rendered</Drawer.Title>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>

      <Drawer.Root lazyMount={false} placement="start">
        <Drawer.Trigger data-probe="eager-trigger">Open</Drawer.Trigger>
        {/*
          `<Show>`, never a ternary. This callback is invoked in `DrawerContext`'s own body, which is
          not a tracking scope, so a bare `drawer.open ? … : …` reads the machine untracked and
          freezes on the value it had at mount — on the client as well as on the server.
        */}
        <Drawer.Context>
          {(drawer) => (
            <span data-probe="eager-label">
              <Show when={drawer.open} fallback="closed">
                open
              </Show>
            </span>
          )}
        </Drawer.Context>
        <Drawer.Backdrop data-probe="eager-backdrop" />
        <Drawer.Positioner data-probe="eager-positioner">
          <Drawer.Content data-probe="eager-content">
            <Drawer.Header data-probe="eager-header">
              <Drawer.Title data-probe="eager-title">Filters</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body data-probe="eager-body">
              <Drawer.Description data-probe="eager-description">
                Narrow the results.
              </Drawer.Description>
            </Drawer.Body>
            <Drawer.Footer data-probe="eager-footer">
              <Drawer.ActionTrigger data-probe="eager-action">Cancel</Drawer.ActionTrigger>
            </Drawer.Footer>
            <Drawer.CloseTrigger data-probe="eager-close">✕</Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>

      <Drawer.Root lazyMount={false}>
        <Drawer.Trigger data-probe="portal-trigger">Open</Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop data-probe="portal-backdrop" />
          <Drawer.Positioner data-probe="portal-positioner">
            <Drawer.Content data-probe="portal-content">
              <Drawer.Title data-probe="portal-title">Portalled</Drawer.Title>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
        <span data-probe="after-portal">after</span>
      </Drawer.Root>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=drawer`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
