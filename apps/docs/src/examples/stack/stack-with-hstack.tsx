import { HStack } from "chakra-ui-solid";
import { DecorativeBox } from "../decorative-box";

export default function StackWithHstack() {
  return (
    <HStack>
      <DecorativeBox h="10" />
      <DecorativeBox h="5" />
      <DecorativeBox h="20" />
    </HStack>
  );
}
