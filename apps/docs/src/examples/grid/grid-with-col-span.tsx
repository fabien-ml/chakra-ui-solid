import { Grid, GridItem } from "chakra-ui-solid";
import { DecorativeBox } from "../../components/decorative-box";

export default function GridWithColSpan() {
  return (
    <Grid templateColumns="repeat(4, 1fr)" gap="6">
      <GridItem colSpan={2}>
        <DecorativeBox h="20" />
      </GridItem>
      <GridItem colSpan={1}>
        <DecorativeBox h="20" />
      </GridItem>
      <GridItem colSpan={1}>
        <DecorativeBox h="20" />
      </GridItem>
    </Grid>
  );
}
