import { Field, Input } from "chakra-ui-solid";

export default function FieldWithRequired() {
  return (
    <Field.Root required>
      <Field.Label>
        Email
        <Field.RequiredIndicator />
      </Field.Label>
      <Input placeholder="me@example.com" />
    </Field.Root>
  );
}
