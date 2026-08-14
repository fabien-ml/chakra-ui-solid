import { HStack, Radiomark } from "chakra-ui-solid";

export default function RadiomarkWithFilled() {
  return (
    <HStack gap="4">
      <Radiomark variant="outline" />
      <Radiomark variant="outline" checked />
      <Radiomark variant="outline" filled />
      <Radiomark variant="outline" filled checked />
    </HStack>
  );
}
