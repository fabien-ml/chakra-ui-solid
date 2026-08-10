import { Flex } from "@chakra-ui-solid/components";
import { DecorativeBox } from "../components/decorative-box";

export default function FlexWithOrder() {
  return (
    <Flex gap="4">
      <DecorativeBox height="10" order="1">
        1
      </DecorativeBox>
      <DecorativeBox height="10" order="3">
        2
      </DecorativeBox>
      <DecorativeBox height="10" order="2">
        3
      </DecorativeBox>
    </Flex>
  );
}
