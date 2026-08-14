import { Field, Input } from "chakra-ui-solid";

export default function FieldWithErrorText() {
  return (
    <Field.Root invalid>
      <Field.Label>Email</Field.Label>
      <Input placeholder="me@example.com" />
      <Field.ErrorText>This is an error text</Field.ErrorText>
    </Field.Root>
  );
}
