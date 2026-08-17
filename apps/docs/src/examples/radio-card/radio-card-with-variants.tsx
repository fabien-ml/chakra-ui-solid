import { HStack, RadioCard, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { value: "next", title: "Next.js" },
  { value: "vite", title: "Vite" },
];

export default function RadioCardWithVariants() {
  return (
    <Stack gap="8">
      <For each={["surface", "subtle", "outline", "solid"] as const}>
        {(variant) => (
          <RadioCard.Root colorPalette="teal" variant={variant} defaultValue="next">
            <RadioCard.Label>variant = ({variant})</RadioCard.Label>
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
