import { Box, VStack } from "@chakra-ui-solid/components";

export default function StackWithVstack() {
  return (
    <VStack>
      <Box w="50%" h="20" bg="bg.emphasized" />
      <Box w="25%" h="20" bg="bg.emphasized" />
      <Box w="100%" h="20" bg="bg.emphasized" />
    </VStack>
  );
}
