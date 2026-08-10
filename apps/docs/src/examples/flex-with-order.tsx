import { Box, Flex } from "@chakra-ui-solid/components";

export default function FlexWithOrder() {
  return (
    <Flex gap="4">
      <Box height="10" width="10" bg="bg.emphasized" order="1">
        1
      </Box>
      <Box height="10" width="10" bg="bg.emphasized" order="3">
        2
      </Box>
      <Box height="10" width="10" bg="bg.emphasized" order="2">
        3
      </Box>
    </Flex>
  );
}
