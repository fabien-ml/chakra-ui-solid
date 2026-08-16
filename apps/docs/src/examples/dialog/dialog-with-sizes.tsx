import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Dialog,
  HStack,
  Portal,
  Text,
} from "chakra-ui-solid";
import { For } from "solid-js";

export default function DialogWithSizes() {
  return (
    <HStack>
      <For each={["xs", "sm", "md", "lg"] as const}>
        {(size) => (
          <Dialog.Root size={size}>
            <Dialog.Trigger
              render={(props) => (
                <Button variant="outline" size={size} {...(props as ButtonProps)} />
              )}
            >
              Open ({size})
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
          </Dialog.Root>
        )}
      </For>
    </HStack>
  );
}
