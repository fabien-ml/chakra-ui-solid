import { Input, InputGroup } from "chakra-ui-solid";

export default function InputGroupWithAddon() {
  return (
    <InputGroup startAddon="https://" endAddon=".com">
      <Input placeholder="yoursite" />
    </InputGroup>
  );
}
