import { Box, HStack } from "@chakra-ui-solid/components";

export default function StackWithHstack() {
  return (
    <HStack>
      <Box h="10" w="20" bg="bg.emphasized" />
      <Box h="5" w="20" bg="bg.emphasized" />
      <Box h="20" w="20" bg="bg.emphasized" />
    </HStack>
  );
}
