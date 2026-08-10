import { Box, SimpleGrid } from "@chakra-ui-solid/components";

export default function SimpleGridWithAutofit() {
  return (
    <SimpleGrid minChildWidth="sm" gap="40px">
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
    </SimpleGrid>
  );
}
