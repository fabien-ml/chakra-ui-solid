import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Drawer,
  Portal,
  Stack,
  Text,
} from "chakra-ui-solid";
import { createSignal } from "solid-js";

export default function DrawerWithCustomContainer() {
  // A **signal**, not a plain `let`: the container element does not exist yet on the render that
  // writes this, and `Portal` reads `container` reactively — so the drawer moves into the box the
  // moment the ref fills it.
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
      <Portal container={container}>
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
    </Drawer.Root>
  );
}
