import { HStack, Icon } from "chakra-ui-solid";
import { BellIcon, BoxIcon, TerminalIcon } from "../../components/site/icons";

export default function IconWithIconLibrary() {
  return (
    <HStack gap="4">
      <Icon as={BellIcon} size="lg" color="teal.600" />
      <Icon as={BoxIcon} size="lg" color="orange.500" />
      <Icon as={TerminalIcon} size="lg" color="purple.600" />
    </HStack>
  );
}
