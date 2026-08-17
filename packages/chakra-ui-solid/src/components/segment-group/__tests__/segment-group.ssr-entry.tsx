import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import { SegmentGroup } from "../index";

/** Five values, so no root's segment count is a number a miscount could land on by accident. */
const FRAMEWORKS = ["next", "vite", "astro", "remix", "nuxt"];

/**
 * The one SegmentGroup tree the `ssr` and `browser` projects share, so the server render they
 * compare is the same subject rather than two hand-kept copies.
 *
 * What each root probes, and each kind is invisible to the other two suites:
 *
 * - **a** — the parts written out by hand from a `<For>`, with an `Indicator` in front of them and
 *   the picked segment in the middle. This is the root the `data-ssr` measurements are taken on: the
 *   server serves the checked segment its stand-in highlight and an indicator with **no rect**, and
 *   hydration has to hand the drawing over to the indicator on the same nodes.
 * - **b** — the same list through `<SegmentGroup.Items>`, which iterates **index-keyed** and
 *   normalises two entry spellings into one shape. A shortcut and a hand-written list must spend
 *   hydration keys identically, or the sibling after them moves.
 * - **c** — `orientation="vertical"`, no indicator at all, and a `SegmentGroup.ItemContext` render
 *   prop (which **must return JSX** — it is called in the part's body, not a tracking scope) whose
 *   two arms are different node counts.
 * - **d** — the arm with **no segments at all**, which still starts a machine and still renders an
 *   indicator with nothing to measure.
 *
 * No `<Portal>`: SegmentGroup has no portalled part. Each Root calls `createUniqueId()` once, off
 * the same counter the `_hk` keys come from.
 */
export function Tree(): JSX.Element {
  const mixedItems = [
    "next",
    { value: "vite", label: "Vite" },
    { value: "astro", label: "Astro", disabled: true },
    "remix",
    "nuxt",
  ];

  return (
    <div>
      <SegmentGroup.Root defaultValue="astro" data-probe="a-root">
        <SegmentGroup.Indicator data-probe="a-indicator" />
        <For each={FRAMEWORKS}>
          {(framework) => (
            <SegmentGroup.Item value={framework} data-probe={`a-item-${framework}`}>
              <SegmentGroup.ItemText data-probe={`a-text-${framework}`}>
                {framework}
              </SegmentGroup.ItemText>
              <SegmentGroup.ItemHiddenInput data-probe={`a-input-${framework}`} />
            </SegmentGroup.Item>
          )}
        </For>
      </SegmentGroup.Root>

      <SegmentGroup.Root defaultValue="vite" size="lg" data-probe="b-root">
        <SegmentGroup.Indicator data-probe="b-indicator" />
        <SegmentGroup.Items items={mixedItems} data-probe="b-item" />
      </SegmentGroup.Root>

      <SegmentGroup.Root defaultValue="one" orientation="vertical" data-probe="c-root">
        <SegmentGroup.Item value="one" data-probe="c-item-one">
          <SegmentGroup.ItemText data-probe="c-text-one">One</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput data-probe="c-input-one" />
          <SegmentGroup.ItemContext>
            {(item) => (
              <span data-probe="c-state-one">
                <Show when={item.checked} fallback="—">
                  picked
                </Show>
              </span>
            )}
          </SegmentGroup.ItemContext>
        </SegmentGroup.Item>
        <SegmentGroup.Item value="two" disabled data-probe="c-item-two">
          <SegmentGroup.ItemText data-probe="c-text-two">Two</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput data-probe="c-input-two" />
          <SegmentGroup.ItemContext>
            {(item) => (
              <span data-probe="c-state-two">
                <Show when={item.checked} fallback="—">
                  picked
                </Show>
              </span>
            )}
          </SegmentGroup.ItemContext>
        </SegmentGroup.Item>
      </SegmentGroup.Root>

      <SegmentGroup.Root data-probe="d-root">
        <SegmentGroup.Indicator data-probe="d-indicator" />
      </SegmentGroup.Root>

      <span data-probe="after">after</span>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=segment-group`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
