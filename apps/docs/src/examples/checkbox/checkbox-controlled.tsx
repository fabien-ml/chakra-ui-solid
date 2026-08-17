import { Checkbox } from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function CheckboxControlled() {
  const [checked, setChecked] = createSignal(false);

  return (
    <Checkbox.Root checked={checked()} onCheckedChange={(details) => setChecked(!!details.checked)}>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
    </Checkbox.Root>
  );
}
