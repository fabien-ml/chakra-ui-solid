import { Input, InputGroup } from "chakra-ui-solid";

export default function InputWithEndAddon() {
  return (
    <InputGroup endAddon=".com">
      <Input placeholder="yoursite" />
    </InputGroup>
  );
}
