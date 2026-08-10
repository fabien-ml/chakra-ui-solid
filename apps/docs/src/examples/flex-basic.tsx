import { Flex } from "@chakra-ui-solid/components";
import { DecorativeBox } from "../components/decorative-box";

export default function FlexBasic() {
  return (
    <Flex gap="4">
      <DecorativeBox height="10" />
      <DecorativeBox height="10" />
      <DecorativeBox height="10" />
    </Flex>
  );
}
