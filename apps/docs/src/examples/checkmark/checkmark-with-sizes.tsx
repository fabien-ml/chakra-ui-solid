import { Checkmark, HStack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function CheckmarkWithSizes() {
  return (
    <HStack gap="4" align="center">
      <For each={["xs", "sm", "md", "lg"] as const}>
        {(size) => <Checkmark size={size} checked />}
      </For>
    </HStack>
  );
}
