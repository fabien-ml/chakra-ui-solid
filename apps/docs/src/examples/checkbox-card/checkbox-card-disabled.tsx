import { CheckboxCard } from "chakra-ui-solid";

export default function CheckboxCardDisabled() {
  return (
    <CheckboxCard.Root disabled maxW="320px">
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content>
          <CheckboxCard.Label>Disabled</CheckboxCard.Label>
          <CheckboxCard.Description>This is a disabled checkbox</CheckboxCard.Description>
        </CheckboxCard.Content>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
    </CheckboxCard.Root>
  );
}
