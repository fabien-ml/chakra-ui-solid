import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Dialog,
  Portal,
  Text,
} from "chakra-ui-solid";

export default function DialogWithRole() {
  return (
    <Dialog.Root role="alertdialog">
      <Dialog.Trigger
        render={(props) => <Button variant="outline" size="sm" {...(props as ButtonProps)} />}
      >
        Open Dialog
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Are you sure?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our systems.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger
                render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
              >
                Cancel
              </Dialog.ActionTrigger>
              <Button colorPalette="red">Delete</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger
              render={(props) => <CloseButton size="sm" {...(props as CloseButtonProps)} />}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
