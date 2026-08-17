import { CheckboxCard, HStack } from "chakra-ui-solid";

export default function CheckboxCardNoIndicator() {
  return (
    <HStack>
      <CheckboxCard.Root>
        <CheckboxCard.HiddenInput />
        <CheckboxCard.Control>
          <CheckboxCard.Label>Chakra UI</CheckboxCard.Label>
        </CheckboxCard.Control>
      </CheckboxCard.Root>

      <CheckboxCard.Root>
        <CheckboxCard.HiddenInput />
        <CheckboxCard.Control>
          <CheckboxCard.Label>Next.js</CheckboxCard.Label>
        </CheckboxCard.Control>
      </CheckboxCard.Root>
    </HStack>
  );
}
