import { Box, Grid } from "@chakra-ui-solid/components";

export default function GridBasic() {
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap="6">
      <Box h="20" bg="bg.emphasized" />
      <Box h="20" bg="bg.emphasized" />
      <Box h="20" bg="bg.emphasized" />
    </Grid>
  );
}
