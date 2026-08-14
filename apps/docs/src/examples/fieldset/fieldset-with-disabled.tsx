import { Field, Fieldset, Input, NativeSelect, Textarea } from "chakra-ui-solid";
import { For } from "solid-js";

export default function FieldsetWithDisabled() {
  return (
    <Fieldset.Root size="lg" disabled>
      <Fieldset.Legend>Shipping details</Fieldset.Legend>
      <Field.Root>
        <Field.Label>Street address</Field.Label>
        <Input name="address" />
      </Field.Root>
      <Field.Root>
        <Field.Label>Country</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field name="country">
            <For each={["United Kingdom", "Canada", "United States"]}>
              {(item) => <option value={item}>{item}</option>}
            </For>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
      <Field.Root>
        <Field.Label>Delivery notes</Field.Label>
        <Textarea name="notes" />
      </Field.Root>
    </Fieldset.Root>
  );
}
