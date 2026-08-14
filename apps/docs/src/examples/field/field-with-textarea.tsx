import { Field, Textarea } from "chakra-ui-solid";

export default function FieldWithTextarea() {
  return (
    <Field.Root>
      <Field.Label>Email</Field.Label>
      <Textarea placeholder="Email" />
    </Field.Root>
  );
}
