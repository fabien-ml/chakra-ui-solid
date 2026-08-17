import { HStack, RadioCard, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { value: "next", title: "Next.js" },
  { value: "vite", title: "Vite" },
];

export default function RadioCardWithSizes() {
  return (
    <Stack gap="8">
      <For each={["sm", "md", "lg"] as const}>
        {(size) => (
          <RadioCard.Root size={size} defaultValue="next">
            <RadioCard.Label>size = ({size})</RadioCard.Label>
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
        )}
      </For>
    </Stack>
  );
}
