import { Input, InputGroup } from "chakra-ui-solid";

export default function InputWithStartAndEndAddon() {
  return (
    <InputGroup startAddon="$" endAddon="USD">
      <Input placeholder="0.00" />
    </InputGroup>
  );
}
