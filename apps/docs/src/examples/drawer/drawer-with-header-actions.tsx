import {
  Button,
  ButtonGroup,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Drawer,
  Portal,
  Text,
} from "chakra-ui-solid";

export default function DrawerWithHeaderActions() {
  return (
    <Drawer.Root size="md">
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
              <Drawer.CloseTrigger
                pos="initial"
                render={(props) => <CloseButton {...(props as CloseButtonProps)} />}
              />
              <Drawer.Title flex="1">Drawer Title</Drawer.Title>
              <ButtonGroup>
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </ButtonGroup>
            </Drawer.Header>
            <Drawer.Body>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </Text>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
