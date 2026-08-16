import { Button, type ButtonProps, Popover, Portal } from "chakra-ui-solid";

export default function PopoverWithSameWidth() {
  return (
    <Popover.Root positioning={{ sameWidth: true }}>
      <Popover.Trigger
        render={(props) => (
          <Button size="sm" variant="outline" minW="xs" {...(props as ButtonProps)} />
        )}
      >
        Click me
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content width="auto">
            <Popover.Arrow />
            <Popover.Body>This is a popover with the same width as the trigger button</Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
