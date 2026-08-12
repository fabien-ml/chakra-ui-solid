import { HStack, Icon } from "chakra-ui-solid";
import { BellIcon, BoxIcon, TerminalIcon } from "../components/site/icons";

export default function IconWithIconLibrary() {
  return (
    <HStack gap="4">
      <Icon size="lg" color="teal.600">
        <BellIcon />
      </Icon>
      <Icon size="lg" color="orange.500">
        <BoxIcon />
      </Icon>
      <Icon size="lg" color="purple.600">
        <TerminalIcon />
      </Icon>
    </HStack>
  );
}
