import { renderServer } from "@chakra-ui-solid/internal-test-utils/render-server";
import type { JSX } from "@solidjs/web";
import { Field } from "../index";

/**
 * The one Field tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * Three roots, and each one takes a different branch through the two gates — which is what makes
 * this worth a round-trip, because a gate decides how many hydration keys (`_hk`, the positional
 * marker Solid matches a server node to a client node by) everything after it consumes:
 *
 * - **signup** — `required` and valid, so the RequiredIndicator renders its `*` and the ErrorText
 *   renders *nothing at all*, the arm that costs the fewest keys;
 * - **password** — optional and `invalid`, the mirror image: the indicator falls back to a caller's
 *   own element and the error text ships, carrying an `ErrorIcon` whose `svg` is built inside the
 *   component body rather than hoisted beside it;
 * - **colour** — a `target` and a `Field.Item`, which renders no element of its own and re-points
 *   the ids underneath it, so a miscount there would shift the item's control against its label.
 *
 * Each root also calls `createUniqueId()` once, off the same counter as the `_hk` keys. **Neither
 * text registers on the server** — `createRegisteredId` defers to `onSettled`, which does not run
 * there — so no server-rendered control carries `aria-describedby`, and the client adds it after
 * hydration. That is an attribute the two sides may disagree about; the structure is not.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <Field.Root id="signup" required>
        <Field.Label data-probe="signup-label">
          Email
          <Field.RequiredIndicator data-probe="signup-indicator" />
        </Field.Label>
        <Field.Context>
          {(field) => <input {...field.getControlProps()} data-probe="signup-control" />}
        </Field.Context>
        <Field.HelperText data-probe="signup-helper">We never share it.</Field.HelperText>
        <Field.ErrorText data-probe="signup-error">Enter an email address</Field.ErrorText>
      </Field.Root>

      <Field.Root id="password" orientation="horizontal" invalid>
        <Field.Label data-probe="password-label">
          Password
          <Field.RequiredIndicator
            fallback={<span data-probe="password-optional">Optional</span>}
          />
        </Field.Label>
        <Field.Context>
          {(field) => <input {...field.getControlProps()} data-probe="password-control" />}
        </Field.Context>
        <Field.ErrorText data-probe="password-error">
          <Field.ErrorIcon data-probe="password-error-icon" />
          Too short
        </Field.ErrorText>
      </Field.Root>

      <Field.Root id="colour" target="red">
        <Field.Label data-probe="colour-label">Colour</Field.Label>
        <Field.Item value="red">
          <Field.Label data-probe="red-label">Red</Field.Label>
          <Field.Context>
            {(field) => (
              <input type="radio" {...field.getControlProps()} data-probe="red-control" />
            )}
          </Field.Context>
        </Field.Item>
        <Field.HelperText data-probe="colour-helper">Pick one.</Field.HelperText>
      </Field.Root>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=field`. */
export async function renderFixture(): Promise<string> {
  return await renderServer(() => <Tree />);
}
