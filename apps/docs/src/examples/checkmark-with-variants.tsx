import { Checkmark, HStack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function CheckmarkWithVariants() {
  return (
    <HStack gap="4">
      <For each={["solid", "outline", "subtle", "plain", "inverted"] as const}>
        {(variant) => <Checkmark variant={variant} checked />}
      </For>
    </HStack>
  );
}
