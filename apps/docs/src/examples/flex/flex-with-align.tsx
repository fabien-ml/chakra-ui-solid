import { Flex } from "chakra-ui-solid";
import { DecorativeBox } from "../decorative-box";

export default function FlexWithAlign() {
  return (
    <Flex gap="4" align="center">
      <DecorativeBox height="4" />
      <DecorativeBox height="8" />
      <DecorativeBox height="10" />
    </Flex>
  );
}
