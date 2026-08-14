import { Portal } from "@solidjs/web";
import { Button, type ButtonProps, Field, Input, Popover, Stack, Textarea } from "chakra-ui-solid";

export default function PopoverWithForm() {
  return (
    <Popover.Root>
      <Popover.Trigger
        render={(props) => <Button size="sm" variant="outline" {...(props as ButtonProps)} />}
      >
        Click me
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap="4">
                <Field.Root>
                  <Field.Label>Width</Field.Label>
                  <Input placeholder="40px" />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Height</Field.Label>
                  <Input placeholder="32px" />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Comments</Field.Label>
                  <Textarea placeholder="Start typing..." />
                </Field.Root>
              </Stack>
            </Popover.Body>
            <Popover.CloseTrigger />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
