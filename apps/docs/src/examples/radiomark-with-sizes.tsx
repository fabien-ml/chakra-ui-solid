import { HStack, Radiomark } from "chakra-ui-solid";
import { For } from "solid-js";

export default function RadiomarkWithSizes() {
  return (
    <HStack gap="4" align="center">
      <For each={["xs", "sm", "md", "lg"] as const}>
        {(size) => <Radiomark size={size} checked />}
      </For>
    </HStack>
  );
}
