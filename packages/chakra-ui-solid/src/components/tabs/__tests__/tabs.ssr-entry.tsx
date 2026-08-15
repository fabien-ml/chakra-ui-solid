import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Show } from "solid-js";
import { Tabs } from "../index";

/**
 * The one Tabs tree the `ssr` and `browser` projects share, so the server render they compare is the
 * same subject rather than two hand-kept copies.
 *
 * Every root is served **selected**, because that is what a set of tabs is: `defaultValue` decides
 * which panel a reader sees before a single byte of JavaScript runs. What differs is the kind of
 * server/client divergence each one carries, and each kind is invisible to the other two suites:
 *
 * - **a** — the *attribute* divergence. Every trigger ships `data-ssr` (the machine's `ssr` context
 *   starts `true` and only its `entry` action clears it, and `entry` runs when a machine *starts*,
 *   which never happens on a server) and none carries it once hydration has started the machine.
 *   That flip is what proves the machine started against the hydrated nodes rather than quietly
 *   client-rendering them. `variant="plain"` is the variant whose recipe actually reads the flag.
 * - **b** — the *node-count* divergence, and the first one a **consumer** decides: `lazyMount` plus
 *   `unmountOnExit` means the number of presence machines and hydration keys (`_hk` — the positional
 *   marker Solid matches a server node to a client node by) is exactly the number of
 *   `<Tabs.Content>` children written here, minus the de-selected ones. Two of the three contribute
 *   nothing on either side while the `ContentGroup` around them keeps a fixed key, so a miscount
 *   would shift the group's own child ids rather than the whole document's.
 * - **c** — the shapes with no element of their own. A `Tabs.Context` render prop (which **must
 *   return JSX**: it is called in the part's body, not a tracking scope, so a bare ternary would read
 *   the machine untracked and freeze), a trigger rendered as an anchor through `render` — this
 *   library's typed spelling of the React version's `asChild`, and the only way an `href` reaches a
 *   trigger, since `TabsTriggerProps` is the button's prop set — and `after` as the alignment
 *   witness: if either of those spent a different number of keys on the two builds, that span is the
 *   first thing that would hydrate against the wrong node.
 *
 * No `<Portal>`: Tabs has no portalled part, and Dialog's and Popover's entries already own that
 * probe. Each root calls `createUniqueId()` once, off the same counter the `_hk` keys come from.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <Tabs.Root defaultValue="react" variant="plain">
        <Tabs.List data-probe="a-list">
          <Tabs.Trigger value="react" data-probe="a-trigger-react">
            React
          </Tabs.Trigger>
          <Tabs.Trigger value="solid" data-probe="a-trigger-solid">
            Solid
          </Tabs.Trigger>
          <Tabs.Indicator data-probe="a-indicator" />
        </Tabs.List>
        <Tabs.Content value="react" data-probe="a-content-react">
          React panel
        </Tabs.Content>
        <Tabs.Content value="solid" data-probe="a-content-solid">
          Solid panel
        </Tabs.Content>
      </Tabs.Root>

      <Tabs.Root defaultValue="one" lazyMount unmountOnExit>
        <Tabs.List data-probe="b-list">
          <Tabs.Trigger value="one" data-probe="b-trigger-one">
            One
          </Tabs.Trigger>
          <Tabs.Trigger value="two" data-probe="b-trigger-two">
            Two
          </Tabs.Trigger>
          <Tabs.Trigger value="three" data-probe="b-trigger-three">
            Three
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.ContentGroup data-probe="b-group">
          <Tabs.Content value="one" data-probe="b-content-one">
            First panel
          </Tabs.Content>
          <Tabs.Content value="two" data-probe="b-content-two">
            Second panel
          </Tabs.Content>
          <Tabs.Content value="three" data-probe="b-content-three">
            Third panel
          </Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>

      <Tabs.Root defaultValue="home">
        <Tabs.List data-probe="c-list">
          <Tabs.Trigger value="home" data-probe="c-trigger-home">
            Home
          </Tabs.Trigger>
          <Tabs.Trigger
            value="docs"
            data-probe="c-trigger-docs"
            render={(triggerProps) => (
              <a {...(triggerProps as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} href="/docs" />
            )}
          >
            Docs
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Context>
          {(tabs) => (
            <span data-probe="c-label">
              <Show when={tabs.value === "docs"} fallback="home">
                docs
              </Show>
            </span>
          )}
        </Tabs.Context>
        <Tabs.Content value="home" data-probe="c-content-home">
          Home panel
        </Tabs.Content>
        <span data-probe="after">after</span>
      </Tabs.Root>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=tabs`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
