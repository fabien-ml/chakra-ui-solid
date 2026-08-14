import { Portal } from "@solidjs/web";
import {
  AspectRatio,
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Dialog,
} from "chakra-ui-solid";

export default function DialogWithCloseOutside() {
  return (
    <Dialog.Root placement="center">
      <Dialog.Trigger
        render={(props) => <Button variant="outline" size="sm" {...(props as ButtonProps)} />}
      >
        Open Dialog
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Body pt="4">
              <Dialog.Title>Dialog Title</Dialog.Title>
              <Dialog.Description mb="4">
                This is a dialog with some content and a video.
              </Dialog.Description>
              <AspectRatio ratio={4 / 3} rounded="lg" overflow="hidden">
                <iframe
                  title="naruto"
                  src="https://www.youtube.com/embed/QhBnZ6NPOY0"
                  allowfullscreen
                />
              </AspectRatio>
            </Dialog.Body>
            <Dialog.CloseTrigger
              top="0"
              insetEnd="-12"
              render={(props) => <CloseButton bg="bg" size="sm" {...(props as CloseButtonProps)} />}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
