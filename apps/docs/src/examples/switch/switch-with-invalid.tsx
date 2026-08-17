import { Switch } from "chakra-ui-solid";

export default function SwitchWithInvalid() {
  return (
    <Switch.Root invalid>
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Activate Chakra</Switch.Label>
    </Switch.Root>
  );
}
