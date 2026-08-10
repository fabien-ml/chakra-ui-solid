import { GridItem, SimpleGrid } from "@chakra-ui-solid/components";
import { DecorativeBox } from "../components/decorative-box";

export default function SimpleGridWithColSpan() {
  return (
    <SimpleGrid columns={4} gap={{ base: "24px", md: "40px" }}>
      <GridItem colSpan={3}>
        <DecorativeBox height="20">Column 1</DecorativeBox>
      </GridItem>
      <GridItem colSpan={1}>
        <DecorativeBox height="20">Column 2</DecorativeBox>
      </GridItem>
    </SimpleGrid>
  );
}
