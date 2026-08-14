import { Field, Fieldset, Input, NativeSelect, Textarea } from "chakra-ui-solid";
import { For } from "solid-js";

export default function FieldsetWithInvalid() {
  return (
    <Fieldset.Root size="lg" invalid>
      <Fieldset.Legend>Shipping details</Fieldset.Legend>
      <Fieldset.Content>
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <Input name="address" />
        </Field.Root>
        <Field.Root invalid>
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
        <Field.Root invalid>
          <Field.Label>Notes</Field.Label>
          <Textarea name="notes" />
        </Field.Root>
      </Fieldset.Content>
      <Fieldset.ErrorText>Some fields are invalid. Please check them.</Fieldset.ErrorText>
    </Fieldset.Root>
  );
}
