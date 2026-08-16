import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Dialog,
  Portal,
  Text,
} from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function DialogControlled() {
  const [open, setOpen] = createSignal(false);

  return (
    <Dialog.Root lazyMount open={open()} onOpenChange={(details) => setOpen(details.open)}>
      <Dialog.Trigger render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}>
        Open
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Dialog Title</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body spaceY="3">
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </Text>
              <Text>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger
                render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
              >
                Cancel
              </Dialog.ActionTrigger>
              <Button>Save</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger
              render={(props) => <CloseButton size="sm" {...(props as CloseButtonProps)} />}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
