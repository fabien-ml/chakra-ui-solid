import { Stack, Textarea } from "chakra-ui-solid";

export default function TextareaWithVariants() {
  return (
    <Stack gap="4">
      <Textarea variant="outline" placeholder="outline" />
      <Textarea variant="subtle" placeholder="subtle" />
      <Textarea variant="flushed" placeholder="flushed" />
    </Stack>
  );
}
