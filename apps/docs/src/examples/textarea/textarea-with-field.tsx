import { Field, HStack, Textarea } from "chakra-ui-solid";

export default function TextareaWithField() {
  return (
    <HStack gap="10" width="full">
      <Field.Root required>
        <Field.Label>
          Comment <Field.RequiredIndicator />
        </Field.Label>
        <Textarea placeholder="Start typing..." variant="subtle" />
      </Field.Root>
      <Field.Root required>
        <Field.Label>
          Comment <Field.RequiredIndicator />
        </Field.Label>
        <Textarea placeholder="Start typing..." variant="outline" />
      </Field.Root>
    </HStack>
  );
}
