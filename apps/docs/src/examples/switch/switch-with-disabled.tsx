import { Switch } from "chakra-ui-solid";

export default function SwitchWithDisabled() {
  return (
    <Switch.Root disabled>
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Activate Chakra</Switch.Label>
    </Switch.Root>
  );
}
