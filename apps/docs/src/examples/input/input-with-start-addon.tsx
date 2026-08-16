import { Input, InputGroup } from "chakra-ui-solid";

export default function InputWithStartAddon() {
  return (
    <InputGroup startAddon="https://">
      <Input placeholder="yoursite.com" />
    </InputGroup>
  );
}
