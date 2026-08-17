import { Checkbox } from "chakra-ui-solid";

export default function CheckboxBasic() {
  return (
    <Checkbox.Root>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
    </Checkbox.Root>
  );
}
