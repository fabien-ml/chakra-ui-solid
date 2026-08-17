import { CheckboxCard } from "chakra-ui-solid";

export default function CheckboxCardWithDescription() {
  return (
    <CheckboxCard.Root maxW="240px">
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content>
          <CheckboxCard.Label>Next.js</CheckboxCard.Label>
          <CheckboxCard.Description>Best for apps</CheckboxCard.Description>
        </CheckboxCard.Content>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
    </CheckboxCard.Root>
  );
}
