import { Box, Flex } from "@chakra-ui-solid/components";

export default function FlexWithAlign() {
  return (
    <Flex gap="4" align="center">
      <Box height="4" width="10" bg="bg.emphasized" />
      <Box height="8" width="10" bg="bg.emphasized" />
      <Box height="10" width="10" bg="bg.emphasized" />
    </Flex>
  );
}
