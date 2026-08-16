import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Dialog,
  Portal,
  Text,
} from "chakra-ui-solid";

export default function DialogWithResponsiveSize() {
  return (
    // A responsive **recipe variant**, which the stylesheet only carries for the recipes a config
    // opts in — this site's `panda.config.ts` names `responsive: { dialog: ["size"] }`. A
    // responsive *style prop* beside it needs no such line.
    <Dialog.Root size={{ mdDown: "full", md: "lg" }}>
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
  );
}
