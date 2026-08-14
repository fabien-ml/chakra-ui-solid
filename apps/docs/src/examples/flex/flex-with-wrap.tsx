import { Flex } from "chakra-ui-solid";
import { DecorativeBox } from "../../components/decorative-box";

export default function FlexWithWrap() {
  return (
    <Flex gap="4" wrap="wrap" maxW="500px">
      <DecorativeBox height="10" width="200px" />
      <DecorativeBox height="10" width="200px" />
      <DecorativeBox height="10" width="200px" />
    </Flex>
  );
}
