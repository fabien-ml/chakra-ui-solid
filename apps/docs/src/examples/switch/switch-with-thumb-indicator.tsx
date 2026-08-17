import { Switch } from "chakra-ui-solid";
import { CheckIcon, XIcon } from "../../components/ui/icons";

export default function SwitchWithThumbIndicator() {
  return (
    <Switch.Root size="lg">
      <Switch.HiddenInput />
      <Switch.Control>
        <Switch.Thumb>
          <Switch.ThumbIndicator fallback={<XIcon color="black" />}>
            <CheckIcon />
          </Switch.ThumbIndicator>
        </Switch.Thumb>
      </Switch.Control>
      <Switch.Label>Switch me</Switch.Label>
    </Switch.Root>
  );
}
