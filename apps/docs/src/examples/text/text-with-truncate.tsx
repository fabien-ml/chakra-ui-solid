import { Flex, Text } from "chakra-ui-solid";

export default function TextWithTruncate() {
  return (
    <Flex maxW="300px">
      <Text truncate>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
    </Flex>
  );
}
