import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Dialog,
  Popover,
  Portal,
  Text,
} from "chakra-ui-solid";

export default function DialogOpenFromPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}>
        Open Popover
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <Popover.Title fontWeight="medium">Popover Title</Popover.Title>
              <Text my="4">
                This popover contains a button that opens a dialog. The dialog should appear above
                the popover.
              </Text>
              <PopoverDialog />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

function PopoverDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={(props) => (
          <Button size="sm" variant="solid" colorPalette="blue" {...(props as ButtonProps)} />
        )}
      >
        Open Dialog
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger
              render={(props) => <CloseButton {...(props as CloseButtonProps)} />}
            />
            <Dialog.Header>
              <Dialog.Title>Dialog from Popover</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                This dialog was opened from within a popover. It should appear above the popover
                thanks to the unified z-index system.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger
                render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
              >
                Cancel
              </Dialog.ActionTrigger>
              <Button colorPalette="blue">Save</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
