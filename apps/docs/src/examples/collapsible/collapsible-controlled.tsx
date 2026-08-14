import { Box, Collapsible, Stack } from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function CollapsibleControlled() {
  const [open, setOpen] = createSignal(false);

  return (
    <Stack gap="4">
      <Box fontWeight="medium">Status: {open() ? "Open" : "Closed"}</Box>
      <Collapsible.Root open={open()} onOpenChange={(details) => setOpen(details.open)}>
        <Collapsible.Trigger paddingY="3">Toggle Collapsible</Collapsible.Trigger>
        <Collapsible.Content>
          <Box padding="4" borderWidth="1px">
            This collapsible is controlled by external state. You can open and close it using the
            buttons above or by clicking the trigger.
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Stack>
  );
}
