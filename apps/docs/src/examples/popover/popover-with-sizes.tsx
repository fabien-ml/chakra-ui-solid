import { Portal } from "@solidjs/web";
import { Button, type ButtonProps, Input, Popover, Stack, Text } from "chakra-ui-solid";
import { For } from "solid-js";

export default function PopoverWithSizes() {
  return (
    <Stack align="center" direction="row" gap="10">
      <For each={["xs", "sm", "md", "lg"] as const}>
        {(size) => (
          <Popover.Root size={size}>
            <Popover.Trigger
              render={(props) => (
                <Button size={size} variant="outline" {...(props as ButtonProps)} />
              )}
            >
              Click me
            </Popover.Trigger>
            <Portal>
              <Popover.Positioner>
                <Popover.Content>
                  <Popover.Arrow />
                  <Popover.Body>
                    <Popover.Title fontWeight="medium">Naruto Form</Popover.Title>
                    <Text my="4">
                      Naruto is a Japanese manga series written and illustrated by Masashi
                      Kishimoto.
                    </Text>
                    <Input placeholder="Your fav. character" size={size} />
                  </Popover.Body>
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>
        )}
      </For>
    </Stack>
  );
}
