import { Input, InputGroup, NativeSelect } from "chakra-ui-solid";

function DomainSelect() {
  return (
    <NativeSelect.Root size="xs" variant="plain" width="auto" me="-1">
      <NativeSelect.Field fontSize="sm">
        <option value=".com" selected>
          .com
        </option>
        <option value=".org">.org</option>
        <option value=".net">.net</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

export default function InputWithSelect() {
  return (
    <InputGroup flex="1" startElement="https://" endElement={<DomainSelect />}>
      <Input ps="4.75em" pe="0" placeholder="yoursite.com" />
    </InputGroup>
  );
}
