import { Icon, Switch } from "chakra-ui-solid";
import { MoonIcon, SunIcon } from "../../components/ui/icons";

export default function SwitchWithTrackIndicator() {
  return (
    <Switch.Root colorPalette="blue" size="lg">
      <Switch.HiddenInput />
      <Switch.Control>
        <Switch.Thumb />
        <Switch.Indicator fallback={<Icon as={MoonIcon} color="gray.400" />}>
          <Icon as={SunIcon} color="yellow.400" />
        </Switch.Indicator>
      </Switch.Control>
      <Switch.Label>Switch me</Switch.Label>
    </Switch.Root>
  );
}
