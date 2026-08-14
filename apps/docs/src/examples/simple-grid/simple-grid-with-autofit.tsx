import { SimpleGrid } from "chakra-ui-solid";
import { DecorativeBox } from "../../components/decorative-box";

export default function SimpleGridWithAutofit() {
  return (
    <SimpleGrid minChildWidth="sm" gap="40px">
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
    </SimpleGrid>
  );
}
