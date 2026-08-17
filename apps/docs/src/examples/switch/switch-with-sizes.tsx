import { HStack, Switch } from "chakra-ui-solid";
import { For } from "solid-js";

export default function SwitchWithSizes() {
  return (
    <HStack gap="8">
      <For each={["xs", "sm", "md", "lg"] as const}>
        {(size) => (
          <Switch.Root size={size}>
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label>{size}</Switch.Label>
          </Switch.Root>
        )}
      </For>
    </HStack>
  );
}
