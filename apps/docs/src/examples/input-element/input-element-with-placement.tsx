import { Group, Input, InputElement, Stack } from "chakra-ui-solid";

export default function InputElementWithPlacement() {
  return (
    <Stack gap="4" width="full">
      <Group width="full">
        <InputElement pointerEvents="none">@</InputElement>
        <Input flex="1" ps="10" placeholder="username" />
      </Group>
      <Group width="full">
        <Input flex="1" pe="14" placeholder="yoursite" />
        <InputElement placement="end" pointerEvents="none">
          .com
        </InputElement>
      </Group>
    </Stack>
  );
}
