import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import { Fieldset } from "../../fieldset";
import { RadioGroup } from "../index";

/** Six values, so no root's item count is a number a miscount could land on by accident. */
const FRAMEWORKS = ["solid", "vue", "react", "svelte", "qwik", "angular"];

/**
 * The one RadioGroup tree the `ssr` and `browser` projects share, so the server render they compare
 * is the same subject rather than two hand-kept copies.
 *
 * What each root probes, and each kind is invisible to the other two suites:
 *
 * - **a** — the divergence this subject is **first** to carry: **N of every part under one machine,
 *   from a `<For>`**. Every earlier subject's hydration keys are decided by which *branch* a gate
 *   took; here they are decided by how many *items* a list has, and each item spends a fixed number
 *   of keys that the next item's start position depends on. Six items over four parts each, with
 *   the checked one in the middle, so a server that spent a different number of keys on any item
 *   shifts every node after it. Its `ItemIndicator` renders a `Radiomark`, whose dot is present on
 *   the checked item alone — one more node in one item than in the other five.
 * - **b** — the same list written **statically**, one `<RadioGroup.Item>` per line, plus a
 *   `RadioGroup.ItemContext` render prop (which **must return JSX** — it is called in the part's
 *   body, not a tracking scope) whose two arms are different node counts. A static list and a `<For>`
 *   must spend keys identically or the two roots cannot both hydrate.
 * - **c** — the **ids** divergence: a `<Fieldset.Root>` hands this machine the id of its legend, so
 *   the group's `aria-labelledby` is resolved by a component that owns neither element and starts no
 *   machine. It also carries the group's `disabled`, read from a context both builds must publish.
 * - **d** — the arm with **no items at all**, and a bare `RadioGroup.ItemControl` in a one-item
 *   group: the plain circle, which is the part `ItemIndicator` replaces rather than wraps.
 *
 * No `<Portal>`: RadioGroup has no portalled part. Each Root calls `createUniqueId()` once, off the
 * same counter the `_hk` keys come from.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <RadioGroup.Root defaultValue="svelte" data-probe="a-root">
        <RadioGroup.Label data-probe="a-label">Framework</RadioGroup.Label>
        <For each={FRAMEWORKS}>
          {(framework) => (
            <RadioGroup.Item value={framework} data-probe={`a-item-${framework}`}>
              <RadioGroup.ItemHiddenInput data-probe={`a-input-${framework}`} />
              <RadioGroup.ItemIndicator data-probe={`a-mark-${framework}`} />
              <RadioGroup.ItemText data-probe={`a-text-${framework}`}>
                {framework}
              </RadioGroup.ItemText>
            </RadioGroup.Item>
          )}
        </For>
      </RadioGroup.Root>

      <RadioGroup.Root defaultValue="one" size="lg" variant="outline" data-probe="b-root">
        <RadioGroup.Item value="one" data-probe="b-item-one">
          <RadioGroup.ItemHiddenInput data-probe="b-input-one" />
          <RadioGroup.ItemIndicator data-probe="b-mark-one" />
          <RadioGroup.ItemText data-probe="b-text-one">One</RadioGroup.ItemText>
          <RadioGroup.ItemContext>
            {(item) => (
              <span data-probe="b-state-one">
                <Show when={item.checked} fallback="—">
                  picked
                </Show>
              </span>
            )}
          </RadioGroup.ItemContext>
        </RadioGroup.Item>
        <RadioGroup.Item value="two" disabled data-probe="b-item-two">
          <RadioGroup.ItemHiddenInput data-probe="b-input-two" />
          <RadioGroup.ItemIndicator data-probe="b-mark-two" />
          <RadioGroup.ItemText data-probe="b-text-two">Two</RadioGroup.ItemText>
          <RadioGroup.ItemContext>
            {(item) => (
              <span data-probe="b-state-two">
                <Show when={item.checked} fallback="—">
                  picked
                </Show>
              </span>
            )}
          </RadioGroup.ItemContext>
        </RadioGroup.Item>
      </RadioGroup.Root>

      <Fieldset.Root disabled data-probe="c-fieldset">
        <Fieldset.Legend data-probe="c-legend">Delivery</Fieldset.Legend>
        <RadioGroup.Root data-probe="c-root">
          <RadioGroup.Item value="post" data-probe="c-item-post">
            <RadioGroup.ItemHiddenInput data-probe="c-input-post" />
            <RadioGroup.ItemIndicator data-probe="c-mark-post" />
            <RadioGroup.ItemText data-probe="c-text-post">Post</RadioGroup.ItemText>
          </RadioGroup.Item>
        </RadioGroup.Root>
      </Fieldset.Root>

      <RadioGroup.Root data-probe="d-empty-root" />

      <RadioGroup.Root defaultValue="plain" data-probe="d-root">
        <RadioGroup.Item value="plain" data-probe="d-item">
          <RadioGroup.ItemHiddenInput data-probe="d-input" />
          <RadioGroup.ItemControl data-probe="d-control" />
          <RadioGroup.ItemText data-probe="d-text">Plain</RadioGroup.ItemText>
        </RadioGroup.Item>
      </RadioGroup.Root>

      <span data-probe="after">after</span>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=radio-group`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
