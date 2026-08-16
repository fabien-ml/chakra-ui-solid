import { Portal } from "@solidjs/web";
import { Button, type ButtonProps, Dialog, Field, Input, Stack } from "chakra-ui-solid";

export default function DialogWithInitialFocus() {
  let lastNameInput: HTMLInputElement | undefined;

  return (
    <Dialog.Root initialFocusEl={() => lastNameInput ?? null}>
      <Dialog.Trigger render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}>
        Open
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Dialog Header</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb="4">
              <Stack gap="4">
                <Field.Root>
                  <Field.Label>First Name</Field.Label>
                  <Input placeholder="First Name" />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Last Name</Field.Label>
                  <Input ref={lastNameInput} placeholder="Focus First" />
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger
                render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
              >
                Cancel
              </Dialog.ActionTrigger>
              <Button>Save</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
