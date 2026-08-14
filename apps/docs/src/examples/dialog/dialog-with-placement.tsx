import { Portal } from "@solidjs/web";
import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Dialog,
  HStack,
  Text,
} from "chakra-ui-solid";
import { For } from "solid-js";

export default function DialogWithPlacement() {
  return (
    <HStack wrap="wrap" gap="4">
      <For each={["top", "center", "bottom"] as const}>
        {(placement) => (
          <Dialog.Root placement={placement} motionPreset="slide-in-bottom">
            <Dialog.Trigger
              render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
            >
              Open Dialog ({placement})
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
