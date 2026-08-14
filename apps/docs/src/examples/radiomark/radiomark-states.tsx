import { HStack, Radiomark } from "chakra-ui-solid";

export default function RadiomarkStates() {
  return (
    <HStack gap="4">
      <Radiomark />
      <Radiomark checked />
      <Radiomark disabled />
      <Radiomark checked disabled />
    </HStack>
  );
}
