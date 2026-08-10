import { Box, Flex } from "@chakra-ui-solid/components";

export default function FlexWithAutoMargin() {
  return (
    <Flex gap="4" justify="space-between">
      <Box height="10" width="40" bg="bg.emphasized" />
      <Box height="10" width="40" bg="bg.emphasized" marginEnd="auto" />
      <Box height="10" width="40" bg="bg.emphasized" />
    </Flex>
  );
}
