import { CloseButton, HStack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function CloseButtonWithSizes() {
  return (
    <HStack gap="4" wrap="wrap">
      <For each={["2xs", "xs", "sm", "md", "lg", "xl"] as const}>
        {(size) => <CloseButton variant="outline" size={size} />}
      </For>
    </HStack>
  );
}
