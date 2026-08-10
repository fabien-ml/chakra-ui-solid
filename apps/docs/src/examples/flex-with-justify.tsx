import { Box, Flex } from "@chakra-ui-solid/components";

export default function FlexWithJustify() {
  return (
    <Flex direction="column" gap="8">
      <Flex gap="4" justify="flex-start">
        <Box height="10" width="120px" bg="bg.emphasized" />
        <Box height="10" width="120px" bg="bg.emphasized">
          flex-start
        </Box>
        <Box height="10" width="120px" bg="bg.emphasized" />
      </Flex>

      <Flex gap="4" justify="center">
        <Box height="10" width="120px" bg="bg.emphasized" />
        <Box height="10" width="120px" bg="bg.emphasized">
          center
        </Box>
        <Box height="10" width="120px" bg="bg.emphasized" />
      </Flex>

      <Flex gap="4" justify="flex-end">
        <Box height="10" width="120px" bg="bg.emphasized" />
        <Box height="10" width="120px" bg="bg.emphasized">
          flex-end
        </Box>
        <Box height="10" width="120px" bg="bg.emphasized" />
      </Flex>

      <Flex gap="4" justify="space-between">
        <Box height="10" width="120px" bg="bg.emphasized" />
        <Box height="10" width="120px" bg="bg.emphasized">
          space-between
        </Box>
        <Box height="10" width="120px" bg="bg.emphasized" />
      </Flex>
    </Flex>
  );
}
