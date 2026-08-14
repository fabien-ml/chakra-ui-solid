import { Portal } from "@solidjs/web";
import { Box, Button, type ButtonProps, Group, Popover } from "chakra-ui-solid";

export default function PopoverWithInitialFocus() {
  let prevButton: HTMLButtonElement | undefined;

  return (
    <Popover.Root initialFocusEl={() => prevButton ?? null}>
      <Popover.Trigger
        render={(props) => <Button size="sm" variant="outline" {...(props as ButtonProps)} />}
      >
        Click me
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Header>Manage Your Channels</Popover.Header>
            <Popover.Arrow />
            <Popover.Body>This is a popover with the same width as the trigger button</Popover.Body>
            <Popover.Footer>
              <Box fontSize="sm" flex="1">
                Step 2 of 4
              </Box>
              <Group>
                <Button size="sm" ref={prevButton}>
                  Prev
                </Button>
                <Button size="sm">Next</Button>
              </Group>
            </Popover.Footer>
            <Popover.CloseTrigger />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
