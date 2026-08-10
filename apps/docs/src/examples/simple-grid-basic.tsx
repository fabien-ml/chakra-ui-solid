import { Box, SimpleGrid } from "@chakra-ui-solid/components";

export default function SimpleGridBasic() {
  return (
    <SimpleGrid columns={2} gap="40px">
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
    </SimpleGrid>
  );
}
