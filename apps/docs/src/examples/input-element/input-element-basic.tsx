import { Group, Input, InputElement } from "chakra-ui-solid";

export default function InputElementBasic() {
  return (
    <Group width="full">
      <InputElement pointerEvents="none">@</InputElement>
      <Input flex="1" ps="10" placeholder="username" />
    </Group>
  );
}
