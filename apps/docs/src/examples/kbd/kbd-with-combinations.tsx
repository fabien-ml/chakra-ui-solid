import { HStack, Kbd } from "chakra-ui-solid";

export default function KbdWithCombinations() {
  return (
    <HStack gap="1">
      <Kbd>ctrl</Kbd>+<Kbd>shift</Kbd>+<Kbd>del</Kbd>
    </HStack>
  );
}
