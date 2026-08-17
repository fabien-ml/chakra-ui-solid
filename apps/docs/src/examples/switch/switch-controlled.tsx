import { Switch } from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function SwitchControlled() {
  const [checked, setChecked] = createSignal(false);

  return (
    <Switch.Root checked={checked()} onCheckedChange={(details) => setChecked(details.checked)}>
      <Switch.HiddenInput />
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Activate Chakra</Switch.Label>
    </Switch.Root>
  );
}
