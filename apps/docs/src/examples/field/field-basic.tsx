import { Field, Input } from "chakra-ui-solid";

export default function FieldBasic() {
  return (
    <Field.Root>
      <Field.Label>Email</Field.Label>
      <Input placeholder="me@example.com" />
    </Field.Root>
  );
}
