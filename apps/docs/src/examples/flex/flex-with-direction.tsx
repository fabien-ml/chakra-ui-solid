import { Flex } from "chakra-ui-solid";
import { DecorativeBox } from "../decorative-box";

export default function FlexWithDirection() {
  return (
    <Flex gap="4" direction="column">
      <DecorativeBox height="10" />
      <DecorativeBox height="10" />
      <DecorativeBox height="10" />
    </Flex>
  );
}
