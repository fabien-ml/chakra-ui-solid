import { Input, InputGroup, Stack } from "chakra-ui-solid";

export default function InputGroupWithSizes() {
  return (
    <Stack gap="4">
      <InputGroup startAddon="https://" startAddonProps={{ size: "sm" }}>
        <Input size="sm" placeholder="size (sm)" />
      </InputGroup>
      <InputGroup startAddon="https://" startAddonProps={{ size: "lg" }}>
        <Input size="lg" placeholder="size (lg)" />
      </InputGroup>
    </Stack>
  );
}
