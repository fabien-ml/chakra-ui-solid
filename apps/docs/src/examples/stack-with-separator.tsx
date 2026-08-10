import { Box, Stack, StackSeparator } from "@chakra-ui-solid/components";

export default function StackWithSeparator() {
  return (
    <Stack separator={StackSeparator}>
      <Box h="20" bg="bg.emphasized" />
      <Box h="20" bg="bg.emphasized" />
      <Box h="20" bg="bg.emphasized" />
    </Stack>
  );
}
