import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { ComponentProps, JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import { RadioCard } from "../index";

/** Five values, so no root's card count is a number a miscount could land on by accident. */
const FRAMEWORKS = ["next", "vite", "astro", "remix", "nuxt"];

/** The glyph the `checked` escape hatch draws — two nodes where the Radiomark's checked arm draws two. */
function Tick(props: ComponentProps<"span">): JSX.Element {
  return (
    <span {...props}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3 8l3 3 7-7" />
      </svg>
    </span>
  );
}

/**
 * The one RadioCard tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * What each root probes, and each kind is invisible to the other two suites:
 *
 * - **a** — the full ten-slot card from a `<For>`: control, content, text, description, indicator and
 *   addon per item, with the picked one in the middle. `radio-group`'s fixture already proves N of a
 *   part under one machine; what is new here is that a card renders **both** an `ItemControl` and an
 *   `ItemIndicator`, because this recipe's control is not the machine's element and carries no id of
 *   its own.
 * - **b** — the divergence this subject is **first** to carry: `RadioCard.ItemIndicator`'s `checked`
 *   escape hatch, a gate inside the repeated part whose two arms are **different subtrees** — a
 *   consumer's own glyph on the picked card, a `Radiomark` (whose dot is itself conditional) on every
 *   other. One card in five takes the far arm, so a server that resolved the gate differently shifts
 *   every hydration key after it. Every earlier subject's gate is decided by a prop the render body
 *   reads or by a machine's whole state; this one is decided per item, by the machine's answer *about
 *   that item*.
 * - **c** — the same list written **statically**, plus a `RadioCard.ItemContext` render prop (which
 *   **must return JSX** — it is called in the part's body, not a tracking scope) whose two arms are
 *   different node counts. A static list and a `<For>` must spend keys identically.
 * - **d** — the arm with **no cards at all**, and a card with no indicator: the `without-indicator`
 *   shape, where the control's only children are the consumer's.
 *
 * No `<Portal>`: RadioCard has no portalled part. Each Root calls `createUniqueId()` once, off the
 * same counter the `_hk` keys come from.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <RadioCard.Root defaultValue="astro" data-probe="a-root">
        <RadioCard.Label data-probe="a-label">Select framework</RadioCard.Label>
        <For each={FRAMEWORKS}>
          {(framework) => (
            <RadioCard.Item value={framework} data-probe={`a-item-${framework}`}>
              <RadioCard.ItemHiddenInput data-probe={`a-input-${framework}`} />
              <RadioCard.ItemControl data-probe={`a-control-${framework}`}>
                <RadioCard.ItemContent data-probe={`a-content-${framework}`}>
                  <RadioCard.ItemText data-probe={`a-text-${framework}`}>
                    {framework}
                  </RadioCard.ItemText>
                  <RadioCard.ItemDescription data-probe={`a-description-${framework}`}>
                    Best for {framework}
                  </RadioCard.ItemDescription>
                </RadioCard.ItemContent>
                <RadioCard.ItemIndicator data-probe={`a-mark-${framework}`} />
              </RadioCard.ItemControl>
              <RadioCard.ItemAddon data-probe={`a-addon-${framework}`}>Free</RadioCard.ItemAddon>
            </RadioCard.Item>
          )}
        </For>
      </RadioCard.Root>

      <RadioCard.Root defaultValue="astro" size="lg" variant="subtle" data-probe="b-root">
        <For each={FRAMEWORKS}>
          {(framework) => (
            <RadioCard.Item value={framework} data-probe={`b-item-${framework}`}>
              <RadioCard.ItemHiddenInput data-probe={`b-input-${framework}`} />
              <RadioCard.ItemControl data-probe={`b-control-${framework}`}>
                <RadioCard.ItemText data-probe={`b-text-${framework}`}>
                  {framework}
                </RadioCard.ItemText>
                <RadioCard.ItemIndicator
                  data-probe={`b-mark-${framework}`}
                  checked={(indicatorProps) => <Tick {...indicatorProps} />}
                />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          )}
        </For>
      </RadioCard.Root>

      <RadioCard.Root defaultValue="one" orientation="vertical" align="center" data-probe="c-root">
        <RadioCard.Item value="one" data-probe="c-item-one">
          <RadioCard.ItemHiddenInput data-probe="c-input-one" />
          <RadioCard.ItemControl data-probe="c-control-one">
            <RadioCard.ItemText data-probe="c-text-one">One</RadioCard.ItemText>
            <RadioCard.ItemIndicator data-probe="c-mark-one" />
          </RadioCard.ItemControl>
          <RadioCard.ItemContext>
            {(item) => (
              <span data-probe="c-state-one">
                <Show when={item.checked} fallback="—">
                  picked
                </Show>
              </span>
            )}
          </RadioCard.ItemContext>
        </RadioCard.Item>
        <RadioCard.Item value="two" disabled data-probe="c-item-two">
          <RadioCard.ItemHiddenInput data-probe="c-input-two" />
          <RadioCard.ItemControl data-probe="c-control-two">
            <RadioCard.ItemText data-probe="c-text-two">Two</RadioCard.ItemText>
            <RadioCard.ItemIndicator data-probe="c-mark-two" />
          </RadioCard.ItemControl>
          <RadioCard.ItemContext>
            {(item) => (
              <span data-probe="c-state-two">
                <Show when={item.checked} fallback="—">
                  picked
                </Show>
              </span>
            )}
          </RadioCard.ItemContext>
        </RadioCard.Item>
      </RadioCard.Root>

      <RadioCard.Root data-probe="d-empty-root" />

      <RadioCard.Root defaultValue="paypal" justify="center" data-probe="d-root">
        <RadioCard.Item value="paypal" data-probe="d-item">
          <RadioCard.ItemHiddenInput data-probe="d-input" />
          <RadioCard.ItemControl data-probe="d-control">
            <RadioCard.ItemText data-probe="d-text">Paypal</RadioCard.ItemText>
          </RadioCard.ItemControl>
        </RadioCard.Item>
      </RadioCard.Root>

      <span data-probe="after">after</span>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=radio-card`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
