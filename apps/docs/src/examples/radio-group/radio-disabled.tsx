import { HStack, RadioGroup } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2", disabled: true },
  { label: "Option 3", value: "3" },
];

export default function RadioDisabled() {
  return (
    <RadioGroup.Root defaultValue="2">
      <HStack gap="6">
        <For each={items}>
          {(item) => (
            <RadioGroup.Item value={item.value} disabled={item.disabled}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
            </RadioGroup.Item>
          )}
        </For>
      </HStack>
    </RadioGroup.Root>
  );
}
