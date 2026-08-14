import { SimpleGrid } from "chakra-ui-solid";
import { DecorativeBox } from "../../components/decorative-box";

export default function SimpleGridBasic() {
  return (
    <SimpleGrid columns={2} gap="40px">
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
      <DecorativeBox height="20" />
    </SimpleGrid>
  );
}
