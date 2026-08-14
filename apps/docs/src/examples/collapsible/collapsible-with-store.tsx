import { Box, Button, Collapsible, createCollapsible, Icon, Stack } from "chakra-ui-solid";
import { Show } from "solid-js";
import { ChevronDownIcon, ChevronRightIcon } from "../../components/site/icons";

export default function CollapsibleWithStore() {
  const collapsible = createCollapsible();

  return (
    <Stack gap="4" align="flex-start">
      <Box fontWeight="medium">State: {collapsible.visible ? "Expanded" : "Collapsed"}</Box>

      <Button size="sm" variant="subtle" onClick={() => collapsible.setOpen(!collapsible.open)}>
        Toggle
        <Icon>
          <Show when={collapsible.open} fallback={<ChevronDownIcon />}>
            <ChevronRightIcon />
          </Show>
        </Icon>
      </Button>

      <Collapsible.RootProvider value={collapsible}>
        <Collapsible.Content>
          <Box padding="4" borderWidth="1px" rounded="l3">
            Using the <code>createCollapsible</code> hook and <code>RootProvider</code> allows you
            to access the collapsible store and control the state from anywhere in your component.
          </Box>
        </Collapsible.Content>
      </Collapsible.RootProvider>
    </Stack>
  );
}
