import { Portal } from "@solidjs/web";
import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Dialog,
  Popover,
  Text,
} from "chakra-ui-solid";

export default function PopoverOpenFromDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}>
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
              <Dialog.Title>Popover in Dialog</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <DialogPopover />
            </Dialog.Body>
            <Dialog.Footer />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function DialogPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger
        render={(props) => <Button size="sm" variant="outline" {...(props as ButtonProps)} />}
      >
        Click me
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Arrow />
          <Popover.Body>
            <Popover.Title fontWeight="medium">Naruto Form</Popover.Title>
            <Text my="4">
              Naruto is a Japanese manga series written and illustrated by Masashi Kishimoto.
            </Text>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
