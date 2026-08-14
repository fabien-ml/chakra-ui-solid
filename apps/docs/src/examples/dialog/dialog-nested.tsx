import { Portal } from "@solidjs/web";
import { Button, type ButtonProps, Dialog, Text } from "chakra-ui-solid";

export default function DialogNested() {
  return (
    <Dialog.Root>
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
              <Button variant="outline">Button 2</Button>

              <Dialog.Root>
                <Dialog.Trigger render={(props) => <Button {...(props as ButtonProps)} />}>
                  Open Nested
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
                          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                          dolore eu fugiat nulla pariatur.
                        </Text>
                      </Dialog.Body>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
