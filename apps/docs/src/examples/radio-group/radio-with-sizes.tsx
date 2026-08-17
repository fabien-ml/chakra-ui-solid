import { HStack, RadioGroup } from "chakra-ui-solid";
import { For } from "solid-js";

export default function RadioWithSizes() {
  return (
    <HStack gap="4">
      <For each={["sm", "md", "lg"] as const}>
        {(size) => (
          <RadioGroup.Root size={size}>
            <RadioGroup.Item value="react">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>Radio ({size})</RadioGroup.ItemText>
            </RadioGroup.Item>
          </RadioGroup.Root>
        )}
      </For>
    </HStack>
  );
}
