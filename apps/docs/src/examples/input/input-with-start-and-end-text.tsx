import { Input, InputGroup } from "chakra-ui-solid";

export default function InputWithStartAndEndText() {
  return (
    <InputGroup startElement="$" endElement="USD">
      <Input placeholder="0.00" />
    </InputGroup>
  );
}
