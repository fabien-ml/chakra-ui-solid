import { Box, Grid, GridItem } from "@chakra-ui-solid/components";

export default function GridWithColSpan() {
  return (
    <Grid templateColumns="repeat(4, 1fr)" gap="6">
      <GridItem colSpan={2}>
        <Box h="20" bg="bg.emphasized" />
      </GridItem>
      <GridItem colSpan={1}>
        <Box h="20" bg="bg.emphasized" />
      </GridItem>
      <GridItem colSpan={1}>
        <Box h="20" bg="bg.emphasized" />
      </GridItem>
    </Grid>
  );
}
