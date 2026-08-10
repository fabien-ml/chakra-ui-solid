import { Box, Flex } from "@chakra-ui-solid/components";

export default function FlexWithDirection() {
  return (
    <Flex gap="4" direction="column">
      <Box height="10" bg="bg.emphasized" />
      <Box height="10" bg="bg.emphasized" />
      <Box height="10" bg="bg.emphasized" />
    </Flex>
  );
}
