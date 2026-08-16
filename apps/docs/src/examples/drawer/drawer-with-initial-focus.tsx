import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Drawer,
  Input,
  Portal,
  Stack,
  Text,
} from "chakra-ui-solid";

export default function DrawerWithInitialFocus() {
  let emailInput: HTMLInputElement | undefined;

  return (
    <Drawer.Root initialFocusEl={() => emailInput ?? null}>
      <Drawer.Trigger
        render={(props) => <Button variant="outline" size="sm" {...(props as ButtonProps)} />}
      >
        Open Drawer
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Drawer Title</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </Text>
              <Stack mt="5">
                <Input value="Naruto" placeholder="First name" />
                <Input ref={emailInput} placeholder="Email" />
              </Stack>
            </Drawer.Body>
            <Drawer.Footer>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger
              render={(props) => <CloseButton size="sm" {...(props as CloseButtonProps)} />}
            />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
