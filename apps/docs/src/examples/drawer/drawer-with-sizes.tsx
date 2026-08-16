import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Drawer,
  HStack,
  Kbd,
  Portal,
} from "chakra-ui-solid";
import { For } from "solid-js";

export default function DrawerWithSizes() {
  return (
    <HStack wrap="wrap">
      <For each={["xs", "sm", "md", "lg", "xl", "full"] as const}>
        {(size) => (
          <Drawer.Root size={size}>
            <Drawer.Trigger
              render={(props) => <Button variant="outline" size="sm" {...(props as ButtonProps)} />}
            >
              Open ({size})
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Header>
                    <Drawer.Title>Drawer Title</Drawer.Title>
                  </Drawer.Header>
                  <Drawer.Body>
                    Press the <Kbd>esc</Kbd> key to close the drawer.
                  </Drawer.Body>
                  <Drawer.Footer>
                    <Drawer.ActionTrigger
                      render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
                    >
                      Cancel
                    </Drawer.ActionTrigger>
                    <Button>Save</Button>
                  </Drawer.Footer>
                  <Drawer.CloseTrigger
                    render={(props) => <CloseButton size="sm" {...(props as CloseButtonProps)} />}
                  />
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
        )}
      </For>
    </HStack>
  );
}
