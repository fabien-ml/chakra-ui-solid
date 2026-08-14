import { Flex } from "chakra-ui-solid";
import { DecorativeBox } from "../decorative-box";

export default function FlexBasic() {
  return (
    <Flex gap="4">
      <DecorativeBox height="10" />
      <DecorativeBox height="10" />
      <DecorativeBox height="10" />
    </Flex>
  );
}
