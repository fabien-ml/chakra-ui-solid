import { Separator, Stack } from "chakra-ui-solid";

export default function SeparatorWithSizes() {
  return (
    <Stack gap="4">
      <Separator size="xs" />
      <Separator size="sm" />
      <Separator size="md" />
      <Separator size="lg" />
    </Stack>
  );
}
