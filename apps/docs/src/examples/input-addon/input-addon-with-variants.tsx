import { Group, Input, InputAddon, Stack } from "chakra-ui-solid";

export default function InputAddonWithVariants() {
  return (
    <Stack gap="4" width="full">
      <Group attached width="full">
        <InputAddon variant="outline">https://</InputAddon>
        <Input flex="1" variant="outline" placeholder="Outline" />
      </Group>
      <Group attached width="full">
        <InputAddon variant="subtle">https://</InputAddon>
        <Input flex="1" variant="subtle" placeholder="Subtle" />
      </Group>
      <Group attached width="full">
        <InputAddon variant="flushed">https://</InputAddon>
        <Input flex="1" variant="flushed" placeholder="Flushed" />
      </Group>
    </Stack>
  );
}
