import { Box, SimpleGrid } from "@chakra-ui-solid/components";

export default function SimpleGridWithColumns() {
  return (
    <SimpleGrid columns={3} gap="40px">
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
    </SimpleGrid>
  );
}
