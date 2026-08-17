import { Checkbox, HStack, Stack, Text } from "chakra-ui-solid";
import { For } from "solid-js";

export default function CheckboxWithVariants() {
  return (
    <HStack align="flex-start">
      <For each={["outline", "subtle", "solid"] as const}>
        {(variant) => (
          <Stack align="flex-start" flex="1">
            <Text>{variant}</Text>
            <Checkbox.Root defaultChecked variant={variant}>
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>Checkbox</Checkbox.Label>
            </Checkbox.Root>
          </Stack>
        )}
      </For>
    </HStack>
  );
}
