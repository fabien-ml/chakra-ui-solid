import { Input, InputGroup, Stack } from "chakra-ui-solid";

export default function InputGroupWithOffset() {
  return (
    <Stack gap="4">
      <InputGroup startElement="$">
        <Input placeholder="No offset" />
      </InputGroup>
      <InputGroup startElement="$" startOffset="0.75rem">
        <Input placeholder="startOffset 0.75rem" />
      </InputGroup>
    </Stack>
  );
}
