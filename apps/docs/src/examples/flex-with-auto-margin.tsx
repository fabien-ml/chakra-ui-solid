import { Flex } from "@chakra-ui-solid/components";
import { DecorativeBox } from "../components/decorative-box";

export default function FlexWithAutoMargin() {
  return (
    <Flex gap="4" justify="space-between">
      <DecorativeBox height="10" width="40" />
      <DecorativeBox height="10" width="40" marginEnd="auto" />
      <DecorativeBox height="10" width="40" />
    </Flex>
  );
}
