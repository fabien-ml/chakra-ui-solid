import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { ComponentProps, JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { Field } from "../../field";
import { Checkbox, CheckboxGroup } from "../index";

/**
 * The one Checkbox tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * What each root probes, and each kind is invisible to the other two suites:
 *
 * - **a** — the divergence this subject is **first** to carry: a **node count decided by a store
 *   that is not a machine**. `<CheckboxGroup>` is plain signals over an array of strings, and each
 *   `<Checkbox.Root value="…">` seeds its own machine from `getItemProps()` — so the group's
 *   `defaultValue` decides whether a box draws a `polyline`, a `path`, or nothing at all, and that
 *   is a different number of hydration keys (`_hk` — the positional marker Solid matches a server
 *   node to a client node by) for every sibling after it. `avatar` reads a context on both builds
 *   too, and what it decides there is an *attribute*; a wrong answer here moves nodes.
 * - **b** — the **ids** divergence, and the second thing no other subject does: a `<Field.Root>`
 *   hands this machine the two element ids it addresses (`label`, `hiddenInput`), so the `for` on
 *   the served `<label>` is resolved by a component that owns neither element and starts no machine.
 *   Its `<Field.HelperText>` registers itself in `onSettled`, which does not run on a server — so
 *   the served input carries no `aria-describedby` and the hydrated one grows one, on the node the
 *   server sent. The box is `indeterminate`, which is the `path` arm of the glyph.
 * - **c** — the shapes with no element of their own, and the escape hatch. `Checkbox.Control` with
 *   no children resolves its default `<Checkbox.Indicator />` through `children()`, which allocates
 *   in the ambient owner rather than at the position it is read; the `checked` escape hatch is a
 *   **function** called with the part's computed props, so the element it returns is built one
 *   level deeper than the arm that reads it; and a `Checkbox.Context` render prop
 *   (which **must return JSX** — it is called in the part's body, not a tracking scope) sits before
 *   `after`, the alignment witness.
 *
 * No `<Portal>`: Checkbox has no portalled part. Each Root calls `createUniqueId()` once, off the
 * same counter the `_hk` keys come from.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <CheckboxGroup defaultValue={["terms"]} name="agreements" data-probe="a-group">
        <Checkbox.Root value="terms" data-probe="a-root-terms">
          <Checkbox.HiddenInput data-probe="a-input-terms" />
          <Checkbox.Control data-probe="a-control-terms" />
          <Checkbox.Label data-probe="a-label-terms">Accept terms</Checkbox.Label>
        </Checkbox.Root>
        <Checkbox.Root value="newsletter" data-probe="a-root-newsletter">
          <Checkbox.HiddenInput data-probe="a-input-newsletter" />
          <Checkbox.Control data-probe="a-control-newsletter" />
          <Checkbox.Label data-probe="a-label-newsletter">Newsletter</Checkbox.Label>
        </Checkbox.Root>
        <Checkbox.Root value="updates" data-probe="a-root-updates">
          <Checkbox.HiddenInput data-probe="a-input-updates" />
          <Checkbox.Control data-probe="a-control-updates" />
          <Checkbox.Label data-probe="a-label-updates">Product updates</Checkbox.Label>
        </Checkbox.Root>
      </CheckboxGroup>

      <Field.Root data-probe="b-field">
        <Checkbox.Root defaultChecked="indeterminate" data-probe="b-root">
          <Checkbox.HiddenInput data-probe="b-input" />
          <Checkbox.Control data-probe="b-control" />
          <Checkbox.Label data-probe="b-label">Partially selected</Checkbox.Label>
        </Checkbox.Root>
        <Field.HelperText data-probe="b-helper">Pick at least one</Field.HelperText>
      </Field.Root>

      <Checkbox.Root defaultChecked size="lg" variant="outline" data-probe="c-root">
        <Checkbox.HiddenInput data-probe="c-input" />
        <Checkbox.Control data-probe="c-control">
          <Checkbox.Indicator
            data-probe="c-indicator"
            checked={(indicatorProps) => (
              // A `span` where the part would have drawn an `svg`, which is the cast the composition
              // page names: the computed props are typed against the element this part renders.
              <span {...(indicatorProps as ComponentProps<"span">)} data-probe="c-custom-checked">
                ✔
              </span>
            )}
          />
        </Checkbox.Control>
        <Checkbox.Context>
          {(checkbox) => (
            <span data-probe="c-state">
              <Show when={checkbox.checked} fallback="off">
                on
              </Show>
            </span>
          )}
        </Checkbox.Context>
      </Checkbox.Root>
      <span data-probe="after">after</span>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=checkbox`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
