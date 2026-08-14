import { Field, HStack, Input } from "chakra-ui-solid";

export default function InputWithField() {
  return (
    <HStack gap="10" width="full">
      <Field.Root required>
        <Field.Label>
          Email <Field.RequiredIndicator />
        </Field.Label>
        <Input placeholder="me@example.com" variant="subtle" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>
          Email <Field.RequiredIndicator />
        </Field.Label>
        <Input placeholder="me@example.com" variant="outline" />
      </Field.Root>
    </HStack>
  );
}
