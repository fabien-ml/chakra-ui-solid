import { HStack, RadioGroup } from "chakra-ui-solid";
import { createSignal, For } from "solid-js";

const items = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" },
];

export default function RadioControlled() {
  const [value, setValue] = createSignal<string | null>(null);

  return (
    <RadioGroup.Root value={value()} onValueChange={(details) => setValue(details.value)}>
      <HStack gap="6">
        <For each={items}>
          {(item) => (
            <RadioGroup.Item value={item.value}>
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
