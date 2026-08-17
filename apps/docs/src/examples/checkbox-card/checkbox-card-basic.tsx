import { CheckboxCard } from "chakra-ui-solid";

export default function CheckboxCardBasic() {
  return (
    <CheckboxCard.Root maxW="240px">
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Label>Next.js</CheckboxCard.Label>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
    </CheckboxCard.Root>
  );
}
