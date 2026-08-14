import { Box, Flex, Spacer } from "chakra-ui-solid";

export default function FlexWithSpacer() {
  return (
    <Flex>
      <Box p="4" bg="red.subtle" color="red.fg">
        Box 1
      </Box>
      <Spacer />
      <Box p="4" bg="green.subtle" color="green.fg">
        Box 2
      </Box>
    </Flex>
  );
}
