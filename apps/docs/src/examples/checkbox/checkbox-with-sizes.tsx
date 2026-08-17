import { Checkbox, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function CheckboxWithSizes() {
  return (
    <Stack align="flex-start" flex="1" gap="4">
      <For each={["xs", "sm", "md", "lg"] as const}>
        {(size) => (
          <Checkbox.Root defaultChecked size={size}>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Checkbox</Checkbox.Label>
          </Checkbox.Root>
        )}
      </For>
    </Stack>
  );
}
