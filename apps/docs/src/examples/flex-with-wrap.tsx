import { Box, Flex } from "@chakra-ui-solid/components";

export default function FlexWithWrap() {
  return (
    <Flex gap="4" wrap="wrap" maxW="500px">
      <Box height="10" width="200px" bg="bg.emphasized" />
      <Box height="10" width="200px" bg="bg.emphasized" />
      <Box height="10" width="200px" bg="bg.emphasized" />
    </Flex>
  );
}
