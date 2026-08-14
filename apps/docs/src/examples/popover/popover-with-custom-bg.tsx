import { Portal } from "@solidjs/web";
import { Button, type ButtonProps, Input, Popover, Text } from "chakra-ui-solid";

export default function PopoverWithCustomBg() {
  return (
    <Popover.Root>
      <Popover.Trigger
        render={(props) => <Button size="sm" variant="outline" {...(props as ButtonProps)} />}
      >
        Click me
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content css={{ "--popover-bg": "lightblue" }}>
            <Popover.Arrow />
            <Popover.Body>
              <Popover.Title fontWeight="medium">Naruto Form</Popover.Title>
              <Text my="4">
                Naruto is a Japanese manga series written and illustrated by Masashi Kishimoto.
              </Text>
              <Input bg="bg" placeholder="Your fav. character" size="sm" />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
