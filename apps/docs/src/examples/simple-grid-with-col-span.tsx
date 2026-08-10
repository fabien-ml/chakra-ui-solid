import { Box, GridItem, SimpleGrid } from "@chakra-ui-solid/components";

export default function SimpleGridWithColSpan() {
  return (
    <SimpleGrid columns={4} gap={{ base: "24px", md: "40px" }}>
      <GridItem colSpan={3}>
        <Box height="20" bg="bg.emphasized">
          Column 1
        </Box>
      </GridItem>
      <GridItem colSpan={1}>
        <Box height="20" bg="bg.emphasized">
          Column 2
        </Box>
      </GridItem>
    </SimpleGrid>
  );
}
