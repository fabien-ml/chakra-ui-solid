import { HStack, RadioCard } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { value: "next", title: "Next.js", description: "Best for apps" },
  { value: "vite", title: "Vite", description: "Best for SPAs" },
  { value: "astro", title: "Astro", description: "Best for static sites" },
];

export default function RadioCardWithAddon() {
  return (
    <RadioCard.Root defaultValue="next">
      <RadioCard.Label>Select framework</RadioCard.Label>
      <HStack align="stretch">
        <For each={items}>
          {(item) => (
            <RadioCard.Item value={item.value}>
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemContent>
                  <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                  <RadioCard.ItemDescription>{item.description}</RadioCard.ItemDescription>
                </RadioCard.ItemContent>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
              <RadioCard.ItemAddon>Some addon text</RadioCard.ItemAddon>
            </RadioCard.Item>
          )}
        </For>
      </HStack>
    </RadioCard.Root>
  );
}
