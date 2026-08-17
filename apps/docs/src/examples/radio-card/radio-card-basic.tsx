import { HStack, RadioCard } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { value: "next", title: "Next.js" },
  { value: "vite", title: "Vite" },
  { value: "astro", title: "Astro" },
];

export default function RadioCardBasic() {
  return (
    <RadioCard.Root defaultValue="next">
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
