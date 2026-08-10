import { Box, SimpleGrid } from "@chakra-ui-solid/components";

export default function SimpleGridWithRowAndColGap() {
  return (
    <SimpleGrid columns={2} columnGap="2" rowGap="4">
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
      <Box height="20" bg="bg.emphasized" />
    </SimpleGrid>
  );
}
