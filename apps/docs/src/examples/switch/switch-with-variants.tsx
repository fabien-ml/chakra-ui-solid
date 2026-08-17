import { HStack, Switch } from "chakra-ui-solid";
import { For } from "solid-js";

export default function SwitchWithVariants() {
  return (
    <HStack gap="8">
      <For each={["raised", "solid"] as const}>
        {(variant) => (
          <Switch.Root variant={variant} defaultChecked>
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label>{variant}</Switch.Label>
          </Switch.Root>
        )}
      </For>
    </HStack>
  );
}
