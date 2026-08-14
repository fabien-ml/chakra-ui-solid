import { Collapsible, Stack, Text } from "chakra-ui-solid";
import { ChevronRightIcon } from "../../components/site/icons";

export default function CollapsibleInitialOpen() {
  return (
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger paddingY="3" display="flex" gap="2" alignItems="center">
        <Collapsible.Indicator transition="transform 0.2s" _open={{ transform: "rotate(90deg)" }}>
          <ChevronRightIcon />
        </Collapsible.Indicator>
        Toggle
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Stack padding="4" borderWidth="1px">
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </Text>
          <Text>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
            commodo consequat.
          </Text>
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
