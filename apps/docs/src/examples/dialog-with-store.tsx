import { Portal } from "@solidjs/web";
import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  createDialog,
  Dialog,
  Text,
} from "chakra-ui-solid";
import { Show } from "solid-js";

export default function DialogWithStore() {
  const dialog = createDialog();

  return (
    <Dialog.RootProvider value={dialog}>
      <Dialog.Trigger
        render={(props) => <Button variant="outline" size="sm" {...(props as ButtonProps)} />}
      >
        <Show when={dialog.open} fallback="Open">
          Close
        </Show>{" "}
        Dialog
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Dialog Title</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
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
    </Dialog.RootProvider>
  );
}
