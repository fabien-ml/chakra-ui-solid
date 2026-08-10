import { Box, Grid, GridItem } from "@chakra-ui-solid/components";

export default function GridSpanningColumns() {
  return (
    <Grid h="200px" templateRows="repeat(2, 1fr)" templateColumns="repeat(5, 1fr)" gap="4">
      <GridItem rowSpan={2} colSpan={1}>
        <Box h="full" bg="bg.emphasized">
          rowSpan=2
        </Box>
      </GridItem>
      <GridItem colSpan={2}>
        <Box h="full" bg="bg.emphasized">
          colSpan=2
        </Box>
      </GridItem>
      <GridItem colSpan={2}>
        <Box h="full" bg="bg.emphasized">
          colSpan=2
        </Box>
      </GridItem>
      <GridItem colSpan={4}>
        <Box h="full" bg="bg.emphasized">
          colSpan=4
        </Box>
      </GridItem>
    </Grid>
  );
}
