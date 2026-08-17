import { Checkbox } from "chakra-ui-solid";

export default function CheckboxWithLabelPosition() {
  return (
    <Checkbox.Root>
      <Checkbox.HiddenInput />
      <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
      <Checkbox.Control />
    </Checkbox.Root>
  );
}
