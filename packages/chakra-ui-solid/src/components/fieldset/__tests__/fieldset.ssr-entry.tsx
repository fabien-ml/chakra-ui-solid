import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Field } from "../../field";
import { Input } from "../../input";
import { Fieldset } from "../index";

/**
 * The one Fieldset tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * Two roots, and each takes a different branch through the one gate — which is what makes this worth
 * a round-trip, because a gate decides how many hydration keys (`_hk`, the positional marker Solid
 * matches a server node to a client node by) everything after it consumes:
 *
 * - **contact** — valid, so `Fieldset.ErrorText` renders *nothing at all*, the arm that costs the
 *   fewest keys, and the `Content` box holds two Fields whose own `createUniqueId()` calls come off
 *   the same counter as the `_hk`s;
 * - **shipping** — `disabled` and `invalid`, the mirror image: the error text ships, and the Field
 *   inside it inherits `disabled` from the group rather than from a prop of its own. That
 *   inheritance is a **context read on the server**, so the two builds have to agree about it
 *   before hydration is even asked the question.
 *
 * **Neither text registers on the server** — `createRegisteredId` defers to `onSettled`, which does
 * not run there — so no server-rendered `fieldset` carries `aria-describedby`, and the client adds
 * it after hydration. That is an attribute the two sides may disagree about; the structure is not.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <Fieldset.Root id="contact" size="lg">
        <Fieldset.Legend data-probe="contact-legend">Contact details</Fieldset.Legend>
        <Fieldset.HelperText data-probe="contact-helper">How we reach you.</Fieldset.HelperText>
        <Fieldset.ErrorText data-probe="contact-error">Check these fields.</Fieldset.ErrorText>
        <Fieldset.Content data-probe="contact-content">
          <Field.Root id="name">
            <Field.Label data-probe="name-label">Name</Field.Label>
            <Input data-probe="name-input" />
          </Field.Root>
          <Field.Root id="email">
            <Field.Label data-probe="email-label">Email</Field.Label>
            <Input data-probe="email-input" type="email" />
          </Field.Root>
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root id="shipping" disabled invalid>
        <Fieldset.Legend data-probe="shipping-legend">Shipping details</Fieldset.Legend>
        <Fieldset.ErrorText data-probe="shipping-error">
          Some fields are invalid.
        </Fieldset.ErrorText>
        <Field.Root id="address">
          <Field.Label data-probe="address-label">Street address</Field.Label>
          <Input data-probe="address-input" />
        </Field.Root>
      </Fieldset.Root>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=fieldset`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
