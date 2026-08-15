import { Portal } from "@solidjs/web";
import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Drawer,
  HStack,
  Text,
} from "chakra-ui-solid";
import { For } from "solid-js";

export default function DrawerWithPlacement() {
  return (
    <HStack wrap="wrap">
      <For each={["bottom", "top", "start", "end"] as const}>
        {(placement) => (
          <Drawer.Root placement={placement}>
            <Drawer.Trigger
              render={(props) => <Button variant="outline" size="sm" {...(props as ButtonProps)} />}
            >
              Open ({placement})
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content
                  roundedTop={placement === "bottom" ? "l3" : undefined}
                  roundedBottom={placement === "top" ? "l3" : undefined}
                >
                  <Drawer.Header>
                    <Drawer.Title>Drawer Title</Drawer.Title>
                  </Drawer.Header>
                  <Drawer.Body>
                    <Text>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                      incididunt ut labore et dolore magna aliqua.
                    </Text>
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
