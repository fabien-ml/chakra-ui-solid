import { Checkmark, HStack } from "chakra-ui-solid";

export default function CheckmarkIndeterminate() {
  return (
    <HStack gap="4">
      <Checkmark />
      <Checkmark checked />
      <Checkmark indeterminate />
    </HStack>
  );
}
