import { Portal } from "@solidjs/web";
import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Drawer,
  Stack,
  Text,
} from "chakra-ui-solid";
import { createSignal, Show } from "solid-js";

export default function DrawerWithCustomContainer() {
  // A **signal**, not a plain `let`: the `<Portal>` below has to be built after the container
  // element exists, and `mount` is read once when the portal is created.
  const [container, setContainer] = createSignal<HTMLDivElement | undefined>(undefined);

  return (
    <Drawer.Root closeOnInteractOutside={false}>
      <Stack
        ref={setContainer}
        pos="relative"
        overflow="hidden"
        align="flex-start"
        p="8"
        minH="400px"
        layerStyle="fill.subtle"
        outline="2px solid gray"
      >
        <Text>Render drawer here</Text>
        <Drawer.Trigger
          render={(props) => (
            <Button variant="outline" size="sm" bg="bg" {...(props as ButtonProps)} />
          )}
        >
          Open Drawer
        </Drawer.Trigger>
      </Stack>
      <Show when={container()}>
        {(node) => (
          <Portal mount={node()}>
            <Drawer.Backdrop pos="absolute" boxSize="full" />
            <Drawer.Positioner pos="absolute" boxSize="full">
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>Drawer Title</Drawer.Title>
                  <Drawer.CloseTrigger
                    render={(props) => <CloseButton size="sm" {...(props as CloseButtonProps)} />}
                  />
                </Drawer.Header>
                <Drawer.Body>
                  <Text>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua.
                  </Text>
                </Drawer.Body>
                <Drawer.Footer>
                  <Button variant="outline">Cancel</Button>
                  <Button>Save</Button>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        )}
      </Show>
    </Drawer.Root>
  );
}
