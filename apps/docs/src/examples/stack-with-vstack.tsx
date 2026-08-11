import { VStack } from "chakra-ui-solid";
import { DecorativeBox } from "../components/decorative-box";

export default function StackWithVstack() {
  return (
    <VStack>
      <DecorativeBox w="50%" h="20" />
      <DecorativeBox w="25%" h="20" />
      <DecorativeBox w="100%" h="20" />
    </VStack>
  );
}
