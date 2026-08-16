import { Group, Input, InputAddon, Stack } from "chakra-ui-solid";

export default function InputAddonWithSizes() {
  return (
    <Stack gap="4" width="full">
      <Group attached width="full">
        <InputAddon size="sm">https://</InputAddon>
        <Input flex="1" size="sm" placeholder="size (sm)" />
      </Group>
      <Group attached width="full">
        <InputAddon size="md">https://</InputAddon>
        <Input flex="1" size="md" placeholder="size (md)" />
      </Group>
      <Group attached width="full">
        <InputAddon size="lg">https://</InputAddon>
        <Input flex="1" size="lg" placeholder="size (lg)" />
      </Group>
    </Stack>
  );
}
