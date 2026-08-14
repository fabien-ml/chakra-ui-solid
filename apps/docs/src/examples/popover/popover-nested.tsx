import { Portal } from "@solidjs/web";
import { Button, type ButtonProps, Popover, Text } from "chakra-ui-solid";

export default function PopoverNested() {
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
              <Text mb="4">
                Naruto is a Japanese manga series written and illustrated by Masashi Kishimoto.
              </Text>

              <Popover.Root>
                <Popover.Trigger
                  render={(props) => (
                    <Button size="xs" variant="outline" {...(props as ButtonProps)} />
                  )}
                >
                  Open Nested Popover
                </Popover.Trigger>
                <Popover.Positioner>
                  <Popover.Content>
                    <Popover.Arrow />
                    <Popover.Body>Some nested popover content</Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Root>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
