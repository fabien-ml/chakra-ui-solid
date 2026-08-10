import { SimpleGrid } from "@chakra-ui-solid/components";
import { DecorativeBox } from "../components/decorative-box";

export default function SimpleGridWithColumns() {
  return (
    <SimpleGrid columns={3} gap="40px">
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
    </SimpleGrid>
  );
}
