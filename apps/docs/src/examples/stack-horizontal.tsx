import { Box, Stack } from "@chakra-ui-solid/components";

export default function StackHorizontal() {
  return (
    <Stack direction="row" h="20">
      <Box flex="1" bg="bg.emphasized" />
      <Box flex="1" bg="bg.emphasized" />
      <Box flex="1" bg="bg.emphasized" />
    </Stack>
  );
}
