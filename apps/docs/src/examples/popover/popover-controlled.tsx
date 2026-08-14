import { Portal } from "@solidjs/web";
import { Button, type ButtonProps, Popover } from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function PopoverControlled() {
  const [open, setOpen] = createSignal(false);

  return (
    <Popover.Root open={open()} onOpenChange={(details) => setOpen(details.open)}>
      <Popover.Trigger
        render={(props) => <Button size="sm" variant="outline" {...(props as ButtonProps)} />}
      >
        Click me
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>This is a popover with the same width as the trigger button</Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
