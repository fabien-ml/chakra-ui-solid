import { Switch } from "chakra-ui-solid";

export default function SwitchBasic() {
  return (
    <Switch.Root>
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Activate Chakra</Switch.Label>
    </Switch.Root>
  );
}
