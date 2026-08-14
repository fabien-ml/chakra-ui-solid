import { SimpleGrid } from "chakra-ui-solid";
import { DecorativeBox } from "../decorative-box";

export default function SimpleGridWithRowAndColGap() {
  return (
    <SimpleGrid columns={2} columnGap="2" rowGap="4">
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
    </SimpleGrid>
  );
}
