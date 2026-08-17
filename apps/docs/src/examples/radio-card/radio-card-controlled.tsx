import { HStack, RadioCard } from "chakra-ui-solid";
import { createSignal, For } from "solid-js";

const items = [
  { value: "next", title: "Next.js" },
  { value: "vite", title: "Vite" },
  { value: "astro", title: "Astro" },
];

export default function RadioCardControlled() {
  const [value, setValue] = createSignal<string | null>("next");

  return (
    <RadioCard.Root value={value()} onValueChange={(details) => setValue(details.value)}>
      <RadioCard.Label>Select framework</RadioCard.Label>
      <HStack align="stretch">
        <For each={items}>
          {(item) => (
            <RadioCard.Item value={item.value}>
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          )}
        </For>
      </HStack>
    </RadioCard.Root>
  );
}
