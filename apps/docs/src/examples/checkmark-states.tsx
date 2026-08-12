import { Checkmark, HStack } from "chakra-ui-solid";

export default function CheckmarkStates() {
  return (
    <HStack gap="3">
      <Checkmark />
      <Checkmark checked />
      <Checkmark indeterminate />
      <Checkmark disabled />
      <Checkmark checked disabled />
      <Checkmark indeterminate disabled />
    </HStack>
  );
}
