import { Field, Input } from "chakra-ui-solid";

export default function InputWithHelperText() {
  return (
    <Field.Root required>
      <Field.Label>
        Email <Field.RequiredIndicator />
      </Field.Label>
      <Input placeholder="Enter your email" />
      <Field.HelperText>We'll never share your email.</Field.HelperText>
    </Field.Root>
  );
}
