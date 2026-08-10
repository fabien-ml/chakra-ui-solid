import { Box, Stack } from "@chakra-ui-solid/components";

export default function StackWithResponsiveDirection() {
  return (
    <Stack direction={{ base: "column", md: "row" }} gap="10">
      <Box boxSize="20" bg="bg.emphasized" />
      <Box boxSize="20" bg="bg.emphasized" />
      <Box boxSize="20" bg="bg.emphasized" />
    </Stack>
  );
}
