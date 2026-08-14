import { Grid } from "chakra-ui-solid";
import { DecorativeBox } from "../decorative-box";

export default function GridBasic() {
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap="6">
      <DecorativeBox h="20" />
      <DecorativeBox h="20" />
      <DecorativeBox h="20" />
    </Grid>
  );
}
