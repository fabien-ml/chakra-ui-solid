import { Group, Input, InputAddon } from "chakra-ui-solid";

export default function InputAddonBasic() {
  return (
    <Group attached width="full">
      <InputAddon>https://</InputAddon>
      <Input flex="1" placeholder="yoursite.com" />
    </Group>
  );
}
