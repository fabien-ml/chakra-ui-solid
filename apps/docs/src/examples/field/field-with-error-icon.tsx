import { Field, Input } from "chakra-ui-solid";

export default function FieldWithErrorIcon() {
  return (
    <Field.Root invalid>
      <Field.Label>Email</Field.Label>
      <Input placeholder="me@example.com" />
      <Field.ErrorText width="full">
        <Field.ErrorIcon />
        This is an error text
      </Field.ErrorText>
    </Field.Root>
  );
}
