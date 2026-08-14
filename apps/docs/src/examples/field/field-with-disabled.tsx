import { Field, Input } from "chakra-ui-solid";

export default function FieldWithDisabled() {
  return (
    <Field.Root disabled>
      <Field.Label>Email</Field.Label>
      <Input placeholder="me@example.com" />
    </Field.Root>
  );
}
