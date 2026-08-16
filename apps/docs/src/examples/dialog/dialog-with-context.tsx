import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Dialog,
  Portal,
  Text,
} from "chakra-ui-solid";
import { Show } from "solid-js";

export default function DialogWithContext() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={(props) => <Button variant="outline" size="sm" {...(props as ButtonProps)} />}
      >
        Open Dialog
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Context>
              {(store) => (
                // The render prop is called once in the part's body, which is not a tracking scope,
                // so it must return JSX — a bare ternary here would read `open` untracked and
                // freeze on the value it had at mount.
                <Dialog.Body pt="6" spaceY="3">
                  <Text>
                    Dialog is open:{" "}
                    <Show when={store.open} fallback="false">
                      true
                    </Show>
                  </Text>
                  <Text>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua.
                  </Text>
                  <Button variant="outline" size="sm" onClick={() => store.setOpen(false)}>
                    Close
                  </Button>
                </Dialog.Body>
              )}
            </Dialog.Context>
            <Dialog.CloseTrigger
              render={(props) => <CloseButton size="sm" {...(props as CloseButtonProps)} />}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
