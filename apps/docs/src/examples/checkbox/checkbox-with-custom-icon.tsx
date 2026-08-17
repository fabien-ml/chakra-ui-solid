import { Checkbox } from "chakra-ui-solid";
import { PlusIcon } from "../../components/ui/icons";

export default function CheckboxWithCustomIcon() {
  return (
    <Checkbox.Root defaultChecked>
      <Checkbox.HiddenInput />
      <Checkbox.Control>
        <PlusIcon />
      </Checkbox.Control>
      <Checkbox.Label>With Custom Icon</Checkbox.Label>
    </Checkbox.Root>
  );
}
