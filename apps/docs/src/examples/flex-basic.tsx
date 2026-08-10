import { Box, Flex } from "@chakra-ui-solid/components";

export default function FlexBasic() {
  return (
    <Flex gap="4">
      <Box height="10" width="10" bg="bg.emphasized" />
      <Box height="10" width="10" bg="bg.emphasized" />
      <Box height="10" width="10" bg="bg.emphasized" />
    </Flex>
  );
}
