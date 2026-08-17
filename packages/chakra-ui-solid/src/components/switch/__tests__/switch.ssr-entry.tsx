import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { Field } from "../../field";
import { Switch } from "../index";

/**
 * The one Switch tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * What each root probes, and each kind is invisible to the other two suites:
 *
 * - **a** and **b** — the divergence this subject is **first** to carry: **a slot with two
 *   mutually-exclusive `children()` arms, both written by the consumer**. `Switch.Indicator` and
 *   `Switch.ThumbIndicator` each take a `children` and a `fallback`, the machine's `checked` picks
 *   one, and the other must cost **nothing** — no `createComponent`, no hydration key (`_hk`, the
 *   positional marker Solid matches a server node to a client node by). Every earlier conditional
 *   subject branches between a subtree and *nothing* (`checkmark`, `radiomark`) or between slots
 *   that can render together (`loader`); here two consumer subtrees of different sizes compete for
 *   one position, twice per root, so a server that resolved either memo eagerly shifts every key
 *   after it. **a** is checked and **b** is not, so the two roots take opposite arms of the same
 *   four gates.
 * - **c** — the **ids** divergence, and the arm with no children at all: a `<Field.Root>` hands this
 *   machine the two element ids it addresses (`label`, `hiddenInput`), so the `for` on the served
 *   `<label>` is resolved by a component that owns neither element and starts no machine. Its
 *   `<Field.HelperText>` registers itself in `onSettled`, which does not run on a server — so the
 *   served input carries no `aria-describedby` and the hydrated one grows one, on the node the
 *   server sent. Its `<Switch.Control>` is written empty, which is the arm that builds the default
 *   `<Switch.Thumb />` inside a `children()` call.
 * - **d** — a `Switch.Context` render prop (which **must return JSX** — it is called in the part's
 *   body, not a tracking scope), sitting before `after`, the alignment witness.
 *
 * No `<Portal>`: Switch has no portalled part. Each Root calls `createUniqueId()` once, off the same
 * counter the `_hk` keys come from.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <Switch.Root defaultChecked size="lg" data-probe="a-root">
        <Switch.HiddenInput data-probe="a-input" />
        <Switch.Control data-probe="a-control">
          <Switch.Thumb data-probe="a-thumb">
            <Switch.ThumbIndicator
              data-probe="a-thumb-indicator"
              fallback={<span data-probe="a-thumb-off">✕</span>}
            >
              <span data-probe="a-thumb-on">✓</span>
            </Switch.ThumbIndicator>
          </Switch.Thumb>
          <Switch.Indicator
            data-probe="a-indicator"
            fallback={<span data-probe="a-track-off">moon</span>}
          >
            <span data-probe="a-track-on">sun</span>
          </Switch.Indicator>
        </Switch.Control>
        <Switch.Label data-probe="a-label">Dark mode</Switch.Label>
      </Switch.Root>

      <Switch.Root variant="raised" data-probe="b-root">
        <Switch.HiddenInput data-probe="b-input" />
        <Switch.Control data-probe="b-control">
          <Switch.Thumb data-probe="b-thumb">
            <Switch.ThumbIndicator
              data-probe="b-thumb-indicator"
              fallback={<span data-probe="b-thumb-off">✕</span>}
            >
              <span data-probe="b-thumb-on">✓</span>
            </Switch.ThumbIndicator>
          </Switch.Thumb>
          <Switch.Indicator
            data-probe="b-indicator"
            fallback={<span data-probe="b-track-off">moon</span>}
          >
            <span data-probe="b-track-on">sun</span>
          </Switch.Indicator>
        </Switch.Control>
        <Switch.Label data-probe="b-label">Light mode</Switch.Label>
      </Switch.Root>

      <Field.Root data-probe="c-field">
        <Switch.Root data-probe="c-root">
          <Switch.HiddenInput data-probe="c-input" />
          <Switch.Control data-probe="c-control" />
          <Switch.Label data-probe="c-label">Notifications</Switch.Label>
        </Switch.Root>
        <Field.HelperText data-probe="c-helper">We only send the important ones</Field.HelperText>
      </Field.Root>

      <Switch.Root defaultChecked data-probe="d-root">
        <Switch.HiddenInput data-probe="d-input" />
        <Switch.Control data-probe="d-control" />
        <Switch.Context>
          {(api) => (
            <span data-probe="d-state">
              <Show when={api.checked} fallback="off">
                on
              </Show>
            </span>
          )}
        </Switch.Context>
      </Switch.Root>
      <span data-probe="after">after</span>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=switch`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
